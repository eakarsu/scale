// Per-million-token pricing table for cost attribution.
// PRODUCT-DECISION: Prisma schema's ApiLog has only `tokens`, not `costUsd`. Rather
// than migrate the schema (TOO-RISKY), we attribute cost at read-time from this
// in-memory table. Numbers reflect public list pricing snapshots and are intended
// as approximations for telemetry only — not billing.

export interface ModelPricing {
  // USD per 1,000,000 tokens
  inputPerM: number;
  outputPerM: number;
}

// Best-effort defaults. Unknown models get UNKNOWN_PRICING.
export const PRICING: Record<string, ModelPricing> = {
  "anthropic/claude-sonnet-4-5-20250929": { inputPerM: 3.0, outputPerM: 15.0 },
  "anthropic/claude-opus-4-6": { inputPerM: 15.0, outputPerM: 75.0 },
  "anthropic/claude-haiku-4-5": { inputPerM: 1.0, outputPerM: 5.0 },
  "openai/gpt-4o-2025-08-06": { inputPerM: 2.5, outputPerM: 10.0 },
  "openai/gpt-4o-mini": { inputPerM: 0.15, outputPerM: 0.6 },
  "google/gemini-2.5-pro-preview-05-06": { inputPerM: 1.25, outputPerM: 5.0 },
  "google/gemini-2.5-flash-preview-05-20": { inputPerM: 0.075, outputPerM: 0.3 },
  "meta-llama/llama-4-maverick": { inputPerM: 0.27, outputPerM: 0.85 },
  "deepseek/deepseek-r1": { inputPerM: 0.55, outputPerM: 2.19 },
  "mistralai/mistral-large-2": { inputPerM: 2.0, outputPerM: 6.0 },
  "cohere/command-r-plus": { inputPerM: 2.5, outputPerM: 10.0 },
  "qwen/qwen-2.5-72b-instruct": { inputPerM: 0.4, outputPerM: 0.4 },
  "microsoft/phi-4": { inputPerM: 0.07, outputPerM: 0.14 },
  "x-ai/grok-3": { inputPerM: 5.0, outputPerM: 15.0 },
  "amazon/nova-pro-v1": { inputPerM: 0.8, outputPerM: 3.2 },
  "mistralai/devstral-small": { inputPerM: 0.1, outputPerM: 0.3 },
};

export const UNKNOWN_PRICING: ModelPricing = { inputPerM: 0, outputPerM: 0 };

// PRODUCT-DECISION: ApiLog stores only `tokens` (total). Without an input/output
// split we approximate with a 50/50 ratio. Documented as a known limitation.
export function estimateCostUsd(model: string, totalTokens: number): number {
  const p = PRICING[model] || UNKNOWN_PRICING;
  if (!p.inputPerM && !p.outputPerM) return 0;
  const halves = totalTokens / 2;
  return (halves * p.inputPerM) / 1_000_000 + (halves * p.outputPerM) / 1_000_000;
}

export function modelKnown(model: string): boolean {
  return model in PRICING;
}
