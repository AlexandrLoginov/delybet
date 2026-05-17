import { cn } from "@/lib/utils";

/** Панель на экране матча (сценарии, сводка, вложенные списки). */
export const analysisBlockClass = "analysis-block";

export function analysisBlockCn(...extra: (string | undefined | false)[]) {
  return cn(analysisBlockClass, ...extra);
}
