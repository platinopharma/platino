"use client";
import { motion } from "framer-motion";

const items = [
  {
    n: "01",
    tag: "Orders",
    title: "Order Fulfillment",
    copy: "A single queue for prescriptions and OTC orders — accept, prepare, dispatch and deliver without ever leaving the workflow.",
    bullets: ["Incoming order queue", "State machine: 6 stages", "Cancellation reasons", "Full audit history", "Refund & partial fulfilment"],
  },
  {
    n: "02",
    tag: "Inventory",
    title: "Inventory Tracking",
    copy: "Batch-level medicine catalogue with automatic expiry tracking, reorder points and sub-100ms search across every SKU.",
    bullets: ["Medicine catalog with images", "Batch expiry tracking", "Barcode & bulk edit", "Categories & taxonomies", "Sub-100ms search"],
  },
  {
    n: "03",
    tag: "Analytics",
    title: "Sales Analytics",
    copy: "Daily, weekly and monthly revenue with bestsellers, dead stock and gross margin per SKU — updated in real time.",
    bullets: ["Revenue by day / week / month", "Best-selling medicines", "Store performance", "Gross profit per SKU", "Custom cohorts"],
  },
  {
    n: "04",
    tag: "Reports",
    title: "Business Insights",
    copy: "One-click GSTR-ready summaries, daily sales exports and audit-grade batch traceability — every file signed and timestamped.",
    bullets: ["GSTR-3B summary", "Daily sales exports", "Expiry & write-off log", "Batch traceability", "Signed PDF & CSV"],
  },
  {
    n: "05",
    tag: "Delivery",
    title: "Secure Pharmacy Platform",
    copy: "Route to in-house riders or regional partners. Customers see live coordinates, you see SLA compliance on every drop.",
    bullets: ["Rider assignment", "Live GPS to customer", "Maps + navigation", "SLA + delay alerts", "Delivery analytics"],
  },
  {
    n: "06",
    tag: "Notifications",
    title: "Prescription Management",
    copy: "Low stock, expiring batches, cancelled orders and new prescriptions — grouped, prioritised and quiet when you are.",
    bullets: ["Low stock alerts", "Expiring batches", "New / cancelled orders", "Operational reminders", "Quiet hours + priorities"],
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-line py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-3xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">[ 06 ] Features</div>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            Everything Your Pharmacy Needs to Grow Online
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
          {items.map((it, i) => (
            <motion.article
              key={it.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className={`group bg-paper p-8 transition-colors hover:bg-hover md:p-10 ${i === items.length - 1 && items.length % 2 === 1 ? "md:col-span-2" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
                  {it.n} · {it.tag}
                </div>
                <span className="translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-ink-subtle">→</span>
              </div>
              <h3 className="mt-8 max-w-md font-display text-3xl leading-tight text-ink">{it.title}</h3>
              <p className="mt-3 max-w-md text-ink-muted">{it.copy}</p>
              <ul className="mt-6 grid grid-cols-1 gap-y-1.5 border-t border-line pt-5 sm:grid-cols-2">
                {it.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                    <span className="size-1 rounded-full bg-brand" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}