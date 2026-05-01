// src/lib/subscription.ts
// Проверка подписки и дневных лимитов

import { prisma } from "./prisma";

// Лимиты для Free-плана
const FREE_LIMITS = {
  upcoming: 1,
  live: 1,
} as const;

export async function checkSubscription(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!sub) return false;
  if (sub.plan !== "PRO") return false;
  if (sub.status !== "active") return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;

  return true;
}

export async function checkDailyLimit(
  userId: string,
  type: "upcoming" | "live"
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.dailyUsage.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  const used = usage?.[type] ?? 0;
  const limit = FREE_LIMITS[type];

  return { allowed: used < limit, used, limit };
}

export async function incrementUsage(
  userId: string,
  type: "upcoming" | "live"
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyUsage.upsert({
    where: { userId_date: { userId, date: today } },
    create: {
      userId,
      date: today,
      upcoming: type === "upcoming" ? 1 : 0,
      live: type === "live" ? 1 : 0,
    },
    update: {
      [type]: { increment: 1 },
    },
  });
}
