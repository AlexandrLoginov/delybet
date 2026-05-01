import { Bolt, CircleCheck, CircleX, Medal } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UpgradeModal } from "@/components/paywall/UpgradeModal";
import { SubscriptionDailyUsage } from "@/components/subscription/SubscriptionDailyUsage";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Подписка · DelyBet",
};

const FEATURES = [
  { label: "Анализы предстоящих матчей", free: "1 в день", pro: "Без лимита" },
  { label: "Анализы Live", free: "1 в день", pro: "Без лимита" },
  { label: "Краткое ИИ‑резюме", free: true, pro: true },
  { label: "Развёрнутая аргументация", free: false, pro: true },
  { label: "Ключевые факторы матча", free: false, pro: true },
  { label: "Влияние новостей", free: false, pro: true },
  { label: "Hot picks дня", free: false, pro: true },
  { label: "История прогнозов", free: "30 дней", pro: "90 дней" },
  { label: "Live-обновления (2 мин кэш)", free: false, pro: true },
];

const FAQ = [
  {
    q: "Можно ли отменить в любой момент?",
    a: "Да. Подписка отменяется в один клик и действует до конца оплаченного периода.",
  },
  {
    q: "На каких устройствах работает?",
    a: "iOS, Android, веб и Telegram Mini App — одна подписка на все платформы.",
  },
  {
    q: "Как считается точность ИИ?",
    a: "Сравниваем рекомендованный исход с фактическим результатом матча по итогу. Подробнее в разделе История.",
  },
];

export default function SubscriptionPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-6 pt-5">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Подписка
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Текущий план и возможности DelyBet Pro
          </p>
        </div>
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <Badge variant="muted" className="px-1.5">
                Текущий план
              </Badge>
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                Free
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Базовый доступ — 1 анализ в день для предстоящих и Live матчей.
              </p>
            </div>

            <Separator />

            <SubscriptionDailyUsage />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-primary/40">
          <div
            className="border-b bg-primary/[0.08] px-5 py-3"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Medal className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
                  DelyBet Pro
                </span>
                <div className="text-xs text-muted-foreground">
                  7 дней бесплатно, далее 499 ₽/мес
                </div>
              </div>
              <Badge variant="pro" className="gap-1">
                <Bolt className="h-3 w-3" strokeWidth={2} />
                −40%
              </Badge>
            </div>
          </div>

          <CardContent className="space-y-4 p-5">
            <div className="rounded-lg border bg-background">
              <div className="grid grid-cols-[1fr_88px_88px] items-center gap-2 border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Возможность</span>
                <span className="text-center">Free</span>
                <span className="text-center text-foreground">Pro</span>
              </div>
              <ul className="divide-y divide-border">
                {FEATURES.map((f) => (
                  <li
                    key={f.label}
                    className="grid grid-cols-[1fr_88px_88px] items-center gap-2 px-4 py-2.5 text-sm"
                  >
                    <span className="text-foreground/85">{f.label}</span>
                    <FeatureCell value={f.free} />
                    <FeatureCell value={f.pro} pro />
                  </li>
                ))}
              </ul>
            </div>

            <UpgradeModal
              trigger={
                <Button size="lg" className="w-full">
                  Попробовать 7 дней бесплатно
                </Button>
              }
            />
            <p className="text-center text-[11px] text-muted-foreground">
              Без обязательств. Отмена в один клик в настройках профиля.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="divide-y divide-border p-0">
            {FAQ.map((item, i) => (
              <div key={i} className="space-y-1 px-5 py-4">
                <div className="text-sm font-semibold">{item.q}</div>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function FeatureCell({ value, pro }: { value: boolean | string; pro?: boolean }) {
  if (typeof value === "string") {
    return (
      <span
        className={cn(
          "text-center text-xs font-medium tabular-num",
          pro ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {value}
      </span>
    );
  }

  return (
    <div className="flex justify-center">
      {value ? (
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full",
            pro
              ? "bg-success-muted text-success ring-1 ring-inset ring-success/30"
              : "bg-success-muted text-success ring-1 ring-inset ring-success/30"
          )}
        >
          <CircleCheck className="h-3 w-3" strokeWidth={2} />
        </span>
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CircleX className="h-3 w-3" strokeWidth={2} />
        </span>
      )}
    </div>
  );
}
