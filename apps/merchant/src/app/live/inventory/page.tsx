"use client";
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Edit3,
  Loader2,
  X,
  Sparkles,
  Pill,
  ArrowRight,
  Boxes,
  Lock,
} from "lucide-react";
import {
  Btn,
  Card,
  Confirm,
  IconBtn,
  PageHeader,
  SlideOver,
  StatCard,
  downloadCSV,
  toast,
} from "@/features/live/ui";
import { money, type Medicine } from "@/features/live/data";
import {
  useInventory,
  useAddMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
  useMasterCatalog,
} from "@/hooks/usePharmacyQueries";

const PAGE = 12;

export default function InventoryPage() {
  const { data: rawItems = [], isLoading } = useInventory();
  const items = Array.isArray(rawItems) ? rawItems : [];

  const addMut = useAddMedicineMutation();
  const updateMut = useUpdateMedicineMutation();
  const deleteMut = useDeleteMedicineMutation();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [masterCatalogOpen, setMasterCatalogOpen] = useState(false);
  const [masterSearch, setMasterSearch] = useState("");
  const [masterCategory, setMasterCategory] = useState("all");
  const [selectedMaster, setSelectedMaster] = useState<any | null>(null);
  const [stockAdjustItem, setStockAdjustItem] = useState<Medicine | null>(null);
  const [confirmDel, setConfirmDel] = useState<Medicine | null>(null);

  const { data: masterData, isLoading: isMasterLoading } = useMasterCatalog(
    masterSearch,
    masterCategory
  );
  const masterList = masterData?.catalog || [];

  const categories = useMemo(
    () => Array.from(new Set(items.map((m) => m.category))),
    [items]
  );
  const rows = useMemo(() => {
    return items.filter(
      (m) =>
        !m.archived &&
        (cat === "all" || m.category === cat) &&
        (!q ||
          m.name.toLowerCase().includes(q.toLowerCase()) ||
          m.brand.toLowerCase().includes(q.toLowerCase()) ||
          m.batch.toLowerCase().includes(q.toLowerCase()))
    );
  }, [q, cat, items]);

  const paged = rows.slice(page * PAGE, page * PAGE + PAGE);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE));

  const active = items.filter((m) => !m.archived);
  const total = active.length;
  const low = active.filter((m) => m.qty > 0 && m.qty < m.minStock).length;
  const out = active.filter((m) => m.qty === 0).length;
  const expiring = active.filter(
    (m) => m.expiry.startsWith("2026-0") || m.expiry.startsWith("2026-1")
  ).length;

  const handleStockInSubmit = async (stockInData: Record<string, unknown>) => {
    try {
      await addMut.mutateAsync(stockInData);
      toast(`Stock-in completed for ${selectedMaster?.medicineName || "medicine"}`);
      setSelectedMaster(null);
    } catch (err: any) {
      toast(err?.response?.data?.message || "Failed to complete stock-in", "error");
    }
  };

  const handleStockAdjustSubmit = async (stock: number, minStock: number, batchNumber?: string) => {
    if (!stockAdjustItem) return;
    try {
      await updateMut.mutateAsync({
        id: stockAdjustItem.id,
        data: { stock, minimumStock: minStock, batchNumber },
      });
      toast(`Stock updated for ${stockAdjustItem.name}`);
      setStockAdjustItem(null);
    } catch (err: any) {
      toast(err?.response?.data?.message || "Failed to update stock", "error");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast("Medicine removed from inventory", "warn");
    } catch (err: any) {
      toast(err?.response?.data?.message || "Failed to remove medicine", "error");
    }
  };

  const exportCSV = () => {
    downloadCSV("inventory.csv", [
      [
        "ID",
        "Name",
        "Brand",
        "Manufacturer",
        "Category",
        "Batch",
        "Expiry",
        "MRP",
        "Selling Price",
        "Qty",
        "MinStock",
        "Rx",
      ],
      ...active.map((m) => [
        m.id,
        m.name,
        m.brand,
        m.manufacturer,
        m.category,
        m.batch,
        m.expiry,
        m.mrp,
        m.price,
        m.qty,
        m.minStock,
        m.rx ? "yes" : "no",
      ]),
    ]);
    toast("Exported inventory.csv");
  };

  const handleSelectMaster = (masterItem: any) => {
    setSelectedMaster(masterItem);
    setMasterCatalogOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Catalogue & Stock-In"
        title="Medicine Inventory"
        description="Manage stock quantities, batches and expiry. Central Medicine Catalog pricing & drug details are controlled by Admin."
        actions={
          <div className="flex items-center gap-2">
            <Btn variant="outline" size="sm" onClick={exportCSV}>
              <Download className="size-3.5" /> Export CSV
            </Btn>
            <Btn
              size="sm"
              onClick={() => setMasterCatalogOpen(true)}
              className="bg-brand text-white hover:bg-brand/90"
            >
              <Sparkles className="size-3.5" /> Stock-in from Master Catalog
            </Btn>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Total medicines"
          value={total.toString()}
          delta="across store inventory"
        />
        <StatCard
          label="Low stock"
          value={low.toString().padStart(2, "0")}
          delta="below reorder threshold"
          tone="alert"
        />
        <StatCard
          label="Out of stock"
          value={out.toString().padStart(2, "0")}
          delta="unavailable for order"
          tone="warn"
        />
        <StatCard
          label="Expiring ≤ 90d"
          value={expiring.toString().padStart(2, "0")}
          delta="review batch expiry"
          tone="warn"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[240px] items-center gap-2 rounded-md border border-line bg-paper px-2.5 py-2 text-[12px] focus-within:border-brand">
          <Search className="size-3.5 text-ink-subtle" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search name, brand, batch..."
            className="flex-1 bg-transparent text-ink placeholder:text-ink-subtle focus:outline-none"
          />
        </label>
        <select
          value={cat}
          onChange={(e) => {
            setCat(e.target.value);
            setPage(0);
          }}
          className="rounded-md border border-line bg-paper px-2.5 py-2 text-[12px] text-ink"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <Card padded={false}>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-ink-subtle">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Boxes className="size-10 text-ink-subtle mx-auto mb-3" />
            <h4 className="text-base font-semibold text-ink">No medicines in store inventory yet</h4>
            <p className="text-xs text-ink-muted mt-1 max-w-md mx-auto">
              Select authorized medicines from the Admin Master Catalog to perform stock-in for your pharmacy.
            </p>
            <div className="mt-4 flex justify-center">
              <Btn size="sm" onClick={() => setMasterCatalogOpen(true)}>
                <Sparkles className="size-3.5" /> Stock-in from Master Catalog
              </Btn>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-paper-alt/60 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">
                  <tr>
                    <th className="px-4 py-2.5">Medicine</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5">Batch · Expiry</th>
                    <th className="px-3 py-2.5">MRP · Selling Price</th>
                    <th className="px-3 py-2.5">Stock</th>
                    <th className="px-3 py-2.5">Rx</th>
                    <th className="px-3 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {paged.map((m) => {
                    const isLow = m.qty > 0 && m.qty < m.minStock;
                    const isOut = m.qty === 0;

                    return (
                      <tr
                        key={m.id}
                        className="transition-colors hover:bg-hover/60"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded bg-paper-alt text-brand">
                              <Pill className="size-4" />
                            </div>
                            <div>
                              <div className="font-medium text-ink flex items-center gap-1.5">
                                {m.name}
                                <span className="text-[9px] bg-paper-alt text-ink-subtle px-1 rounded font-mono">
                                  READ-ONLY
                                </span>
                              </div>
                              <div className="text-[11px] text-ink-muted">
                                {m.brand && m.brand !== m.name && `${m.brand} · `}
                                {m.manufacturer}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded bg-paper-alt px-1.5 py-0.5 text-[11px] font-medium text-ink-muted">
                            {m.category}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-[11px]">
                          <div>{m.batch || "—"}</div>
                          <div className="text-ink-subtle">{m.expiry || "—"}</div>
                        </td>
                        <td className="px-3 py-3 font-mono">
                          <div className="text-ink font-semibold">{money(m.price)}</div>
                          {m.mrp > m.price && (
                            <div className="text-[10px] text-ink-subtle line-through">
                              {money(m.mrp)}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`font-semibold ${
                              isOut
                                ? "text-alert"
                                : isLow
                                ? "text-warn"
                                : "text-ink"
                            }`}
                          >
                            {m.qty}
                          </span>
                          <span className="text-[10px] text-ink-subtle ml-1">
                            (min {m.minStock})
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {m.rx ? (
                            <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-bold text-info">
                              Rx
                            </span>
                          ) : (
                            <span className="text-[11px] text-ink-subtle">OTC</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconBtn
                              title="Adjust Stock & Min Threshold"
                              onClick={() => setStockAdjustItem(m)}
                            >
                              <Edit3 className="size-3.5" />
                            </IconBtn>
                            <IconBtn
                              title="Delete from Inventory"
                              tone="alert"
                              onClick={() => setConfirmDel(m)}
                            >
                              <Trash2 className="size-3.5" />
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[11px] text-ink-muted">
              <div>
                Showing {paged.length} of {rows.length}
              </div>
              <div className="flex items-center gap-1">
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Prev
                </Btn>
                <span className="px-2 font-mono">
                  {page + 1} / {totalPages}
                </span>
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Btn>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* SlideOver for Stock-In from Master Catalog */}
      <SlideOver
        open={!!selectedMaster}
        onClose={() => setSelectedMaster(null)}
        title="Stock-In from Central Master Catalog"
        width="max-w-lg"
      >
        {selectedMaster && (
          <StockInForm
            masterItem={selectedMaster}
            onSubmit={handleStockInSubmit}
            onCancel={() => setSelectedMaster(null)}
            isPending={addMut.isPending}
          />
        )}
      </SlideOver>

      {/* SlideOver for Stock Adjustment */}
      <SlideOver
        open={!!stockAdjustItem}
        onClose={() => setStockAdjustItem(null)}
        title="Adjust Inventory Stock"
        width="max-w-md"
      >
        {stockAdjustItem && (
          <StockAdjustForm
            item={stockAdjustItem}
            onSubmit={handleStockAdjustSubmit}
            onCancel={() => setStockAdjustItem(null)}
            isPending={updateMut.isPending}
          />
        )}
      </SlideOver>

      {/* Master Catalog Selection Modal */}
      {masterCatalogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-paper rounded-xl border border-line shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line p-4 bg-paper-alt/30">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-brand" />
                  <h3 className="font-semibold text-ink text-base">
                    Select Medicine from Master Catalog
                  </h3>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  Verified central medicine catalog created and maintained by Platino Admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMasterCatalogOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-hover hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-3 border-b border-line bg-paper flex gap-2">
              <label className="flex flex-1 items-center gap-2 rounded-md border border-line bg-paper-alt px-3 py-1.5 text-xs">
                <Search className="size-3.5 text-ink-subtle" />
                <input
                  value={masterSearch}
                  onChange={(e) => setMasterSearch(e.target.value)}
                  placeholder="Search Paracetamol, Crocin, Amoxicillin, brand or generic..."
                  className="flex-1 bg-transparent text-ink placeholder:text-ink-subtle focus:outline-none"
                  autoFocus
                />
              </label>
              <select
                value={masterCategory}
                onChange={(e) => setMasterCategory(e.target.value)}
                className="rounded-md border border-line bg-paper-alt px-2.5 py-1.5 text-xs text-ink"
              >
                <option value="all">All Categories</option>
                <option value="Fever & Pain Relief">Fever & Pain Relief</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Cardiac">Cardiac</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Vitamins & Supplements">Vitamins</option>
                <option value="Respiratory">Respiratory</option>
              </select>
            </div>

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto p-3 divide-y divide-line">
              {isMasterLoading ? (
                <div className="flex h-40 items-center justify-center text-ink-subtle">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : masterList.length === 0 ? (
                <div className="py-12 text-center text-ink-muted text-xs">
                  No medicines found in master catalog matching "{masterSearch}".
                </div>
              ) : (
                (masterList as any[]).map((m: any) => (
                  <div
                    key={m.id || m._id || m.medicineId}
                    className="flex items-center justify-between py-3 hover:bg-paper-alt/40 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                      <div className="grid h-10 w-10 place-items-center rounded-md bg-paper-alt text-brand shrink-0">
                        <Pill className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink text-xs truncate">
                            {m.medicineName}
                          </span>
                          <span className="font-mono text-[10px] bg-brand/10 text-brand px-1.5 py-0.2 rounded">
                            {m.medicineId}
                          </span>
                          {m.prescriptionRequired && (
                            <span className="text-[9px] bg-info/10 text-info px-1 py-0.2 rounded font-bold">
                              Rx
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-ink-muted mt-0.5">
                          {m.brandName && `${m.brandName} • `}
                          {m.genericName && `${m.genericName} • `}
                          {m.dosageForm} {m.strength && `(${m.strength})`} • {m.packSize}
                        </div>
                        <div className="text-[10px] text-ink-subtle mt-0.5">
                          Mfr: {m.manufacturer} | Admin Selling Price: <span className="font-semibold text-ink">{money(m.sellingPrice || m.mrp)}</span> (MRP {money(m.mrp)})
                        </div>
                      </div>
                    </div>

                    <Btn
                      size="sm"
                      onClick={() => handleSelectMaster(m)}
                      className="shrink-0 gap-1 text-xs"
                    >
                      Stock-In <ArrowRight className="size-3" />
                    </Btn>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-line bg-paper-alt/20 flex justify-end">
              <Btn variant="ghost" size="sm" onClick={() => setMasterCatalogOpen(false)}>
                Close
              </Btn>
            </div>
          </div>
        </div>
      )}

      <Confirm
        open={!!confirmDel}
        title="Remove medicine from inventory?"
        message={`This will remove ${confirmDel?.name} from your active store inventory.`}
        confirmLabel="Remove"
        tone="alert"
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => {
          if (confirmDel) {
            remove(confirmDel.id);
          }
          setConfirmDel(null);
        }}
      />
    </div>
  );
}

function StockInForm({
  masterItem,
  onSubmit,
  onCancel,
  isPending,
}: {
  masterItem: any;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [batchNumber, setBatchNumber] = useState(`BATCH-${Date.now().toString().slice(-6)}`);
  const [quantity, setQuantity] = useState("100");
  const [expiryDate, setExpiryDate] = useState("2028-12-31");
  const [manufacturingDate, setManufacturingDate] = useState("2025-01-01");
  const [minimumStock, setMinimumStock] = useState("10");
  const [reason, setReason] = useState("Stock-In from Master Catalog");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber.trim()) {
      toast("Batch number is required", "warn");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      toast("Quantity must be greater than zero", "warn");
      return;
    }
    if (!expiryDate) {
      toast("Expiry date is required", "warn");
      return;
    }

    onSubmit({
      centralMedicineId: masterItem._id || masterItem.id,
      batchNumber: batchNumber.trim(),
      quantity: Number(quantity),
      expiryDate,
      manufacturingDate: manufacturingDate || undefined,
      minimumStock: Number(minimumStock) || 5,
      reason: reason.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Read-Only Central Medicine Header */}
      <div className="rounded-lg border border-brand/20 bg-brand/5 p-3.5 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-brand text-sm">{masterItem.medicineName}</span>
          <span className="font-mono text-[10px] bg-brand/20 text-brand px-2 py-0.5 rounded font-bold">
            {masterItem.medicineId || "CENTRAL-MED"}
          </span>
        </div>
        <div className="text-ink-muted">
          {masterItem.brandName && `Brand: ${masterItem.brandName} • `}
          {masterItem.genericName && `Generic: ${masterItem.genericName} • `}
          {masterItem.manufacturer}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-brand/10 text-ink font-mono">
          <span>Admin MRP: {money(masterItem.mrp)}</span>
          <span className="font-bold text-brand">Selling Price: {money(masterItem.sellingPrice || masterItem.mrp)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-ink-subtle pt-1">
          <Lock className="size-3 text-brand" />
          <span>Medicine identity & pricing are set by Central Admin and read-only.</span>
        </div>
      </div>

      {/* Stock-In Inputs */}
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-ink-subtle mb-1">
            Batch Number *
          </label>
          <input
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="e.g. BATCH-PAR-2026-01"
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-ink-subtle mb-1">
              Quantity (Units) *
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-ink-subtle mb-1">
              Minimum Stock Alert
            </label>
            <input
              type="number"
              min="0"
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-ink-subtle mb-1">
              Expiry Date *
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-ink-subtle mb-1">
              Mfg Date (Optional)
            </label>
            <input
              type="date"
              value={manufacturingDate}
              onChange={(e) => setManufacturingDate(e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-ink-subtle mb-1">
            Reason / Remarks
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Stock-In from Master Catalog"
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-line">
        <Btn type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Btn>
        <Btn type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Complete Stock-In"}
        </Btn>
      </div>
    </form>
  );
}

function StockAdjustForm({
  item,
  onSubmit,
  onCancel,
  isPending,
}: {
  item: Medicine;
  onSubmit: (stock: number, minStock: number, batchNumber?: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [stock, setStock] = useState(item.qty?.toString() || (item as any).stock?.toString() || "0");
  const [minStock, setMinStock] = useState(item.minStock?.toString() || "10");
  const [batch, setBatch] = useState(item.batch || "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(Number(stock) || 0, Number(minStock) || 0, batch.trim() || undefined);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg border border-line bg-paper-alt/40 p-3 text-xs space-y-1">
        <div className="font-semibold text-ink">{item.name}</div>
        <div className="text-ink-muted">
          {item.brand && `${item.brand} • `}{item.manufacturer}
        </div>
        <div className="font-mono text-ink text-[11px] pt-1">
          Admin Price: {money(item.price)} (MRP {money(item.mrp)})
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-ink-subtle mb-1">
            Total Stock Quantity
          </label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-ink-subtle mb-1">
            Minimum Stock Threshold
          </label>
          <input
            type="number"
            min="0"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-ink-subtle mb-1">
            Batch Number
          </label>
          <input
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-line">
        <Btn type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Btn>
        <Btn type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Save Adjustment"}
        </Btn>
      </div>
    </form>
  );
}
