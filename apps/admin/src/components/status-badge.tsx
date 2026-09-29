import { cn } from "@/lib/utils";

const MAP: Record<string, { label: string; cls: string; dot: string }> = {
  // verification
  pending: { label: "Pending", cls: "bg-warning/12 text-warning-foreground/90 ring-warning/25", dot: "bg-warning" },
  verified: { label: "Verified", cls: "bg-success/12 text-success ring-success/25", dot: "bg-success" },
  rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive ring-destructive/25", dot: "bg-destructive" },
  suspended: { label: "Suspended", cls: "bg-warning/12 text-warning-foreground/90 ring-warning/25", dot: "bg-warning" },
  blacklisted: { label: "Blacklisted", cls: "bg-foreground/10 text-foreground ring-foreground/20", dot: "bg-foreground" },
  docs_requested: { label: "Docs Requested", cls: "bg-info/10 text-info ring-info/25", dot: "bg-info" },
  // pharmacy
  active: { label: "Active", cls: "bg-success/12 text-success ring-success/25", dot: "bg-success" },
  offline: { label: "Offline", cls: "bg-muted text-muted-foreground ring-border", dot: "bg-muted-foreground" },
  // orders
  preparing: { label: "Preparing", cls: "bg-info/10 text-info ring-info/25", dot: "bg-info" },
  out_for_delivery: { label: "Out for Delivery", cls: "bg-warning/12 text-warning-foreground/90 ring-warning/25", dot: "bg-warning" },
  delivered: { label: "Delivered", cls: "bg-success/12 text-success ring-success/25", dot: "bg-success" },
  cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive ring-destructive/25", dot: "bg-destructive" },
  // medicine
  approved: { label: "Approved", cls: "bg-success/12 text-success ring-success/25", dot: "bg-success" },
  hidden: { label: "Hidden", cls: "bg-muted text-muted-foreground ring-border", dot: "bg-muted-foreground" },
  flagged: { label: "Flagged", cls: "bg-destructive/10 text-destructive ring-destructive/25", dot: "bg-destructive" },
  // payments / tickets
  paid: { label: "Paid", cls: "bg-success/12 text-success ring-success/25", dot: "bg-success" },
  refunded: { label: "Refunded", cls: "bg-muted text-muted-foreground ring-border", dot: "bg-muted-foreground" },
  open: { label: "Open", cls: "bg-info/10 text-info ring-info/25", dot: "bg-info" },
  resolved: { label: "Resolved", cls: "bg-success/12 text-success ring-success/25", dot: "bg-success" },
  high: { label: "High", cls: "bg-destructive/10 text-destructive ring-destructive/25", dot: "bg-destructive" },
  medium: { label: "Medium", cls: "bg-warning/12 text-warning-foreground/90 ring-warning/25", dot: "bg-warning" },
  low: { label: "Low", cls: "bg-muted text-muted-foreground ring-border", dot: "bg-muted-foreground" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = MAP[status] ?? { label: status, cls: "bg-muted text-muted-foreground ring-border", dot: "bg-muted-foreground" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        s.cls,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
