"use client";

import { useAppLocale } from "@/hooks/use-app-locale";
import { cn } from "@/lib/utils";

export function TelegramBrowserLoginExplanation({
  className,
}: {
  className?: string;
}) {
  const { t } = useAppLocale();
  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
      {t("telegram.loginExplanation")}
    </p>
  );
}
