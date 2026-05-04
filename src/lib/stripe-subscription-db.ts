import type Stripe from "stripe";

import { prisma } from "./prisma";

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  if (
    status === "active" ||
    status === "trialing"
  )
    return "active";
  if (status === "past_due" || status === "unpaid")
    return "past_due";
  return status;
}

/**
 * Приводит строку Stripe-подписки к нашей строке Subscription.
 * userId нужен только при создании строки впервые через upsert(where: userId).
 */
export async function syncStripeSubscription(params: {
  userId: string;
  stripeSub: Stripe.Subscription;
}): Promise<void> {
  const { userId, stripeSub } = params;

  const customerId =
    typeof stripeSub.customer === "string"
      ? stripeSub.customer
      : stripeSub.customer?.id ?? null;

  if (!customerId) return;

  const okForPro =
    stripeSub.status === "active" || stripeSub.status === "trialing";
  const plan = okForPro ? "PRO" : "FREE";
  const periodEnd = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : null;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSub.id,
      plan,
      status: mapStripeStatus(stripeSub.status),
      currentPeriodEnd: periodEnd,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSub.id,
      plan,
      status: mapStripeStatus(stripeSub.status),
      currentPeriodEnd: periodEnd,
    },
  });
}

export async function clearProSubscription(userId: string): Promise<void> {
  await prisma.subscription.updateMany({
    where: { userId },
    data: {
      plan: "FREE",
      status: "canceled",
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    },
  });
}
