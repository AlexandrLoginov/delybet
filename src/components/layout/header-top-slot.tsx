/** Верхняя полоса хедера 56px (h-14) — визуальный уровень над основной строкой. */
export function HeaderTopSlot() {
  return (
    <div
      className="h-14 w-full shrink-0 border-b border-border bg-card"
      aria-hidden
    />
  );
}
