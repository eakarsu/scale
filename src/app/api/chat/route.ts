import { NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/openrouter";

export async function POST(request: Request) {
  try {
    const { messages, model, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const client = getOpenRouterClient(apiKey);

    const completion = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 2048,
    });

    return NextResponse.json({
      message: completion.choices[0]?.message,
      usage: completion.usage,
      model: completion.model,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "OpenRouter API error" },
      { status: error.status || 500 }
    );
  }
}
