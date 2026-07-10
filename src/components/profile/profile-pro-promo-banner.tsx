"use client";

import { Medal } from "@phosphor-icons/react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RenewSubscriptionDrawer } from "@/components/subscription/RenewSubscriptionDrawer";
import { useAppLocale } from "@/hooks/use-app-locale";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";

export function ProfileProPromoBanner() {
  const { t } = useAppLocale();
  const { data: authMe } = useAuthMe();
  const devPro = useDevProPreview();
  if (authMe?.isPro || devPro) return null;

  return (
    <Card className="overflow-hidden border-primary/35 shadow-glow">
      <CardContent className="flex items-center gap-3 bg-gradient-to-r from-primary/12 via-primary/8 to-transparent p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-primary text-primary-foreground shadow-glow">
          <Medal className="h-4 w-4" weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{t("subscription.proEyebrow")}</div>
          <p className="text-xs text-muted-foreground">{t("profile.promoTitle")}</p>
        </div>
        <RenewSubscriptionDrawer
          intent="subscribe"
          trigger={
            <Button type="button" size="sm" className="shrink-0">
              {t("profile.promoCta")}
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
