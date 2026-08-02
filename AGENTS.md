# AGENTS.md

## Cursor Cloud specific instructions

DelyBet is a Next.js 14 (App Router) + TypeScript app for AI sports-match analysis, with a Telegram Mini App layer. Standard commands live in `package.json` (`dev`, `build`, `lint`, `db:push`). Package manager is **npm** (`package-lock.json`).

### Services

- **Next.js dev server** — `npm run dev` on port 3000 (the app itself).
- **PostgreSQL** — the only mandatory datastore (Prisma). Redis (Upstash) is optional; `src/lib/cache.ts` transparently falls back to an in-memory cache when unset.

### Non-obvious setup / run caveats

- **`.env.local` is required and git-ignored.** It won't appear in the repo diff. A working local one already exists in this environment with: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/delybet`, `SESSION_SECRET` (>= 16 chars), `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `NEXT_PUBLIC_USE_MOCKS=true`, `NEXT_PUBLIC_ENABLE_DEV_TOOLS=true`. If it's missing, recreate it from `.env.example`.
- **PostgreSQL is not auto-started on boot.** Start it with `sudo pg_ctlcluster 16 main start`. Local DB `delybet` with user/password `postgres`/`postgres`.
- **Prisma CLI reads `.env`, not `.env.local`.** So `npx prisma db push` / `prisma generate` will error with "Environment variable not found: DATABASE_URL" unless you pass it inline, e.g. `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/delybet" npx prisma db push`. The Next.js runtime does read `.env.local` normally.
- **Offline mode:** with `NEXT_PUBLIC_USE_MOCKS=true` the app needs no external API keys — sports data comes from `src/lib/mock-data.ts` and AI analysis is mocked. For real functionality add `ANTHROPIC_API_KEY` (AI), `API_SPORTS_KEY` (live matches), Stripe/PayOS keys (payments), and `TELEGRAM_BOT_TOKEN` (real Telegram login).

### Testing the product in a plain browser

- The app is primarily a Telegram Mini App. In a normal browser there is **no login** (session status is "browser"); most read flows still work with mocks.
- **Clicking a match card in a browser pops an "Открыть в DelyBet в Telegram" prompt instead of navigating.** To open a match detail page directly, navigate to `http://localhost:3000/match/<id>` (e.g. `/match/1001`).
- **Unlocking the Pro AI analysis for local UI testing:** set `localStorage['delybet-dev-pro-preview'] = 'true'` in the browser console (see `src/lib/dev-pro-preview-store.ts`), then reload the match page. The API also honors `?pro=true` when `NEXT_PUBLIC_ENABLE_DEV_TOOLS=true` in development, so you can hit `GET /api/analysis/1001?sport=football&status=upcoming&pro=true` directly.
