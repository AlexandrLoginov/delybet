"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { TelegramBrowserLoginExplanation } from "@/components/telegram/telegram-browser-login-explanation";
import { TelegramOpenInTelegramButton } from "@/components/telegram/telegram-open-in-telegram-button";
import {
  isTelegramExternalLinkElement,
  TELEGRAM_GATE_INTERACTIVE_SELECTOR,
} from "@/lib/telegram/telegram-browser-gate";
import { useTelegramSession } from "@/lib/telegram/use-telegram-session";

export function TelegramBrowserGateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const session = useTelegramSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (session.status === "telegram") {
      setOpen(false);
    }
  }, [session.status]);

  useEffect(() => {
    if (session.status !== "browser") return;

    const onClickCapture = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const node = e.target;
      if (!(node instanceof Element)) return;

      if (node.closest("[data-telegram-gate-exempt]")) return;
      if (node.closest('[role="dialog"]')) return;
      if (isTelegramExternalLinkElement(node)) return;

      const interactive = node.closest(TELEGRAM_GATE_INTERACTIVE_SELECTOR);
      if (!interactive) return;

      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [session.status]);

  return (
    <>
      {children}
      {session.status === "browser" ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <div className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain px-6 pb-4">
              <DrawerHeader className="px-0 pt-0">
                <DrawerTitle className="pt-2 text-left">
                  Вход через Telegram
                </DrawerTitle>
                <div className="pt-3 text-left">
                  <TelegramBrowserLoginExplanation />
                </div>
              </DrawerHeader>
            </div>
            <DrawerFooter className="gap-2">
              <TelegramOpenInTelegramButton />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : null}
    </>
  );
}
