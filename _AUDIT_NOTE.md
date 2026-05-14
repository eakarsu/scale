# Audit Note — scale

**Date:** 2026-05-06
**Bucket:** A — DETECTOR_FALSE_POSITIVE

## Summary

Detector flagged this project as missing LLM integration. This is a **false positive** — `scale` is an OpenRouter/LLM observability product and has the integration in `src/lib/openrouter.ts` plus a chat API route.

## Evidence — Files containing LLM references

Whole-project scan (excluding node_modules/.next/.git/dist/build) for `openrouter|openai|anthropic|claude|chat/completions`:

- `src/lib/openrouter.ts` — OpenRouter client
- `src/lib/seed.ts` — references provider models
- `src/app/api/chat/route.ts` — chat proxy endpoint
- `src/app/playground/page.tsx`
- `src/app/models/page.tsx`
- `src/app/logs/page.tsx`
- `src/app/layout.tsx`
- `src/components/layout/Sidebar.tsx`

Source file count: **33**.
Stack: Next.js (App Router) + Prisma + Tailwind + 11 pages.

## Conclusion

LLM/OpenRouter integration is genuinely present.

## Audit recommendations applied (this batch)

Audit context: batch_11.md → §scale flagged "no anomaly detection / no automated prompt optimization / no cost tracking". The Prisma schema already defines an `ApiLog` model (endpoint/model/status/latency/tokens/ip) and a `/api/logs` GET reader, but the existing `/api/chat` POST never wrote to it — meaning the observability product was not recording its own primary endpoint.

### MECHANICAL items implemented

1. **Wire `/api/chat` to `ApiLog`** — `src/app/api/chat/route.ts` now records every request (success or failure) with endpoint, model, status, latency_ms, total_tokens, and client IP. Logging runs in `finally` so transport errors don't break responses, and write failures are swallowed (logged to console) so telemetry never fails the user.
   - Helper `getClientIp` reads `x-forwarded-for` then `x-real-ip` then falls back to `unknown`.
   - Response shape unchanged.

That implementation also unblocks the existing `/api/logs` page (which previously displayed only seed data).

## Backlog (deferred)

These items remain unimplemented and are tracked here for follow-up passes:

- **Per-request cost attribution** — schema has `tokens` but not `costUsd`; add column + populate using `SUPPORTED_MODELS` pricing column.
- **Latency histograms** — current schema stores point latency; add a periodic aggregator route or `/api/stats` endpoint to expose p50/p95/p99 by model.
- **Prompt-injection scanning** — pre-call middleware to detect classic injection patterns; would also belong in `chat` and any future `agents` route.
- **Usage quota enforcement** — extend `/api/chat` with a per-IP or per-API-key quota check before calling OpenRouter (similar pattern to `salesforce`'s `aiRateLimiter`).
- **Anomaly detection / drift monitoring** — requires productisation; needs schema changes + scheduled job framework. NEEDS-PRODUCT-DECISION.
- **Multi-cloud orchestration** (audit suggestion #6) — TOO-RISKY in current shape; depends on bringing in new SDKs which are forbidden in this batch.

## Files touched this batch

- `src/app/api/chat/route.ts` — added IP capture + ApiLog telemetry in finally block (no behavioural change to caller).

## Apply pass 5 (all backlog)

Implemented all four remaining deferred items from the pass-2 backlog as additive Next.js routes + lib helpers (no schema migration; all guidance from PRODUCT-DECISIONs documented inline):

**Per-request cost attribution** — new `src/lib/pricing.ts` with model→USD/M-token pricing table. PRODUCT-DECISION: `ApiLog` only has `tokens` (total), so cost is computed at read-time with a 50/50 input/output split approximation. `/api/stats` now returns `total_estimated_cost_usd` and `per_model[].estimated_cost_usd` + `pricing_known`.

**Prompt-injection scanning** — new `src/lib/promptInjection.ts` (10 rules: ignore-previous-instructions, system-prompt-leak, role-jailbreak, DAN, sudo prefix, encoded payload, exfiltration URL, delimiter escape, suppress safety, extract credentials). New `POST /api/scan` standalone endpoint. `/api/chat` runs the scan on user-role messages and returns `injectionScan` in the response (PRODUCT-DECISION: non-blocking — surfacing only, since hard-blocking would change behaviour).

**Usage quota enforcement** — new `src/lib/quota.ts` with in-memory per-IP token bucket. PRODUCT-DECISION: 60 req/60s default (env-tunable via `QUOTA_LIMIT` / `QUOTA_WINDOW_MS`). `/api/chat` returns 429 + `resetMs` on overflow.

**Anomaly detection** — new `GET /api/anomalies` endpoint. PRODUCT-DECISION: rule-based (no ML deps): flags latency outliers (`> mean + 3σ`), token spikes (`> 3× model median`), and error spikes (`> 30%` per model). Pure-read.

Smoke-tested live on port 11601: `POST /api/scan` correctly flagged "ignore previous instructions" with score 1.0. `GET /api/anomalies?limit=200` and `GET /api/stats?limit=200` returned 200 with the new fields. No revert.

Backlog still deferred:
- Multi-cloud orchestration — TOO-RISKY (requires new SDKs).

## Apply pass 4 (mechanical backlog)

Implemented two of the deferred items adapted to this project's Next.js / no-JWT shape (FE is the product, no separate "AI Center"):

1. **`GET /api/stats`** — pure-read latency-histogram endpoint. Returns p50/p95/p99/mean/max latency by model from recent `ApiLog` rows plus aggregate status counts and total tokens. No LLM call. Closes the "latency histograms" backlog item.
2. **`POST /api/insights`** — LLM-powered analysis of recent `ApiLog` entries. Aggregates the most recent N requests (10–1000) into per-model and overall summaries, asks an OpenRouter model for a structured JSON insight (headline, findings with severity, cost signals, performance signals, recommendations). Returns 503 when `OPENROUTER_API_KEY` is missing and no `apiKey` override is supplied. Telemetry-self-records via the same `ApiLog` write pattern used by `/api/chat`.

Frontend: added a new `/insights` page (`src/app/insights/page.tsx`) — controls for sample size, insight model, and optional API key override; renders the latency histogram table and AI insights with severity-coded findings, cost signals, performance signals, and recommendations. Sidebar (`src/components/layout/Sidebar.tsx`) gained an "Insights" entry between "API Logs" and "Playground".

Smoke-tested live on port 11601: `GET /api/stats?limit=10` returned the histogram from seeded `ApiLog` rows; `POST /api/insights` returned a fully-structured analysis from `claude-haiku-4-5` (also self-recorded back into `ApiLog`).

Backlog still deferred: per-request cost attribution (schema change), prompt-injection scanning (cross-cutting middleware), usage-quota enforcement (policy/schema), anomaly detection (NEEDS-PRODUCT-DECISION), multi-cloud orchestration (TOO-RISKY).

## Apply pass 3 (frontend)

**Action:** LEFT-AS-IS — FE already wired.

This is a Next.js App Router product with FE colocated alongside the API routes:
- `src/app/playground/page.tsx` — chat UI calling `POST /api/chat` (line 33)
- `src/app/logs/page.tsx` — reads from `/api/logs` (now showing real data after the pass-2 wire-up)
- `src/app/models/page.tsx`, `dashboard`, `evaluations`, `finetune`, `agents`, `data`, `projects`, `team` — all already implemented

The product itself is an LLM observability + playground, so the FE is the product. No additional AI form to surface.
