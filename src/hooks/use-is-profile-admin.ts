"use client";

import { useAdminUserPreview } from "@/hooks/use-admin-user-preview";
import { useTelegramSession } from "@/lib/telegram/use-telegram-session";
import { isProfileAdminTelegramUser } from "@/lib/telegram/profile-admin-eligible";

/** Telegram-аккаунт в списке админов (независимо от переключателя Admin User). */
export function useIsProfileAdmin(): boolean {
  const state = useTelegramSession();
  return state.status === "telegram" && isProfileAdminTelegramUser(state.user);
}

/** Админские возможности в UI (пункт «Админка», доступ к /admin). */
export function useAdminFeaturesEnabled(): boolean {
  const isAdmin = useIsProfileAdmin();
  const adminUserMode = useAdminUserPreview();
  return isAdmin && adminUserMode;
}

export function useTelegramInitData(): string | null {
  const state = useTelegramSession();
  return state.status === "telegram" ? state.initData || null : null;
}
