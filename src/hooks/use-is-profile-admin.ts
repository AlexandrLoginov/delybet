"use client";

import { useTelegramSession } from "@/lib/telegram/use-telegram-session";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";

export function useIsProfileAdmin(): boolean {
  const state = useTelegramSession();
  return (
    state.status === "telegram" &&
    isProfileAdminTelegramUsername(state.user.username)
  );
}

export function useTelegramInitData(): string | null {
  const state = useTelegramSession();
  return state.status === "telegram" ? state.initData || null : null;
}
