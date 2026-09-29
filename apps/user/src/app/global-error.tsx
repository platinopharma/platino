'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[USER FRONTEND Global Fatal Application Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-lg w-full rounded-3xl border border-border bg-surface p-8 sm:p-10 text-center shadow-soft">
          <h1 className="font-display text-2xl font-medium tracking-tight text-destructive mb-3">System Interruption Detected</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            A critical layout rendering exception occurred. Our technical support systems have been automatically alerted.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01]"
          >
            Restore Session
          </button>
        </div>
      </body>
    </html>
  );
}
