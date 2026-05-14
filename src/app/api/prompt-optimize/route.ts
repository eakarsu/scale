import { NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/openrouter";
import { checkQuota } from "@/lib/quota";

// Prompt Optimization Loop — test prompt variations, identify best, auto-promote.
function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const quota = checkQuota(ip);
  if (!quota.allowed) return NextResponse.json({ error: "Quota exceeded" }, { status: 429 });
  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as {
    promptVariations?: string[];
    modelId?: string;
    evalInputs?: Array<{ input: string; ideal?: string }>;
  };
  if (!body.promptVariations || body.promptVariations.length < 2 || !body.evalInputs?.length) {
    return NextResponse.json({ error: "promptVariations (>=2) and evalInputs[] required" }, { status: 400 });
  }
  const modelId = body.modelId || "anthropic/claude-haiku-4-5";
  const client = getOpenRouterClient();

  const scores: Array<{ promptIdx: number; avgScore: number; sample: string }> = [];
  for (let i = 0; i < body.promptVariations.length; i++) {
    const promptTemplate = body.promptVariations[i];
    let sum = 0;
    let sample = "";
    for (const ev of body.evalInputs.slice(0, 6)) {
      const userMessage = `${promptTemplate}\n\n${ev.input}`;
      try {
        const resp = await client.chat.completions.create({
          model: modelId,
          messages: [{ role: "user", content: userMessage }],
          max_tokens: 400,
        });
        const out = resp.choices?.[0]?.message?.content || "";
        const score = ev.ideal ? (out.toLowerCase().includes(ev.ideal.toLowerCase()) ? 1 : 0) : (out.length > 30 ? 0.7 : 0.3);
        sum += score;
        if (!sample) sample = out.slice(0, 200);
      } catch {
        sum += 0;
      }
    }
    scores.push({ promptIdx: i, avgScore: sum / Math.min(body.evalInputs.length, 6), sample });
  }

  scores.sort((a, b) => b.avgScore - a.avgScore);
  return NextResponse.json({ ranked: scores, winnerIdx: scores[0]?.promptIdx, modelId });
}
