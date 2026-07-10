"use client";

import { useCallback, useEffect, useRef } from "react";

import { getTelegramBotUsername } from "@/lib/telegram/bot-username";
import type { TelegramLoginWidgetPayload } from "@/lib/telegram/verify-login-widget";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    __delybetTelegramLogin?: (user: TelegramLoginWidgetPayload) => void;
  }
}

type TelegramLoginButtonProps = {
  className?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export function TelegramLoginButton({
  className,
  onSuccess,
  onError,
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const botUsername = getTelegramBotUsername();

  const handleAuth = useCallback(
    async (payload: TelegramLoginWidgetPayload) => {
      try {
        const res = await fetch("/api/auth/telegram-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          onError?.(data.error ?? "LOGIN_FAILED");
          return;
        }
        onSuccess?.();
      } catch {
        onError?.("LOGIN_FAILED");
      }
    },
    [onError, onSuccess]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !botUsername) return;

    window.__delybetTelegramLogin = (user) => {
      void handleAuth(user);
    };

    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "__delybetTelegramLogin(user)");
    script.setAttribute("data-request-access", "write");
    container.appendChild(script);

    return () => {
      delete window.__delybetTelegramLogin;
      container.innerHTML = "";
    };
  }, [botUsername, handleAuth]);

  return (
    <div
      ref={containerRef}
      className={cn("flex min-h-10 items-center justify-center", className)}
      data-telegram-gate-exempt
    />
  );
}
