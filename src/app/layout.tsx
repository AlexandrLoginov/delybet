import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import Script from "next/script";

import { LocaleProvider } from "@/hooks/use-app-locale";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AdminModeToolbar } from "@/components/layout/admin-mode-toolbar";
import { NavBar } from "@/components/nav/NavBar";
import { TelegramBrowserGateProvider } from "@/components/telegram/telegram-browser-gate-provider";
import { TelegramSessionProvider } from "@/lib/telegram/use-telegram-session";

import "./globals.css";

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: "DelyBet — ИИ-анализ матчей",
  description:
    "Разбор матчей с помощью ИИ: вероятности, ключевые факторы и обновления в лайве.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#080b12" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning className={geistSans.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Telegram Mini App: до React — иначе initData может быть пустым */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TelegramSessionProvider>
            <LocaleProvider>
              <TelegramBrowserGateProvider>
                <AdminModeToolbar />
                <div className="min-h-screen pt-[var(--app-inset-top,0px)] pb-[calc(72px+max(20px,env(safe-area-inset-bottom,0px))+var(--admin-toolbar-h,0px))]">
                  {children}
                </div>
                <NavBar />
              </TelegramBrowserGateProvider>
            </LocaleProvider>
          </TelegramSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
