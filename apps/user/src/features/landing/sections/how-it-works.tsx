'use client';
import { MapPin, Store, PackageCheck } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui-parts/section-header";

const steps = [
  {
    icon: MapPin,
    title: "Set your location",
    text: "We find verified pharmacies within your delivery radius — updated in real time.",
  },
  {
    icon: Store,
    title: "Browse and choose",
    text: "Compare ratings, prices, delivery times, and offers. Pick the pharmacy that fits.",
  },
  {
    icon: PackageCheck,
    title: "Order and track",
    text: "Place your order, upload a prescription if needed, and follow live delivery updates.",
  },
];

export function HowItWorks() {
  return (
    <section>
      <SectionHeader
        eyebrow="How it works"
        title="Three simple steps."
        hint="From a symptom to a delivered order — in minutes, not hours."
      />
      <div className="relative grid gap-6 lg:grid-cols-3">
        <div
          aria-hidden
          className="absolute left-12 right-12 top-8 hidden h-px lg:block"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, var(--primary-soft) 20%, var(--primary-soft) 80%, transparent 100%)",
          }}
        />
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-3xl border border-border bg-surface-elevated p-6 text-center shadow-soft"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <s.icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary">
              Step {i + 1}
            </div>
            <h3 className="mt-2 font-display text-xl">{s.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
