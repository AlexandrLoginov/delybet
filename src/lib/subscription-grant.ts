import { prisma } from "@/lib/prisma";
import type { RenewalPackageId } from "@/i18n/types";
import { RENEWAL_PACKAGES } from "@/lib/renewal-packages";

function packageMonths(id: RenewalPackageId): number {
  const pkg = RENEWAL_PACKAGES.find((p) => p.id === id);
  return pkg?.months ?? 1;
}

/** Выдаёт или продлевает Pro на срок пакета (PayOS и др. разовые оплаты). */
export async function grantProFromPackage(
  userId: string,
  packageId: RenewalPackageId
): Promise<void> {
  const months = packageMonths(packageId);
  const now = new Date();

  const existing = await prisma.subscription.findUnique({
    where: { userId },
    select: { currentPeriodEnd: true },
  });

  const base =
    existing?.currentPeriodEnd && existing.currentPeriodEnd > now
      ? existing.currentPeriodEnd
      : now;

  const periodEnd = new Date(base);
  periodEnd.setMonth(periodEnd.getMonth() + months);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: "PRO",
      status: "active",
      currentPeriodEnd: periodEnd,
    },
    update: {
      plan: "PRO",
      status: "active",
      currentPeriodEnd: periodEnd,
    },
  });
}
