import type { TelegramSessionState } from "@/lib/telegram/use-telegram-session";

export function isAuthenticatedTelegramSession(
  state: TelegramSessionState
): state is Extract<
  TelegramSessionState,
  { status: "telegram" } | { status: "web" }
> {
  return state.status === "telegram" || state.status === "web";
}
