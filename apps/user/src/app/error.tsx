'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[USER FRONTEND Route Error Shield]', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 px-4 py-16 text-center font-sans text-foreground">
      <div className="max-w-lg rounded-3xl border border-border bg-surface p-8 sm:p-10 shadow-soft">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">We encountered an unexpected processing error</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Our diagnostic systems have logged this incident. Please reset your session or retry the operation.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01] sm:w-auto"
          >
            Retry and Recovery
          </button>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-surface px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated sm:w-auto"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
