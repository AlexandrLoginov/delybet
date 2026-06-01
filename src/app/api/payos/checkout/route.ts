import { NextRequest, NextResponse } from "next/server";

import { getSessionUserIdFromRequest } from "@/lib/auth-session";
import { payosCancelUrl, payosReturnUrl } from "@/lib/payos-config";
import { isSubscriptionPackageId } from "@/lib/stripe-price-env";
import { getPayOS } from "@/lib/payos-client";
import { payosAmountVndForPackage, generatePayosOrderCode } from "@/lib/payos-amount";
import { savePayosPendingOrder } from "@/lib/payos-order-cache";
import { isPayosConfigured } from "@/lib/payos-config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!isPayosConfigured()) {
      return NextResponse.json(
        { error: "PAYOS_NOT_CONFIGURED", message: "PayOS is not configured" },
        { status: 503 }
      );
    }

    const userId = getSessionUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Войдите через Telegram Mini App",
        },
        { status: 401 }
      );
    }

    const body = (await req.json()) as { packageId?: string };
    const packageId = body.packageId;
    if (!isSubscriptionPackageId(packageId)) {
      return NextResponse.json({ error: "INVALID_PACKAGE" }, { status: 400 });
    }

    const orderCode = generatePayosOrderCode();
    const amount = payosAmountVndForPackage(packageId);

    await savePayosPendingOrder(orderCode, { userId, packageId });

    const payos = getPayOS();
    const link = await payos.paymentRequests.create({
      orderCode,
      amount,
      description: `DelyBet Pro ${packageId}`,
      returnUrl: payosReturnUrl(),
      cancelUrl: payosCancelUrl(),
    });

    if (!link.checkoutUrl) {
      return NextResponse.json(
        { error: "PAYOS_NO_URL", message: "PayOS did not return checkout URL" },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: link.checkoutUrl, orderCode });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PAYOS_CHECKOUT_FAILED";
    return NextResponse.json(
      { error: "PAYOS_CHECKOUT_FAILED", message },
      { status: 500 }
    );
  }
}
