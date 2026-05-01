"use client";

import { useState, type ReactNode } from "react";
import { CircleCheck, Medal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UpgradeModalProps {
  trigger?: ReactNode;
  defaultOpen?: boolean;
}

const FEATURES = [
  "Безлимит анализов матчей в день",
  "Развёрнутая аргументация Claude",
  "Ключевые факторы и влияние новостей",
  "Live-обновления по ходу матча",
  "Hot picks от ИИ ежедневно",
];

export function UpgradeModal({ trigger, defaultOpen = false }: UpgradeModalProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Medal className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
              SportAI Pro
            </span>
          </div>
          <DialogTitle className="pt-1">Получи полный анализ ИИ</DialogTitle>
          <DialogDescription>
            7 дней бесплатно, потом 499 ₽/мес. Отмена в один клик.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 py-1">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
                <CircleCheck className="h-2.5 w-2.5" strokeWidth={2} />
              </span>
              {f}
            </li>
          ))}
        </ul>

        <DialogFooter className="!flex-col gap-2 sm:!flex-col">
          <Button size="lg" className="w-full">
            Попробовать 7 дней бесплатно
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
            Может, позже
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
