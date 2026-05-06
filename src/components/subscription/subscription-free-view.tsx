"use client";

import Link from "next/link";
import {
  CaretLeft,
  CheckCircle,
  Lightning,
  Medal,
  XCircle,
} from "@phosphor-icons/react/ssr";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RenewSubscriptionDrawer } from "@/components/subscription/RenewSubscriptionDrawer";
import { SubscriptionDailyUsage } from "@/components/subscription/SubscriptionDailyUsage";
import { SUBSCRIPTION_FEATURE_ROWS } from "@/lib/subscription-features";
import { cn } from "@/lib/utils";

export function SubscriptionFreeView() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-6 pt-5">
      <div className="mb-5">
        <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
          <Link href="/profile">
            <CaretLeft className="h-4 w-4 shrink-0" weight="fill" />
            Профиль
          </Link>
        </Button>
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
        <div className="border-b bg-primary/[0.08] px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Medal className="h-4 w-4" weight="fill" />
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
              <Lightning className="h-3 w-3" weight="fill" />
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
              {SUBSCRIPTION_FEATURE_ROWS.map((f) => (
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

          <RenewSubscriptionDrawer
            intent="subscribe"
            billingAction="checkout"
            trigger={
              <Button size="lg" className="w-full">
                Перейти на PRO
              </Button>
            }
          />
        </CardContent>
      </Card>
    </main>
  );
}

function FeatureCell({
  value,
  pro,
}: {
  value: boolean | string;
  pro?: boolean;
}) {
  if (typeof value === "string") {
    return (
      <span
        className={cn(
          "text-center text-xs font-medium tabular-nums",
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
          <CheckCircle className="h-3 w-3" weight="fill" />
        </span>
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <XCircle className="h-3 w-3" weight="fill" />
        </span>
      )}
    </div>
  );
}
