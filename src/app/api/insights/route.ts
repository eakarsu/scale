import { NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/openrouter";
import prisma from "@/lib/prisma";

// POST /api/insights — LLM-powered analysis of recent ApiLog entries.
// Returns 503 if the server-managed OPENROUTER_API_KEY is not configured.
export async function POST(request: Request) {
  const startedAt = Date.now();
  let modelUsed = "unknown";
  let status = 200;
  let tokens = 0;

  try {
    const body = await request.json().catch(() => ({}));
    const { model, lookback } = body || {};

    if (!process.env.OPENROUTER_API_KEY) {
      status = 503;
      return NextResponse.json(
        { error: "Optional AI service is not configured." },
        { status: 503 }
      );
    }

    const take = Math.min(Math.max(parseInt(lookback, 10) || 200, 10), 1000);
    const logs = await prisma.apiLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: { model: true, status: true, latency: true, tokens: true, createdAt: true, endpoint: true },
    });

    if (logs.length === 0) {
      return NextResponse.json({
        insights: { headline: "No log data available", findings: [], recommendations: [] },
        sample_size: 0,
      });
    }

    // Aggregate so we send compact context, not raw rows
    const byModel = new Map<string, { count: number; totalLatency: number; tokens: number; errors: number }>();
    const statusCounts: Record<string, number> = {};
    let totalLatency = 0;
    let totalTokens = 0;
    let errorCount = 0;
    for (const l of logs) {
      const m = byModel.get(l.model) || { count: 0, totalLatency: 0, tokens: 0, errors: 0 };
      m.count += 1;
      m.totalLatency += l.latency;
      m.tokens += l.tokens;
      if (l.status >= 400) m.errors += 1;
      byModel.set(l.model, m);
      statusCounts[String(l.status)] = (statusCounts[String(l.status)] || 0) + 1;
      totalLatency += l.latency;
      totalTokens += l.tokens;
      if (l.status >= 400) errorCount += 1;
    }
    const perModel = Array.from(byModel.entries()).map(([model, m]) => ({
      model,
      requests: m.count,
      avg_latency_ms: Math.round(m.totalLatency / m.count),
      total_tokens: m.tokens,
      errors: m.errors,
      error_rate: +(m.errors / m.count).toFixed(3),
    }));
    const summary = {
      sample_size: logs.length,
      window: { from: logs[logs.length - 1].createdAt, to: logs[0].createdAt },
      avg_latency_ms: Math.round(totalLatency / logs.length),
      total_tokens: totalTokens,
      status_counts: statusCounts,
      error_rate: +(errorCount / logs.length).toFixed(3),
      per_model: perModel,
    };

    const chosenModel = model || "anthropic/claude-haiku-4-5";
    modelUsed = chosenModel;

    const client = getOpenRouterClient();
    const completion = await client.chat.completions.create({
      model: chosenModel,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are an LLM operations analyst. Given aggregate API log statistics, identify performance, cost, and reliability patterns. Always reply with valid JSON only with this structure: { \"headline\": string, \"findings\": [{ \"area\": string, \"observation\": string, \"severity\": \"info\"|\"warning\"|\"critical\" }], \"cost_signals\": [string], \"performance_signals\": [string], \"recommendations\": [string] }",
        },
        {
          role: "user",
          content: `Aggregate stats over the most recent ${logs.length} requests:\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    });

    tokens = completion.usage?.total_tokens || 0;
    modelUsed = completion.model || modelUsed;
    const raw = completion.choices[0]?.message?.content || "";
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch {
          parsed = null;
        }
      }
    }

    return NextResponse.json({
      sample_size: logs.length,
      summary,
      insights: parsed || { raw, error: "Could not parse insights" },
      model: modelUsed,
      usage: completion.usage,
    });
  } catch (error) {
    const err = error as { status?: number; message?: string };
    status = err?.status || 500;
    return NextResponse.json({ error: err?.message || "Insights generation failed" }, { status });
  } finally {
    const latency = Date.now() - startedAt;
    try {
      await prisma.apiLog.create({
        data: {
          endpoint: "/api/insights",
          model: modelUsed,
          status,
          latency,
          tokens,
          ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
        },
      });
    } catch (logErr) {
      console.error("apiLog write failed:", logErr);
    }
  }
}
