import { Skeleton } from "@/components/ui/skeleton";

export type AppPageSkeletonVariant = "list" | "detail" | "profile";

export function AppPageSkeleton({
  variant = "list",
}: {
  variant?: AppPageSkeletonVariant;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-6 pt-5">
      <Skeleton className="h-[26px] w-44 max-w-[60%] rounded-lg" aria-hidden />

      {variant === "detail" ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-[14px]" aria-hidden />
          <Skeleton className="h-52 w-full rounded-[14px]" aria-hidden />
          <Skeleton className="h-40 w-full rounded-[14px]" aria-hidden />
        </div>
      ) : variant === "profile" ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex min-h-[120px] items-start gap-4">
              <Skeleton
                className="h-14 w-14 shrink-0 rounded-full"
                aria-hidden
              />
              <div className="flex min-h-[92px] min-w-0 flex-1 flex-col justify-center gap-2.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-[min(220px,70%)] rounded-lg" />
                  <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-40 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-[14px]" aria-hidden />
          <Skeleton className="h-64 w-full rounded-[14px]" aria-hidden />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-[108px] rounded-lg" aria-hidden />
            <Skeleton className="h-9 w-[108px] rounded-lg" aria-hidden />
          </div>
          <Skeleton className="h-10 w-full max-w-xs rounded-lg" aria-hidden />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-[130px] w-full rounded-xl"
                aria-hidden
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
