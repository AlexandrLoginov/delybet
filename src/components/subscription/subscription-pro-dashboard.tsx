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
import { localeIntlTag } from "@/i18n";
import { useAppLocale } from "@/hooks/use-app-locale";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import { formatDaysLeft, getWholeDaysUntil } from "@/lib/format-days-left";
import { formatSubscriptionPeriodRange } from "@/lib/format-period-range";
import { PRO_SUBSCRIPTION_DEMO } from "@/lib/pro-subscription-demo";
import { RENEWAL_BASE_MONTHLY_RUB } from "@/lib/renewal-packages";

const SUBSCRIPTION_HISTORY_LIMIT = 5;

export function SubscriptionProDashboard() {
  const { locale, t, formatFromRub } = useAppLocale();
  const { data: authMe } = useAuthMe();
  const devProPreview = useDevProPreview();
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

  const periodEnd = useMemo(() => {
    const raw = authMe?.subscription?.currentPeriodEnd;
    return raw ? new Date(raw) : null;
  }, [authMe?.subscription?.currentPeriodEnd]);

  const endDateLabel = periodEnd
    ? periodEnd.toLocaleDateString(localeIntlTag(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const daysLeft = periodEnd ? getWholeDaysUntil(periodEnd) : null;

  const statusLabel =
    authMe?.subscription?.status === "past_due"
      ? t("subscription.proStatusPastDue")
      : authMe?.subscription?.status === "trialing"
        ? t("subscription.proStatusTrialing")
        : authMe?.subscription?.status === "canceled"
          ? t("subscription.proStatusCanceled")
          : t("subscription.proStatusActive");

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-8 pt-5">
      <div className="mb-1">
        <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
          <Link href="/profile">
            <CaretLeft className="h-4 w-4 shrink-0" weight="fill" />
            {t("nav.profile")}
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
                    {t("subscription.proActive")}
                  </h1>
                  <Badge variant="success" className="font-semibold">
                    {statusLabel}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t("profile.promoTitle")}
                </p>
              </div>
            </div>
          </div>
          {devProPreview && authMe?.isPro !== true && (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-snug text-muted-foreground">
              {t("profile.devPreview")}: {t("profile.devPreviewHint")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ClockClockwise className="h-4 w-4" weight="fill" />
            {t("subscription.currentPlan")}
          </div>
          {periodEnd && endDateLabel ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.proUntil", { date: endDateLabel })}
                </p>
              </div>
              {daysLeft !== null && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium tabular-nums text-foreground">
                    {formatDaysLeft(locale, Math.max(0, daysLeft))}
                  </span>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("subscription.proStripePending")}
            </p>
          )}

          <Separator />

          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {t("subscription.proRateHint")}
            </span>
            <span className="text-base font-semibold tabular-nums">
              {formatFromRub(RENEWAL_BASE_MONTHLY_RUB)}
            </span>
          </div>

          <RenewSubscriptionDrawer
            intent="renew"
            trigger={
              <Button type="button" size="lg" className="mt-1 w-full">
                {t("subscription.proManage")}
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("subscription.historyTitle")}
          </div>
          <ul className="divide-y divide-border rounded-lg border border-border bg-background">
            {historyOrdered.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-foreground/90">
                  {formatSubscriptionPeriodRange(
                    locale,
                    row.periodStartISO,
                    row.periodEndISO
                  )}
                </span>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="tabular-nums text-sm text-muted-foreground">
                    {formatFromRub(row.amountRub)}
                  </span>
                  <Badge
                    variant={
                      row.status === "current"
                        ? "success"
                        : row.status === "canceled"
                          ? "destructive"
                          : "muted"
                    }
                    className="font-medium"
                  >
                    {row.status === "current"
                      ? t("subscription.historyCurrent")
                      : row.status === "canceled"
                        ? t("subscription.historyPast")
                        : t("subscription.historyCompleted")}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
