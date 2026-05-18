"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createTranslator, type TranslateFn } from "@/i18n";
import {
  formatMonthlyPriceFromRub,
  formatPriceFromRub,
} from "@/lib/currency";
import {
  applyAppLocale,
  localeMeta,
  LOCALE_STORAGE_KEY,
  readStoredLocale,
  type AppLocaleCode,
} from "@/lib/locale";

export const LOCALE_CHANGE_EVENT = "sportai-locale-change";

type LocaleContextValue = {
  locale: AppLocaleCode;
  setLocale: (code: AppLocaleCode) => void;
  hydrated: boolean;
  current: ReturnType<typeof localeMeta>;
  t: TranslateFn;
  formatFromRub: (rub: number) => string;
  formatMonthlyFromRub: (totalRub: number, months: number) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function useAppLocaleState(): LocaleContextValue {
  const [locale, setLocaleState] = useState<AppLocaleCode>("ru");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) {
      setLocaleState(stored);
      applyAppLocale(stored);
    }
    setHydrated(true);

    function onLocaleChange(event: Event) {
      const detail = (event as CustomEvent<AppLocaleCode>).detail;
      if (detail) {
        setLocaleState(detail);
        applyAppLocale(detail);
      }
    }

    function onStorage(event: StorageEvent) {
      if (event.key !== LOCALE_STORAGE_KEY) return;
      const stored = readStoredLocale();
      if (stored) {
        setLocaleState(stored);
        applyAppLocale(stored);
      }
    }

    window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setLocale = useCallback((code: AppLocaleCode) => {
    setLocaleState(code);
    localStorage.setItem(LOCALE_STORAGE_KEY, code);
    applyAppLocale(code);
    window.dispatchEvent(
      new CustomEvent(LOCALE_CHANGE_EVENT, { detail: code })
    );
  }, []);

  const t = useMemo(() => createTranslator(locale), [locale]);

  const formatFromRub = useCallback(
    (rub: number) => formatPriceFromRub(rub, locale),
    [locale]
  );

  const formatMonthlyFromRub = useCallback(
    (totalRub: number, months: number) =>
      formatMonthlyPriceFromRub(totalRub, months, locale),
    [locale]
  );

  return {
    locale,
    setLocale,
    hydrated,
    current: localeMeta(locale),
    t,
    formatFromRub,
    formatMonthlyFromRub,
  };
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const value = useAppLocaleState();
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useAppLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useAppLocale must be used within LocaleProvider");
  }
  return ctx;
}

export type { TranslateFn };
