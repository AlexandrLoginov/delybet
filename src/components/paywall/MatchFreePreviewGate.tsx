"use client";

import { LockSimple, Medal } from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { RenewSubscriptionDrawer } from "@/components/subscription/RenewSubscriptionDrawer";
import { useAppLocale } from "@/hooks/use-app-locale";
import {
  freePreviewKindForMatch,
  getFreeRedeemedMatchId,
  redeemFreePreview,
  isMatchGloballyEligibleForFreePreview,
} from "@/lib/freemium";
import type { Match } from "@/types/match";

function FreePreviewBlocked() {
  const { t } = useAppLocale();
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <LockSimple className="h-5 w-5" weight="fill" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">
          {t("matches.freePreviewUsed")}
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {t("paywall.description")}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <RenewSubscriptionDrawer
          intent="subscribe"
          billingAction="checkout"
          trigger={
            <Button className="gap-1.5">
              <Medal className="h-3.5 w-3.5" weight="fill" />
              {t("subscription.subscribeCta")}
            </Button>
          }
        />
        <Button asChild variant="outline">
          <Link href="/matches">{t("common.matches")}</Link>
        </Button>
      </div>
    </main>
  );
}

export function MatchFreePreviewGate({
  match,
  isPro,
  liveFreeEligibleId,
  children,
}: {
  match: Match;
  isPro: boolean;
  liveFreeEligibleId?: string | null;
  children: ReactNode;
}) {
  if (isPro) return <>{children}</>;

  const eligibleGlobally = isMatchGloballyEligibleForFreePreview(match, {
    liveEligibleId:
      match.status === "live" && liveFreeEligibleId !== undefined
        ? liveFreeEligibleId
        : undefined,
  });
  const kind = freePreviewKindForMatch(match);

  if (typeof window !== "undefined") {
    const r = getFreeRedeemedMatchId(kind);
    if (!r && eligibleGlobally) {
      redeemFreePreview(match.id, kind);
    }
  }

  const redeemed = getFreeRedeemedMatchId(kind);

  if (!eligibleGlobally) {
    if (redeemed === match.id) return <>{children}</>;
    return <FreePreviewBlocked />;
  }

  const rNow = getFreeRedeemedMatchId(kind);
  if (!rNow || rNow === match.id) return <>{children}</>;
  return <FreePreviewBlocked />;
}
