"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { v: 1240, suffix: "+", l: "Verified pharmacies" },
  { v: 15.2, suffix: "M", l: "Medicines managed", decimals: 1 },
  { v: 4.8, suffix: "M", l: "Orders processed", decimals: 1 },
  { v: 62, suffix: "", l: "Cities served" },
];

function Counter({ to, decimals = 0, prefix = "", suffix = "" }: { to: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="border-t border-line py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-2xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">[ 08 ] By the numbers</div>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            Trusted Technology for Healthcare Businesses
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-paper p-5 sm:p-8"
            >
              <div className="font-display text-4xl leading-none tracking-tight text-ink sm:text-5xl md:text-6xl">
                <Counter to={s.v} decimals={s.decimals} suffix={s.suffix} />
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle sm:mt-4">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}