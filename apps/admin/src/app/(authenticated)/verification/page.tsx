"use client";

import Link from "next/link";
import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Phone, Mail, MapPin, Navigation, Calendar, ChevronDown, FileText, ZoomIn, ZoomOut,
  Download, Maximize2, Check, X, FileQuestion, Ban, ShieldAlert, Search, ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Pharmacy, Document, VerificationStatus } from "@/lib/types";
import { fmtDate, fromNow } from "@/lib/format";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListSkeleton } from "@/components/data-states";
import { cn } from "@/lib/utils";
import {
  useVerificationListQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useRequestDocsMutation,
  useSuspendMutation,
  useBlacklistMutation,
} from "@/hooks/useAdminVerificationQueries";



type ActionType = "approve" | "reject" | "docs" | "suspend" | "blacklist";

function DocViewer({ doc, open, onClose }: { doc: Document | null; open: boolean; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  if (!doc) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileText className="h-4 w-4" />{doc.type}</DialogTitle>
          <DialogDescription>Uploaded {fmtDate(doc.uploadedAt)}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}><ZoomOut className="h-4 w-4" /></Button>
            <span className="w-12 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button size="icon" variant="ghost" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2.4, z + 0.2))}><ZoomIn className="h-4 w-4" /></Button>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success(`${doc.type} downloaded`)}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
        <div className="max-h-[75vh] w-full overflow-auto rounded-xl border bg-muted/20 p-4 flex items-center justify-center">
          <div className="mx-auto origin-top transition-transform" style={{ transform: `scale(${zoom})` }}>
            {doc.url.toLowerCase().endsWith('.pdf') ? (
              <iframe 
                src={doc.url} 
                className="w-[600px] h-[800px] rounded-lg shadow-sm border bg-white" 
                title={doc.type}
              />
            ) : (
              <img 
                src={doc.url} 
                alt={doc.type} 
                className="max-w-[600px] object-contain rounded-lg shadow-sm border bg-white" 
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const ACTION_META: Record<ActionType, { title: string; desc: string; variant: "default" | "destructive"; needsReason?: boolean; needsMsg?: boolean; status: VerificationStatus; toast: string }> = {
  approve: { title: "Approve Pharmacy", desc: "This pharmacy will gain immediate access to the Partner App and can start receiving orders.", variant: "default", status: "verified", toast: "Pharmacy approved — Partner App access granted" },
  reject: { title: "Reject Application", desc: "A mandatory reason is required. The pharmacy will be notified.", variant: "destructive", needsReason: true, status: "rejected", toast: "Application rejected — notification sent" },
  docs: { title: "Request Additional Documents", desc: "Send a custom message describing what is needed.", variant: "default", needsMsg: true, status: "docs_requested", toast: "Document request sent" },
  suspend: { title: "Suspend Pharmacy", desc: "Temporarily disable this pharmacy's operations.", variant: "destructive", needsReason: true, status: "suspended", toast: "Pharmacy suspended" },
  blacklist: { title: "Blacklist Pharmacy", desc: "Permanently ban this pharmacy from the platform.", variant: "destructive", needsReason: true, status: "blacklisted", toast: "Pharmacy blacklisted" },
};

function PharmacyCard({ p, onAction, onView }: { p: Pharmacy; onAction: (a: ActionType, p: Pharmacy) => void; onView: (d: Document) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div layout className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-soft">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-4 p-4 text-left">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white" style={{ background: p.avatarColor }}>
          {p.storeName.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium">{p.storeName}</h3>
            <StatusBadge status={p.verification} />
          </div>
          <p className="truncate text-sm text-muted-foreground">{p.ownerName} · {p.city}, {p.state}</p>
        </div>
        <div className="hidden text-right text-xs text-muted-foreground sm:block">
          <div>Registered</div>
          <div className="font-medium text-foreground">{fromNow(p.registeredAt)}</div>
        </div>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <div className="border-t p-4">
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Information</h4>
                  <dl className="space-y-2.5 text-sm">
                    {[
                      [Phone, "Phone", p.phone], [Mail, "Email", p.email],
                      [MapPin, "Address", p.address], [Navigation, "GPS", `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`],
                      [Calendar, "Registered", fmtDate(p.registeredAt)],
                    ].map(([Icon, label, val]: any) => (
                      <div key={label} className="flex items-start gap-2.5">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
                        <span className="font-medium">{val}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2.5 pt-1">
                      <span className="rounded-lg bg-muted px-2 py-1 text-xs">License: {p.licenseNo}</span>
                      <span className="rounded-lg bg-muted px-2 py-1 text-xs">GST: {p.gstNo}</span>
                    </div>
                  </dl>
                  <Link href={`/pharmacies/${p.id }`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View full profile <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Uploaded Documents</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {p.documents.map((d) => (
                      <button key={d.id} onClick={() => onView(d)} className="group relative flex flex-col items-start gap-2 rounded-xl border bg-muted/30 p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5">
                        <div className="flex w-full items-center justify-between">
                          <FileText className="h-5 w-5 text-primary" />
                          {d.verified ? <Check className="h-3.5 w-3.5 text-success" /> : <span className="h-1.5 w-1.5 rounded-full bg-warning" />}
                        </div>
                        <span className="text-xs font-medium leading-tight">{d.type}</span>
                        <Maximize2 className="absolute right-2 bottom-2 h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                {p.verification !== "blacklisted" && (
                  <Button size="sm" onClick={() => onAction("approve", p)}>
                    <Check className="mr-1.5 h-4 w-4" />
                    {p.verification === "verified" ? "Re-Approve" : "Approve"}
                  </Button>
                )}
                
                {p.verification !== "rejected" && p.verification !== "blacklisted" && (
                  <Button size="sm" variant="destructive" onClick={() => onAction("reject", p)}>
                    <X className="mr-1.5 h-4 w-4" />Reject
                  </Button>
                )}
                
                {p.verification !== "verified" && p.verification !== "rejected" && p.verification !== "blacklisted" && (
                  <Button size="sm" variant="outline" onClick={() => onAction("docs", p)}>
                    <FileQuestion className="mr-1.5 h-4 w-4" />Request Docs
                  </Button>
                )}
                
                {p.verification === "verified" && (
                  <Button size="sm" variant="outline" onClick={() => onAction("suspend", p)}>
                    <ShieldAlert className="mr-1.5 h-4 w-4" />Suspend
                  </Button>
                )}
                
                {p.verification !== "blacklisted" && (
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onAction("blacklist", p)}>
                    <Ban className="mr-1.5 h-4 w-4" />Blacklist
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Verification() {
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [action, setAction] = useState<{ type: ActionType; p: Pharmacy } | null>(null);
  const [reason, setReason] = useState("");

  const { data: pharmacies = [], isLoading } = useVerificationListQuery();
  const approveMutation = useApproveVerificationMutation();
  const rejectMutation = useRejectVerificationMutation();
  const requestDocsMutation = useRequestDocsMutation();
  const suspendMutation = useSuspendMutation();
  const blacklistMutation = useBlacklistMutation();

  const isActionPending = approveMutation.isPending || rejectMutation.isPending || requestDocsMutation.isPending || suspendMutation.isPending || blacklistMutation.isPending;

  const items = pharmacies
    .filter((p) => (filter === "all" ? true : filter === "pending" ? (p.verification === "pending" || p.verification === "docs_requested") : p.verification === filter))
    .filter((p) => `${p.storeName} ${p.ownerName} ${p.city}`.toLowerCase().includes(q.toLowerCase()));

  const confirm = async () => {
    if (!action) return;
    const meta = ACTION_META[action.type];
    if ((meta.needsReason || meta.needsMsg) && !reason.trim()) {
      toast.error(meta.needsMsg ? "Please enter a message" : "A reason is required");
      return;
    }
    
    try {
      if (action.type === "approve") {
        await approveMutation.mutateAsync(action.p.id);
      } else if (action.type === "reject") {
        await rejectMutation.mutateAsync({ registrationId: action.p.id, reason });
      } else if (action.type === "docs") {
        await requestDocsMutation.mutateAsync({ registrationId: action.p.id, reason });
      } else if (action.type === "suspend") {
        await suspendMutation.mutateAsync({ registrationId: action.p.id, reason });
      } else if (action.type === "blacklist") {
        await blacklistMutation.mutateAsync({ registrationId: action.p.id, reason });
      }
      toast.success(meta.toast);
      setAction(null);
      setReason("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  const counts = {
    all: pharmacies.length,
    pending: pharmacies.filter((p) => p.verification === "pending" || p.verification === "docs_requested").length,
    verified: pharmacies.filter((p) => p.verification === "verified").length,
    rejected: pharmacies.filter((p) => p.verification === "rejected").length,
  };

  return (
    <>
      <PageHeader title="Verification Queue" subtitle="Review partner applications, inspect documents, and take action." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All <span className="ml-1.5 text-xs opacity-60">{counts.all}</span></TabsTrigger>
            <TabsTrigger value="pending">Pending <span className="ml-1.5 text-xs opacity-60">{counts.pending}</span></TabsTrigger>
            <TabsTrigger value="verified">Verified <span className="ml-1.5 text-xs opacity-60">{counts.verified}</span></TabsTrigger>
            <TabsTrigger value="rejected">Rejected <span className="ml-1.5 text-xs opacity-60">{counts.rejected}</span></TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search store, owner, city…" className="pl-9" />
        </div>
      </div>

      <motion.div layout className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card p-4 shadow-sm">
                <ListSkeleton rows={1} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {items.map((p) => (
              <PharmacyCard key={p.id} p={p} onAction={(type, pp) => setAction({ type, p: pp })} onView={setViewDoc} />
            ))}
            {!items.length && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
                <Search className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">No applications found</p>
                <p className="text-sm text-muted-foreground">Try a different filter or search term.</p>
              </div>
            )}
          </>
        )}
      </motion.div>

      <DocViewer doc={viewDoc} open={!!viewDoc} onClose={() => setViewDoc(null)} />

      <Dialog open={!!action} onOpenChange={(o) => { if (!o) { setAction(null); setReason(""); } }}>
        <DialogContent>
          {action ? (
            <>
              <DialogHeader>
                <DialogTitle>{ACTION_META[action.type].title}</DialogTitle>
                <DialogDescription>{action.p.storeName} — {ACTION_META[action.type].desc}</DialogDescription>
              </DialogHeader>
              {(ACTION_META[action.type].needsReason || ACTION_META[action.type].needsMsg) && (
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={ACTION_META[action.type].needsMsg ? "Describe the documents required…" : "Enter reason (required)…"}
                  rows={4}
                />
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => { setAction(null); setReason(""); }} disabled={isActionPending}>Cancel</Button>
                <Button variant={ACTION_META[action.type].variant} onClick={confirm} disabled={isActionPending}>
                  {isActionPending ? "Processing..." : "Confirm"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <DialogTitle className="sr-only">Action Menu</DialogTitle>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Verification;
