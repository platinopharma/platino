const pillars = [
  { k: "AES-256", l: "Encryption at rest", d: "Every prescription, patient record, and document is encrypted with rotating keys." },
  { k: "TLS 1.3", l: "In-transit protection", d: "All traffic secured with modern TLS across our multi-region edge." },
  { k: "SOC 2", l: "Auditable controls", d: "Independent auditors verify our controls annually. Reports available on request." },
  { k: "RBAC", l: "Role-based access", d: "Owner, pharmacist, cashier, rider — every role scoped to only what it needs." },
];

export function Security() {
  return (
    <section id="security" className="border-t border-line py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">[ 06 ] Security</div>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
              Built to the standard your patients would expect.
            </h2>
            <p className="mt-5 max-w-lg text-ink-muted">
              Pharmaceutical operations demand higher-than-average trust. We treat every prescription like a controlled
              substance — protected, auditable, and only ever visible to who needs it.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["HIPAA-aligned", "GDPR-ready", "ISO 27001", "PCI DSS"].map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-line bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {pillars.map((p) => (
              <div key={p.k} className="flex flex-col bg-paper p-6">
                <div className="font-display text-3xl text-ink">{p.k}</div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-brand">{p.l}</div>
                <p className="mt-3 text-sm text-ink-muted">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}