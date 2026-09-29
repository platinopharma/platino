import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocView } from "@/components/legal/legal-doc-view";
import { getLegalDoc, LEGAL_DOCS } from "@/lib/legal-content";

export async function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({
    doc: doc.slug,
  }));
}

export const dynamic = 'force-static';
export const revalidate = 86400; // 24-hour immutable CDN caching

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const docContent = getLegalDoc(doc);
  if (!docContent) return { title: 'Document Not Found | Platino Pharma' };
  return {
    title: `${docContent.title} | Platino Pharma`,
    description: docContent.description,
    alternates: { canonical: `/legal/${docContent.slug}` },
  };
}

export default async function LegalDocPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  
  const docContent = getLegalDoc(doc);
  if (!docContent) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          Legal
        </span>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-foreground">
          Document not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn't find a legal document called <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{doc}</code>.
        </p>
        <Link
          href="/legal"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Back to all legal documents
        </Link>
      </div>
    );
  }
  
  return <LegalDocView doc={docContent} />;
}
