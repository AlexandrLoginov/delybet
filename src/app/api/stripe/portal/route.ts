import { NextRequest, NextResponse } from "next/server";

import { appBaseUrl } from "@/lib/app-base-url";
import { getSessionUserIdFromRequest } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe-client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const userId = getSessionUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });

    const customerId = sub?.stripeCustomerId?.trim();
    if (!customerId) {
      return NextResponse.json(
        { error: "NO_STRIPE_CUSTOMER" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appBaseUrl()}/subscription`,
    });

    const url = portal.url;
    if (!url) {
      return NextResponse.json({ error: "PORTAL_NO_URL" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "PORTAL_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
