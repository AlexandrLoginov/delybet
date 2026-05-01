import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { NavBar } from "@/components/nav/NavBar";

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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen pt-[96px] pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
            {children}
          </div>
          <NavBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
