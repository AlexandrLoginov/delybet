import { cn } from "@/lib/utils";

type DelyBetWordmarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-[28px]",
} as const;

export function DelyBetWordmark({ className, size = "md" }: DelyBetWordmarkProps) {
  return (
    <span className={cn("wordmark inline-flex items-baseline", sizeClass[size], className)}>
      <span>Dely</span>
      <span className="wordmark-accent">Bet</span>
    </span>
  );
}
