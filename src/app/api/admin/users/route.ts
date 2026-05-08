import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const guard = requireAdminSession(req);
    if (!guard.ok) return guard.response;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        telegramId: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            updatedAt: true,
          },
        },
      },
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      telegramId: u.telegramId,
      createdAt: u.createdAt.toISOString(),
      subscription: u.subscription
        ? {
            plan: u.subscription.plan,
            status: u.subscription.status,
            currentPeriodEnd: u.subscription.currentPeriodEnd?.toISOString() ?? null,
            stripeCustomerId: u.subscription.stripeCustomerId,
            stripeSubscriptionId: u.subscription.stripeSubscriptionId,
            updatedAt: u.subscription.updatedAt.toISOString(),
            isBlocked: u.subscription.status === "blocked",
          }
        : null,
    }));

    const stats = {
      totalUsers: result.length,
      proUsers: result.filter((u) => u.subscription?.plan === "PRO").length,
      blockedUsers: result.filter((u) => u.subscription?.isBlocked).length,
      stripeLinkedUsers: result.filter(
        (u) => Boolean(u.subscription?.stripeCustomerId)
      ).length,
    };

    return NextResponse.json({
      users: result,
      stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "ADMIN_USERS_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
