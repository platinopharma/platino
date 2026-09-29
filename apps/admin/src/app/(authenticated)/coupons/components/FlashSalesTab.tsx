'use client';
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function FlashSalesTab() {
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    discountType: "percentage",
    discountValue: "",
    startTime: "",
    endTime: "",
    applicableProductIds: [] as string[],
    isActive: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fsData, medsData] = await Promise.all([
        apiGet('/admin/flash-sales'),
        apiGet('/admin/medicines?limit=100')
      ]);
      
      if (fsData.success) setFlashSales(fsData.flashSales);
      if (medsData.success) setMedicines(medsData.data || []);
    } catch (e: any) {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.applicableProductIds.length === 0) {
      toast.error("Please select at least one product for the flash sale");
      return;
    }

    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        isActive: Boolean(formData.isActive)
      };

      let data;
      if (editingId) {
        data = await apiPut(`/admin/flash-sales/${editingId}`, payload);
      } else {
        data = await apiPost(`/admin/flash-sales`, payload);
      }
      
      if (data.success) {
        toast.success(`Flash Sale ${editingId ? 'updated' : 'created'} successfully`);
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast.error(data.error || "Failed to save flash sale");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flash sale?")) return;
    try {
      const data = await apiDelete(`/admin/flash-sales/${id}`);
      if (data.success) {
        toast.success("Flash sale deleted");
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete flash sale");
      }
    } catch (err: any) {
      toast.error("Error deleting flash sale");
    }
  };

  const handleEdit = (fs: any) => {
    setEditingId(fs.id);
    setFormData({
      name: fs.name,
      discountType: fs.discountType,
      discountValue: String(fs.discountValue),
      startTime: new Date(fs.startTime).toISOString().slice(0, 16),
      endTime: new Date(fs.endTime).toISOString().slice(0, 16),
      applicableProductIds: fs.applicableProductIds,
      isActive: fs.isActive
    });
    setIsDialogOpen(true);
  };

  const openCreateNew = () => {
    setEditingId(null);
    setFormData({
      name: "",
      discountType: "percentage",
      discountValue: "",
      startTime: "",
      endTime: "",
      applicableProductIds: [],
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const toggleProduct = (id: string) => {
    setFormData(prev => {
      const current = prev.applicableProductIds;
      if (current.includes(id)) {
        return { ...prev, applicableProductIds: current.filter(x => x !== id) };
      }
      return { ...prev, applicableProductIds: [...current, id] };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Flash Sales</h2>
          <p className="text-muted-foreground text-sm">Schedule time-limited sales on specific products.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreateNew}><Plus className="w-4 h-4 mr-2" /> Add Flash Sale</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-[#0a0a0a] border-border/40 shadow-2xl p-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
                <DialogTitle className="font-medium text-foreground tracking-wide">{editingId ? 'Edit Flash Sale' : 'Create Flash Sale'}</DialogTitle>
              </div>
              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                <label className="block space-y-2">
                  <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Campaign Name</div>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Diwali Mega Sale" 
                    className="h-11 bg-background/40 border-border/40 focus-visible:ring-primary text-base"
                    required 
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-2">
                    <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Start Time</div>
                    <Input 
                      type="datetime-local"
                      value={formData.startTime} 
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                      className="h-11 bg-background/40 border-border/40 text-sm"
                      required 
                    />
                  </label>
                  <label className="block space-y-2">
                    <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">End Time</div>
                    <Input 
                      type="datetime-local"
                      value={formData.endTime} 
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                      className="h-11 bg-background/40 border-border/40 text-sm"
                      required 
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Discount Type</div>
                    <Select 
                      value={formData.discountType}
                      onValueChange={val => setFormData({...formData, discountType: val})}
                    >
                      <SelectTrigger className="h-11 bg-background/40 border-border/40">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="block space-y-2">
                    <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Discount Value</div>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.discountValue} 
                      onChange={e => setFormData({...formData, discountValue: e.target.value})}
                      placeholder="e.g. 15" 
                      className="h-11 bg-background/40 border-border/40"
                      required 
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Select Products</div>
                  <div className="border border-border/40 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-background/20">
                    {medicines.map(med => (
                      <label key={med._id || med.id} className="flex items-center gap-3 p-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.applicableProductIds.includes(med._id || med.id)}
                          onChange={() => toggleProduct(med._id || med.id)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                        />
                        <div className="text-sm">{med.medicineName}</div>
                      </label>
                    ))}
                    {medicines.length === 0 && <div className="text-sm text-muted-foreground p-2">Loading products...</div>}
                  </div>
                  <div className="text-xs text-muted-foreground">{formData.applicableProductIds.length} products selected</div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-3 p-3 border border-border/40 rounded-lg bg-background/20 hover:bg-background/40 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive} 
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div className="text-sm font-medium">Flash Sale is Active</div>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingId ? 'Update' : 'Create'} Sale</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border border-border/40 rounded-xl overflow-hidden bg-[#0a0a0a]">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 bg-muted/20 hover:bg-muted/20">
              <TableHead className="font-medium text-foreground/80">Campaign</TableHead>
              <TableHead className="font-medium text-foreground/80">Products</TableHead>
              <TableHead className="font-medium text-foreground/80">Discount</TableHead>
              <TableHead className="font-medium text-foreground/80">Status</TableHead>
              <TableHead className="font-medium text-foreground/80">Schedule</TableHead>
              <TableHead className="text-right font-medium text-foreground/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading flash sales...
                </TableCell>
              </TableRow>
            ) : flashSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No flash sales found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              flashSales.map((fs) => {
                const now = new Date();
                const start = new Date(fs.startTime);
                const end = new Date(fs.endTime);
                const isLive = fs.isActive && now >= start && now <= end;
                const isScheduled = fs.isActive && now < start;

                return (
                  <TableRow key={fs.id} className="border-border/40">
                    <TableCell className="font-medium">{fs.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground">
                        {fs.applicableProductIds.length} Items
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {fs.discountType === 'percentage' ? `${fs.discountValue}% Off` : `₹${fs.discountValue} Off`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isLive ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse">Live</Badge>
                      ) : isScheduled ? (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Scheduled</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20">Inactive/Expired</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div>{start.toLocaleString()} -</div>
                      <div>{end.toLocaleString()}</div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50" onClick={() => handleEdit(fs)}>
                        <Edit2 className="w-4 h-4 text-foreground/70" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete(fs.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
