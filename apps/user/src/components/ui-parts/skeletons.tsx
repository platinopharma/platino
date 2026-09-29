import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl", className)} />;
}

export function PharmacyCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface-elevated">
      <div className="relative h-40 sm:h-44">
        <Skeleton className="h-full w-full rounded-none" />
        <Skeleton className="absolute left-3 top-3 h-5 w-24 rounded-full" />
        <Skeleton className="absolute right-3 top-3 h-9 w-9 rounded-full" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-10 rounded-md" />
        </div>
        <Skeleton className="mt-1.5 h-3 w-5/6" />
        <div className="mt-auto flex gap-2 pt-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-foreground/[0.02] px-4 py-2.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-3.5 rounded" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-1 flex-col p-2.5">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="mt-1.5 h-3 w-3/5" />
        <Skeleton className="mt-0.5 h-3 w-1/2" />
        <div className="mt-auto flex items-center justify-between pt-3">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}
