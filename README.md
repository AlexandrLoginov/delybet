# DelyBet — Руководство для Cursor

## Быстрый старт

### 1. Создать проект

```bash
npx create-next-app@latest delybet --typescript --tailwind --app --src-dir
cd delybet
```

### 2. Установить зависимости

```bash
npm install @prisma/client prisma \
  @anthropic-ai/sdk \
  axios \
  next-auth \
  stripe \
  @twa-dev/sdk \
  swr
```

### 3. Скопировать файлы из этого пакета

```
schema.prisma         → prisma/schema.prisma
sports-api.ts         → src/lib/sports-api.ts
ai-analysis.ts        → src/lib/ai-analysis.ts
cache.ts              → src/lib/cache.ts
subscription.ts       → src/lib/subscription.ts
analysis-route.ts     → src/app/api/analysis/[matchId]/route.ts
.cursorrules          → .cursorrules
```

### 4. Настроить окружение

Скопируй `.env.local` из `CURSOR_START.md` и заполни ключи.

### 5. Инициализировать базу данных

```bash
npx prisma generate
npx prisma db push
```

### 6. Запустить

```bash
npm run dev
```

---

## Как работает цепочка анализа

```
Пользователь нажимает "ИИ-анализ"
  ↓
GET /api/analysis/:matchId?sport=football&live=true
  ↓
Проверка сессии + подписки (Pro/Free)
  ↓
Проверка дневного лимита (Free: 1/день)
  ↓
Проверка Redis кэша (TTL: 2 мин live / 15 мин upcoming)
  ↓ (cache miss)
Параллельный сбор данных:
  ├── getMatchById()      — данные матча
  ├── getMatchStats()     — статистика
  ├── getTeamForm() x2   — форма обеих команд
  └── getMatchNews()      — актуальные новости
  ↓
buildPrompt() — формируем структурированный промпт
  ↓
Anthropic Messages API — генерация ИИ‑анализа
  ↓
parseAnalysisResponse() — разбор JSON
  ↓
Сохраняем в Redis
  ↓
Возвращаем: Full (Pro) или Summary (Free)
```

---

## Подсказки для Cursor

### Создать главную страницу
```
Создай главный экран DelyBet: тёмный фон #08101f, 
табы "Предстоящие" и "Live", фильтр по видам спорта (футбол, баскетбол, теннис, волейбол),
список карточек матчей. Используй компоненты из src/components/matches/.
Данные загружай через Server Component из /api/matches/upcoming
```

### Создать экран анализа
```
Создай страницу /match/[id] с полным ИИ-анализом.
Загружай данные из /api/analysis/[matchId].
Показывай: счёт, полосу вероятностей (зелёный/серый/синий),
блок ИИ‑рекомендации, табы Статистика/Форма/Новости.
Для isPro=false показывай Paywall overlay поверх детального анализа.
```

### Создать онбординг
```
Создай 3-шаговый онбординг: 
1. Приветственный экран с демо-карточкой матча
2. Выбор видов спорта (чипы: футбол, баскетбол, теннис, волейбол)
3. Выбор тарифа (Free / Pro с 7-дневным пробным периодом)
Используй цвет акцента #4ade80, тёмный фон #08101f
```

---

## Внешние сервисы — где зарегистрироваться

| Сервис | URL | Что получить |
|--------|-----|-------------|
| API-Sports | api-sports.io | API_SPORTS_KEY |
| NewsAPI | newsapi.org | NEWS_API_KEY |
| Anthropic | console.anthropic.com | ANTHROPIC_API_KEY |
| Upstash | upstash.com | UPSTASH_REDIS_* |
| Stripe | dashboard.stripe.com | STRIPE_* ключи |
| Vercel | vercel.com | Деплой одной кнопкой |

---

## Структура БД (краткая)

- **User** — пользователь, список видов спорта
- **Subscription** — план (FREE/PRO), Stripe ID, срок
- **DailyUsage** — счётчики использования по дням (Free лимиты)
- **MatchAnalysis** — кэш анализов в БД (резервный, основной — Redis)
