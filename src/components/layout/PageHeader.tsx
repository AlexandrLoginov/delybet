import type { ReactNode } from "react";

import { HeaderActions } from "@/components/layout/header-actions";
import { HeaderTopSlot } from "@/components/layout/header-top-slot";

interface PageHeaderProps {
  title: string;
  description?: string;
  right?: ReactNode;
}

export function PageHeader({ title, description, right }: PageHeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <HeaderTopSlot />
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-tight">{title}</span>
          <div className="flex items-center gap-2">
            <HeaderActions />
            {right}
          </div>
        </div>
      </header>
      {description && (
        <div className="mx-auto w-full max-w-2xl px-4 pt-5">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      )}
    </>
  );
}
