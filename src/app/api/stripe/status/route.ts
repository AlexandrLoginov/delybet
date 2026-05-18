import { NextResponse } from "next/server";

import { appBaseUrl } from "@/lib/app-base-url";
import {
  isStripeCheckoutReady,
  isStripeProductionReady,
  isStripeSecretConfigured,
  isStripeWebhookConfigured,
  stripePackagePriceStatus,
} from "@/lib/stripe-config";

export const dynamic = "force-dynamic";

/** Публичная диагностика Stripe (без секретов). */
export async function GET() {
  const packages = stripePackagePriceStatus();

  return NextResponse.json({
    secretKey: isStripeSecretConfigured(),
    webhook: isStripeWebhookConfigured(),
    checkoutReady: isStripeCheckoutReady(),
    productionReady: isStripeProductionReady(),
    packages,
    appBaseUrl: appBaseUrl(),
    webhookPath: "/api/stripe/webhook",
  });
}
