# Pace CRM

Open-source door-to-door sales CRM. Log visits by voice or text, let AI extract the structure, and track your pipeline from first knock to closed deal.

## Features

- **Voice & text visit logging** — speak or type after each visit, AI extracts business, contact, services pitched, and outcomes
- **AI-powered extraction** — Gemini 2.5 Flash (via OpenRouter) structures free-form notes into visit records (falls back to regex when no API key is configured)
- **Sales pipeline** — drag-and-drop Kanban board with customizable stages
- **Stats dashboard** — conversion rates, activity trends, area breakdowns
- **Audit trail** — every contact event logged and searchable
- **Export** — download your data as XLSX
- **Self-hostable** — deploy on Vercel, Railway, or any Node.js host

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL via Neon (serverless driver)
- **ORM**: Drizzle
- **Auth**: JWT sessions (jose + bcryptjs)
- **AI**: Gemini 2.5 Flash via OpenRouter (optional — app works without it)
- **UI**: Custom CSS, Recharts, Leaflet, dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or a [Neon](https://neon.tech) account)
- (Optional) OpenRouter API key for AI extraction

### Setup

1. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd pace-crm
npm install
```

2. Create a `.env.local` file:

```env
DATABASE_URL=postgresql://user:pass@host/dbname
SESSION_SECRET=your-random-secret-min-32-chars
OPENROUTER_API_KEY=sk-or-...   # optional — enables AI visit extraction
```

3. Push the database schema:

```bash
npm run db:push
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to create an account and start logging visits.

## Project Structure

```
app/
  (auth)/        — login & signup pages
  (app)/         — authenticated app shell
  (legal)/       — privacy policy & terms of use
  actions/       — server actions (auth, visits, businesses, config)
  api/extract/   — AI extraction endpoint
components/
  screens/       — full-page views (today, pipeline, log-visit, stats, etc.)
  icons.tsx      — SVG icon components
  ui.tsx         — shared UI primitives
db/
  schema/        — Drizzle table definitions
  seed.ts        — demo data seeder
lib/
  auth/          — session, password, guards
  store.tsx      — client-side state (React context + optimistic updates)
  data.ts        — business enrichment, constants
  validations.ts — Zod schemas
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |

## License

MIT
