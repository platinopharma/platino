"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Boxes,
  Pill,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Trash2,
  Edit3,
  MoreHorizontal,
  Package,
  Layers,
  Sparkles,
  Download,
  Eye,
  RefreshCw,
  Clock,
  ShieldAlert,
  Thermometer,
  Percent,
  X,
  ExternalLink,
  Store,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState, TableSkeleton } from "@/components/data-states";
import {
  useAdminInventory,
  useCreateAdminInventoryMutation,
  useUpdateAdminInventoryMutation,
  useDeleteAdminInventoryMutation,
} from "@/hooks/useAdminInventoryQueries";
import { AdminInventoryItem } from "@/lib/types";
import { inr, fmtDate } from "@/lib/format";

const CATEGORIES = [
  "all",
  "Fever & Pain Relief",
  "Cough, Cold & Immunity",
  "Digestion & Acidity",
  "Diabetes Care",
  "Cardiac & Blood Pressure",
  "Skin & Hair Care",
  "Vitamins & Supplements",
  "Baby & Mother Care",
  "Eye, Ear & Dental Care",
  "First Aid & Surgical Essentials",
  "Prescription Medicines",
  "Antibiotics",
  "Respiratory",
  "Ayurvedic / Herbal",
];

const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Ointment",
  "Gel",
  "Drops",
  "Suspension",
  "Inhaler",
  "Powder",
  "Cream",
];

const UNITS = ["strips", "bottles", "boxes", "vials", "tubes", "pieces", "packs"];

const TEMPERATURE_OPTIONS = [
  "Room Temperature",
  "Below 25°C",
  "2°C – 8°C (Refrigerated)",
  "Cool and Dry Place",
  "Deep Freeze (-20°C)",
];

export default function AdminInventoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [pharmacyId, setPharmacyId] = useState("all");
  const [sort, setSort] = useState<"stock" | "price" | "expiry" | "discount">("stock");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminInventoryItem | null>(null);
  const [viewItem, setViewItem] = useState<AdminInventoryItem | null>(null);
  const [restockItem, setRestockItem] = useState<AdminInventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);

  const { data, isLoading, refetch } = useAdminInventory({
    search,
    category,
    stockStatus,
    pharmacyId,
  });

  const createMut = useCreateAdminInventoryMutation();
  const updateMut = useUpdateAdminInventoryMutation();
  const deleteMut = useDeleteAdminInventoryMutation();

  const rawList = data?.data || data?.medicines || [];
  const pharmacies = data?.pharmacies || [];

  // Filter & Sort
  const items = useMemo(() => {
    return [...rawList].sort((a, b) => {
      if (sort === "price") return (b.pricing?.sellingPrice || 0) - (a.pricing?.sellingPrice || 0);
      if (sort === "discount") return (b.pricing?.discountPercentage || 0) - (a.pricing?.discountPercentage || 0);
      if (sort === "expiry") {
        const dA = a.inventory?.expiryDate ? new Date(a.inventory.expiryDate).getTime() : 0;
        const dB = b.inventory?.expiryDate ? new Date(b.inventory.expiryDate).getTime() : 0;
        return dA - dB;
      }
      return (b.inventory?.quantity || b.stock || 0) - (a.inventory?.quantity || a.stock || 0);
    });
  }, [rawList, sort]);

  // Summary Metrics
  const totalSKUs = items.length;
  const totalUnits = items.reduce((acc, m) => acc + (m.inventory?.quantity || m.stock || 0), 0);
  const lowStockCount = items.filter(
    (m) =>
      (m.inventory?.quantity || m.stock || 0) > 0 &&
      (m.inventory?.quantity || m.stock || 0) <= (m.inventory?.lowStockThreshold || 20)
  ).length;
  const outOfStockCount = items.filter((m) => (m.inventory?.quantity || m.stock || 0) === 0).length;
  const totalValuation = items.reduce(
    (acc, m) => acc + (m.pricing?.sellingPrice || 0) * (m.inventory?.quantity || m.stock || 0),
    0
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    try {
      await deleteMut.mutateAsync(id);
      toast.success(`"${name}" removed from inventory`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete item");
    }
  };

  const handleRestockSubmit = async () => {
    if (!restockItem) return;
    const currentQty = restockItem.inventory?.quantity || restockItem.stock || 0;
    const newQty = currentQty + Number(restockQty);
    try {
      await updateMut.mutateAsync({
        id: restockItem.id || restockItem._id || "",
        data: {
          inventory: {
            ...restockItem.inventory,
            quantity: newQty,
          },
          stock: newQty,
          status: newQty > 0 ? "active" : "out_of_stock",
        },
      });
      toast.success(`Restocked ${restockItem.medicineName} (+${restockQty} units, Total: ${newQty})`);
      setRestockItem(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update stock");
    }
  };

  const exportCSV = () => {
    const headers = [
      "Medicine ID",
      "Medicine Name",
      "Brand Name",
      "Generic Name",
      "Category",
      "Subcategory",
      "Dosage Form",
      "Strength",
      "Pack Size",
      "Manufacturer",
      "MRP",
      "Selling Price",
      "Discount %",
      "Stock Qty",
      "Unit",
      "Batch Number",
      "Expiry Date",
      "Low Stock Threshold",
      "Rx Required",
      "Storage Temp",
      "Status",
    ];

    const rows = items.map((m) => [
      m.medicineId || "",
      `"${m.medicineName}"`,
      `"${m.brandName || m.medicineName}"`,
      `"${m.genericName || ""}"`,
      `"${m.category}"`,
      `"${m.subcategory || ""}"`,
      m.dosageForm,
      m.strength || "",
      m.packSize,
      `"${m.manufacturer}"`,
      m.pricing?.mrp || 0,
      m.pricing?.sellingPrice || 0,
      m.pricing?.discountPercentage || 0,
      m.inventory?.quantity || 0,
      m.inventory?.unit || "strips",
      m.inventory?.batchNumber || "",
      m.inventory?.expiryDate ? new Date(m.inventory.expiryDate).toISOString().slice(0, 10) : "",
      m.inventory?.lowStockThreshold || 10,
      m.prescriptionRequired ? "Yes" : "No",
      `"${m.storage?.temperature || "Room Temperature"}"`,
      m.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platino_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inventory exported to CSV");
  };

  return (
    <>
      <PageHeader
        title="Operations Inventory Management"
        subtitle="Full-spectrum medicine catalog, batching, stock valuation, and pharmacy partner sync"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Medicine
            </Button>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mb-6">
        <Card className="p-4 border-l-4 border-l-primary flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Catalog</span>
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{totalSKUs}</div>
            <div className="text-xs text-muted-foreground">Unique SKUs active</div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-info flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Stock Units</span>
            <Package className="h-4 w-4 text-info" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{totalUnits.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Units across stores</div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-warning flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Low Stock Alert</span>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
            <div className="text-xs text-muted-foreground">Below threshold</div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-destructive flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Out of Stock</span>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
            <div className="text-xs text-muted-foreground">Requires replenishment</div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock Valuation</span>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{inr(totalValuation)}</div>
            <div className="text-xs text-muted-foreground">Selling value</div>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden p-0 shadow-sm">
        {/* Controls Bar */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center bg-card">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine name, brand, generic, batch number, SKU..."
              className="pl-9"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockStatus} onValueChange={setStockStatus}>
            <SelectTrigger className="sm:w-36">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v: any) => setSort(v)}>
            <SelectTrigger className="sm:w-36">
              <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stock">Stock Level</SelectItem>
              <SelectItem value="price">Selling Price</SelectItem>
              <SelectItem value="discount">Discount %</SelectItem>
              <SelectItem value="expiry">Expiry Date</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" onClick={() => refetch()} title="Refresh">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <TableSkeleton rows={8} cols={8} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No inventory records found"
            description={
              search || category !== "all"
                ? "No medicines match your current search or category filters."
                : "No inventory items have been created yet. Click 'Add Medicine' above to create one."
            }
            action={
              search || category !== "all"
                ? {
                    label: "Clear Filters",
                    onClick: () => {
                      setSearch("");
                      setCategory("all");
                      setStockStatus("all");
                    },
                  }
                : {
                    label: "Add New Medicine",
                    onClick: () => setIsAddOpen(true),
                  }
            }
            className="border-0"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-12">SKU ID</TableHead>
                  <TableHead>Medicine & Brand</TableHead>
                  <TableHead>Category / Subcategory</TableHead>
                  <TableHead>Form & Strength</TableHead>
                  <TableHead>Batch & Expiry</TableHead>
                  <TableHead>Stock (Units)</TableHead>
                  <TableHead>Pricing & MRP</TableHead>
                  <TableHead>Rx / Temp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((m, i) => {
                  const qty = m.inventory?.quantity ?? m.stock ?? 0;
                  const threshold = m.inventory?.lowStockThreshold ?? 10;
                  const isLow = qty > 0 && qty <= threshold;
                  const isOut = qty === 0;
                  const expDate = m.inventory?.expiryDate || m.expiryDate;
                  const isExpiringSoon = expDate ? new Date(expDate).getTime() - Date.now() < 90 * 864e5 : false;
                  const frontImg = (m.images || []).find((im: any) => im.type === "front")?.url || m.images?.[0]?.url || (typeof m.images?.[0] === "string" ? m.images[0] : null);

                  return (
                    <motion.tr
                      key={m.id || m._id || m.medicineId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.015, 0.2) }}
                      className="border-b transition-colors hover:bg-muted/30"
                    >
                      {/* SKU */}
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {m.medicineId || `MED-${m._id?.slice(-6).toUpperCase()}`}
                      </TableCell>

                      {/* Medicine & Brand */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {frontImg ? (
                            <img
                              src={frontImg}
                              alt={m.medicineName}
                              className="h-10 w-10 shrink-0 rounded-lg object-cover border border-line bg-muted"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Pill className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-ink flex items-center gap-2">
                              <span className="truncate">{m.medicineName}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {m.brandName && m.brandName !== m.medicineName && (
                                <span className="font-semibold text-ink-subtle mr-1.5">{m.brandName} •</span>
                              )}
                              <span>{m.manufacturer}</span>
                            </div>
                            {m.genericName && (
                              <div className="text-[11px] text-muted-foreground italic truncate max-w-[200px]">
                                {m.genericName}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <div>
                          <span className="inline-block rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                            {m.category}
                          </span>
                          {m.subcategory && (
                            <div className="mt-1 text-[11px] text-muted-foreground truncate">{m.subcategory}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Form & Strength */}
                      <TableCell>
                        <div className="text-xs font-medium text-ink">
                          {m.dosageForm || "Tablet"} {m.strength && `(${m.strength})`}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{m.packSize || "10 Tablets"}</div>
                      </TableCell>

                      {/* Batch & Expiry */}
                      <TableCell>
                        <div className="font-mono text-xs text-ink">{m.inventory?.batchNumber || m.batchNo || "BATCH-001"}</div>
                        <div
                          className={`flex items-center gap-1 text-[11px] ${
                            isExpiringSoon ? "font-semibold text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {isExpiringSoon && <AlertTriangle className="h-3 w-3" />}
                          Exp: {expDate ? fmtDate(expDate) : "N/A"}
                        </div>
                      </TableCell>

                      {/* Stock Quantity */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-sm ${
                              isOut ? "text-destructive" : isLow ? "text-warning font-bold" : "text-ink"
                            }`}
                          >
                            {qty}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{m.inventory?.unit || "strips"}</span>
                        </div>
                        <div className="mt-1 h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOut ? "bg-destructive w-0" : isLow ? "bg-warning w-1/3" : "bg-emerald-500 w-full"
                            }`}
                          />
                        </div>
                      </TableCell>

                      {/* Pricing */}
                      <TableCell>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-ink">{inr(m.pricing?.sellingPrice ?? m.sellingPrice ?? 0)}</span>
                          {(m.pricing?.mrp ?? m.mrp) > (m.pricing?.sellingPrice ?? m.sellingPrice ?? 0) && (
                            <span className="text-xs text-muted-foreground line-through">
                              {inr(m.pricing?.mrp ?? m.mrp ?? 0)}
                            </span>
                          )}
                        </div>
                        {(m.pricing?.discountPercentage ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Percent className="h-2.5 w-2.5" />
                            {m.pricing.discountPercentage}% OFF
                          </span>
                        )}
                      </TableCell>

                      {/* Rx / Temp */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {m.prescriptionRequired ? (
                            <span className="w-fit rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-bold text-info">
                              Rx Required
                            </span>
                          ) : (
                            <span className="w-fit rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              OTC
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                            {m.storage?.temperature || "Room Temp"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={isOut ? "out_of_stock" : m.status || "active"} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setViewItem(m)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Full Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setRestockItem(m); setRestockQty(50); }}>
                              <Package className="mr-2 h-4 w-4 text-emerald-500" />
                              Quick Restock (+Qty)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingItem(m)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit Parameters
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(m.id || m._id || m.medicineId, m.medicineName)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete SKU
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add / Edit Medicine Dialog */}
      <MedicineFormDialog
        isOpen={isAddOpen || !!editingItem}
        onClose={() => {
          setIsAddOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
        pharmacies={pharmacies}
        onSubmit={async (formData) => {
          try {
            if (editingItem) {
              await updateMut.mutateAsync({
                id: editingItem.id || editingItem._id || editingItem.medicineId,
                data: formData,
              });
              toast.success(`"${formData.medicineName}" updated successfully`);
            } else {
              await createMut.mutateAsync(formData);
              toast.success(`"${formData.medicineName}" added to inventory`);
            }
            setIsAddOpen(false);
            setEditingItem(null);
          } catch (err: any) {
            toast.error(err?.message || "Failed to save medicine inventory");
          }
        }}
      />

      {/* Quick Restock Dialog */}
      <Dialog open={!!restockItem} onOpenChange={(open) => !open && setRestockItem(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Restock Medicine
            </DialogTitle>
            <DialogDescription>
              Add units to current stock for <strong>{restockItem?.medicineName}</strong> ({restockItem?.brandName}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg text-sm">
              <span className="text-muted-foreground">Current Stock:</span>
              <span className="font-bold text-ink">
                {restockItem?.inventory?.quantity || restockItem?.stock || 0} {restockItem?.inventory?.unit || "strips"}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Units to Add</label>
              <Input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-lg text-sm text-emerald-700 dark:text-emerald-300">
              <span>New Total Stock:</span>
              <span className="font-bold text-base">
                {(restockItem?.inventory?.quantity || restockItem?.stock || 0) + Number(restockQty)}{" "}
                {restockItem?.inventory?.unit || "strips"}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleRestockSubmit} className="bg-primary">
              Confirm Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Item Details Dialog */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold">
                  {viewItem.medicineId}
                </span>
                <StatusBadge status={viewItem.status} />
              </div>
              <DialogTitle className="text-xl font-bold mt-2">{viewItem.medicineName}</DialogTitle>
              <DialogDescription>
                {viewItem.brandName} • {viewItem.genericName || "No generic name specified"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              {/* Images Preview */}
              {viewItem.images && viewItem.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {viewItem.images.map((img, idx) => (
                    <div key={idx} className="relative shrink-0 rounded-lg overflow-hidden border border-line bg-muted w-28 h-28">
                      <img src={img.url} alt={img.alt || "Medicine Image"} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-black/70 text-[10px] text-white px-1.5 py-0.5 rounded uppercase">
                        {img.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              {viewItem.description && (
                <div className="bg-muted/40 p-3 rounded-lg">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Description & Indication
                  </span>
                  <p className="text-ink text-xs leading-relaxed">{viewItem.description}</p>
                </div>
              )}

              {/* Grid specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-card border p-3 rounded-lg">
                  <span className="text-[11px] text-muted-foreground block">Category</span>
                  <span className="font-semibold text-ink">{viewItem.category}</span>
                </div>
                <div className="bg-card border p-3 rounded-lg">
                  <span className="text-[11px] text-muted-foreground block">Dosage Form</span>
                  <span className="font-semibold text-ink">{viewItem.dosageForm}</span>
                </div>
                <div className="bg-card border p-3 rounded-lg">
                  <span className="text-[11px] text-muted-foreground block">Strength</span>
                  <span className="font-semibold text-ink">{viewItem.strength || "N/A"}</span>
                </div>
                <div className="bg-card border p-3 rounded-lg">
                  <span className="text-[11px] text-muted-foreground block">Pack Size</span>
                  <span className="font-semibold text-ink">{viewItem.packSize}</span>
                </div>
                <div className="bg-card border p-3 rounded-lg">
                  <span className="text-[11px] text-muted-foreground block">Manufacturer</span>
                  <span className="font-semibold text-ink">{viewItem.manufacturer}</span>
                </div>
                <div className="bg-card border p-3 rounded-lg">
                  <span className="text-[11px] text-muted-foreground block">Rx Status</span>
                  <span className="font-semibold text-ink">{viewItem.prescriptionRequired ? "Prescription Required" : "OTC"}</span>
                </div>
              </div>

              {/* Pricing & Stock Banner */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-lg">
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mb-1">Pricing Overview</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                      {inr(viewItem.pricing?.sellingPrice || 0)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">{inr(viewItem.pricing?.mrp || 0)}</span>
                    <span className="text-xs font-bold text-emerald-600">({viewItem.pricing?.discountPercentage || 0}% OFF)</span>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-lg">
                  <div className="text-xs text-blue-800 dark:text-blue-300 font-semibold mb-1">Batch & Stock</div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {viewItem.inventory?.quantity || 0} {viewItem.inventory?.unit || "strips"}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Batch: {viewItem.inventory?.batchNumber || "N/A"} • Exp: {viewItem.inventory?.expiryDate ? fmtDate(viewItem.inventory.expiryDate) : "N/A"}
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div className="bg-muted/40 p-3 rounded-lg flex items-start gap-2">
                <Thermometer className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold">{viewItem.storage?.temperature || "Room Temperature"}: </span>
                  <span className="text-muted-foreground">{viewItem.storage?.storageInstructions || "Store in cool, dry place."}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewItem(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  const itm = viewItem;
                  setViewItem(null);
                  setEditingItem(itm);
                }}
              >
                <Edit3 className="mr-1.5 h-4 w-4" />
                Edit SKU
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// -------------------------------------------------------------
// Multi-Section Medicine Creation & Editing Modal
// -------------------------------------------------------------
function MedicineFormDialog({
  isOpen,
  onClose,
  initialData,
  pharmacies,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: AdminInventoryItem | null;
  pharmacies: Array<{ id: string; name: string; city: string }>;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  // Form states
  const [medicineId, setMedicineId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [category, setCategory] = useState("Fever & Pain Relief");
  const [subcategory, setSubcategory] = useState("Antipyretic / Analgesic");
  const [description, setDescription] = useState("");

  const [frontImageUrl, setFrontImageUrl] = useState("");
  const [frontImageAlt, setFrontImageAlt] = useState("");
  const [backImageUrl, setBackImageUrl] = useState("");
  const [backImageAlt, setBackImageAlt] = useState("");

  const [dosageForm, setDosageForm] = useState("Tablet");
  const [strength, setStrength] = useState("500 mg");
  const [packSize, setPackSize] = useState("10 Tablets");
  const [manufacturer, setManufacturer] = useState("Example Pharma Ltd");

  const [mrp, setMrp] = useState<number>(25.0);
  const [sellingPrice, setSellingPrice] = useState<number>(22.0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(12);

  const [quantity, setQuantity] = useState<number>(150);
  const [unit, setUnit] = useState("strips");
  const [batchNumber, setBatchNumber] = useState("BATCH-PAR-2026-01");
  const [expiryDate, setExpiryDate] = useState("2028-01-31");
  const [manufacturingDate, setManufacturingDate] = useState("2026-01-01");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(20);

  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [temperature, setTemperature] = useState("Room Temperature");
  const [storageInstructions, setStorageInstructions] = useState(
    "Store in a cool, dry place away from direct sunlight."
  );

  const [status, setStatus] = useState<string>("active");
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>("PHARM-000123");

  // Sync initialData when opening in edit mode
  useMemo(() => {
    if (initialData) {
      setMedicineId(initialData.medicineId || "");
      setMedicineName(initialData.medicineName || "");
      setBrandName(initialData.brandName || "");
      setGenericName(initialData.genericName || "");
      setCategory(initialData.category || "Fever & Pain Relief");
      setSubcategory(initialData.subcategory || "");
      setDescription(initialData.description || "");

      const fImg = initialData.images?.find((im) => im.type === "front") || initialData.images?.[0];
      const bImg = initialData.images?.find((im) => im.type === "back");
      setFrontImageUrl(fImg?.url || "");
      setFrontImageAlt(fImg?.alt || "");
      setBackImageUrl(bImg?.url || "");
      setBackImageAlt(bImg?.alt || "");

      setDosageForm(initialData.dosageForm || "Tablet");
      setStrength(initialData.strength || "");
      setPackSize(initialData.packSize || "10 Tablets");
      setManufacturer(initialData.manufacturer || "");

      const pMrp = initialData.pricing?.mrp ?? initialData.mrp ?? 25;
      const pSp = initialData.pricing?.sellingPrice ?? initialData.sellingPrice ?? 22;
      setMrp(pMrp);
      setSellingPrice(pSp);
      setDiscountPercentage(initialData.pricing?.discountPercentage ?? (pMrp > 0 ? Math.round(((pMrp - pSp) / pMrp) * 100) : 0));

      setQuantity(initialData.inventory?.quantity ?? initialData.stock ?? 100);
      setUnit(initialData.inventory?.unit || "strips");
      setBatchNumber(initialData.inventory?.batchNumber || initialData.batchNo || "BATCH-001");
      setExpiryDate(
        initialData.inventory?.expiryDate
          ? new Date(initialData.inventory.expiryDate).toISOString().slice(0, 10)
          : "2028-01-31"
      );
      setManufacturingDate(
        initialData.inventory?.manufacturingDate
          ? new Date(initialData.inventory.manufacturingDate).toISOString().slice(0, 10)
          : "2026-01-01"
      );
      setLowStockThreshold(initialData.inventory?.lowStockThreshold || 20);

      setPrescriptionRequired(!!initialData.prescriptionRequired);
      setTemperature(initialData.storage?.temperature || "Room Temperature");
      setStorageInstructions(initialData.storage?.storageInstructions || "Store in cool, dry place.");
      setStatus(initialData.status || "active");
      setSelectedPharmacyId(initialData.pharmacy?.pharmacyId || "PHARM-000123");
    } else {
      // Reset to standard Crocin 500 template for quick testing
      setMedicineId("MED-000001");
      setMedicineName("Paracetamol 500mg");
      setBrandName("Crocin 500");
      setGenericName("Paracetamol");
      setCategory("Fever & Pain Relief");
      setSubcategory("Antipyretic / Analgesic");
      setDescription("Used for temporary relief of fever and mild to moderate pain.");
      setFrontImageUrl("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop");
      setFrontImageAlt("Crocin 500 Paracetamol tablets front view");
      setBackImageUrl("https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&auto=format&fit=crop");
      setBackImageAlt("Crocin 500 Paracetamol tablets back view");
      setDosageForm("Tablet");
      setStrength("500 mg");
      setPackSize("10 Tablets");
      setManufacturer("Example Pharma Ltd");
      setMrp(25.0);
      setSellingPrice(22.0);
      setDiscountPercentage(12);
      setQuantity(150);
      setUnit("strips");
      setBatchNumber("BATCH-PAR-2026-01");
      setExpiryDate("2028-01-31");
      setManufacturingDate("2026-01-01");
      setLowStockThreshold(20);
      setPrescriptionRequired(false);
      setTemperature("Room Temperature");
      setStorageInstructions("Store in a cool, dry place away from direct sunlight.");
      setStatus("active");
    }
  }, [initialData, isOpen]);

  const handleMrpChange = (val: number) => {
    setMrp(val);
    if (val > 0 && sellingPrice <= val) {
      setDiscountPercentage(Math.round(((val - sellingPrice) / val) * 100));
    }
  };

  const handleSpChange = (val: number) => {
    setSellingPrice(val);
    if (mrp > 0 && val <= mrp) {
      setDiscountPercentage(Math.round(((mrp - val) / mrp) * 100));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      toast.error("Medicine Name is required");
      return;
    }
    if (!manufacturer.trim()) {
      toast.error("Manufacturer is required");
      return;
    }

    setLoading(true);
    try {
      const images: any[] = [];
      if (frontImageUrl.trim()) {
        images.push({
          url: frontImageUrl.trim(),
          type: "front",
          alt: frontImageAlt.trim() || `${medicineName} front view`,
        });
      }
      if (backImageUrl.trim()) {
        images.push({
          url: backImageUrl.trim(),
          type: "back",
          alt: backImageAlt.trim() || `${medicineName} back view`,
        });
      }

      const payload = {
        medicineId: medicineId.trim() || undefined,
        medicineName: medicineName.trim(),
        brandName: brandName.trim() || medicineName.trim(),
        genericName: genericName.trim() || null,
        category: category.trim(),
        subcategory: subcategory.trim(),
        description: description.trim(),
        images,
        dosageForm,
        strength: strength.trim() || null,
        packSize: packSize.trim() || "10 Tablets",
        manufacturer: manufacturer.trim(),
        pricing: {
          mrp: Number(mrp),
          sellingPrice: Number(sellingPrice),
          discountPercentage: Number(discountPercentage),
        },
        inventory: {
          quantity: Number(quantity),
          unit,
          batchNumber: batchNumber.trim() || "BATCH-001",
          expiryDate,
          manufacturingDate: manufacturingDate || undefined,
          lowStockThreshold: Number(lowStockThreshold),
        },
        prescriptionRequired,
        storage: {
          temperature,
          storageInstructions: storageInstructions.trim(),
        },
        status,
        pharmacy: {
          pharmacyId: selectedPharmacyId,
        },
      };

      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Boxes className="h-5 w-5 text-primary" />
            {initialData ? "Edit Medicine Parameters" : "Add New Medicine to Inventory"}
          </DialogTitle>
          <DialogDescription>
            Configure full medicine identification, classification, pricing, batch inventory, and storage requirements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* 1. Identification */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-line">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span>1. Basic Identification</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink">Medicine ID (SKU)</label>
                <Input
                  value={medicineId}
                  onChange={(e) => setMedicineId(e.target.value)}
                  placeholder="e.g. MED-000001"
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink">Medicine Name *</label>
                <Input
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink">Brand Name</label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Crocin 500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink">Generic / Active Ingredient</label>
                <Input
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g. Paracetamol"
                />
              </div>
            </div>
          </div>

          {/* 2. Classification & Specs */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-line">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              2. Classification & Specs
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink">Category *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "all").map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Subcategory</label>
                <Input
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Antipyretic / Analgesic"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Dosage Form</label>
                <Select value={dosageForm} onValueChange={setDosageForm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOSAGE_FORMS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Strength</label>
                <Input
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="e.g. 500 mg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Pack Size</label>
                <Input
                  value={packSize}
                  onChange={(e) => setPackSize(e.target.value)}
                  placeholder="e.g. 10 Tablets"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Manufacturer *</label>
                <Input
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. Example Pharma Ltd"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink">Description & Indications</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Used for temporary relief of fever and mild to moderate pain."
              />
            </div>
          </div>

          {/* 3. Pricing & Discounts */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-line">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              3. Pricing & Margins
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink">MRP (₹) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={mrp}
                  onChange={(e) => handleMrpChange(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink">Selling Price (₹) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => handleSpChange(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink">Discount %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* 4. Inventory, Batching & Expiry */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-line">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              4. Inventory & Batching
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink">Initial Quantity *</label>
                <Input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Stock Unit</label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Low Stock Alert Threshold</label>
                <Input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Batch Number *</label>
                <Input
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. BATCH-PAR-2026-01"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Expiry Date *</label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Manufacturing Date</label>
                <Input
                  type="date"
                  value={manufacturingDate}
                  onChange={(e) => setManufacturingDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 5. Storage & Compliance */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-line">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              5. Storage & Compliance
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink">Temperature Requirements</label>
                <Select value={temperature} onValueChange={setTemperature}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPERATURE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Prescription Status</label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="rx"
                      checked={!prescriptionRequired}
                      onChange={() => setPrescriptionRequired(false)}
                    />
                    <span>OTC (Over The Counter)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer font-semibold text-info">
                    <input
                      type="radio"
                      name="rx"
                      checked={prescriptionRequired}
                      onChange={() => setPrescriptionRequired(true)}
                    />
                    <span>Rx (Prescription Required)</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-ink">Storage Instructions</label>
                <Input
                  value={storageInstructions}
                  onChange={(e) => setStorageInstructions(e.target.value)}
                  placeholder="e.g. Store in a cool, dry place away from direct sunlight."
                />
              </div>
            </div>
          </div>

          {/* 6. Image URLs */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-line">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              6. Packaging Images
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Front Image URL</label>
                <Input
                  value={frontImageUrl}
                  onChange={(e) => setFrontImageUrl(e.target.value)}
                  placeholder="https://example.com/images/crocin-front.jpg"
                />
                <Input
                  value={frontImageAlt}
                  onChange={(e) => setFrontImageAlt(e.target.value)}
                  placeholder="Alt text for front view"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Back Image URL</label>
                <Input
                  value={backImageUrl}
                  onChange={(e) => setBackImageUrl(e.target.value)}
                  placeholder="https://example.com/images/crocin-back.jpg"
                />
                <Input
                  value={backImageAlt}
                  onChange={(e) => setBackImageAlt(e.target.value)}
                  placeholder="Alt text for back view"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* 7. Status & Linked Pharmacy */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-line">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              7. Status & Partner Assignment
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ink">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Available for order)</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft / Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink">Assign to Pharmacy Partner</label>
                <Select value={selectedPharmacyId} onValueChange={setSelectedPharmacyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Pharmacy Partner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PHARM-000123">Master Global Catalog (All Stores)</SelectItem>
                    {pharmacies.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-card/95 backdrop-blur pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary">
              {loading ? "Saving..." : initialData ? "Update Medicine SKU" : "Save to Inventory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
