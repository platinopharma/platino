"use client";
import { useState } from "react";
import { Bell, ShoppingBag, XCircle, Package, AlertTriangle, ShieldCheck, IndianRupee, Info, Check } from "lucide-react";
import { Btn, Card, PageHeader, Pill, toast } from "@/features/live/ui";
import { NOTICES, type Notice, type NoticeKind } from "@/features/live/data";

const ICONS: Record<NoticeKind, React.ReactNode> = {
  order: <ShoppingBag className="size-4" />,
  cancel: <XCircle className="size-4" />,
  stock: <Package className="size-4" />,
  expiry: <AlertTriangle className="size-4" />,
  verify: <ShieldCheck className="size-4" />,
  payment: <IndianRupee className="size-4" />,
  system: <Info className="size-4" />,
};

const TONES: Record<NoticeKind, "brand" | "alert" | "warn" | "signal" | "muted"> = {
  order: "brand", cancel: "alert", stock: "alert", expiry: "warn", verify: "signal", payment: "signal", system: "muted",
};

const ICON_BG: Record<NoticeKind, string> = {
  order: "bg-brand/10 text-brand",
  cancel: "bg-alert/10 text-alert",
  stock: "bg-alert/10 text-alert",
  expiry: "bg-warn/15 text-warn",
  verify: "bg-signal/10 text-signal",
  payment: "bg-signal/10 text-signal",
  system: "bg-ink/5 text-ink-muted",
};

const TABS: { key: NoticeKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "order", label: "Orders" },
  { key: "stock", label: "Stock" },
  { key: "expiry", label: "Expiry" },
  { key: "payment", label: "Payments" },
  { key: "verify", label: "Verification" },
  { key: "system", label: "System" },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState<NoticeKind | "all">("all");
  const [items, setItems] = useState<Notice[]>(NOTICES);

  const unread = items.filter((n) => !n.read).length;
  const rows = items.filter((n) => tab === "all" || n.kind === tab);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description={`${unread} unread — orders, alerts and account updates in one place.`}
        actions={
          <>
            <Btn variant="outline" size="sm" onClick={() => setItems((it) => it.map((n) => ({ ...n, read: true })))}><Check className="size-3.5" /> Mark all read</Btn>
            <Btn size="sm" variant="outline" onClick={() => toast("Notification preferences open in Settings")}><Bell className="size-3.5" /> Preferences</Btn>
          </>
        }
      />

      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          const n = t.key === "all" ? items.length : items.filter((x) => x.kind === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-md border px-3 py-1.5 text-[12px] ${active ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-muted hover:text-ink"}`}
            >
              {t.label} <span className={`ml-1 font-mono text-[10px] ${active ? "text-paper/70" : "text-ink-subtle"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <Card padded={false}>
        <ul className="divide-y divide-line">
          {rows.map((n) => (
            <li key={n.id} className={`flex gap-3 px-4 py-3.5 text-[12px] ${n.read ? "opacity-70" : ""}`}>
              <div className={`grid size-9 shrink-0 place-items-center rounded-md ${ICON_BG[n.kind]}`}>{ICONS[n.kind]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate font-medium text-ink">{n.title}</div>
                  {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-brand" />}
                </div>
                <div className="mt-0.5 truncate text-ink-muted">{n.body}</div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-ink-subtle">
                  <span>{n.time}</span>
                  <span>·</span>
                  <Pill tone={TONES[n.kind]}>{n.kind}</Pill>
                </div>
              </div>
              <button onClick={() => setItems((it) => it.map((x) => x.id === n.id ? { ...x, read: true } : x))} className="text-[11px] text-ink-subtle hover:text-ink">
                {n.read ? "Read" : "Mark read"}
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
