"use client";

import * as React from "react";
import { Headphones } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useAppLocale } from "@/hooks/use-app-locale";
import { APP_LOCALES, type AppLocaleCode } from "@/lib/locale";
import { cn } from "@/lib/utils";

const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL ?? "#";

export function HeaderActions({ className }: { className?: string }) {
  const { locale, setLocale } = useAppLocale();

  const onLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as AppLocaleCode);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor="header-lang" className="sr-only">
        Язык интерфейса
      </label>
      <select
        id="header-lang"
        value={locale}
        onChange={onLocaleChange}
        className="h-8 max-w-[8.5rem] cursor-pointer rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground shadow-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:shadow-sm"
      >
        {APP_LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <Button
        asChild
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        aria-label="Поддержка"
      >
        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
          <Headphones className="h-4 w-4" weight="fill" aria-hidden />
        </a>
      </Button>
    </div>
  );
}
