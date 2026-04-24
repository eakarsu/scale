# Nexus AI Platform

Full-stack AI data & deployment platform (Scale AI clone) built with Next.js 14, Prisma, SQLite, Tailwind CSS, and OpenRouter API.

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
# 1. Install dependencies
npm install

# 2. Generate Prisma client + create SQLite database
npx prisma generate
npx prisma db push

# 3. Seed database with 128 demo records (16 per feature)
npx tsx src/lib/seed.ts

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
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
2. Either:
   - Paste key directly in the Playground UI, OR
   - Set `OPENROUTER_API_KEY` in `.env` for server-side usage

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
