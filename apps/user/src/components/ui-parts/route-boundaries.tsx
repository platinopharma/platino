'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, SearchX } from "lucide-react";

export function RouteError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <h1 className="mt-4 font-display text-2xl font-medium">Something didn't load</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message || "Please try again in a moment."}</p>
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => {
            router.refresh();
            reset();
          }}
          className="h-11 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="grid h-11 place-items-center rounded-full border border-border bg-surface-elevated px-6 text-sm font-medium"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export function RouteNotFound({
  title,
  hint,
  backTo = "/",
  backLabel = "Go home",
}: {
  title: string;
  hint?: string;
  backTo?: "/" | "/pharmacies" | "/orders" | "/legal";
  backLabel?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="h-5 w-5" aria-hidden />
      </div>
      <h1 className="mt-4 font-display text-2xl font-medium">{title}</h1>
      {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
      <Link
        href={backTo}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
      >
        {backLabel}
      </Link>
    </div>
  );
}
