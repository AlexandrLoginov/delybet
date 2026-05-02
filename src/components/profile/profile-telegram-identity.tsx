"use client";

import { useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ProfilePlanBadge } from "@/components/profile/profile-plan-badge";
import {
  displayNameFromTelegramUser,
  initialsFromTelegramUser,
} from "@/lib/telegram/telegram-user-display";
import { cn } from "@/lib/utils";
import type { TelegramWebAppUser } from "@/types/telegram";

type IdentityState =
  | { status: "loading" }
  | { status: "browser" }
  | {
      status: "telegram";
      user: TelegramWebAppUser;
      verified: boolean;
      authDate?: number;
      verifyError?: "session";
    };

export function ProfileTelegramIdentity() {
  const [state, setState] = useState<IdentityState>({ status: "loading" });

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

        const initData =
          (WebApp.initData || tg?.initData || "").trim();
        const unsafeUser = (WebApp.initDataUnsafe?.user ??
          tg?.initDataUnsafe?.user) as TelegramWebAppUser | undefined;

        if (!initData && !unsafeUser) {
          setState({ status: "browser" });
          return;
        }

        if (unsafeUser) {
          setState({
            status: "telegram",
            user: unsafeUser,
            verified: false,
          });
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
              setState({
                status: "telegram",
                user: data.user,
                verified: true,
                authDate: data.authDate,
              });
              return;
            }
          }

          if (res.status === 401) {
            if (unsafeUser) {
              setState({
                status: "telegram",
                user: unsafeUser,
                verified: false,
                verifyError: "session",
              });
              return;
            }
            setState({ status: "browser" });
            return;
          }

          /* 503: токен бота не задан — оставляем данные из initDataUnsafe */
        }

        if (unsafeUser) {
          setState({
            status: "telegram",
            user: unsafeUser,
            verified: false,
          });
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

  if (state.status === "loading") {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex animate-pulse items-center gap-4">
            <div className="h-14 w-14 shrink-0 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-3 w-36 rounded bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.status === "browser") {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Данные профиля доступны только внутри{" "}
            <span className="font-medium text-foreground">Telegram Mini App</span>{" "}
            с непустым <code className="text-xs">initData</code>.
          </p>
          <p className="text-[11px] text-muted-foreground">
            В BotFather для меню бота укажите тип{" "}
            <span className="font-medium text-foreground/90">Web App</span> и HTTPS-URL
            сайта (не обычную ссылку «открыть в браузере»). После смены настроек
            полностью закройте мини-приложение и откройте снова из чата с ботом.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { user, verified, authDate, verifyError } = state;
  const name = displayNameFromTelegramUser(user);
  const initials = initialsFromTelegramUser(user);
  const sessionHint =
    authDate != null
      ? new Date(authDate * 1000).toLocaleString("ru-RU", {
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            {user.photo_url ? (
              <AvatarImage src={user.photo_url} alt="" className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-base font-semibold">{name}</span>
              <ProfilePlanBadge />
            </div>
            {user.username ? (
              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                @{user.username}
              </div>
            ) : null}
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Fingerprint className="h-3 w-3 shrink-0" strokeWidth={2} />
              <span className="truncate tabular-num">ID {user.id}</span>
            </div>
            {verifyError === "session" ? (
              <p className="mt-1 text-[11px] text-destructive">
                Сессия устарела. Закройте и снова откройте приложение из бота.
              </p>
            ) : verified && sessionHint ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Данные проверены · {sessionHint}
              </p>
            ) : (
              <p
                className={cn(
                  "mt-1 text-[11px] text-muted-foreground",
                  !verified && "italic"
                )}
              >
                {verified
                  ? "Telegram"
                  : "Добавьте TELEGRAM_BOT_TOKEN на сервере для проверки подписи"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
