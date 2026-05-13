"use client";

import type { ReactNode } from "react";

import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import { setDevProPreview } from "@/lib/dev-pro-preview-store";
import { useTelegramSession } from "@/lib/telegram/use-telegram-session";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";
import { cn } from "@/lib/utils";

function syncPreviewCookie(enabled: boolean): void {
  void fetch("/api/account/ui-preview-pro", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
}

/** Показывает переключатель Free/Pro только для разрешённого Telegram @username. */
export function ProfileTariffPreviewGate({
  children,
}: {
  children: ReactNode;
}) {
  const state = useTelegramSession();
  if (
    state.status !== "telegram" ||
    !isProfileAdminTelegramUsername(state.user.username)
  ) {
    return null;
  }
  return <>{children}</>;
}

/** Подписи Free / Pro и переключатель предпросмотра интерфейса. */
export function ProfileTariffPreviewControl() {
  const previewPro = useDevProPreview();

  return (
    <div
      className="flex shrink-0 items-center gap-2"
      data-telegram-gate-exempt
    >
      <span
        className={cn(
          "text-[11px] tabular-nums",
          !previewPro ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        Free
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={previewPro}
        aria-label={
          previewPro
            ? "Сейчас предпросмотр Pro, переключить на Free"
            : "Сейчас Free, переключить на предпросмотр Pro"
        }
        onClick={() => {
          const next = !previewPro;
          setDevProPreview(next);
          syncPreviewCookie(next);
        }}
        className={cn(
          "inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          previewPro ? "bg-success" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow transition-transform",
            previewPro ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
      <span
        className={cn(
          "text-[11px] tabular-nums",
          previewPro ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        Pro
      </span>
    </div>
  );
}
