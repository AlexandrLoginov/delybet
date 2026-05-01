import Image from "next/image";

import { cn } from "@/lib/utils";
import type { Team } from "@/types/match";

interface TeamLogoProps {
  team: Team;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_PX: Record<NonNullable<TeamLogoProps["size"]>, number> = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

export function TeamLogo({ team, size = "md", className }: TeamLogoProps) {
  const px = SIZE_PX[size];

  return (
    <div
      className={cn(
        "relative shrink-0 select-none",
        size === "sm" && "h-6 w-6",
        size === "md" && "h-8 w-8",
        size === "lg" && "h-12 w-12",
        size === "xl" && "h-16 w-16",
        className
      )}
    >
      <Image
        src={team.logoUrl}
        alt={team.name}
        width={px * 2}
        height={px * 2}
        sizes={`${px}px`}
        className="h-full w-full object-contain"
        unoptimized
      />
    </div>
  );
}
