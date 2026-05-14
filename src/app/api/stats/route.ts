import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { estimateCostUsd, modelKnown } from "@/lib/pricing";

// GET /api/stats — latency histograms (p50/p95/p99) by model + status counts.
// Pure read endpoint, no LLM call required.
// Now also returns per-model + total estimated cost in USD via the in-memory
// pricing table in `@/lib/pricing` (PRODUCT-DECISION documented there).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "1000", 10) || 1000, 1), 5000);

  const logs = await prisma.apiLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { model: true, status: true, latency: true, tokens: true, createdAt: true },
  });

  const byModel = new Map<string, number[]>();
  const tokensByModel = new Map<string, number>();
  const statusCounts: Record<string, number> = {};
  let totalTokens = 0;
  let totalCostUsd = 0;

  for (const log of logs) {
    if (!byModel.has(log.model)) byModel.set(log.model, []);
    byModel.get(log.model)!.push(log.latency);
    tokensByModel.set(log.model, (tokensByModel.get(log.model) || 0) + log.tokens);
    statusCounts[String(log.status)] = (statusCounts[String(log.status)] || 0) + 1;
    totalTokens += log.tokens;
    totalCostUsd += estimateCostUsd(log.model, log.tokens);
  }

  function pct(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return sorted[idx];
  }

  const perModel = Array.from(byModel.entries()).map(([model, latencies]) => {
    const sorted = [...latencies].sort((a, b) => a - b);
    const tokens = tokensByModel.get(model) || 0;
    return {
      model,
      requests: latencies.length,
      p50_ms: pct(sorted, 50),
      p95_ms: pct(sorted, 95),
      p99_ms: pct(sorted, 99),
      max_ms: sorted[sorted.length - 1] || 0,
      mean_ms: Math.round(latencies.reduce((s, n) => s + n, 0) / latencies.length),
      tokens,
      estimated_cost_usd: +estimateCostUsd(model, tokens).toFixed(6),
      pricing_known: modelKnown(model),
    };
  }).sort((a, b) => b.requests - a.requests);

  return NextResponse.json({
    sample_size: logs.length,
    total_tokens: totalTokens,
    total_estimated_cost_usd: +totalCostUsd.toFixed(6),
    status_counts: statusCounts,
    per_model: perModel,
    generated_at: new Date().toISOString(),
  });
}
