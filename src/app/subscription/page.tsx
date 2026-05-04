import { Suspense } from "react";

import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { SubscriptionPageClient } from "@/components/subscription/subscription-page-client";

export const metadata = {
  title: "Подписка · DelyBet",
};

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<AppPageSkeleton variant="profile" />}>
      <SubscriptionPageClient />
    </Suspense>
  );
}
