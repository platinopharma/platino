"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Sparkline } from "./sparkline";
import { OrdersWorkflow } from "./orders-workflow";

type ModuleKey =
  | "dashboard"
  | "inventory"
  | "orders"
  | "delivery"
  | "revenue"
  | "performance"
  | "notifications";

const modules: Record<
  ModuleKey,
  { label: string; caption: string; description: string }
> = {
  dashboard: {
    label: "Pharmacy Dashboard",
    caption: "Operational cockpit",
    description:
      "A single pane of glass across today's revenue, pending prescriptions, and inventory health — refreshed every 400ms.",
  },
  inventory: {
    label: "Inventory Management",
    caption: "Catalog & stock intelligence",
    description:
      "Barcode-serialized SKUs, batch expiry tracking, category rollups, and smart reorder points tuned to your local demand curve.",
  },
  orders: {
    label: "Live Orders",
    caption: "Prescription lifecycle",
    description:
      "Accept, prepare, pack, and dispatch prescriptions with a keyboard-first workflow and full audit trail.",
  },
  delivery: {
    label: "Delivery Tracking",
    caption: "Last-mile logistics",
    description:
      "Assign riders, share live coordinates with customers, and monitor SLA compliance across every route.",
  },
  revenue: {
    label: "Revenue Analytics",
    caption: "Financial telemetry",
    description:
      "Daily, weekly, and monthly revenue with SKU-level margin analysis and cohort comparisons across your stores.",
  },
  performance: {
    label: "Store Performance",
    caption: "Operational benchmarks",
    description:
      "Benchmark fill rate, prescription turnaround, and staff velocity against your own historical baseline.",
  },
  notifications: {
    label: "Notifications",
    caption: "Signal, not noise",
    description:
      "Low stock, expiring batches, cancelled orders, and new prescriptions — prioritized so nothing critical is missed.",
  },
};

const keys = Object.keys(modules) as ModuleKey[];

export function ModulesShowcase() {
  const [active, setActive] = useState<ModuleKey>("inventory");
  const meta = modules[active];

  return (
    <section id="platform" className="border-y border-line bg-paper-alt/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
              [ 02 ] Platform
            </div>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
              Seven modules. One operating layer for the modern pharmacy.
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-ink-muted">
            Every module speaks to the next. Explore how the platform composes daily operations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Module list */}
          <div className="flex flex-row overflow-x-auto lg:flex-col lg:overflow-visible">
            {keys.map((k, i) => {
              const isActive = k === active;
              return (
                <button
                  key={k}
                  onClick={() => setActive(k)}
                  className={`group relative flex shrink-0 items-center justify-between gap-4 border-line px-4 py-4 text-left transition-colors lg:w-full lg:border-b ${
                    isActive ? "text-ink" : "text-ink-muted hover:text-ink"
                  } ${i === 0 ? "lg:border-t" : ""}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="module-active"
                      className="absolute inset-y-0 left-0 w-0.5 bg-ink"
                    />
                  )}
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
                      0{i + 1}
                    </div>
                    <div className="mt-1 text-sm font-medium whitespace-nowrap">{modules[k].label}</div>
                  </div>
                  <span
                    aria-hidden
                    className={`hidden text-ink-subtle transition-opacity lg:inline ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                  >
                    →
                  </span>
                </button>
              );
            })}
          </div>

          {/* Canvas */}
          <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
                  {meta.caption}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-ink">{meta.label}</div>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
                platino.rx/modules/{active}
              </div>
            </div>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="p-6"
                >
                  <p className="mb-6 max-w-2xl text-ink-muted">{meta.description}</p>
                  <ModuleCanvas active={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModuleCanvas({ active }: { active: ModuleKey }) {
  if (active === "inventory") return <InventoryPane />;
  if (active === "orders") return <OrdersWorkflow />;
  if (active === "delivery") return <DeliveryPane />;
  if (active === "revenue") return <RevenuePane />;
  if (active === "notifications") return <NotificationsPane />;
  if (active === "performance") return <PerformancePane />;
  return <DashboardPane />;
}

function DashboardPane() {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {[
        { l: "Today's revenue", v: "₹42,492" },
        { l: "Orders", v: "42" },
        { l: "Fill rate", v: "98.4%" },
        { l: "Uptime", v: "99.99%" },
      ].map((k) => (
        <div key={k.l} className="rounded-lg border border-line p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">{k.l}</div>
          <div className="mt-2 font-display text-3xl text-ink">{k.v}</div>
        </div>
      ))}
    </div>
  );
}

const inv = [
  { n: "Paracetamol 500mg", cat: "Analgesic", stock: 320, exp: "03/27" },
  { n: "Azithromycin 500mg", cat: "Antibiotic", stock: 42, exp: "11/26" },
  { n: "Metformin 500mg", cat: "Diabetic", stock: 210, exp: "07/27" },
  { n: "Insulin Glargine", cat: "Diabetic", stock: 8, exp: "02/26" },
  { n: "Salbutamol Inhaler", cat: "Respiratory", stock: 24, exp: "05/26" },
  { n: "Atorvastatin 20mg", cat: "Cardiac", stock: 38, exp: "09/26" },
];
function InventoryPane() {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="grid grid-cols-12 gap-4 border-b border-line bg-paper-alt/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
        <div className="col-span-5">Medicine</div>
        <div className="col-span-3">Category</div>
        <div className="col-span-2 text-right">In stock</div>
        <div className="col-span-2 text-right">Expiry</div>
      </div>
      {inv.map((r) => {
        const low = r.stock < 50;
        return (
          <div key={r.n} className="grid grid-cols-12 items-center gap-4 border-b border-line px-4 py-2.5 text-sm last:border-b-0">
            <div className="col-span-5 flex items-center gap-3">
              <span className="grid size-7 place-items-center rounded-md border border-line bg-paper-alt/60 font-mono text-[10px] text-ink-subtle">
                {r.n.split(" ")[0].slice(0, 2).toUpperCase()}
              </span>
              <span className="font-medium text-ink">{r.n}</span>
            </div>
            <div className="col-span-3 text-ink-muted">{r.cat}</div>
            <div className={`col-span-2 text-right font-mono ${low ? "text-alert" : "text-ink"}`}>{r.stock}</div>
            <div className="col-span-2 text-right font-mono text-ink-subtle">{r.exp}</div>
          </div>
        );
      })}
    </div>
  );
}

const flow = ["Accepted", "Preparing", "Packed", "Out for delivery", "Delivered"];
function OrdersPane() {
  return (
    <div>
      <div className="relative mb-6 flex items-center justify-between">
        <div className="absolute inset-x-4 top-3 h-px bg-line" />
        {flow.map((s, i) => (
          <div key={s} className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.7 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`grid size-6 place-items-center rounded-full border-2 ${i <= 2 ? "border-signal bg-signal text-paper" : "border-line bg-paper text-ink-subtle"} font-mono text-[10px]`}
            >
              {i + 1}
            </motion.div>
            <div className="mt-2 text-[11px] font-medium text-ink">{s}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-line">
        {[
          { id: "RX-90241", n: "Azithromycin 500mg × 3", s: "Packed", t: "signal" },
          { id: "RX-90240", n: "Paracetamol 500mg × 2", s: "Preparing", t: "warn" },
          { id: "RX-90239", n: "Metformin HCL 500mg × 1", s: "Accepted", t: "brand" },
        ].map((o) => (
          <div key={o.id} className="flex items-center justify-between border-b border-line px-4 py-3 text-sm last:border-b-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-ink-subtle">#{o.id}</span>
              <span className="font-medium text-ink">{o.n}</span>
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                o.t === "signal" ? "border-signal/25 bg-signal/10 text-signal" : o.t === "warn" ? "border-warn/30 bg-warn/15 text-warn" : "border-brand/25 bg-brand/10 text-brand"
              }`}
            >
              {o.s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryPane() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-line bg-paper-alt/50">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.85 0.01 260) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.85 0.01 260) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <svg viewBox="0 0 400 250" className="absolute inset-0 h-full w-full">
          <path d="M40,200 C120,180 160,60 240,80 S360,180 380,60" fill="none" stroke="oklch(0.42 0.14 250)" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="40" cy="200" r="5" fill="oklch(0.42 0.14 250)" />
          <circle cx="380" cy="60" r="5" fill="oklch(0.62 0.15 155)" />
          <motion.circle cx="0" cy="0" r="6" fill="oklch(0.18 0.02 260)" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} style={{ offsetPath: "path('M40,200 C120,180 160,60 240,80 S360,180 380,60')" } as React.CSSProperties} />
        </svg>
        <div className="absolute bottom-3 left-3 rounded-md border border-line bg-paper/90 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink backdrop-blur">
          Rider #R-042 · ETA 8 min
        </div>
      </div>
      <div className="space-y-3">
        {[
          { r: "Aarav K.", o: 3, sla: "on-track" },
          { r: "Meera S.", o: 2, sla: "on-track" },
          { r: "Devon P.", o: 1, sla: "delayed" },
        ].map((r) => (
          <div key={r.r} className="flex items-center justify-between rounded-lg border border-line p-3">
            <div>
              <div className="text-sm font-medium text-ink">{r.r}</div>
              <div className="font-mono text-[10px] text-ink-subtle">{r.o} orders</div>
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${r.sla === "on-track" ? "border-signal/25 bg-signal/10 text-signal" : "border-alert/25 bg-alert/10 text-alert"}`}
            >
              {r.sla}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenuePane() {
  return (
    <div className="rounded-lg border border-line p-4">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">Monthly revenue</div>
          <div className="mt-1 font-display text-3xl text-ink">₹2,84,921.60</div>
        </div>
        <div className="font-mono text-[10px] text-signal">▲ 18.4% MoM</div>
      </div>
      <Sparkline data={[10, 14, 12, 18, 22, 19, 26, 30, 28, 34, 32, 38, 44, 40, 48, 52]} height={140} className="w-full" stroke="oklch(0.42 0.14 250)" fill="oklch(0.42 0.14 250 / 0.1)" />
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        {[
          { l: "Gross margin", v: "42.8%" },
          { l: "AOV", v: "₹284.00" },
          { l: "Refunds", v: "0.6%" },
        ].map((k) => (
          <div key={k.l} className="border-t border-line pt-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">{k.l}</div>
            <div className="mt-1 font-display text-lg text-ink">{k.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformancePane() {
  const rows = [
    { s: "Green Cross · Bandra W", r: "₹82,400", o: 92, t: "12m" },
    { s: "MediPoint · Andheri E", r: "₹61,200", o: 74, t: "14m" },
    { s: "CityCare · Powai", r: "₹54,800", o: 61, t: "11m" },
  ];
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="grid grid-cols-12 gap-4 border-b border-line bg-paper-alt/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
        <div className="col-span-6">Store</div>
        <div className="col-span-2 text-right">Revenue</div>
        <div className="col-span-2 text-right">Orders</div>
        <div className="col-span-2 text-right">Avg TAT</div>
      </div>
      {rows.map((r) => (
        <div key={r.s} className="grid grid-cols-12 items-center gap-4 border-b border-line px-4 py-3 text-sm last:border-b-0">
          <div className="col-span-6 font-medium text-ink">{r.s}</div>
          <div className="col-span-2 text-right font-mono text-ink">{r.r}</div>
          <div className="col-span-2 text-right font-mono text-ink-muted">{r.o}</div>
          <div className="col-span-2 text-right font-mono text-ink-muted">{r.t}</div>
        </div>
      ))}
    </div>
  );
}

function NotificationsPane() {
  const items = [
    { t: "signal", h: "New order · #RX-90244", s: "Paracetamol 500mg × 2 · ₹64.00", time: "just now" },
    { t: "alert", h: "Low stock · Insulin Glargine", s: "8 units remaining · reorder recommended", time: "2m" },
    { t: "warn", h: "Expiring soon · Amoxicillin batch #A-4421", s: "60 days to expiry · 42 units", time: "9m" },
    { t: "muted", h: "Cancelled · #RX-90238", s: "Customer cancelled before dispatch", time: "24m" },
  ];
  return (
    <div className="rounded-lg border border-line">
      {items.map((n) => (
        <div key={n.h} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0">
          <span
            className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
              n.t === "signal" ? "bg-signal" : n.t === "alert" ? "bg-alert" : n.t === "warn" ? "bg-warn" : "bg-ink-subtle"
            }`}
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-ink">{n.h}</div>
            <div className="text-[12px] text-ink-muted">{n.s}</div>
          </div>
          <div className="font-mono text-[10px] text-ink-subtle">{n.time}</div>
        </div>
      ))}
    </div>
  );
}