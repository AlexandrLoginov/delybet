import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { NavBar } from "@/components/nav/NavBar";
import { TelegramBrowserGateProvider } from "@/components/telegram/telegram-browser-gate-provider";
import { TelegramSessionProvider } from "@/lib/telegram/use-telegram-session";

import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DelyBet — ИИ-анализ матчей",
  description:
    "Разбор матчей с помощью ИИ: вероятности, ключевые факторы, влияние новостей и обновления в лайве.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f6" },
    { media: "(prefers-color-scheme: dark)", color: "#181a20" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
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
            <TelegramBrowserGateProvider>
              <div className="min-h-screen pt-[96px] pb-[calc(49px+max(24px,env(safe-area-inset-bottom,0px)))]">
                {children}
              </div>
              <NavBar />
            </TelegramBrowserGateProvider>
          </TelegramSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
