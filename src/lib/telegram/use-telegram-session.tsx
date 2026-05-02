"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { TelegramWebAppUser } from "@/types/telegram";

export type TelegramSessionState =
  | { status: "loading" }
  | { status: "browser" }
  | { status: "telegram"; user: TelegramWebAppUser };

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

    (async () => {
      try {
        const { default: WebApp } = await import("@twa-dev/sdk");
        if (cancelled) return;

        WebApp.ready();
        if (typeof WebApp.expand === "function") {
          WebApp.expand();
        }

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
          setState({ status: "browser" });
          return;
        }

        if (unsafeUser) {
          setState({ status: "telegram", user: unsafeUser });
        }

        if (initData) {
          const res = await fetch("/api/telegram/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData }),
          });

          if (cancelled) return;

          if (res.ok) {
            const data = (await res.json()) as {
              user?: TelegramWebAppUser;
              authDate?: number;
            };
            if (data.user) {
              setState({ status: "telegram", user: data.user });
              return;
            }
          }

          if (res.status === 401) {
            if (unsafeUser) {
              setState({ status: "telegram", user: unsafeUser });
              return;
            }
            setState({ status: "browser" });
            return;
          }
        }

        if (unsafeUser) {
          setState({ status: "telegram", user: unsafeUser });
          return;
        }

        setState({ status: "browser" });
      } catch {
        if (!cancelled) setState({ status: "browser" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
