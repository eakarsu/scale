import { NextResponse } from "next/server";
import { scanForInjection } from "@/lib/promptInjection";

// POST /api/scan — standalone prompt-injection scanner.
// Pure compute; no LLM call, no env var required.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { text, messages } = body || {};
    let combined = "";
    if (typeof text === "string") combined = text;
    else if (Array.isArray(messages)) {
      combined = messages
        .filter((m: { content?: string }) => m && typeof m.content === "string")
        .map((m: { content: string }) => m.content)
        .join("\n");
    }
    if (!combined) {
      return NextResponse.json({ error: "Provide `text` or `messages` in body." }, { status: 400 });
    }
    const result = scanForInjection(combined);
    return NextResponse.json(result);
  } catch (err) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e?.message || "Scan failed" }, { status: 500 });
  }
}
