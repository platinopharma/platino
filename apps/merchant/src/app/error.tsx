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
    console.error('[CUSTOMER FRONTEND Partner Portal Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center gap-6 px-4 py-12 text-center font-sans text-ink bg-paper">
      <div className="max-w-md w-full rounded-xl border border-line bg-paper-alt/60 p-6 text-center shadow-lg">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-lg bg-alert/10 text-alert border border-alert/25">
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold leading-tight text-ink">Partner Command Processing Exception</h2>
        <p className="mt-1.5 text-[13px] leading-normal text-ink-muted">
          An error occurred while executing interactive pharmacy operations. Our system telemetry has automatically recorded this event.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-ink px-3.5 text-[13px] font-medium text-paper transition-colors hover:bg-ink/90 sm:w-auto"
          >
            Retry Operation
          </button>
          <button
            type="button"
            onClick={() => window.location.assign('/live/orders')}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-line bg-paper px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-hover sm:w-auto"
          >
            Return to Orders Console
          </button>
        </div>
      </div>
    </div>
  );
}
