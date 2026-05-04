"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CaretLeft,
  ClockClockwise,
  Medal,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RenewSubscriptionDrawer } from "@/components/subscription/RenewSubscriptionDrawer";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import { getWholeDaysUntil } from "@/lib/format-days-left";
import { RENEWAL_BASE_MONTHLY_RUB } from "@/lib/renewal-packages";

export function SubscriptionProDashboard() {
  const { data: authMe } = useAuthMe();
  const devProPreview = useDevProPreview();

  const periodEnd = useMemo(() => {
    const raw = authMe?.subscription?.currentPeriodEnd;
    return raw ? new Date(raw) : null;
  }, [authMe?.subscription?.currentPeriodEnd]);

  const endDateLabel = periodEnd
    ? periodEnd.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const daysLeft = periodEnd ? getWholeDaysUntil(periodEnd) : null;

  const statusLabel =
    authMe?.subscription?.status === "past_due"
      ? "Просрочен платёж"
      : authMe?.subscription?.status === "trialing"
        ? "Пробный период"
        : "Активна";

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-8 pt-5">
      <div className="mb-1">
        <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
          <Link href="/profile">
            <CaretLeft className="h-4 w-4 shrink-0" weight="fill" />
            Профиль
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-success/35 bg-card">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Medal className="h-5 w-5" weight="fill" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight">
                    DelyBet Pro
                  </h1>
                  <Badge variant="success" className="font-semibold">
                    {statusLabel}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Полный доступ к ИИ-анализам и расширенным данным.
                </p>
              </div>
            </div>
          </div>
          {(devProPreview && authMe?.isPro !== true) && (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-snug text-muted-foreground">
              На экране включён локальный режим «Pro (тест)»: реальную подписку Stripe см. ниже после оплаты.
            </p>
          )}
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-snug text-muted-foreground">
            Оплаченный период продлевается автоматически, если не отменить заранее. Отмена не забирает уже
            оплаченные дни — доступ сохранится до конца расчётного периода.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ClockClockwise className="h-4 w-4" weight="fill" />
            Текущий период
          </div>
          {periodEnd && endDateLabel ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Действует до</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {endDateLabel}
                </p>
              </div>
              {daysLeft !== null && (
                <p className="text-sm text-muted-foreground">
                  Осталось дней (по календарю):{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {Math.max(0, daysLeft)}
                  </span>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Дата из Stripe синхронизируется после вебхука. Если оплата прошла недавно, обнови страницу через
              минуту.
            </p>
          )}

          <Separator />

          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Ориентир помесячной ставки после акций
            </span>
            <span className="text-base font-semibold tabular-nums">
              {RENEWAL_BASE_MONTHLY_RUB} ₽
            </span>
          </div>

          <RenewSubscriptionDrawer
            intent="renew"
            trigger={
              <Button type="button" size="lg" className="mt-1 w-full">
                Управление и продление в Stripe
              </Button>
            }
          />
        </CardContent>
      </Card>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        Вопросы по счёту или возврату — через «Помощь и поддержку» в профиле, мы ответим в рабочее время.
      </p>
    </main>
  );
}
