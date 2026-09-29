const reasons = [
  { t: "Increase sales", d: "Reach thousands of nearby customers actively searching for the medicines you already stock." },
  { t: "Receive online orders", d: "Live queue of digital prescriptions and OTC orders — accept, prepare and dispatch in a single flow." },
  { t: "Manage inventory", d: "Batch-level stock with expiry tracking, low-stock alerts and one-click reorder across every store." },
  { t: "Real-time analytics", d: "Revenue, best sellers, dead stock and margin per SKU — updated the instant a sale is rung up." },
  { t: "Fast payments", d: "Weekly settlements straight to your bank with itemised statements and downloadable GST reports." },
  { t: "Dedicated support", d: "A named onboarding manager for 30 days, then 24×7 chat and phone with sub-15-minute SLAs." },
];

export function Why() {
  return (
    <section className="border-t border-line bg-ink py-24 text-paper">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">[ 03 ] Why join Platino</div>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight md:text-5xl">
              Built for Independent Pharmacies
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-paper/60">
            One platform for storefront, operations and finance — built specifically for verified pharmacy partners.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-paper/10 bg-paper/10 md:grid-cols-3">
          {reasons.map((r, i) => (
            <div key={r.t} className="bg-ink p-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
                0{i + 1}
              </div>
              <div className="mt-6 text-lg font-semibold">{r.t}</div>
              <p className="mt-2 text-sm text-paper/60">{r.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}