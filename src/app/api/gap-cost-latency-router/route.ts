// === Batch 11 Gaps & Frontend Mounts ===
// AI gap: Cost/Latency Model Router (scale)
import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

async function callLLM(systemPrompt: string, userMsg: string, maxTokens = 1400) {
  if (!OPENROUTER_API_KEY) throw Object.assign(new Error('OPENROUTER_API_KEY not configured'), { status: 503 });
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + OPENROUTER_API_KEY, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'scale Gap cost-latency-router' },
    body: JSON.stringify({ model: OPENROUTER_MODEL, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }], max_tokens: maxTokens }),
  });
  const data = await r.json();
  if (data?.error) throw new Error(data.error.message || 'LLM error');
  return data.choices?.[0]?.message?.content || '';
}

// lazy in-memory gap_features table
const gapFeatures: Array<{ at: string; slug: string; payload: unknown }> = (globalThis as unknown as { __gapFeatures?: typeof gapFeatures }).__gapFeatures ?? [];
(globalThis as unknown as { __gapFeatures?: typeof gapFeatures }).__gapFeatures = gapFeatures;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sys = "You recommend a model given task profile, cost budget, and latency target.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await callLLM(sys, user);
    gapFeatures.push({ at: new Date().toISOString(), slug: 'cost-latency-router', payload: { keys: Object.keys(body) } });
    return NextResponse.json({ recommendation: out });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'request failed' }, { status: e?.status || 500 });
  }
}

export async function GET() {
  return NextResponse.json({ feature: 'cost-latency-router', events: gapFeatures.filter(r => r.slug === 'cost-latency-router').length });
}
