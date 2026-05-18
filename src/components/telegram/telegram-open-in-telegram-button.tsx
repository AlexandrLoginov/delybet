"use client";

import { Button } from "@/components/ui/button";
import { useAppLocale } from "@/hooks/use-app-locale";
import { getTelegramBotOpenUrl } from "@/lib/telegram/telegram-bot-url";
import { cn } from "@/lib/utils";

import { TelegramLogoIcon } from "@/components/telegram/telegram-logo-icon";

const telegramCtaButtonClassName = cn(
  "w-full gap-2 rounded-[8px] border-0 bg-[#229ED9] font-semibold text-white shadow-none dark:shadow-sm",
  "hover:bg-[#1f8bc4] hover:text-white",
  "focus-visible:ring-[#229ED9]"
);

export function TelegramOpenInTelegramButton({
  className,
}: {
  className?: string;
}) {
  const { t } = useAppLocale();
  const href = getTelegramBotOpenUrl();

  return (
    <Button
      asChild
      size="lg"
      className={cn(telegramCtaButtonClassName, className)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <TelegramLogoIcon className="h-4 w-4 shrink-0 opacity-95" />
        {t("telegram.openApp")}
      </a>
    </Button>
  );
}
