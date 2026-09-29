"use client";
import { motion } from "framer-motion";
import { Sparkline, BarChart } from "./sparkline";

const orders = [
  { id: "RX-90241", med: "Azithromycin 500mg", qty: "3 strips", status: "Delivered", tone: "signal", time: "14:02" },
  { id: "RX-90240", med: "Paracetamol 500mg (Calpol)", qty: "2 bottles", status: "Out for delivery", tone: "brand", time: "13:58" },
  { id: "RX-90239", med: "Metformin HCL 500mg", qty: "1 pack", status: "Preparing", tone: "warn", time: "13:44" },
  { id: "RX-90238", med: "Amoxicillin 500mg (30ct)", qty: "1 strip", status: "Accepted", tone: "muted", time: "13:31" },
  { id: "RX-90237", med: "Insulin Glargine 100u/mL", qty: "2 vials", status: "Delivered", tone: "signal", time: "13:12" },
];

const toneMap: Record<string, string> = {
  signal: "bg-signal/10 text-signal border-signal/25",
  brand: "bg-brand/10 text-brand border-brand/25",
  warn: "bg-warn/15 text-warn border-warn/30",
  muted: "bg-ink/5 text-ink-muted border-line",
};

const revenue = [12, 14, 11, 18, 22, 19, 24, 28, 26, 31, 34, 29, 36, 41, 38, 44];
const bars = [6, 9, 4, 12, 8, 15, 11, 18, 14, 22, 17, 24];

export function DashboardMock({
  compact = false,
  bare = false,
}: {
  compact?: boolean;
  /** Drop the fake browser chrome + shadow so it can sit inside a real page. */
  bare?: boolean;
}) {
  return (
    <div
      className={
        bare
          ? "relative"
          : "relative overflow-hidden rounded-2xl border border-line bg-paper shadow-hero"
      }
    >
      {!bare && (
      <div className="flex items-center justify-between border-b border-line bg-paper-alt/60 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-line" />
            <span className="size-2.5 rounded-full bg-line" />
            <span className="size-2.5 rounded-full bg-line" />
          </div>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
            platino.rx / operations / live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-signal/25 bg-signal/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-signal">
            <motion.span
              className="size-1.5 rounded-full bg-signal"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            online
          </span>
        </div>
      </div>
      )}

      <div className="grid grid-cols-12 gap-0">
        {/* Sidebar */}
        {!compact && !bare && (
          <aside className="col-span-2 hidden border-r border-line bg-paper-alt/40 p-3 lg:block">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">workspace</div>
            {["Overview", "Orders", "Inventory", "Delivery", "Analytics", "Notifications", "Settings"].map((s, i) => (
              <div
                key={s}
                className={`mb-0.5 rounded-md px-2.5 py-1.5 text-[12px] ${i === 0 ? "bg-ink text-paper" : "text-ink-muted hover:bg-ink/5"}`}
              >
                {s}
              </div>
            ))}
          </aside>
        )}

        {/* Main */}
        <div
          className={`${
            compact || bare ? "col-span-12" : "col-span-12 lg:col-span-10"
          } ${bare ? "p-0" : "p-5"}`}
        >
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Today's revenue" value="₹42,492" delta="+12.5%" tone="signal" />
            <Kpi label="Active orders" value="42" delta="8 dispatch" tone="brand" />
            <Kpi label="Low stock" value="06" delta="critical" tone="alert" />
            <Kpi label="Fill rate" value="98.4%" delta="target 95%" tone="muted" />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {/* Revenue */}
            <div className="md:col-span-2 rounded-xl border border-line bg-paper p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">Revenue · 30d</div>
                  <div className="mt-1 font-display text-2xl text-ink">₹2,84,921.60</div>
                </div>
                <div className="flex gap-1 font-mono text-[10px] text-ink-subtle">
                  <span className="rounded bg-ink/5 px-1.5 py-0.5">1D</span>
                  <span className="rounded bg-ink px-1.5 py-0.5 text-paper">30D</span>
                  <span className="rounded bg-ink/5 px-1.5 py-0.5">QTR</span>
                </div>
              </div>
              <Sparkline
                data={revenue}
                height={110}
                className="w-full text-brand"
                stroke="var(--brand)"
                fill="color-mix(in oklch, var(--brand) 12%, transparent)"
              />
            </div>
            {/* Low stock */}
            <div className="rounded-xl border border-alert/30 bg-alert/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-alert">Low stock alert</div>
                <div className="font-mono text-[10px] text-alert">4 SKUs</div>
              </div>
              <div className="space-y-2.5">
                {[
                  { n: "Insulin Glargine 100u/mL", p: 12 },
                  { n: "Salbutamol Inhaler", p: 24 },
                  { n: "Atorvastatin 20mg", p: 38 },
                ].map((s) => (
                  <div key={s.n}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-ink">{s.n}</span>
                      <span className="font-mono text-ink-subtle">{s.p}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-alert/15">
                      <motion.div
                        className="h-full bg-alert"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.p}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orders table */}
          <div className="mt-4 rounded-xl border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">Live order stream</div>
              <div className="flex items-center gap-3 font-mono text-[10px] text-ink-subtle">
                <span>Updated 0.4s ago</span>
                <span className="inline-flex items-center gap-1 rounded bg-signal/10 px-1.5 py-0.5 text-signal">● sync</span>
              </div>
            </div>
            <div className="divide-y divide-line">
              {orders.slice(0, compact ? 3 : 5).map((o, i) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col gap-2 px-4 py-3 text-[12px] md:grid md:grid-cols-12 md:items-center md:gap-4"
                >
                  <div className="flex items-center justify-between md:col-span-2 md:block">
                    <div className="font-mono text-ink-subtle">#{o.id}</div>
                    <div className="font-mono text-ink-subtle md:hidden">{o.time}</div>
                  </div>
                  <div className="font-medium text-ink md:col-span-5">{o.med}</div>
                  <div className="flex items-center justify-between md:col-span-5 md:grid md:grid-cols-5 md:gap-4">
                    <div className="text-ink-muted md:col-span-2">{o.qty}</div>
                    <div className="md:col-span-2">
                      <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${toneMap[o.tone]}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="hidden text-right font-mono text-ink-subtle md:col-span-1 md:block">{o.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {!compact && (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-line bg-paper p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">Peak hours</div>
                <BarChart data={bars} className="mt-3" height={80} />
              </div>
              <div className="rounded-xl border border-line bg-paper p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">Delivery ETA</div>
                <div className="mt-3 font-display text-2xl text-ink">18 min</div>
                <div className="mt-1 text-[11px] text-ink-muted">avg last 100 orders · –4 min vs. wk</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/5">
                  <div className="h-full w-3/4 rounded-full bg-signal" />
                </div>
              </div>
              <div className="rounded-xl border border-line bg-paper p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">Compliance</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="relative size-14">
                    <svg viewBox="0 0 36 36" className="size-14 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="var(--line)" strokeWidth="3" />
                      <motion.circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke="var(--signal)" strokeWidth="3" strokeLinecap="round"
                        strokeDasharray="94.2"
                        initial={{ strokeDashoffset: 94.2 }}
                        whileInView={{ strokeDashoffset: 94.2 * 0.02 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-display text-2xl text-ink">99.8%</div>
                    <div className="text-[11px] text-ink-muted">audit-ready</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: string }) {
  const toneCls: Record<string, string> = {
    signal: "text-signal",
    brand: "text-brand",
    alert: "text-alert",
    muted: "text-ink-subtle",
  };
  return (
    <div className="rounded-xl border border-line bg-paper p-3.5">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">{label}</div>
      <div className="mt-1.5 font-display text-2xl leading-none text-ink">{value}</div>
      <div className={`mt-1.5 font-mono text-[10px] ${toneCls[tone]}`}>{delta}</div>
    </div>
  );
}