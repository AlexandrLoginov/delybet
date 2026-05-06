"use client";

import { Badge } from "@/components/ui/badge";
import { useAuthMe } from "@/hooks/use-auth-me";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";

export function ProfilePlanBadge() {
  const { data: authMe } = useAuthMe();
  const devPro = useDevProPreview();
  const isPro = Boolean(authMe?.isPro) || devPro;

  return (
    <Badge variant={isPro ? "success" : "muted"} className="px-1.5">
      {isPro ? "Pro" : "Free"}
    </Badge>
  );
}
