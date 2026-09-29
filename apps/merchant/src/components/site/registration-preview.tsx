"use client";
import { motion } from "framer-motion";

const stages = [
  {
    n: "01",
    tag: "Business details",
    fields: [
      { l: "Legal business name", v: "Green Cross Pharmacy Pvt Ltd", ok: true },
      { l: "Store address", v: "12 MG Road, Bengaluru 560001", ok: true },
      { l: "Owner contact", v: "+91 98••• ••210", ok: true },
    ],
  },
  {
    n: "02",
    tag: "Document upload",
    fields: [
      { l: "Drug licence (Form 20 & 21)", v: "licence.pdf · 1.2 MB", ok: true },
      { l: "GST certificate", v: "gst.pdf · 380 KB", ok: true },
      { l: "Pharmacist registration", v: "reg.pdf · 640 KB", ok: true },
    ],
  },
  {
    n: "03",
    tag: "Verification",
    fields: [
      { l: "GSTIN validation", v: "Matched against government registry", ok: true },
      { l: "Drug licence lookup", v: "Verified · Karnataka", ok: true },
      { l: "Bank account check", v: "Penny drop successful", ok: true },
    ],
  },
  {
    n: "04",
    tag: "Approval",
    fields: [
      { l: "Compliance review", v: "Passed · 12h 04m", ok: true },
      { l: "Store slug", v: "green-cross-mg-road", ok: true },
      { l: "Status", v: "Approved · ready to go live", ok: true },
    ],
  },
];

export function RegistrationPreview() {
  return (
    <section className="border-t border-line bg-paper-alt/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-2xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">[ 07 ] Onboarding preview</div>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            A guided, four-stage onboarding you can finish in a single sitting.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stages.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className="rounded-2xl border border-line bg-paper p-5"
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
                  Step {s.n}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-signal/25 bg-signal/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-signal">
                  ✓ Complete
                </span>
              </div>
              <div className="mt-3 font-display text-xl text-ink">{s.tag}</div>
              <ul className="mt-4 space-y-3">
                {s.fields.map((f) => (
                  <li key={f.l}>
                    <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">{f.l}</div>
                    <div className="mt-1 flex items-center gap-2 text-[13px] text-ink">
                      <span className="size-1.5 shrink-0 rounded-full bg-signal" />
                      <span className="truncate">{f.v}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-5">
          <div>
            <div className="font-display text-xl text-ink">Ready to start yours?</div>
            <div className="mt-1 text-sm text-ink-muted">Most partners are live within 24 hours of applying.</div>
          </div>
          <a
            href="/onboarding?new=true"
            className="group flex w-full items-center justify-between rounded-lg border border-line bg-paper px-4 py-3 shadow-sm transition-all hover:border-ink hover:shadow-md"
          >
            Start onboarding <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}