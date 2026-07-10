"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { TelegramWebAppUser } from "@/types/telegram";
import {
  bindTelegramViewportInsetEvents,
  clearViewportInsets,
} from "@/lib/telegram/sync-viewport-insets";

export type TelegramSessionState =
  | { status: "loading" }
  | { status: "browser" }
  | { status: "web"; user: TelegramWebAppUser }
  | { status: "telegram"; user: TelegramWebAppUser; initData: string };

const TelegramSessionContext = createContext<TelegramSessionState | null>(null);

export function TelegramSessionProvider({ children }: { children: ReactNode }) {
  const state = useTelegramSessionState();
  return (
    <TelegramSessionContext.Provider value={state}>
      {children}
    </TelegramSessionContext.Provider>
  );
}

export function useTelegramSession(): TelegramSessionState {
  const ctx = useContext(TelegramSessionContext);
  if (ctx === null) {
    throw new Error(
      "useTelegramSession must be used within TelegramSessionProvider"
    );
  }
  return ctx;
}

function useTelegramSessionState(): TelegramSessionState {
  const [state, setState] = useState<TelegramSessionState>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;
    let unbindInsets: (() => void) | undefined;

    (async () => {
      try {
        const { default: WebApp } = await import("@twa-dev/sdk");
        if (cancelled) return;

        WebApp.ready();
        if (typeof WebApp.expand === "function") {
          WebApp.expand();
        }

        unbindInsets = bindTelegramViewportInsetEvents(
          WebApp as Parameters<typeof bindTelegramViewportInsetEvents>[0]
        );

        const tg = (
          typeof window !== "undefined"
            ? (window as unknown as { Telegram?: { WebApp?: typeof WebApp } })
                .Telegram?.WebApp
            : undefined
        );

        const initData = (WebApp.initData || tg?.initData || "").trim();
        const unsafeUser = (WebApp.initDataUnsafe?.user ??
          tg?.initDataUnsafe?.user) as TelegramWebAppUser | undefined;

        if (!initData && !unsafeUser) {
          clearViewportInsets();

          const meRes = await fetch("/api/auth/me", { credentials: "include" });
          if (!cancelled && meRes.ok) {
            const me = (await meRes.json()) as {
              authenticated?: boolean;
              user?: {
                name: string | null;
                telegramId: string | null;
              };
              telegramUsername?: string | null;
            };
            const telegramId = me.user?.telegramId
              ? Number.parseInt(me.user.telegramId, 10)
              : NaN;
            if (me.authenticated && Number.isFinite(telegramId)) {
              const fullName = me.user?.name?.trim() ?? "";
              const [firstName, ...rest] = fullName.split(/\s+/);
              setState({
                status: "web",
                user: {
                  id: telegramId,
                  first_name: firstName || "User",
                  last_name: rest.join(" ") || undefined,
                  username: me.telegramUsername ?? undefined,
                },
              });
              return;
            }
          }

          setState({ status: "browser" });
          return;
        }

        if (unsafeUser) {
          setState({
            status: "telegram",
            user: unsafeUser,
            initData,
          });
        }

        if (initData) {
          const res = await fetch("/api/telegram/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ initData }),
          });

          if (cancelled) return;

          if (res.ok) {
            await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ initData }),
            });

            const data = (await res.json()) as {
              user?: TelegramWebAppUser;
              authDate?: number;
            };
            if (data.user) {
              setState({ status: "telegram", user: data.user, initData });
              return;
            }
          }

          if (res.status === 401) {
            if (unsafeUser) {
              setState({ status: "telegram", user: unsafeUser, initData });
              return;
            }
            clearViewportInsets();
            setState({ status: "browser" });
            return;
          }
        }

        if (unsafeUser) {
          setState({ status: "telegram", user: unsafeUser, initData });
          return;
        }

        clearViewportInsets();
        setState({ status: "browser" });
      } catch {
        if (!cancelled) {
          clearViewportInsets();
          setState({ status: "browser" });
        }
      }
    })();

    return () => {
      cancelled = true;
      unbindInsets?.();
    };
  }, []);

  return state;
}
