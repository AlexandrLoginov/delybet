"use client";

import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import { SubscriptionFreeView } from "@/components/subscription/subscription-free-view";
import { SubscriptionProDashboard } from "@/components/subscription/subscription-pro-dashboard";

export function SubscriptionPageClient() {
  const isPro = useDevProPreview();

  if (isPro) {
    return <SubscriptionProDashboard />;
  }

  return <SubscriptionFreeView />;
}
