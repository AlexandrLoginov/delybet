import { cn } from "@/lib/utils";

export function TelegramBrowserLoginExplanation({
  className,
}: {
  className?: string;
}) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
      Авторизация доступна только через официальное приложение Telegram: откройте
      бота{" "}
      <span className="font-medium text-foreground">@delybet_bot</span> и запустите
      мини-приложение из чата. В обычном браузере Telegram не передаёт сайту данные
      входа и профиля.
    </p>
  );
}
