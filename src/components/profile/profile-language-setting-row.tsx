"use client";

import Image from "next/image";
import { useState } from "react";
import { CaretRight, Check, Globe } from "@phosphor-icons/react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { APP_LOCALES, flagCdnUrl, type AppLocaleCode } from "@/lib/locale";
import { useAppLocale } from "@/hooks/use-app-locale";
import { cn } from "@/lib/utils";

export function ProfileLanguageSettingRow() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useAppLocale();

  function selectLanguage(code: AppLocaleCode) {
    setLocale(code);
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
          <Globe className="h-4 w-4" weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{t("profile.language")}</div>
          <div className="text-[11px] text-muted-foreground">{t(`meta.locales.${locale}`)}</div>
        </div>
        <CaretRight
          className="h-4 w-4 shrink-0 text-muted-foreground"
          weight="fill"
          aria-hidden
        />
      </button>

      <DrawerContent>
        <DrawerHeader className="px-6 pb-2 pt-0 text-left">
          <DrawerTitle>{t("profile.languageSheetTitle")}</DrawerTitle>
        </DrawerHeader>
        <ul
          className="flex flex-col gap-1 px-4 pb-[max(20px,env(safe-area-inset-bottom,0px))]"
          role="listbox"
          aria-label={t("profile.languageSelectAria")}
        >
          {APP_LOCALES.map((item) => {
            const selected = locale === item.code;
            return (
              <li key={item.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectLanguage(item.code)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                    selected
                      ? "bg-primary/10 ring-1 ring-inset ring-primary/35"
                      : "hover:bg-muted/60"
                  )}
                >
                  <span className="relative h-5 w-7 shrink-0 overflow-hidden rounded-sm ring-1 ring-border">
                    <Image
                      src={flagCdnUrl(item.flagCountry, 40)}
                      alt=""
                      width={28}
                      height={20}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium">
                    {t(`meta.locales.${item.code}`)}
                  </span>
                  {selected ? (
                    <Check
                      className="h-4 w-4 shrink-0 text-primary"
                      weight="bold"
                      aria-hidden
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}
