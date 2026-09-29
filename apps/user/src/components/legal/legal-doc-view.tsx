'use client';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Download } from "lucide-react";
import { EFFECTIVE_DATE, ENTITY, LEGAL_DOCS, LEGAL_VERSION, type LegalDoc } from "@/lib/legal-content";
import { downloadLegalPdf } from "@/lib/legal-pdf";

export function LegalDocView({ doc }: { doc: LegalDoc }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <Link href={`/`} className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
        <Link href="/legal" className="hover:text-foreground">
          Legal
        </Link>
        <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
        <span className="text-foreground">{doc.title}</span>
      </nav>

      <header className="border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Legal · Document {String(doc.order).padStart(2, "0")} of 12
          </span>
          <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            {LEGAL_VERSION}
          </span>
        </div>
        <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {doc.description}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
            Last updated {EFFECTIVE_DATE} · Version {LEGAL_VERSION}
          </p>
          <button
            type="button"
            onClick={() => downloadLegalPdf(doc)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 text-[11px] font-bold uppercase tracking-widest text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={`Download ${doc.title} as PDF`}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Download PDF
          </button>
        </div>
      </header>

      <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 text-[13px] leading-relaxed text-foreground/80">
        <strong className="font-semibold text-foreground">Editable app-owned content.</strong>{" "}
        This page is maintained by {ENTITY.legalName} to describe how {ENTITY.name} operates. It
        is not an independent certification or a substitute for legal advice.
      </div>

      {doc.intro && (
        <p className="mt-8 text-[15px] leading-relaxed text-foreground/90">{doc.intro}</p>
      )}

      <div className="mt-8 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl tracking-tight text-foreground">
              {section.heading}
            </h2>
            {section.body?.map((para, i) => (
              <p
                key={i}
                className="mt-3 text-[15px] leading-relaxed text-foreground/85"
              >
                {para}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-3 space-y-2">
                {section.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-[15px] leading-relaxed text-foreground/85"
                  >
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <footer className="mt-14 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          Questions? Email{" "}
          <a
            href={`mailto:${ENTITY.supportEmail}`}
            className="font-semibold text-primary hover:underline"
          >
            {ENTITY.supportEmail}
          </a>
          .
        </div>
        <Link
          href="/legal"
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-foreground/80 hover:border-primary/40 hover:text-primary sm:self-auto"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          All legal documents
        </Link>
      </footer>

      <nav aria-label="Related legal documents" className="mt-10">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Also in Legal
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {LEGAL_DOCS.filter((d) => d.slug !== doc.slug)
            .slice(0, 6)
            .map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/legal/${d.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground/80 hover:border-primary/40 hover:text-foreground"
                >
                  <span className="truncate">
                    {String(d.order).padStart(2, "0")}. {d.title}
                  </span>
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </article>
  );
}
