"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "rejected"
  | "cancelled";

type Event = { status: OrderStatus; at: number; note?: string };

type Order = {
  id: string;
  medicine: string;
  qty: string;
  customer: string;
  address: string;
  amount: number;
  status: OrderStatus;
  events: Event[];
};

const flow: OrderStatus[] = ["pending", "accepted", "preparing", "packed", "out_for_delivery", "delivered"];

const statusMeta: Record<OrderStatus, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "muted" },
  accepted: { label: "Accepted", tone: "brand" },
  preparing: { label: "Preparing", tone: "warn" },
  packed: { label: "Packed", tone: "warn" },
  out_for_delivery: { label: "Out for delivery", tone: "brand" },
  delivered: { label: "Delivered", tone: "signal" },
  rejected: { label: "Rejected", tone: "alert" },
  cancelled: { label: "Cancelled", tone: "alert" },
};

const toneCls: Record<string, string> = {
  signal: "border-signal/25 bg-signal/10 text-signal",
  brand: "border-brand/25 bg-brand/10 text-brand",
  warn: "border-warn/30 bg-warn/15 text-warn",
  muted: "border-line bg-ink/5 text-ink-muted",
  alert: "border-alert/30 bg-alert/10 text-alert",
};

const seedOrders: Order[] = [
  {
    id: "RX-90244",
    medicine: "Paracetamol 500mg (Calpol)",
    qty: "2 bottles",
    customer: "Ananya Rao",
    address: "Linking Rd, Bandra W",
    amount: 64.0,
    status: "pending",
    events: [{ status: "pending", at: Date.now() - 5_000, note: "Prescription received" }],
  },
  {
    id: "RX-90243",
    medicine: "Azithromycin 500mg",
    qty: "3 strips",
    customer: "Vikram Shah",
    address: "Hill Rd, Bandra W",
    amount: 245.0,
    status: "preparing",
    events: [
      { status: "pending", at: Date.now() - 4 * 60_000 },
      { status: "accepted", at: Date.now() - 3 * 60_000 },
      { status: "preparing", at: Date.now() - 90_000, note: "Pharmacist assigned" },
    ],
  },
  {
    id: "RX-90242",
    medicine: "Metformin HCL 500mg",
    qty: "1 pack",
    customer: "Priya Nair",
    address: "Turner Rd, Bandra W",
    amount: 184.0,
    status: "out_for_delivery",
    events: [
      { status: "pending", at: Date.now() - 22 * 60_000 },
      { status: "accepted", at: Date.now() - 20 * 60_000 },
      { status: "preparing", at: Date.now() - 18 * 60_000 },
      { status: "packed", at: Date.now() - 12 * 60_000 },
      { status: "out_for_delivery", at: Date.now() - 6 * 60_000, note: "Rider #R-042 dispatched" },
    ],
  },
  {
    id: "RX-90241",
    medicine: "Insulin Glargine 100u/mL",
    qty: "2 vials",
    customer: "Rohan Menon",
    address: "Carter Rd, Bandra W",
    amount: 628.0,
    status: "delivered",
    events: [
      { status: "pending", at: Date.now() - 60 * 60_000 },
      { status: "accepted", at: Date.now() - 58 * 60_000 },
      { status: "preparing", at: Date.now() - 55 * 60_000 },
      { status: "packed", at: Date.now() - 50 * 60_000 },
      { status: "out_for_delivery", at: Date.now() - 45 * 60_000 },
      { status: "delivered", at: Date.now() - 32 * 60_000, note: "Signed by customer" },
    ],
  },
];

const incomingPool = [
  { medicine: "Amoxicillin 500mg (30ct)", qty: "1 strip", customer: "Kabir Sethi", address: "SV Rd, Khar W", amount: 99.0 },
  { medicine: "Atorvastatin 20mg", qty: "1 bottle", customer: "Meera Iyer", address: "Pali Hill, Bandra", amount: 142.0 },
  { medicine: "Salbutamol Inhaler", qty: "1 unit", customer: "Devon Pereira", address: "Waterfield Rd", amount: 225.0 },
  { medicine: "Cetirizine 10mg", qty: "2 strips", customer: "Lena Fernandes", address: "Chapel Rd", amount: 63.0 },
];

function nextStatus(s: OrderStatus): OrderStatus | null {
  const idx = flow.indexOf(s);
  if (idx === -1 || idx === flow.length - 1) return null;
  return flow[idx + 1];
}

function fmtTime(t: number) {
  const diff = Math.floor((Date.now() - t) / 1000);
  if (diff < 60) return `${Math.max(1, diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// --- Atomic Memoized Order Queue Row ---
const OrderQueueRow = React.memo(({ order, isSelected, onSelect }: { order: Order; isSelected: boolean; onSelect: (id: string) => void }) => {

  const meta = statusMeta[order.status];
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: -8, backgroundColor: "oklch(0.62 0.15 155 / 0.08)" }}
      animate={{ opacity: 1, y: 0, backgroundColor: "oklch(1 0 0 / 0)" }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      onClick={() => onSelect(order.id)}
      className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-b-0 ${
        isSelected ? "bg-paper-alt/60" : "hover:bg-hover"
      }`}
    >
      <span className={`h-full w-0.5 self-stretch rounded-full ${isSelected ? "bg-ink" : "bg-transparent"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-ink-subtle">#{order.id}</span>
          <span className="truncate text-sm font-medium text-ink">{order.medicine}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-muted">
          <span>{order.customer}</span>
          <span className="text-ink-subtle">·</span>
          <span>{order.qty}</span>
          <span className="text-ink-subtle">·</span>
          <span className="font-mono">₹{order.amount.toFixed(2)}</span>
        </div>
      </div>
      <span
        className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${toneCls[meta.tone]}`}
      >
        {meta.label}
      </span>
    </motion.button>
  );
});
OrderQueueRow.displayName = "OrderQueueRow";

// --- Atomic Memoized Reason Capture Modal ---
interface ReasonModalProps {
  reasonMode: null | "rejected" | "cancelled";
  orderId: string;
  onClose: () => void;
  onSubmit: (id: string, to: OrderStatus, note: string) => void;
}

const ReasonCaptureModal = React.memo(({ reasonMode, orderId, onClose, onSubmit }: ReasonModalProps) => {
  const [reasonPreset, setReasonPreset] = useState<string>("");
  const [reasonText, setReasonText] = useState<string>("");
  const [reasonError, setReasonError] = useState<string>("");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const REASON_MIN = 5;
  const REASON_MAX = 200;

  const rejectPresets = [
    "Out of stock",
    "Prescription unclear or invalid",
    "Outside delivery radius",
    "Controlled substance — cannot fulfill",
  ];
  const cancelPresets = [
    "Customer request",
    "Payment failed / refunded",
    "Item recalled by manufacturer",
    "Duplicate order",
  ];

  const combinedReason = [reasonPreset, reasonText.trim()].filter(Boolean).join(" — ");
  const reasonLen = combinedReason.length;
  const canSubmitReason = reasonLen >= REASON_MIN && reasonLen <= REASON_MAX;

  function handleFormSubmit() {
    if (!reasonMode) return;
    if (reasonLen < REASON_MIN) {
      setReasonError("Please provide a reason of at least 5 characters.");
      return;
    }
    if (reasonLen > REASON_MAX) {
      setReasonError("Reason must be 200 characters or fewer.");
      return;
    }
    const label = reasonMode === "rejected" ? "Rejected" : "Cancelled";
    onSubmit(orderId, reasonMode, `${label}: ${combinedReason}`);
    onClose();
  }

  useEffect(() => {
    if (!reasonMode) return;
    const focusTimer = requestAnimationFrame(() => textareaRef.current?.focus());
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Enter") {
        const target = e.target as HTMLElement | null;
        const inTextarea = target?.tagName === "TEXTAREA";
        const isPresetChip = target?.getAttribute("data-reason-chip") === "true";
        if (isPresetChip && !e.metaKey && !e.ctrlKey) return;
        if (inTextarea && e.shiftKey) return;
        e.preventDefault();
        handleFormSubmit();
        return;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [reasonMode, reasonPreset, reasonText, orderId, onClose, onSubmit]);

  if (!reasonMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-line bg-paper shadow-xl"
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
              Order #{orderId}
            </div>
            <h3 className="mt-0.5 text-base font-semibold text-ink">
              {reasonMode === "rejected" ? "Reject order" : "Cancel order"}
            </h3>
            <p className="mt-1 text-[12px] text-ink-muted">
              A reason is required and will be added to the order timeline.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-subtle hover:bg-hover hover:text-ink">
            ✕
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
              Common reasons
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(reasonMode === "rejected" ? rejectPresets : cancelPresets).map((p) => {
                const active = reasonPreset === p;
                return (
                  <button
                    key={p}
                    type="button"
                    data-reason-chip="true"
                    aria-pressed={active}
                    onClick={() => {
                      setReasonPreset(active ? "" : p);
                      setReasonError("");
                    }}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      active
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-paper text-ink-muted hover:text-ink"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="reason-notes" className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
              <span>Additional notes {reasonPreset ? "(optional)" : "(required)"}</span>
              <span className={reasonLen > REASON_MAX ? "text-alert" : reasonLen >= REASON_MIN ? "text-signal" : "text-ink-subtle"}>
                {reasonLen}/{REASON_MAX}
              </span>
            </label>
            <textarea
              id="reason-notes"
              aria-invalid={!!reasonError}
              aria-describedby={reasonError ? "reason-error-msg" : undefined}
              ref={textareaRef}
              value={reasonText}
              onChange={(e) => {
                setReasonText(e.target.value.slice(0, 240));
                setReasonError("");
              }}
              rows={3}
              maxLength={240}
              className="w-full resize-none rounded-md border border-line bg-paper px-3 py-2 text-[13px] text-ink placeholder:text-ink-subtle focus:border-ink focus:outline-none"
            />
          </div>

          {reasonError && (
            <div id="reason-error-msg" role="alert" aria-live="assertive" className="rounded-md border border-alert/30 bg-alert/5 px-3 py-2 text-[12px] text-alert">
              {reasonError}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            onClick={onClose}
            aria-label="Keep current order"
            className="inline-flex min-h-[38px] items-center rounded-md border border-line px-3.5 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/20"
          >
            Keep order
          </button>
          <button
            onClick={handleFormSubmit}
            disabled={!canSubmitReason}
            aria-label={reasonMode === "rejected" ? "Confirm rejection of order" : "Confirm cancellation of order"}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-alert px-3.5 py-1.5 text-[12px] font-medium text-paper transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-alert/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {reasonMode === "rejected" ? "Reject order" : "Cancel order"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});
ReasonCaptureModal.displayName = "ReasonCaptureModal";

export function OrdersWorkflow() {
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [selectedId, setSelectedId] = useState<string>(seedOrders[0].id);
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const counterRef = useRef(90245);

  const [reasonMode, setReasonMode] = useState<null | "rejected" | "cancelled">(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const openReason = useCallback((mode: "rejected" | "cancelled") => {
    previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    setReasonMode(mode);
    setLive(false);
  }, []);

  const closeReason = useCallback(() => {
    setReasonMode(null);
    requestAnimationFrame(() => previouslyFocusedRef.current?.focus?.());
  }, []);

  // Keep relative timestamps fresh
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setTick((t) => t + 1);
    }, 15_000);
    return () => clearInterval(id);
  }, []);

  // Live simulator: progress active orders or inject a new one
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      setOrders((prev) => {
        const active = prev.filter((o) => !["delivered", "rejected", "cancelled"].includes(o.status));
        if (active.length < 6 && Math.random() < 0.45) {
          const t = incomingPool[Math.floor(Math.random() * incomingPool.length)];
          const id = `RX-${counterRef.current++}`;
          const next: Order = {
            ...t,
            id,
            status: "pending",
            events: [{ status: "pending", at: Date.now(), note: "Prescription received" }],
          };
          return [next, ...prev].slice(0, 12);
        }
        if (active.length === 0) return prev;
        const target = active[Math.floor(Math.random() * active.length)];
        const ns = nextStatus(target.status);
        if (!ns) return prev;
        return prev.map((o) =>
          o.id === target.id
            ? { ...o, status: ns, events: [...o.events, { status: ns, at: Date.now() }] }
            : o,
        );
      });
    }, 4200);
    return () => clearInterval(id);
  }, [live]);

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? orders[0], [orders, selectedId]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const transition = useCallback((id: string, to: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: to, events: [...o.events, { status: to, at: Date.now(), note }] } : o)),
    );
  }, []);

  const handleSelectOrder = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const active = selected;
  const terminal = ["delivered", "rejected", "cancelled"].includes(active.status);
  const upcoming = nextStatus(active.status);

  return (
    <div>
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "pending", "preparing", "out_for_delivery", "delivered"] as const).map((f) => (
            <span
              key={f}
              className="rounded-full border border-line bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
            >
              {f.replace(/_/g, " ")} · <span className="text-ink">{counts[f] ?? 0}</span>
            </span>
          ))}
        </div>
        <button
          onClick={() => setLive((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
            live ? "border-signal/30 bg-signal/10 text-signal" : "border-line bg-paper text-ink-muted"
          }`}
        >
          <motion.span
            className={`size-1.5 rounded-full ${live ? "bg-signal" : "bg-ink-subtle"}`}
            animate={live ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          {live ? "Live simulator" : "Paused"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Queue */}
        <div className="rounded-lg border border-line bg-paper">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
            <span>Order queue</span>
            <span key={tick}>{orders.length} total</span>
          </div>
          <div className="max-h-[440px] overflow-auto">
            <AnimatePresence initial={false}>
              {orders.map((o) => (
                <OrderQueueRow key={o.id} order={o} isSelected={o.id === selected.id} onSelect={handleSelectOrder} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail + Timeline */}
        <div className="rounded-lg border border-line bg-paper">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
                    Order #{selected.id}
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-ink">{selected.medicine}</div>
                  <div className="mt-1 text-[12px] text-ink-muted">
                    {selected.customer} · {selected.address} · {selected.qty}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl text-ink">₹{selected.amount.toFixed(2)}</div>
                  <span
                    className={`mt-1 inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${toneCls[statusMeta[selected.status].tone]}`}
                  >
                    {statusMeta[selected.status].label}
                  </span>
                </div>
              </div>

              {/* Stepper */}
              <div className="relative px-6 pt-6">
                <div className="absolute left-6 right-6 top-[34px] h-px bg-line" />
                <div className="relative flex items-start justify-between">
                  {flow.map((s, i) => {
                    const currentIdx = flow.indexOf(selected.status === "rejected" || selected.status === "cancelled" ? "pending" : selected.status);
                    const reached = currentIdx >= i && !["rejected", "cancelled"].includes(selected.status);
                    const isNow = currentIdx === i && !terminal;
                    return (
                      <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isNow ? 1 : 0.9,
                            backgroundColor: reached ? "oklch(0.62 0.15 155)" : "oklch(1 0 0)",
                            borderColor: reached ? "oklch(0.62 0.15 155)" : "oklch(0.9 0.008 260)",
                          }}
                          transition={{ duration: 0.4 }}
                          className="grid size-5 place-items-center rounded-full border-2"
                        >
                          {reached && (
                            <svg viewBox="0 0 12 12" className="size-2.5 text-paper">
                              <path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                          )}
                        </motion.div>
                        <div className={`max-w-[70px] text-center text-[10px] leading-tight ${reached ? "text-ink" : "text-ink-subtle"}`}>
                          {statusMeta[s].label}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {(selected.status === "rejected" || selected.status === "cancelled") && (
                  <div className="mt-3 rounded-md border border-alert/25 bg-alert/5 px-3 py-2 text-[12px] text-alert">
                    Order {selected.status}. No further transitions available.
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 border-y border-line px-5 py-3">
                {selected.status === "pending" ? (
                  <>
                    <button
                      onClick={() => transition(selected.id, "accepted", "Order accepted by pharmacist")}
                      className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-paper hover:bg-brand-ink"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => openReason("rejected")}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[12px] font-medium text-alert hover:bg-alert/5"
                    >
                      ✕ Reject
                    </button>
                  </>
                ) : (
                  <>
                    {upcoming && !terminal && (
                      <button
                        onClick={() => transition(selected.id, upcoming)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-paper hover:bg-brand-ink"
                      >
                        Advance → {statusMeta[upcoming].label}
                      </button>
                    )}
                    {!terminal && (
                      <button
                        onClick={() => openReason("cancelled")}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[12px] font-medium text-alert hover:bg-alert/5"
                      >
                        Cancel order
                      </button>
                    )}
                  </>
                )}
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle" key={tick}>
                  updated {fmtTime(selected.events[selected.events.length - 1].at)}
                </span>
              </div>

              {/* Timeline */}
              <div className="px-5 py-4">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
                  Event timeline
                </div>
                <ol className="relative space-y-3 border-l border-line pl-4">
                  <AnimatePresence initial={false}>
                    {[...selected.events].reverse().map((e, i) => {
                      const meta = statusMeta[e.status];
                      const isLatest = i === 0;
                      return (
                        <motion.li
                          key={`${e.status}-${e.at}`}
                          layout
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                          className="relative"
                        >
                          <span
                            className={`absolute -left-[21px] top-1 grid size-3 place-items-center rounded-full border-2 ${
                              isLatest ? "border-signal bg-signal" : "border-line bg-paper"
                            }`}
                          >
                            {isLatest && (
                              <motion.span
                                className="absolute size-3 rounded-full bg-signal/50"
                                animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${toneCls[meta.tone]}`}
                            >
                              {meta.label}
                            </span>
                            <span className="font-mono text-[10px] text-ink-subtle" key={tick}>
                              {fmtTime(e.at)}
                            </span>
                          </div>
                          {e.note && <div className="mt-1 text-[12px] text-ink-muted">{e.note}</div>}
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ol>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Reason capture modal */}
      <AnimatePresence>
        {reasonMode && (
          <ReasonCaptureModal
            reasonMode={reasonMode}
            orderId={selected.id}
            onClose={closeReason}
            onSubmit={transition}
          />
        )}
      </AnimatePresence>
    </div>
  );
}