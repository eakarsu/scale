# Nexus AI Platform — local demonstration

Single-operator AI operations demonstration built with Next.js, Prisma, SQLite,
Tailwind CSS, and an optional OpenRouter connector. It is not a production
multi-tenant ML platform and is not affiliated with Scale AI. See `SECURITY.md`
and `_COMPLETENESS_REVIEW.md` for the supported boundary and launch blockers.

## Architecture

```
nexus-ai-project/
├── prisma/
│   └── schema.prisma          # Database schema (10 models)
├── src/
│   ├── app/
│   │   ├── api/               # API routes (8 endpoints)
│   │   │   ├── chat/          # OpenRouter proxy
│   │   │   ├── projects/      # CRUD
│   │   │   ├── models/        # Read + search
│   │   │   ├── evaluations/   # CRUD + filter
│   │   │   ├── agents/        # CRUD
│   │   │   ├── datasets/      # CRUD
│   │   │   ├── labelers/      # Read
│   │   │   ├── finetunes/     # CRUD
│   │   │   └── logs/          # Read
│   │   ├── dashboard/         # Server component - aggregated stats
│   │   ├── projects/          # Client - filterable project list
│   │   ├── models/            # Client - searchable model cards
│   │   ├── evaluations/       # Client - category-filtered leaderboard
│   │   ├── agents/            # Client - agent deployment grid
│   │   ├── data/              # Client - dataset table
│   │   ├── team/              # Client - workforce cards
│   │   ├── finetune/          # Client - fine-tuning jobs table
│   │   ├── logs/              # Client - API request logs
│   │   ├── playground/        # Client - live OpenRouter chat
│   │   ├── layout.tsx         # Root layout (sidebar + header)
│   │   ├── page.tsx           # Redirect to /dashboard
│   │   └── globals.css        # Tailwind + custom styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   │   └── Header.tsx     # Top bar with breadcrumb
│   │   └── ui/
│   │       └── index.tsx      # Reusable components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── openrouter.ts      # OpenRouter client + model registry
│   │   ├── utils.ts           # cn(), formatNumber(), etc.
│   │   └── seed.ts            # Database seeder (128 records)
│   └── types/
│       └── index.ts           # TypeScript interfaces
├── .env                       # Environment variables
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Quick Start

```bash
# 1. Reproducible install
npm ci

# 2. Generate Prisma client + create SQLite database
npx prisma generate
npx prisma db push # disposable/local database only

# 3. Seed database with 128 demo records (16 per feature)
ALLOW_DISPOSABLE_SEED=YES npm run seed

# 4. Build, configure operator credentials, then start the verified runtime
npm run build
cp .env.example .env
# edit .env, including a bcrypt password hash and unique session secret
./start.sh

# 5. Open http://127.0.0.1:3051 and sign in as the configured operator
```

## Features (10 modules, 16+ seeded records each)

| Module | Records | Description |
|--------|---------|-------------|
| Dashboard | Aggregated | KPIs from all tables |
| Projects | 16 | Data labeling projects (RLHF, annotation, classification) |
| Model Hub | 16 | OpenRouter model catalog with pricing & metrics |
| Evaluations | 16 | SEAL-style benchmarks across 10 categories |
| Agents | 16 | Deployed AI agents with performance metrics |
| Data Engine | 16 | Multi-format datasets (image, text, audio, video, 3D) |
| Workforce | 16 | Expert annotators across 12 global regions |
| Fine-Tuning | 16 | RLHF fine-tuning jobs with loss tracking |
| API Logs | 16 | Request monitoring (status codes, latency, tokens) |
| Playground | Live | Real-time chat via OpenRouter (paste your API key) |

## OpenRouter Setup

1. Get API key from [openrouter.ai/keys](https://openrouter.ai/keys)
2. For this local demonstration, set `OPENROUTER_API_KEY` in the runtime
   environment. Do not use customer/provider production credentials.

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server + Client Components)
- **Database**: SQLite via Prisma ORM
- **Styling**: Tailwind CSS
- **LLM Gateway**: OpenRouter API (via OpenAI SDK)
- **State**: React hooks + fetch
- **Icons**: Lucide React
- **Language**: TypeScript

## Database Commands

```bash
npx prisma studio     # Visual database browser at localhost:5555
npx prisma db push    # Push schema changes
npx prisma generate   # Regenerate client after schema changes
npx tsx src/lib/seed.ts  # Re-seed data
```

## Next Steps

- [ ] Auth (NextAuth.js with GitHub/Google OAuth)
- [ ] Real file upload to S3/GCS
- [ ] WebSocket for live API log streaming
- [ ] Agent workflow builder (visual editor)
- [ ] Stripe billing integration
- [ ] Migrate SQLite → PostgreSQL for production
- [ ] Docker + docker-compose
- [ ] CI/CD pipeline

## License

Private - Confidential
