"use client";

import * as React from "react";
import { faHeadset } from "@fortawesome/free-solid-svg-icons";

import { FaIcon } from "@/components/icons/FaIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL ?? "#";

const LOCALES = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

const STORAGE_KEY = "sportai-locale";

export function HeaderActions({ className }: { className?: string }) {
  const [locale, setLocale] = React.useState<LocaleCode>("ru");

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
    if (stored === "ru" || stored === "en") {
      setLocale(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const onLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as LocaleCode;
    setLocale(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
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
        className="h-8 max-w-[8.5rem] cursor-pointer rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {LOCALES.map((l) => (
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
          <FaIcon icon={faHeadset} className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
