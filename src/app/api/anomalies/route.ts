import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/anomalies — statistical anomaly detection over recent ApiLog rows.
// PRODUCT-DECISION: rule-based detection (no ML deps allowed). Flags points with
// latency > mean + 3*stdev per model, error spikes (>30% of last N), and abnormal
// token spikes (>3x model median). Heuristics are documented inline.
// Pure read endpoint; no env vars required.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "500", 10) || 500, 50), 5000);

  const logs = await prisma.apiLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, model: true, status: true, latency: true, tokens: true, createdAt: true, endpoint: true },
  });

  if (logs.length < 5) {
    return NextResponse.json({ sample_size: logs.length, anomalies: [], note: "Not enough data (<5 rows)" });
  }

  // Group by model for per-model statistics.
  type LogRow = (typeof logs)[number];
  const byModel: Record<string, LogRow[]> = {};
  for (const l of logs) {
    if (!byModel[l.model]) byModel[l.model] = [];
    byModel[l.model].push(l);
  }

  function mean(arr: number[]): number {
    return arr.reduce((s, n) => s + n, 0) / arr.length;
  }
  function stdev(arr: number[], mu: number): number {
    if (arr.length < 2) return 0;
    return Math.sqrt(arr.reduce((s, n) => s + (n - mu) ** 2, 0) / (arr.length - 1));
  }
  function median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  type Anomaly = {
    type: "latency_outlier" | "token_spike" | "error_spike";
    severity: "info" | "warning" | "critical";
    model: string;
    message: string;
    sample?: { id: string; latency?: number; tokens?: number; status?: number; createdAt: Date };
    stats?: Record<string, number>;
  };
  const anomalies: Anomaly[] = [];

  for (const model of Object.keys(byModel)) {
    const rows = byModel[model];
    if (rows.length < 5) continue;
    const latencies = rows.map((r: LogRow) => r.latency);
    const muL = mean(latencies);
    const sdL = stdev(latencies, muL);
    const tokens = rows.map((r: LogRow) => r.tokens).filter((t: number) => t > 0);
    const medT = median(tokens);
    const errors = rows.filter((r: LogRow) => r.status >= 400).length;
    const errRate = errors / rows.length;

    // Latency outliers: > mu + 3*sd
    const threshold = muL + 3 * sdL;
    for (const r of rows) {
      if (sdL > 0 && r.latency > threshold) {
        anomalies.push({
          type: "latency_outlier",
          severity: r.latency > muL + 5 * sdL ? "critical" : "warning",
          model,
          message: `Latency ${r.latency}ms exceeds mu+3sd (${Math.round(threshold)}ms)`,
          sample: { id: r.id, latency: r.latency, status: r.status, createdAt: r.createdAt },
          stats: { mean: Math.round(muL), stdev: Math.round(sdL) },
        });
      }
      if (medT > 0 && r.tokens > 3 * medT) {
        anomalies.push({
          type: "token_spike",
          severity: r.tokens > 5 * medT ? "critical" : "warning",
          model,
          message: `Token count ${r.tokens} exceeds 3x median (${medT})`,
          sample: { id: r.id, tokens: r.tokens, status: r.status, createdAt: r.createdAt },
          stats: { median: medT },
        });
      }
    }

    // Error spike: >30% errors over the whole window per model.
    if (errRate > 0.3 && rows.length >= 10) {
      anomalies.push({
        type: "error_spike",
        severity: errRate > 0.5 ? "critical" : "warning",
        model,
        message: `Error rate ${(errRate * 100).toFixed(1)}% over ${rows.length} requests`,
        stats: { error_rate: +errRate.toFixed(3), errors, total: rows.length },
      });
    }
  }

  return NextResponse.json({
    sample_size: logs.length,
    anomalies: anomalies.slice(0, 200),
    generated_at: new Date().toISOString(),
  });
}
