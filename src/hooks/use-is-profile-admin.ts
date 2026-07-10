"use client";

import { useTelegramSession } from "@/lib/telegram/use-telegram-session";
import { isProfileAdminTelegramUser } from "@/lib/telegram/profile-admin-eligible";
import { isAuthenticatedTelegramSession } from "@/lib/telegram/session-status";

export function useIsProfileAdmin(): boolean {
  const state = useTelegramSession();
  return (
    isAuthenticatedTelegramSession(state) &&
    isProfileAdminTelegramUser(state.user)
  );
}

export function useTelegramInitData(): string | null {
  const state = useTelegramSession();
  return state.status === "telegram" ? state.initData || null : null;
}
