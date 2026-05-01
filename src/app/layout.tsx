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
  title: "SportAI — ИИ-анализ матчей",
  description:
    "Получай разбор матчей от Claude: вероятности, ключевые факторы, влияние новостей и live-обновления.",
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
          <div className="min-h-screen pt-[80px] pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
            {children}
          </div>
          <NavBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
