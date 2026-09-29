"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Eye, EyeOff, Check, Trash2, Flag, MoreHorizontal, AlertTriangle, ArrowUpDown, Pill, SearchX } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState, TableSkeleton } from "@/components/data-states";
import { useAdminMedicines, useUpdateAdminMedicineMutation } from "@/hooks/useAdminDataQueries";
import { inr, fmtDate } from "@/lib/format";



const categories = ["all", "Antibiotics", "Cardiac", "Diabetes", "Pain Relief", "Vitamins", "Respiratory", "Gastro"];

function Medicines() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"stock" | "price" | "expiry">("stock");
  
  const { data, isLoading: loading } = useAdminMedicines();
  const updateMut = useUpdateAdminMedicineMutation();
  const ALL = data?.medicines || [];

  const items = useMemo(() => {
    return ALL
      .filter((m) => (cat === "all" ? true : m.category === cat))
      .filter((m) => `${m.name} ${m.manufacturer} ${m.batchNo}`.toLowerCase().includes(q.toLowerCase()))
      .filter((m) => (m.status as string) !== "removed")
      .sort((a, b) => (sort === "price" ? b.sellingPrice - a.sellingPrice : sort === "expiry" ? +new Date(a.expiry) - +new Date(b.expiry) : b.stock - a.stock));
  }, [q, cat, sort, ALL]);

  const act = async (id: string, status: string, msg: string) => { 
    try {
      await updateMut.mutateAsync({ id, status });
      toast.success(msg); 
    } catch (err) {
      toast.error("Failed to update medicine");
    }
  };
  const isEmpty = !loading && items.length === 0;

  const Actions = ({ m, size = 8 }: { m: (typeof items)[number]; size?: number }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className={size === 10 ? "h-10 w-10" : "h-8 w-8"} aria-label={`Actions for ${m.name}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => act(m.id, "approved", "Medicine approved")}><Check className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>
        <DropdownMenuItem onClick={() => act(m.id, "hidden", "Medicine hidden")}>{m.status === "hidden" ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}Hide</DropdownMenuItem>
        <DropdownMenuItem onClick={() => act(m.id, "flagged", "Listing flagged as suspicious")}><Flag className="mr-2 h-4 w-4" />Flag suspicious</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => act(m.id, "removed", "Medicine removed")}><Trash2 className="mr-2 h-4 w-4" />Remove</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <PageHeader title="Medicine Management" subtitle={`${ALL.length} medicines listed across partners`} />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicines, manufacturers, batch…" aria-label="Search medicines" className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="sm:w-44" aria-label="Filter medicines"><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All categories" : c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as any)}>
            <SelectTrigger className="sm:w-40" aria-label="Sort medicines"><ArrowUpDown className="mr-1 h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="expiry">Expiry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : isEmpty ? (
          <EmptyState
            icon={q || cat !== "all" ? SearchX : Pill}
            title={q || cat !== "all" ? "No matching medicines" : "No medicines listed"}
            description={q || cat !== "all" ? "Try a different search term or category filter." : "Medicines listed by partner pharmacies will appear here."}
            action={q || cat !== "all" ? { label: "Clear filters", onClick: () => { setQ(""); setCat("all"); } } : undefined}
            className="border-0"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Batch / Expiry</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>MRP / Price</TableHead>
                    <TableHead>Rx</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((m, i) => {
                    const expiringSoon = +new Date(m.expiry) - Date.now() < 90 * 864e5;
                    return (
                      <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.01, 0.2) }} className="border-b transition-colors hover:bg-muted/40">
                        <TableCell>
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.manufacturer}</div>
                        </TableCell>
                        <TableCell><span className="rounded-lg bg-muted px-2 py-0.5 text-xs">{m.category}</span></TableCell>
                        <TableCell>
                          <div className="text-sm">{m.batchNo}</div>
                          <div className={`flex items-center gap-1 text-xs ${expiringSoon ? "text-destructive" : "text-muted-foreground"}`}>
                            {expiringSoon && <AlertTriangle className="h-3 w-3" />}{fmtDate(m.expiry)}
                          </div>
                        </TableCell>
                        <TableCell><span className={m.stock < 30 ? "font-medium text-destructive" : "font-medium"}>{m.stock}</span></TableCell>
                        <TableCell><div className="text-xs text-muted-foreground line-through">{inr(m.mrp)}</div><div className="font-medium">{inr(m.sellingPrice)}</div></TableCell>
                        <TableCell>{m.prescriptionRequired ? <span className="rounded bg-info/10 px-1.5 py-0.5 text-xs font-medium text-info">Rx</span> : <span className="text-xs text-muted-foreground">OTC</span>}</TableCell>
                        <TableCell><StatusBadge status={m.status} /></TableCell>
                        <TableCell><Actions m={m} /></TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y md:hidden">
              {items.map((m, i) => {
                const expiringSoon = +new Date(m.expiry) - Date.now() < 90 * 864e5;
                return (
                  <motion.li key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.015, 0.25) }} className="flex min-h-16 items-start gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{m.name}</span>
                        {m.prescriptionRequired && <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info">Rx</span>}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{m.manufacturer} · {m.category}</p>
                      <p className={`mt-0.5 flex items-center gap-1 text-xs ${expiringSoon ? "text-destructive" : "text-muted-foreground"}`}>
                        {expiringSoon && <AlertTriangle className="h-3 w-3" />}Exp {fmtDate(m.expiry)} · Stock {m.stock}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <StatusBadge status={m.status} />
                        <span className="font-medium">{inr(m.sellingPrice)}</span>
                      </div>
                    </div>
                    <Actions m={m} size={10} />
                  </motion.li>
                );
              })}
            </ul>
          </>
        )}
      </Card>
    </>
  );
}

export default Medicines;
