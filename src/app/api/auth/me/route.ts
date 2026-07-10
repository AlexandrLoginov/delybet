import { cookies } from "next/headers";

import { NextResponse } from "next/server";

import { SESSION_COOKIE, verifySession, verifySessionPayload } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = cookies();
    const token = store.get(SESSION_COOKIE)?.value ?? null;
    const userId = token ? verifySession(token) : null;
    const sessionPayload = token ? verifySessionPayload(token) : null;

    if (!userId) {
      return NextResponse.json({
        authenticated: false as const,
        user: null,
        isPro: false,
        subscription: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        telegramId: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
            stripeSubscriptionId: true,
            stripeCustomerId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        authenticated: false as const,
        user: null,
        isPro: false,
        subscription: null,
      });
    }

    const isPro = await checkSubscription(userId);

    return NextResponse.json({
      authenticated: true as const,
      user: {
        id: user.id,
        name: user.name,
        telegramId: user.telegramId,
      },
      telegramUsername: sessionPayload?.tg ?? null,
      isPro,
      subscription: user.subscription,
    });
  } catch {
    return NextResponse.json({ error: "ME_FAILED" }, { status: 500 });
  }
}
