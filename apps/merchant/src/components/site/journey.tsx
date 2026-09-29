"use client";
import { motion } from "framer-motion";

type Step = {
  n: string;
  title: string;
  time: string;
  desc: string;
  actions: string[];
  icon: React.ReactNode;
};

const steps: Step[] = [
  {
    n: "01",
    title: "Sign up",
    time: "2 minutes",
    desc: "Create your pharmacy account with your phone number. No credit card, no commitment.",
    actions: ["Enter phone & OTP", "Add pharmacy name", "Pick your city"],
    icon: <IconUser />,
  },
  {
    n: "02",
    title: "Upload documents",
    time: "5 minutes",
    desc: "Share your drug license, GST, and store photos. We auto-verify against government registries.",
    actions: ["Drug license", "GST certificate", "Owner ID + store photos"],
    icon: <IconDoc />,
  },
  {
    n: "03",
    title: "Get verified",
    time: "Under 24 hours",
    desc: "Our compliance team reviews and approves your pharmacy. You'll get a WhatsApp confirmation.",
    actions: ["Compliance review", "WhatsApp approval", "Dashboard access"],
    icon: <IconShield />,
  },
  {
    n: "04",
    title: "Set up your store",
    time: "15 minutes",
    desc: "Import your inventory from Excel, set store hours, delivery radius, and payment preferences.",
    actions: ["Bulk import inventory", "Set hours & radius", "Connect payments"],
    icon: <IconStore />,
  },
  {
    n: "05",
    title: "Start receiving orders",
    time: "Same day",
    desc: "Go live. Accept online orders, process prescriptions, and track deliveries in real time.",
    actions: ["Accept live orders", "Process prescriptions", "Track deliveries"],
    icon: <IconRocket />,
  },
];

export function Journey() {
  return (
    <section id="how-it-works" className="relative border-y border-line bg-paper-alt/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
              [ 02 ] How it works
            </div>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
              Join in 5 simple steps.
              <br />
              <span className="italic text-ink-muted">Live in under a day.</span>
            </h2>
            <p className="mt-4 text-pretty text-ink-muted">
              A guided, no-jargon journey from signup to your first online order. Every step is designed for busy
              pharmacy owners — no technical knowledge required.
            </p>
          </div>
          <a
            href="/onboarding?new=true"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-6 text-[14px] font-semibold text-paper transition-all hover:bg-brand-ink"
          >
            Start your application
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>

        {/* Steps rail */}
        <div className="relative">
          {/* connecting line (desktop) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-[46px] hidden h-px bg-gradient-to-r from-transparent via-line to-transparent lg:block"
          />
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.19, 1, 0.22, 1] }}
                className="group relative flex flex-col rounded-2xl border border-line bg-paper p-6 transition-colors hover:border-ink/25"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl border border-line bg-paper-alt/50 text-ink transition-colors group-hover:border-brand/40 group-hover:bg-brand/5 group-hover:text-brand">
                    {s.icon}
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.18em] text-ink-subtle">{s.n}</span>
                </div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-brand">{s.time}</div>
                <h3 className="font-display text-xl leading-tight text-ink">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{s.desc}</p>
                <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                  {s.actions.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-[12px] text-ink-muted">
                      <svg className="mt-0.5 size-3.5 shrink-0 text-signal" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M4 10.5l3.5 3.5L16 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Reassurance strip */}
        <div className="mt-10 grid grid-cols-1 gap-3 rounded-2xl border border-line bg-paper p-6 md:grid-cols-3">
          <Reassure
            title="No setup fees"
            desc="Join free. Pay only a small commission when you fulfil an order."
          />
          <Reassure
            title="Dedicated onboarding manager"
            desc="A real human walks you through setup on WhatsApp or call."
          />
          <Reassure
            title="Cancel anytime"
            desc="No lock-in contracts. Export your data whenever you want."
          />
        </div>
      </div>
    </section>
  );
}

function Reassure({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-signal/10 text-signal">
        <svg className="size-3.5" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10.5l3.5 3.5L16 6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div>
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="mt-0.5 text-[12px] text-ink-muted">{desc}</div>
      </div>
    </div>
  );
}

function IconUser() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconStore() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}
function IconRocket() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 15c-1 2-1 4-1 5 1 0 3 0 5-1" />
      <path d="M14 5c4 0 6 2 6 6-2 6-7 9-11 10l-3-3C7 14 10 9 14 5z" />
      <circle cx="15" cy="10" r="1.5" />
    </svg>
  );
}