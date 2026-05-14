import { NextResponse } from "next/server";
import { SUPPORTED_MODELS } from "@/lib/openrouter";

// Cost & Performance Trade-off Analyzer — compare model sizes, latency, cost; recommend.

interface PerfRow {
  modelId: string;
  avgLatencyMs?: number;
  qualityScore?: number;
  inputCostPer1K?: number;
  outputCostPer1K?: number;
}

// Lean v0 reference table (USD per 1K tokens, approximate). Update as needed.
const BASELINE: Record<string, { in: number; out: number; tier: 'frontier' | 'mid' | 'lite' }> = {
  "anthropic/claude-opus-4-6": { in: 0.015, out: 0.075, tier: 'frontier' },
  "anthropic/claude-sonnet-4-5-20250929": { in: 0.003, out: 0.015, tier: 'mid' },
  "anthropic/claude-haiku-4-5": { in: 0.0008, out: 0.004, tier: 'lite' },
  "openai/gpt-4o-2025-08-06": { in: 0.0025, out: 0.01, tier: 'mid' },
  "openai/gpt-4o-mini": { in: 0.00015, out: 0.0006, tier: 'lite' },
  "google/gemini-2.5-flash-preview-05-20": { in: 0.0003, out: 0.0025, tier: 'lite' },
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    workloadInputTokensPerCall?: number;
    workloadOutputTokensPerCall?: number;
    callsPerDay?: number;
    minQualityScore?: number;
    perfData?: PerfRow[];
  };
  const inTok = body.workloadInputTokensPerCall ?? 1200;
  const outTok = body.workloadOutputTokensPerCall ?? 400;
  const cpd = body.callsPerDay ?? 1000;
  const minQ = body.minQualityScore ?? 0.7;

  const rows = SUPPORTED_MODELS.map((m) => {
    const base = BASELINE[m.id];
    const perfRow = (body.perfData || []).find((p) => p.modelId === m.id);
    const inPrice = perfRow?.inputCostPer1K ?? base?.in;
    const outPrice = perfRow?.outputCostPer1K ?? base?.out;
    const dailyCost = inPrice && outPrice ? ((inTok * inPrice) + (outTok * outPrice)) * cpd / 1000 : null;
    return {
      modelId: m.id,
      provider: m.provider,
      tier: base?.tier ?? null,
      avgLatencyMs: perfRow?.avgLatencyMs ?? null,
      qualityScore: perfRow?.qualityScore ?? null,
      dailyCostUSD: dailyCost,
    };
  });

  const eligible = rows.filter((r) => (r.qualityScore ?? 0.8) >= minQ && r.dailyCostUSD != null);
  eligible.sort((a, b) => (a.dailyCostUSD || 0) - (b.dailyCostUSD || 0));

  return NextResponse.json({
    inputs: { inTok, outTok, callsPerDay: cpd, minQualityScore: minQ },
    rows,
    recommended: eligible[0] || null,
    runnerUp: eligible[1] || null,
  });
}
