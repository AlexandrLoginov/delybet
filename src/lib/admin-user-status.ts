import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";

export type AdminUserRole = "admin" | "user";

/** Статус для админ-списка: админ / Pro / без подписки / заблокирован. */
export type AdminUserStatusKind = "admin" | "pro" | "free" | "blocked";

export function resolveAdminUserRole(
  telegramUsername: string | null | undefined
): AdminUserRole {
  return isProfileAdminTelegramUsername(telegramUsername ?? undefined)
    ? "admin"
    : "user";
}

export function resolveAdminUserStatusKind(input: {
  telegramUsername?: string | null;
  plan?: string | null;
  status?: string | null;
  currentPeriodEnd?: string | Date | null;
}): AdminUserStatusKind {
  if (resolveAdminUserRole(input.telegramUsername) === "admin") {
    return "admin";
  }
  if (input.status === "blocked") {
    return "blocked";
  }
  if (input.plan === "PRO") {
    const end = input.currentPeriodEnd
      ? new Date(input.currentPeriodEnd)
      : null;
    if (!end || Number.isNaN(end.getTime()) || end >= new Date()) {
      return "pro";
    }
  }
  return "free";
}
