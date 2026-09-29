"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LifeBuoy, Send, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, TableSkeleton } from "@/components/data-states";
import { useSimulatedLoading } from "@/hooks/use-loading";
import { fromNow, initials } from "@/lib/format";

const ALL: any[] = []; // Migrated to live data later
import { cn } from "@/lib/utils";



function Support() {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(ALL[0]);
  const [note, setNote] = useState("");
  const items = ALL.filter((t) => (filter === "all" ? true : t.status === filter));

  return (
    <>
      <PageHeader title="Support Center" subtitle="Resolve customer tickets and track conversations." />
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-2">
          {items.map((t, i) => (
            <motion.button key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => setActive(t)}
              className={cn("w-full rounded-2xl border bg-card p-4 text-left transition-colors", active.id === t.id ? "border-primary ring-1 ring-primary/30" : "hover:bg-muted/40")}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t.id}</span>
                <StatusBadge status={t.status} />
              </div>
              <div className="mt-1 font-medium">{t.subject}</div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.customer}</span><StatusBadge status={t.priority} />
              </div>
            </motion.button>
          ))}
        </div>

        <Card className="lg:col-span-3">
          <CardContent className="flex h-full flex-col pt-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">{active.subject}</h3>
                <p className="text-sm text-muted-foreground">{active.id} · {active.customer} · opened {fromNow(active.createdAt)}</p>
              </div>
              <StatusBadge status={active.status} />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              <div className="flex gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{initials(active.customer)}</span>
                <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2 text-sm">Hi, I have an issue regarding "{active.subject.toLowerCase()}". Can you help?</div>
              </div>
              <div className="flex flex-row-reverse gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">PS</span>
                <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary/10 px-3.5 py-2 text-sm">Thanks for reaching out — looking into this now and will update you shortly.</div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internal note · Assignee: {active.assignee}</div>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note (not visible to customer)…" aria-label="Add internal note" className="bg-card" />
              </div>
              <div className="flex gap-2">
                <Input placeholder="Reply to customer…" aria-label="Reply to customer" className="flex-1" />
                <Button aria-label="Send reply" onClick={() => toast.success("Reply sent")}><Send className="h-4 w-4" /></Button>
                <Button variant="outline" onClick={() => toast.success("Ticket resolved")}>Resolve</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Support;
