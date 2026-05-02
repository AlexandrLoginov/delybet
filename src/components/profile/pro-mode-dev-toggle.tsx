"use client";

import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import { setDevProPreview } from "@/lib/dev-pro-preview-store";
import { cn } from "@/lib/utils";

export function ProModeDevToggle() {
  const enabled = useDevProPreview();

  return (
    <div className="flex justify-center pb-1">
      <div
        data-telegram-gate-exempt
        className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2"
      >
        <span className="text-xs font-medium text-muted-foreground">
          Режим Pro (тест)
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Временный режим Pro"
          onClick={() => setDevProPreview(!enabled)}
          className={cn(
            "inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            enabled ? "bg-success" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "h-5 w-5 rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}
