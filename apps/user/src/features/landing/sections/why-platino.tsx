'use client';
import { ShieldCheck, Timer, HeartPulse, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui-parts/section-header";

const items = [
  {
    icon: ShieldCheck,
    title: "Only verified pharmacies",
    text: "Every store on Platino is a licensed pharmacy with certified pharmacists on staff.",
  },
  {
    icon: Timer,
    title: "Fast, honest delivery",
    text: "See real distance, real ETAs, and real delivery fees — no surprises at checkout.",
  },
  {
    icon: HeartPulse,
    title: "Real people, real care",
    text: "Chat with the pharmacist behind the counter. Ask questions, get real answers.",
  },
  {
    icon: Sparkles,
    title: "One trusted app for wellness",
    text: "Medicines, healthcare, ayurveda, baby care, senior care — all in one place.",
  },
];

export function WhyPlatino() {
  return (
    <section>
      <SectionHeader
        eyebrow="Why Platino"
        title="Healthcare, thoughtfully redesigned."
        hint="Built for how India actually shops for medicines — with local pharmacies at the heart."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="surface-panel rounded-3xl p-6 shadow-soft"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
              <it.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 font-display text-lg font-medium">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
