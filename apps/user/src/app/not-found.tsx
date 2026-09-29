'use client';
import Link from 'next/link';
import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 px-4 py-16 text-center font-sans text-foreground">
      <div className="max-w-lg rounded-3xl border border-border bg-surface p-8 sm:p-10 shadow-soft">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-primary">
          <FileQuestion className="h-8 w-8" strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Page or resource not found
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The healthcare resource, pharmacy storefront, or prescription record you are looking for may have been removed, archived, or is currently unavailable in your area.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01] sm:w-auto"
          >
            <Home className="h-4 w-4" strokeWidth={1.75} />
            Return to Homepage
          </Link>

          <Link
            href="/pharmacies"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated sm:w-auto"
          >
            <Search className="h-4 w-4 text-primary" strokeWidth={1.75} />
            Explore Pharmacies
          </Link>
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Go back to previous page
        </button>
      </div>
    </div>
  );
}
