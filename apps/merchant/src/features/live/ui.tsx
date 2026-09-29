"use client";
import { type ReactNode, useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-1 text-xl font-semibold leading-tight text-ink sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  tone = "muted",
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "signal" | "brand" | "alert" | "warn" | "muted";
  icon?: ReactNode;
}) {
  const toneCls: Record<string, string> = {
    signal: "text-signal",
    brand: "text-brand",
    alert: "text-alert",
    warn: "text-warn",
    muted: "text-ink-subtle",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
      className="rounded-xl border border-line bg-paper p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">{label}</div>
        {icon && <span className="text-ink-subtle">{icon}</span>}
      </div>
      <div className="mt-2 font-display text-2xl leading-none text-ink">{value}</div>
      {delta && <div className={`mt-1.5 font-mono text-[10px] ${toneCls[tone]}`}>{delta}</div>}
    </motion.div>
  );
}

export function Card({
  title,
  action,
  children,
  padded = true,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-paper ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          {title && (
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">
              {title}
            </div>
          )}
          {action}
        </div>
      )}
      <div className={padded ? "p-4" : ""}>{children}</div>
    </div>
  );
}

export type Tone = "signal" | "brand" | "warn" | "alert" | "muted" | "accepted" | "delivered" | "pending_amber";

const TONE_CLS: Record<Tone, string> = {
  signal: "bg-signal/10 text-signal border-signal/25",
  brand: "bg-brand/10 text-brand border-brand/25",
  warn: "bg-warn/15 text-warn border-warn/30",
  alert: "bg-alert/10 text-alert border-alert/25",
  muted: "bg-ink/5 text-ink-muted border-line",
  accepted: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
  delivered: "bg-emerald-900/30 text-emerald-300 border-emerald-800/30",
  pending_amber: "bg-amber-950/40 text-amber-400 border-amber-800/40",
};

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${TONE_CLS[tone]}`}
    >
      {children}
    </span>
  );
}

export function IconBtn({
  children,
  onClick,
  title,
  disabled,
  tone,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  tone?: Tone;
  className?: string;
}) {
  const toneClasses = tone === "alert" ? "hover:border-alert hover:text-alert" : "hover:bg-hover hover:text-ink";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title || "Icon action"}
      disabled={disabled}
      className={`grid size-8 place-items-center rounded-md border border-line bg-paper text-ink-muted transition-colors disabled:opacity-40 ${toneClasses} ${className || ""}`}
    >
      {children}
    </button>
  );
}

export function Btn({
  children,
  onClick,
  variant = "solid",
  size = "md",
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const sz = size === "sm" ? "h-8 px-2.5 text-[12px]" : "h-9 px-3.5 text-[13px]";
  const v =
    variant === "solid"
      ? "bg-ink text-paper hover:bg-ink/90"
      : variant === "outline"
        ? "border border-line bg-paper text-ink hover:bg-hover"
        : "text-ink-muted hover:bg-hover hover:text-ink";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-40 ${sz} ${v} ${className}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-line bg-paper-alt/40 p-10 text-center">
      <div className="max-w-sm">
        <div className="font-display text-lg text-ink">{title}</div>
        {description && <p className="mt-1 text-[13px] text-ink-muted">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

/** Full-screen slide-over drawer anchored to the right. */
export function SlideOver({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
        className={`absolute right-0 top-0 flex h-full w-full ${width} flex-col border-l border-line bg-paper shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">{title}</div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-muted hover:bg-hover hover:text-ink"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </motion.aside>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink/5 ${className}`} />;
}

// --------------------------- Toast system ---------------------------
// Tiny event-based toaster. Call `toast("Saved")` from anywhere.

type ToastKind = "info" | "success" | "warn" | "error";
type ToastItem = { id: number; kind: ToastKind; text: string };

let toastId = 0;
const toastListeners = new Set<() => void>();
let toastList: ToastItem[] = [];

function emit() { toastListeners.forEach((l) => l()); }

export function toast(text: string, kind: ToastKind = "success") {
  const id = ++toastId;
  toastList = [...toastList, { id, kind, text }];
  emit();
  setTimeout(() => {
    toastList = toastList.filter((t) => t.id !== id);
    emit();
  }, 2600);
}

function subscribe(fn: () => void) { toastListeners.add(fn); return () => { toastListeners.delete(fn); }; }
function getSnap() { return toastList; }

const TOAST_TONE: Record<ToastKind, string> = {
  info: "border-line bg-paper text-ink",
  success: "border-signal/30 bg-signal/10 text-ink",
  warn: "border-warn/30 bg-warn/15 text-ink",
  error: "border-alert/30 bg-alert/10 text-ink",
};

export function Toaster() {
  const items = useSyncExternalStore(subscribe, getSnap, getSnap);
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(320px,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
            className={`pointer-events-auto rounded-md border px-3 py-2 text-[12px] shadow-sm ${TOAST_TONE[t.kind]}`}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// --------------------------- Confirm dialog ---------------------------

export function Confirm({
  open, title, message, confirmLabel = "Confirm", tone = "brand", onCancel, onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: "brand" | "alert";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55] grid place-items-center p-4">
      <button aria-label="Close" onClick={onCancel} className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-dlg-title" aria-describedby="confirm-dlg-msg" className="relative w-full max-w-sm rounded-xl border border-line bg-paper p-5 shadow-xl">
        <div id="confirm-dlg-title" className="font-display text-lg text-ink">{title}</div>
        <p id="confirm-dlg-msg" className="mt-1 text-[13px] text-ink-muted">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn
            onClick={onConfirm}
            className={tone === "alert" ? "!bg-alert hover:!bg-alert/90" : ""}
          >
            {confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// --------------------------- CSV download helper ---------------------------

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}