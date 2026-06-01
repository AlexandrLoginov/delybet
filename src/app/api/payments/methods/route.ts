import { NextRequest, NextResponse } from "next/server";

import { isAppLocaleCode, type AppLocaleCode } from "@/lib/locale";
import {
  paymentMethodsForLocale,
  type PaymentMethodId,
} from "@/lib/payment-methods";
import { isPayosConfigured } from "@/lib/payos-config";
import { isStripeCheckoutReady } from "@/lib/stripe-config";

export const dynamic = "force-dynamic";

function methodAvailable(id: PaymentMethodId): boolean {
  switch (id) {
    case "stripe":
      return isStripeCheckoutReady();
    case "payos":
      return isPayosConfigured();
    default:
      return false;
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("locale") ?? "ru";
  const locale: AppLocaleCode = isAppLocaleCode(raw) ? raw : "ru";

  const candidates = paymentMethodsForLocale(locale);
  const methods = candidates
    .filter(methodAvailable)
    .map((id) => ({ id, available: true }));

  return NextResponse.json({
    locale,
    methods,
    stripeReady: isStripeCheckoutReady(),
    payosReady: isPayosConfigured(),
  });
}
