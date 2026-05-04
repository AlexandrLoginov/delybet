import { NextRequest, NextResponse } from "next/server";

import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe-client";
import {
  clearProSubscription,
  syncStripeSubscription,
} from "@/lib/stripe-subscription-db";

export const dynamic = "force-dynamic";

async function resolveUserId(
  stripeSub: Stripe.Subscription
): Promise<string | null> {
  const m = stripeSub.metadata?.userId;
  if (typeof m === "string" && m.length > 0) return m;

  const row = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSub.id },
    select: { userId: true },
  });
  return row?.userId ?? null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "no signature" }, { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const userId = session.metadata?.userId;
        const subRaw = session.subscription;
        const subId =
          typeof subRaw === "string"
            ? subRaw
            : subRaw &&
                typeof subRaw === "object" &&
                "id" in subRaw &&
                typeof subRaw.id === "string"
              ? subRaw.id
              : undefined;
        if (typeof userId !== "string" || !userId || !subId) break;

        const stripeSub = await stripe.subscriptions.retrieve(subId);
        await syncStripeSubscription({ userId, stripeSub });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(stripeSub);
        if (userId) await syncStripeSubscription({ userId, stripeSub });
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(stripeSub);
        if (userId) await clearProSubscription(userId);
        break;
      }

      default:
        break;
    }
  } catch {
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
