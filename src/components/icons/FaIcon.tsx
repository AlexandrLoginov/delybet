"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { cn } from "@/lib/utils";

type FaIconProps = {
  icon: IconDefinition;
  className?: string;
} & Omit<React.ComponentProps<typeof FontAwesomeIcon>, "icon">;

export function FaIcon({ icon, className, ...props }: FaIconProps) {
  return (
    <FontAwesomeIcon
      icon={icon}
      fixedWidth
      className={cn("inline-block shrink-0", className)}
      {...props}
    />
  );
}
