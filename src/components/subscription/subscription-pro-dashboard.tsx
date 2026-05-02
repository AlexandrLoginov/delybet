"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarClock, ChevronLeft, History, Medal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RenewSubscriptionDrawer } from "@/components/subscription/RenewSubscriptionDrawer";
import { PRO_SUBSCRIPTION_DEMO } from "@/lib/pro-subscription-demo";
import { getCalendarDaysFromTo, getWholeDaysUntil } from "@/lib/format-days-left";
import { cn } from "@/lib/utils";

const SUBSCRIPTION_HISTORY_LIMIT = 5;

export function SubscriptionProDashboard() {
  /** Сначала новые периоды (текущая сверху), не более 5 записей */
  const historyOrdered = useMemo(
    () =>
      [...PRO_SUBSCRIPTION_DEMO.history]
        .sort(
          (a, b) =>
            new Date(b.periodStartISO).getTime() -
            new Date(a.periodStartISO).getTime()
        )
        .slice(0, SUBSCRIPTION_HISTORY_LIMIT),
    []
  );

  const periodStart = new Date(PRO_SUBSCRIPTION_DEMO.currentPeriodStartISO);
  const periodEnd = new Date(PRO_SUBSCRIPTION_DEMO.currentPeriodEndISO);
  const daysLeft = getWholeDaysUntil(periodEnd);

  const totalPeriodDays = Math.max(
    1,
    getCalendarDaysFromTo(periodStart, periodEnd)
  );

  const pctRemaining = Math.min(
    100,
    Math.max(0, (daysLeft / totalPeriodDays) * 100)
  );

  const endDateLabel = periodEnd.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-8 pt-5">
      <div className="mb-1">
        <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
          <Link href="/profile">
            <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
            Профиль
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-success/35 bg-card">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Medal className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight">
                    DelyBet Pro
                  </h1>
                  <Badge variant="success" className="font-semibold">
                    Активна
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Полный доступ к ИИ-анализам и расширенным данным.
                </p>
              </div>
            </div>
          </div>
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-snug text-muted-foreground">
            Автопродления пока нет: доступ оплачивается помесячно, каждый новый
            период нужно оформить отдельно.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <CalendarClock className="h-4 w-4" strokeWidth={2} />
            Срок подписки
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Действует до</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {endDateLabel}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Осталось в периоде</span>
              <span className="tabular-nums text-foreground">
                {Math.max(0, daysLeft)} из {totalPeriodDays} дней
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={Math.round(pctRemaining)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Доля оставшихся дней текущего периода"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width]",
                  daysLeft <= 3 ? "bg-destructive/80" : "bg-success"
                )}
                style={{ width: `${pctRemaining}%` }}
              />
            </div>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Шкала показывает, какая часть оплаченного периода ещё впереди.
            </p>
          </div>

          <Separator />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Стоимость месяца при следующей оплате
            </span>
            <span className="text-base font-semibold tabular-nums">
              {PRO_SUBSCRIPTION_DEMO.nextChargeRub} ₽
            </span>
          </div>
          <RenewSubscriptionDrawer
            trigger={
              <Button type="button" size="lg" className="mt-1 w-full">
                Продлить подписку
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <History className="h-4 w-4" strokeWidth={2} />
            История подписок
          </div>
          <ul className="divide-y divide-border rounded-lg border border-border bg-background">
            {historyOrdered.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-foreground/90">
                  {row.periodLabel}
                </span>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="tabular-num text-sm text-muted-foreground">
                    {row.amountRub} ₽
                  </span>
                  <Badge
                    variant={
                      row.status === "Текущая"
                        ? "success"
                        : row.status === "Отменена"
                          ? "destructive"
                          : "muted"
                    }
                    className="font-medium"
                  >
                    {row.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        Вопросы по счёту или возврату — через «Помощь и поддержку» в профиле,
        мы ответим в рабочее время.
      </p>
    </main>
  );
}
