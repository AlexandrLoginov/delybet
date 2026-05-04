import { NextRequest, NextResponse } from "next/server";

import { appBaseUrl } from "@/lib/app-base-url";
import { getSessionUserIdFromRequest } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe-client";
import {
  isSubscriptionPackageId,
  stripePriceIdForPackage,
} from "@/lib/stripe-price-env";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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

    const priceId = stripePriceIdForPackage(packageId);
    if (!priceId) {
      return NextResponse.json(
        {
          error: "STRIPE_PRICE_NOT_CONFIGURED",
          message: `Задайте env для пакета ${packageId} (STRIPE_PRICE_PRO_*)`,
        },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const base = appBaseUrl();

    const userRow = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: userRow?.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/subscription?checkout=success`,
      cancel_url: `${base}/subscription?checkout=cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        packageId,
      },
      subscription_data: {
        metadata: {
          userId,
          packageId,
        },
      },
    });

    const url = session.url;
    if (!url) {
      return NextResponse.json(
        { error: "CHECKOUT_NO_URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "CHECKOUT_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
