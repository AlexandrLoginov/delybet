# DelyBet — Cursor Starter Guide

## Стек
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **DB:** PostgreSQL + Prisma ORM
- **Cache:** Redis (Upstash — serverless, бесплатный тир)
- **Auth:** NextAuth.js
- **Payments:** Stripe
- **AI:** Anthropic Messages API (`ANTHROPIC_API_KEY`, опционально `ANTHROPIC_MODEL`)
- **Sport Data:** API-Football + API-Sports
- **Deploy:** Vercel

---

## Быстрый старт

```bash
npx create-next-app@latest delybet --typescript --tailwind --app --src-dir
cd delybet
npm install @prisma/client prisma @anthropic-ai/sdk axios redis stripe next-auth
npx prisma init
```

---

## Структура проекта

```
delybet/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx               # Главный экран
│   │   │   └── match/[id]/page.tsx    # ИИ-анализ матча
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── matches/
│   │       │   ├── upcoming/route.ts
│   │       │   └── live/route.ts
│   │       ├── analysis/
│   │       │   └── [matchId]/route.ts  # ← Главный эндпоинт
│   │       ├── sports/route.ts
│   │       └── webhooks/stripe/route.ts
│   ├── components/
│   │   ├── matches/
│   │   │   ├── MatchCard.tsx
│   │   │   ├── MatchList.tsx
│   │   │   └── LiveBadge.tsx
│   │   ├── analysis/
│   │   │   ├── AIAnalysis.tsx
│   │   │   ├── ProbabilityBar.tsx
│   │   │   ├── StatsBars.tsx
│   │   │   └── NewsItem.tsx
│   │   ├── paywall/
│   │   │   └── PaywallOverlay.tsx
│   │   └── ui/
│   │       ├── Tabs.tsx
│   │       └── SportFilter.tsx
│   ├── lib/
│   │   ├── sports-api.ts       # Клиент API-Football
│   │   ├── ai-analysis.ts      # Интеграция ИИ‑анализа
│   │   ├── cache.ts            # Redis wrapper
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── subscription.ts     # Проверка подписки
│   └── types/
│       ├── match.ts
│       └── analysis.ts
├── prisma/
│   └── schema.prisma
├── .env.local
└── .cursorrules               # ← Правила для Cursor AI
```

---

## .env.local

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/delybet"

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Sports APIs
API_FOOTBALL_KEY="your-key"        # api-sports.io
API_SPORTS_KEY="your-key"          # тот же провайдер

# AI
ANTHROPIC_API_KEY="your-key"
ANTHROPIC_MODEL=""

# Cache
UPSTASH_REDIS_REST_URL="your-url"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Payments (Hosted Checkout — publishable key не нужен)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_PRO_1M="price_..."
STRIPE_PRICE_PRO_3M="price_..."
STRIPE_PRICE_PRO_6M="price_..."
STRIPE_PRICE_PRO_12M="price_..."
```
