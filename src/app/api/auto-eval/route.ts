import { NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/openrouter";
import { checkQuota } from "@/lib/quota";
import prisma from "@/lib/prisma";

// Automated Model Evaluation Agent — run a test suite, flag regressions, suggest action.
function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

interface TestCase {
  id: string;
  input: string;
  expected?: string;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const quota = checkQuota(ip);
  if (!quota.allowed) {
    return NextResponse.json({ error: "Quota exceeded", resetMs: quota.resetMs }, { status: 429 });
  }
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    modelId?: string;
    testSuite?: TestCase[];
    priorBaseline?: Array<{ id: string; output: string; score?: number }>;
  };
  if (!body.modelId || !body.testSuite?.length) {
    return NextResponse.json({ error: "modelId and testSuite[] required" }, { status: 400 });
  }

  const client = getOpenRouterClient();
  const results: Array<{ id: string; output: string; passed: boolean; latencyMs: number }> = [];
  for (const tc of body.testSuite.slice(0, 25)) {
    const t0 = Date.now();
    try {
      const resp = await client.chat.completions.create({
        model: body.modelId,
        messages: [{ role: "user", content: tc.input }],
        max_tokens: 500,
      });
      const output = resp.choices?.[0]?.message?.content || "";
      const passed = tc.expected ? output.includes(tc.expected) : output.trim().length > 0;
      results.push({ id: tc.id, output, passed, latencyMs: Date.now() - t0 });
    } catch (err) {
      results.push({ id: tc.id, output: `ERROR: ${(err as Error).message}`, passed: false, latencyMs: Date.now() - t0 });
    }
  }

  const passCount = results.filter((r) => r.passed).length;
  const regressions = (body.priorBaseline || []).filter((b) => {
    const cur = results.find((r) => r.id === b.id);
    return cur && !cur.passed;
  });

  try {
    await (prisma as any).evaluationRun?.create({ data: { modelId: body.modelId, total: results.length, passed: passCount } });
  } catch {
    // schema variance — ignore
  }

  const verdict = regressions.length > 0 ? "rollback_or_retrain" : passCount === results.length ? "ship_it" : "investigate";
  return NextResponse.json({ verdict, total: results.length, passed: passCount, regressions, results });
}
