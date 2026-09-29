"use client";
import { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Who can join?", a: "Any licensed pharmacy holding a valid drug licence and GST registration in a supported region. Every applicant undergoes multi-step verification before going live." },
  { q: "What documents are required?", a: "Drug licence (Form 20 & 21), GST certificate, pharmacist registration, PAN, cancelled cheque or bank proof, and store address proof. Everything is uploaded during onboarding." },
  { q: "How long does verification take?", a: "Most pharmacies are approved within 24 hours. Multi-branch operators may take up to 72 hours pending regulatory review." },
  { q: "When do I receive payments?", a: "Weekly settlements are transferred directly to your registered bank account, with itemised statements and downloadable GST reports." },
  { q: "How are commissions calculated?", a: "A transparent percentage per fulfilled order, tiered by monthly volume. Full breakdowns per SKU and order are available in the partner dashboard." },
  { q: "Do you support multiple stores?", a: "Yes. A single owner account can manage unlimited stores with per-store roles, permissions and analytics." },
  { q: "Which delivery partners are supported?", a: "You can operate with in-house riders or integrate with regional partners. Native integrations include Shadowfax, Dunzo, Porter and Loadshare." },
  { q: "Can I export my data?", a: "Anytime. Full CSV and API exports of orders, inventory and financial records are available to every partner." },
];

export function FAQ() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => faqs.filter((f) => f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase())),
    [q],
  );
  return (
    <section id="faq" className="border-t border-line py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-[240px_1fr]">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">[ 09 ] FAQ</div>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink">Questions, answered.</h2>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="mt-6 w-full rounded-md border border-line bg-paper-alt/40 px-3 py-2 text-sm outline-none focus:border-brand focus:bg-paper"
              suppressHydrationWarning
            />
          </div>
          <div>
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-ink-muted">
                No answers found for "{q}".
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filtered.map((f, i) => (
                  <AccordionItem key={f.q} value={`item-${i}`} className="border-line">
                    <AccordionTrigger className="py-5 text-left text-base font-medium text-ink hover:no-underline">
                      <span className="flex items-center gap-4">
                        <span className="font-mono text-[11px] text-ink-subtle">0{i + 1}</span>
                        {f.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="max-w-2xl text-pretty text-[15px] text-ink-muted">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}