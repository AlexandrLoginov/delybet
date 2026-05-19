import type { TranslateFn } from "@/i18n";
import { SPORTS } from "@/lib/mock-data";
import type { SportSlug } from "@/types/match";

export function sportLabel(slug: SportSlug, t: TranslateFn): string {
  return t(`sports.${slug}`);
}

export function sportsWithLabels(t: TranslateFn) {
  return SPORTS.map((s) => ({
    ...s,
    label: sportLabel(s.slug, t),
  }));
}
