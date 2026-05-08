"use client";

import { useSearchParams } from "next/navigation";

import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { SubscriptionFreeView } from "@/components/subscription/subscription-free-view";
import { SubscriptionProDashboard } from "@/components/subscription/subscription-pro-dashboard";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";

export function SubscriptionPageClient() {
  const { data, isLoading, error } = useAuthMe();
  const devProPreview = useDevProPreview();
  const search = useSearchParams();
  const checkout = search.get("checkout");

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-6 text-center text-sm text-muted-foreground">
        Не удалось загрузить данные аккаунта. Проверьте доступ к интернету и попробуйте обновить
        страницу.
      </main>
    );
  }

  if (isLoading && !data) {
    return <AppPageSkeleton variant="profile" />;
  }

  const isPro = data?.isPro === true || devProPreview;

  return (
    <div className="space-y-4">
      {checkout === "success" ? (
        <div className="mx-auto max-w-2xl px-4 pt-3">
          <div className="rounded-xl border border-success/35 bg-success-muted/15 px-4 py-3 text-sm text-foreground">
            Спасибо! После Stripe подтверждение придёт через вебхук — статус подписки обновится в течение минуты.
          </div>
        </div>
      ) : null}
      {checkout === "cancel" ? (
        <div className="mx-auto max-w-2xl px-4 pt-3">
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Оплата не завершена. Можешь попробовать снова когда будет удобно.
          </div>
        </div>
      ) : null}
      {isPro ? <SubscriptionProDashboard /> : <SubscriptionFreeView />}
    </div>
  );
}
