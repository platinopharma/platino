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
    console.error('[CUSTOMER FRONTEND Global Fatal Exception]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-paper text-ink flex flex-col items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-md w-full rounded-xl border border-line bg-paper-alt/60 p-6 text-center shadow-lg">
          <h1 className="text-lg font-semibold leading-tight text-alert mb-2">Partner Portal Interruption</h1>
          <p className="text-[13px] leading-normal text-ink-muted mb-6">
            A fatal routing exception was encountered. Our operations engineering team has been alerted via telemetry monitoring.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-ink px-3.5 text-[13px] font-medium text-paper transition-colors hover:bg-ink/90"
          >
            Restore Partner Portal
          </button>
        </div>
      </body>
    </html>
  );
}
