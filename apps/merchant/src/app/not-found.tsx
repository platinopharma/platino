'use client';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center gap-6 px-4 py-12 text-center font-sans text-ink bg-paper">
      <div className="max-w-md w-full rounded-xl border border-line bg-paper-alt/60 p-6 text-center shadow-lg">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-lg bg-brand/10 text-brand border border-brand/25">
          <AlertCircle className="size-6" strokeWidth={1.75} />
        </div>
        
        <h1 className="text-lg font-semibold leading-tight text-ink">
          Partner Console Route Not Found
        </h1>
        
        <p className="mt-1.5 text-[13px] leading-normal text-ink-muted">
          The requested management interface, order record, or store setting URL is unrecognized or unavailable under your active partner session.
        </p>
        
        <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Link
            href="/live/orders"
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-ink px-3.5 text-[13px] font-medium text-paper transition-colors hover:bg-ink/90 sm:w-auto"
          >
            <LayoutDashboard className="size-4" strokeWidth={1.75} />
            Orders Dashboard
          </Link>
          
          <Link
            href="/onboarding?new=true"
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-line bg-paper px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-hover sm:w-auto"
          >
            Store Onboarding
          </Link>
        </div>
        
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Return to previous view
        </button>
      </div>
    </div>
  );
}
