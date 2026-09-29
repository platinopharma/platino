import { ReactNode } from "react";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Platino Pharmacy Legal",
    default: "Legal & Privacy | Platino Pharmacy",
  },
  description: "Legal policies, terms of service, and privacy guidelines for Platino Pharmacy users and partners.",
};

const legalDocs = [
  { title: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  { title: "Privacy Policy", href: "/legal/privacy-policy" },
  { title: "Customer Terms of Service", href: "/legal/customer-terms" },
  { title: "Pharmacy Partner Agreement", href: "/legal/pharmacy-partner-agreement" },
  { title: "Refund, Return & Cancellation", href: "/legal/refund-cancellation" },
  { title: "Medical Disclaimer", href: "/legal/medical-disclaimer" },
  { title: "Platform Responsibilities", href: "/legal/platform-responsibilities" },
  { title: "Acceptable Use Policy", href: "/legal/acceptable-use" },
  { title: "Intellectual Property Policy", href: "/legal/intellectual-property" },
  { title: "Cookie Policy", href: "/legal/cookie-policy" },
  { title: "Community Guidelines", href: "/legal/community-guidelines" },
  { title: "Grievance Redressal Policy", href: "/legal/grievance-redressal" },
];

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper font-sans text-ink antialiased">
      <SiteNav />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-24 md:flex md:gap-16">
          <aside className="mb-12 md:mb-0 md:w-64 md:shrink-0">
            <div className="sticky top-28">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle mb-6">
                Legal Documents
              </div>
              <nav className="flex flex-col gap-3 border-l border-line pl-4">
                {legalDocs.map((doc) => (
                  <Link
                    key={doc.href}
                    href={doc.href}
                    className="text-sm text-ink-muted hover:text-signal transition-colors"
                  >
                    {doc.title}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          
          <div className="prose prose-slate max-w-3xl flex-1 pb-24 prose-headings:font-display prose-headings:font-semibold prose-a:text-signal hover:prose-a:text-brand prose-p:text-ink-muted prose-li:text-ink-muted">
            {children}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
