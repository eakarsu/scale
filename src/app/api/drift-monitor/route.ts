import { NextResponse } from "next/server";

// Drift Monitoring — accept periodic metric samples; alert when accuracy drops below threshold.

interface Sample {
  modelId: string;
  windowStart: string;
  metric: 'accuracy' | 'f1' | 'rouge' | 'bleu' | 'latency_ms';
  value: number;
  sampleSize?: number;
}

interface Threshold {
  modelId: string;
  metric: Sample['metric'];
  minValue?: number;
  maxValue?: number;
}

const samples: Sample[] = [];
const thresholds = new Map<string, Threshold>(); // key = modelId|metric

function thrKey(modelId: string, metric: string) { return `${modelId}|${metric}`; }

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    action: 'ingest' | 'set_threshold' | 'check';
    sample?: Sample;
    threshold?: Threshold;
    modelId?: string;
  };

  if (body.action === 'set_threshold' && body.threshold) {
    const t = body.threshold;
    thresholds.set(thrKey(t.modelId, t.metric), t);
    return NextResponse.json({ ok: true, threshold: t });
  }

  if (body.action === 'ingest' && body.sample) {
    samples.push(body.sample);
    if (samples.length > 1000) samples.splice(0, samples.length - 1000);
    return NextResponse.json({ ok: true, total: samples.length });
  }

  if (body.action === 'check') {
    const modelId = body.modelId;
    const breaches: Array<Sample & { thresholdViolated: 'below_min' | 'above_max' }> = [];
    for (const s of samples) {
      if (modelId && s.modelId !== modelId) continue;
      const t = thresholds.get(thrKey(s.modelId, s.metric));
      if (!t) continue;
      if (t.minValue != null && s.value < t.minValue) breaches.push({ ...s, thresholdViolated: 'below_min' });
      else if (t.maxValue != null && s.value > t.maxValue) breaches.push({ ...s, thresholdViolated: 'above_max' });
    }
    return NextResponse.json({ breaches, totalSamples: samples.length, thresholdsConfigured: thresholds.size });
  }

  return NextResponse.json({ error: "action must be ingest | set_threshold | check" }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    samples: samples.slice(-100),
    thresholds: Array.from(thresholds.values()),
  });
}
