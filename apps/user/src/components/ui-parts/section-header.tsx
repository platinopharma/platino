import type { ReactNode } from "react";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  hint,
  actionTo,
  actionLabel = "See all",
}: {
  eyebrow?: string;
  title: ReactNode;
  hint?: string;
  actionTo?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </div>
        )}
        <h2 className="mt-1 font-display text-2xl font-medium leading-tight sm:text-3xl">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </div>
      {actionTo && (
        <Link
          href={actionTo}
          className="group hidden shrink-0 items-center gap-1 text-sm font-medium text-primary sm:inline-flex"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
