"use client";

import { LockSimple } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { RenewSubscriptionDrawer } from "@/components/subscription/RenewSubscriptionDrawer";
import { useAppLocale } from "@/hooks/use-app-locale";

interface PaywallOverlayProps {
  children: ReactNode;
  title?: string;
  description?: string;
  upgradeButton?: boolean;
}

export function PaywallOverlay({
  children,
  title,
  description,
  upgradeButton = true,
}: PaywallOverlayProps) {
  const { t } = useAppLocale();
  const resolvedTitle = title ?? t("paywall.title");
  const resolvedDescription = description ?? t("paywall.description");

  return (
    <div className="relative h-fit w-full max-w-full self-start overflow-hidden rounded-card border border-border bg-card shadow-card">
      <div
        className="pointer-events-none h-fit w-full max-w-full select-none [mask-image:linear-gradient(to_bottom,black_0,black_30%,transparent_88%)]"
        aria-hidden
      >
        <div className="h-fit w-full max-w-full opacity-50 blur-[3px]">{children}</div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 bg-gradient-to-t from-card via-card/98 to-transparent px-6 pb-6 pt-12 text-center backdrop-blur-[2px]">
        <div className="space-y-1">
          <div className="text-sm font-semibold">{resolvedTitle}</div>
          <p className="max-w-sm text-xs text-muted-foreground">{resolvedDescription}</p>
        </div>
        {upgradeButton ? (
          <RenewSubscriptionDrawer
            intent="subscribe"
            billingAction="checkout"
            trigger={
              <Button size="sm" className="gap-1.5 px-5 shadow-none dark:shadow-lg">
                <LockSimple className="h-3.5 w-3.5" weight="fill" />
                {t("paywall.openPro")}
              </Button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
