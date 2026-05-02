"use client";

import { useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  displayNameFromTelegramUser,
  initialsFromTelegramUser,
} from "@/lib/telegram/telegram-user-display";
import type { TelegramWebAppUser } from "@/types/telegram";

type IdentityState =
  | { status: "loading" }
  | { status: "browser" }
  | { status: "telegram"; user: TelegramWebAppUser };

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

          /* 503: токен бота не задан — оставляем данные из initDataUnsafe */
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

  if (state.status === "loading") {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex min-h-[88px] items-start gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-full" aria-hidden />
            <div className="flex min-h-[56px] min-w-0 flex-1 flex-col justify-center gap-2">
              <Skeleton className="h-5 w-[min(220px,75%)] rounded-lg" aria-hidden />
              <Skeleton className="h-3.5 w-32 rounded-md" aria-hidden />
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

  const { user } = state;
  const name = displayNameFromTelegramUser(user);
  const initials = initialsFromTelegramUser(user);

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
            <div className="truncate text-base font-semibold text-foreground">{name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Fingerprint className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
              <span className="tabular-num">ID {user.id}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
