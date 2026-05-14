import { NextResponse } from "next/server";

// Dataset QA Agent — validate training data; flag outliers, duplicates, label errors.

interface Row {
  id: string;
  input: string;
  label?: string;
  meta?: Record<string, unknown>;
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return String(h);
}

function shingles(text: string, k = 4): Set<string> {
  const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);
  const set = new Set<string>();
  for (let i = 0; i + k <= tokens.length; i++) set.add(tokens.slice(i, i + k).join(' '));
  return set;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  a.forEach((x) => { if (b.has(x)) inter++; });
  return inter / Math.max(1, a.size + b.size - inter);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { rows?: Row[]; jaccardThreshold?: number };
  if (!body.rows || body.rows.length === 0) {
    return NextResponse.json({ error: "rows[] required" }, { status: 400 });
  }
  const thresh = body.jaccardThreshold ?? 0.85;

  // Exact-hash duplicates
  const seen = new Map<string, string>();
  const exactDups: Array<{ ids: string[] }> = [];
  for (const r of body.rows) {
    const h = hash(r.input);
    if (seen.has(h)) {
      exactDups.push({ ids: [seen.get(h) as string, r.id] });
    } else {
      seen.set(h, r.id);
    }
  }

  // Length-outlier detection (mean +/- 3 stddev on token count)
  const tokens = body.rows.map((r) => r.input.split(/\s+/).length);
  const mean = tokens.reduce((a, b) => a + b, 0) / tokens.length;
  const std = Math.sqrt(tokens.reduce((s, t) => s + (t - mean) ** 2, 0) / tokens.length);
  const outliers = body.rows.filter((_, i) => Math.abs(tokens[i] - mean) > 3 * std).map((r) => r.id);

  // Near-duplicate via shingles (O(n^2) — limited to first 200)
  const limited = body.rows.slice(0, 200);
  const sigs = limited.map((r) => shingles(r.input));
  const nearDups: Array<{ aId: string; bId: string; similarity: number }> = [];
  for (let i = 0; i < limited.length; i++) {
    for (let j = i + 1; j < limited.length; j++) {
      const sim = jaccard(sigs[i], sigs[j]);
      if (sim >= thresh) nearDups.push({ aId: limited[i].id, bId: limited[j].id, similarity: Number(sim.toFixed(3)) });
    }
  }

  // Label imbalance
  const labelCounts: Record<string, number> = {};
  for (const r of body.rows) {
    if (r.label) labelCounts[r.label] = (labelCounts[r.label] || 0) + 1;
  }

  return NextResponse.json({
    total: body.rows.length,
    exactDuplicates: exactDups,
    nearDuplicates: nearDups,
    lengthOutliers: outliers,
    labelDistribution: labelCounts,
    stats: { meanTokens: Number(mean.toFixed(1)), stdTokens: Number(std.toFixed(1)) },
  });
}
