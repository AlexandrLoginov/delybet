import type { TelegramWebAppUser } from "@/types/telegram";

/** @username Telegram (без @): админка, Free/Pro и Mock/Api. */
export const PROFILE_ADMIN_USERNAMES = [
  "aleksandr_loginov_designer",
  "yaronberg",
  "uppcorp",
] as const;

const PROFILE_ADMIN_USERNAMES_SET = new Set<string>(
  PROFILE_ADMIN_USERNAMES.map((u) => u.toLowerCase())
);

function normalizeTelegramUsername(username: string | undefined): string | null {
  const raw = username?.trim().toLowerCase();
  if (!raw) return null;
  return raw.startsWith("@") ? raw.slice(1) : raw;
}

export function isProfileAdminTelegramUsername(
  username: string | undefined
): boolean {
  const normalized = normalizeTelegramUsername(username);
  if (!normalized) return false;
  return PROFILE_ADMIN_USERNAMES_SET.has(normalized);
}

export function isProfileAdminTelegramUser(
  user: Pick<TelegramWebAppUser, "username"> | undefined
): boolean {
  return isProfileAdminTelegramUsername(user?.username);
}
