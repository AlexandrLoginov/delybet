"use client";

import { Badge } from "@/components/ui/badge";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";

export function ProfilePlanBadge() {
  const devPro = useDevProPreview();

  return (
    <Badge variant={devPro ? "success" : "muted"} className="px-1.5">
      {devPro ? "Pro" : "Free"}
    </Badge>
  );
}
