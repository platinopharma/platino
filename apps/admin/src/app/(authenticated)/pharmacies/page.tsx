"use client";

import Link from "next/link";
import { useState } from "react";

import { motion } from "framer-motion";
import { Search, Star, ArrowUpRight, LayoutGrid, List, Store, SearchX } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, CardGridSkeleton } from "@/components/data-states";
import { useAdminPharmacies } from "@/hooks/useAdminDataQueries";
import { inr, num, fromNow } from "@/lib/format";
import { cn } from "@/lib/utils";

function Pharmacies() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  
  const { data, isLoading: loading } = useAdminPharmacies();
  const ALL = data?.pharmacies || [];

  const items = ALL
    .filter((p) => (status === "all" ? true : p.status === status))
    .filter((p) => `${p.storeName} ${p.city} ${p.ownerName}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Partner Pharmacies"
        subtitle={`${num(ALL.length)} pharmacies across the network`}
        actions={
          <div className="flex rounded-xl border p-0.5">
            <Button size="icon" variant={view === "grid" ? "secondary" : "ghost"} className="h-8 w-8" aria-label="Grid view" onClick={() => setView("grid")}><LayoutGrid className="h-4 w-4" /></Button>
            <Button size="icon" variant={view === "list" ? "secondary" : "ghost"} className="h-8 w-8" aria-label="List view" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pharmacies…" aria-label="Search pharmacies" className="pl-9" />
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={q || status !== "all" ? SearchX : Store}
          title={q || status !== "all" ? "No matching pharmacies" : "No pharmacies yet"}
          description={q || status !== "all" ? "Try adjusting your search or status filter." : "Partner pharmacies will appear here as they join the network."}
          action={q || status !== "all" ? { label: "Clear filters", onClick: () => { setQ(""); setStatus("all"); } } : undefined}
        />
      ) : (
      <div className={cn(view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-2")}>
        {items.map((p, i) => (
          <motion.div className="min-w-0" key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
            <Link href={p.status === 'pending' ? '/verification' : `/pharmacies/${p.id}`}
              className={cn(
                "group block min-w-0 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft",
                view === "list" && "flex items-center gap-4",
              )}
            >
              <div className={cn("flex items-center gap-3", view === "grid" && "mb-3")}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white" style={{ background: p.avatarColor }}>
                  {p.storeName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate font-medium">{p.storeName}</h3>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{p.city}, {p.state}</p>
                </div>
                <div className="shrink-0"><StatusBadge status={p.status} /></div>
              </div>
              <div className={cn("grid grid-cols-3 gap-2 text-sm", view === "list" && "ml-auto w-80")}>
                <div><div className="text-xs text-muted-foreground">Orders</div><div className="font-medium">{num(p.totalOrders)}</div></div>
                <div><div className="text-xs text-muted-foreground">Revenue</div><div className="font-medium">{inr(p.revenue, true)}</div></div>
                <div><div className="text-xs text-muted-foreground">Rating</div><div className="flex items-center gap-1 font-medium"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{p.rating}</div></div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      )}
    </>
  );
}

export default Pharmacies;
