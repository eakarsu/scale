# Completeness Review: scale

**Review date:** 2026-07-18

## Assessment basis

Static inspection of project-owned source, configuration, Prisma schema, API routes, AI-provider utilities, and generated gap routes only; no dependency installation, build, database migration, provider call, model evaluation, or runtime launch was performed.

## Classification

**Complete local scope**

The repository provides a coherent local AI-operations dashboard for projects, models, evaluations, agents, datasets, labelers, fine-tunes, logs, cost/performance, drift, chat, and prompt analysis. Its SQLite-backed pages and APIs are usable as a local demo, but many advanced operations remain in-memory records or thin provider calls rather than an operational ML platform.

## Why it is not production-ready

- The Prisma schema uses SQLite and contains no organization/tenant or user ownership model; mutation routes accept request bodies without visible authentication or authorization.
- Evaluation endpoints store caller-supplied scores but do not establish a reproducible evaluation runner, dataset/version lineage, metric computation, or approval workflow.
- Per-IP quota state is in memory and resets on restart; several gap routes likewise keep only process-local event arrays.
- API create routes pass unvalidated request data directly to Prisma, weakening schema, access, and abuse boundaries.
- Multi-cloud deployment reports credential readiness/queued state but does not implement durable provider jobs, rollback, artifact promotion, or reconciliation.

## Needed features

1. Add SSO/API identities, organizations, projects, role-scoped permissions, service accounts, audit events, and strict tenant filtering on every query and mutation.
2. Move to a production database and durable object/event stores with migrations, backups, retention, dataset/model lineage, and deletion propagation.
3. Implement a real evaluation runner with immutable dataset/model/prompt versions, reproducible sampling, metric plugins, safety gates, reviewer approval, and regression thresholds.
4. Replace in-memory quotas/gap records with durable distributed rate limits, job queues, webhooks, retries, idempotency, cancellation, and operator reconciliation.
5. Validate all API payloads and provider outputs; add prompt-injection/data-exfiltration controls, per-tenant budgets, redaction, tracing, and model/provider change management.
6. Add CI plus isolated connector tests for model registries and cloud targets, including failed deployment, rollback, stale metrics, provider throttling, and restart recovery.

## Risks or launch blockers

- Unauthenticated/unscoped APIs could expose or mutate every project's datasets, models, evaluations, and logs.
- Stored evaluation scores can appear authoritative even when no reproducible execution produced them.
- Process-local quotas and event records fail under restart or multiple instances and cannot enforce billing or abuse controls.
- Seed logic deletes all primary tables, so it must be isolated from any normal production startup path.

## Evidence inspected

- `prisma/schema.prisma:6`
- `src/app/api/evaluations/route.ts:14`
- `src/lib/quota.ts:1`
- `src/app/api/gap-cicd-trigger/route.ts:5`
- `src/app/api/multi-cloud-deploy/route.ts:38`
- `src/lib/seed.ts:9`

## Recommended next action

Treat the current build as a single-user demo and first implement tenant identity plus one reproducible evaluation job with durable lineage, queueing, authorization, and a release-blocking regression threshold.

## Implementation progress — 2026-07-20

The first and highest-risk review item has been completed for the supported **single-operator local demonstration** scope. A signed-session identity gate now protects every product page and API. This does not claim multi-tenancy, SSO, or production ML operations; those remain explicit future-work blockers.

Completed changes:

- Added an operator login backed by an environment-supplied email and bcrypt password hash. No credential or demo password is published in the UI or repository.
- Added signed HS256 sessions with fixed issuer/audience, eight-hour expiry, HTTP-only strict-same-site cookies, signature verification, and a logout path/UI.
- Added a top-level Next proxy that protects all pages and APIs; unauthenticated pages redirect to login and unauthenticated APIs return 401.
- Added `start.sh` that launches only an existing production build on loopback, requires all database/session/operator settings, refuses an occupied port, and performs no install, schema mutation, seed, or process termination.
- Put the destructive seed behind `ALLOW_DISPOSABLE_SEED=YES` and documented it as disposable-only.
- Upgraded the active Next/React toolchain, removed the external Google-font runtime request, repaired CSS ordering, modernized TypeScript targeting, fixed a literal-state typing failure, and updated Next configuration/proxy conventions.
- Patched the dependency graph. The audit is reduced from six findings (including four high) to two moderate PostCSS findings inherited inside Next 16.2.10; npm offers only an invalid downgrade to Next 9, so the remaining findings are recorded rather than hidden.
- Added `.env.example`, `SECURITY.md`, authentication/startup tests, CI build and secret-scan gates, and corrected the README's runtime/authentication boundary.
- Removed the misleading always-connected provider indicator; OpenRouter is now labeled optional.
- Removed browser-supplied provider keys from the playground and insights API; the optional OpenRouter credential is server-managed only.

Verification performed:

- `npm test`: 4/4 authentication/startup/provider-secret boundary tests passed.
- Disposable SQLite schema and 128-record seed: completed under the explicit disposable gate.
- `npm run build`: passed with Next.js 16.2.10; TypeScript passed and 58 routes/pages were generated.
- `./start.sh`: started successfully on `127.0.0.1:3051`; the port was clean after shutdown.
- `/login`: 200; unauthenticated `/dashboard`: 307 redirect; unauthenticated `/api/stats`: 401.
- Wrong password: 401; valid operator login: 200; server-validated session: 200 with the configured operator identity.
- Authenticated dashboard and stats API: 200; tampered session cookie: 401.
- Project-owned source/config secret scans and `git diff --check`: passed.

Browser status: **BLOCKED_BROWSER**. The in-app browser service reported no available browser, so a visible form click could not be performed. The actual production login handler, cookie issuance, proxy enforcement, session verification, protected page/API, wrong-password path, unauthenticated path, and tampered-cookie path were all exercised over HTTP; no visual-browser pass is claimed.

Residual production blockers: this remains a single SQLite-backed operator/demo namespace. Organization/project tenancy, SSO/service accounts/RBAC, immutable audit events, production database migrations/backups/deletion propagation, reproducible evaluation lineage and approval gates, durable distributed quotas/jobs/webhooks, provider output validation/redaction/budgets, and isolated connector/rollback tests are not implemented. Illustrative evaluation and gap records must not be treated as authoritative operations or billing evidence.

### Runtime acceptance follow-up (2026-07-20)

- Added an explicit SQLite schema setup command that honors the validator's isolated `DB_PATH`, and made the disposable seed select that same file under `NODE_ENV=test`.
- Normal login still accepts only `NEXUS_OPERATOR_PASSWORD_HASH`. For isolated validation, a startup wrapper hashes the temporary plaintext credential before launching Next and deletes the plaintext variable from the child environment. The production route and build contain no plaintext-password fallback.
- The failed first attempt on PostgreSQL allocation `55695`, API `6190`, and UI allocation `6191` is preserved in `_runtime_non_suite_repair_shard2p.tsv`. After coordinating a new never-reused triple, startup, login, signed cookie session, and authenticated `/api/stats` passed on PostgreSQL allocation `55711`, API `6218`, and UI allocation `6219`; the latest row is `API_VERIFIED / startup_login_session_api`.
