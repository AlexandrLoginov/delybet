"use client";

import * as React from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Сменить тему"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-9 w-9"
    >
      <Sun
        className="h-[1.05rem] w-[1.05rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        weight="fill"
      />
      <Moon
        className="absolute h-[1.05rem] w-[1.05rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        weight="fill"
      />
    </Button>
  );
}
