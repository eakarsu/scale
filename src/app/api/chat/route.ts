import { NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/openrouter";
import prisma from "@/lib/prisma";
import { checkQuota } from "@/lib/quota";
import { scanForInjection } from "@/lib/promptInjection";

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let modelUsed = "unknown";
  let status = 200;
  let tokens = 0;
  const ip = getClientIp(request);

  // Per-IP quota enforcement (in-memory, resets on restart).
  const quota = checkQuota(ip);
  if (!quota.allowed) {
    status = 429;
    return NextResponse.json(
      {
        error: "Quota exceeded. Try again later.",
        limit: quota.limit,
        resetMs: quota.resetMs,
      },
      { status: 429 },
    );
  }

  try {
    const { messages, model, skipInjectionScan } = await request.json();
    modelUsed = model || "unknown";

    if (!process.env.OPENROUTER_API_KEY) {
      status = 503;
      return NextResponse.json({ error: "Optional model provider is not configured" }, { status: 503 });
    }

    // Prompt-injection scan on user-role messages; flagged but non-blocking by default.
    if (!skipInjectionScan && Array.isArray(messages)) {
      const userText = messages
        .filter((m: { role?: string; content?: string }) => m && m.role === "user" && typeof m.content === "string")
        .map((m: { content: string }) => m.content)
        .join("\n");
      const scan = scanForInjection(userText);
      // PRODUCT-DECISION: do not hard-block — surface findings in the response so
      // operators can audit. Hard-block would be a behaviour change.
      if (scan.isFlagged) {
        request.headers.append?.("x-injection-flagged", "1");
      }
      // Attach to response below via a side channel
      (request as unknown as { __scan: typeof scan }).__scan = scan;
    }

    const client = getOpenRouterClient();

    const completion = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 2048,
    });

    tokens = completion.usage?.total_tokens || 0;
    modelUsed = completion.model || modelUsed;

    const scan = (request as unknown as { __scan?: { isFlagged: boolean; score: number; findings: unknown[] } }).__scan;
    return NextResponse.json({
      message: completion.choices[0]?.message,
      usage: completion.usage,
      model: completion.model,
      injectionScan: scan ? { isFlagged: scan.isFlagged, score: scan.score, findings: scan.findings } : undefined,
      quota: { remaining: quota.remaining, limit: quota.limit, resetMs: quota.resetMs },
    });
  } catch (error: any) {
    status = error.status || 500;
    return NextResponse.json(
      { error: error.message || "OpenRouter API error" },
      { status }
    );
  } finally {
    const latency = Date.now() - startedAt;
    // Record usage telemetry. Failures here must not break the response.
    try {
      await prisma.apiLog.create({
        data: {
          endpoint: "/api/chat",
          model: modelUsed,
          status,
          latency,
          tokens,
          ip,
        },
      });
    } catch (logErr) {
      console.error("apiLog write failed:", logErr);
    }
  }
}
