"use client";

import { Medal } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RenewSubscriptionDrawer } from "@/components/subscription/RenewSubscriptionDrawer";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";

export function ProfileProPromoBanner() {
  const devPro = useDevProPreview();
  if (devPro) return null;

  return (
    <Card className="overflow-hidden border-primary/40">
      <CardContent className="flex items-center gap-3 bg-primary/[0.08] p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Medal className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">DelyBet Pro</div>
          <p className="text-xs text-muted-foreground">
            Безлимитный доступ к ИИ-анализам и ключевым факторам
          </p>
        </div>
        <RenewSubscriptionDrawer
          intent="subscribe"
          trigger={
            <Button type="button" size="sm" className="shrink-0">
              Перейти на PRO
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
