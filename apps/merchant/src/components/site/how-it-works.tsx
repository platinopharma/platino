"use client";
import { motion } from "framer-motion";

const steps = [
  { n: "01", t: "Register your pharmacy", d: "Create an owner account and add your business details in under five minutes." },
  { n: "02", t: "Upload documents", d: "Drug licence, GST, pharmacist registration and bank proof — securely stored." },
  { n: "03", t: "Get verified", d: "Our compliance team validates your documents against government registries." },
  { n: "04", t: "Start receiving orders", d: "Go live, appear to nearby customers, and process your first order the same day." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-2xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">[ 05 ] How it works</div>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            From application to first order in under 24 hours.
          </h2>
        </div>
        <ol className="relative grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className="relative bg-paper p-7"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">{s.n}</div>
              <div className="mt-6 font-display text-2xl leading-tight text-ink">{s.t}</div>
              <p className="mt-2 text-sm text-ink-muted">{s.d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}