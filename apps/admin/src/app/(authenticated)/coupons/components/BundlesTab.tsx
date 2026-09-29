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

export function BundlesTab() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    triggerProductId: "",
    rewardProductId: "",
    discountType: "percentage",
    discountValue: "",
    isActive: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bundlesData, medsData] = await Promise.all([
        apiGet('/admin/bundles'),
        apiGet('/admin/medicines?limit=100') // Adjust limit as needed
      ]);
      
      if (bundlesData.success) setBundles(bundlesData.bundles);
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
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        isActive: Boolean(formData.isActive)
      };

      let data;
      if (editingId) {
        data = await apiPut(`/admin/bundles/${editingId}`, payload);
      } else {
        data = await apiPost(`/admin/bundles`, payload);
      }
      
      if (data.success) {
        toast.success(`Bundle ${editingId ? 'updated' : 'created'} successfully`);
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast.error(data.error || "Failed to save bundle");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    try {
      const data = await apiDelete(`/admin/bundles/${id}`);
      if (data.success) {
        toast.success("Bundle deleted");
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete bundle");
      }
    } catch (err: any) {
      toast.error("Error deleting bundle");
    }
  };

  const handleEdit = (bundle: any) => {
    setEditingId(bundle.id);
    setFormData({
      name: bundle.name,
      triggerProductId: bundle.triggerProductId,
      rewardProductId: bundle.rewardProductId,
      discountType: bundle.discountType,
      discountValue: String(bundle.discountValue),
      isActive: bundle.isActive
    });
    setIsDialogOpen(true);
  };

  const openCreateNew = () => {
    setEditingId(null);
    setFormData({
      name: "",
      triggerProductId: "",
      rewardProductId: "",
      discountType: "percentage",
      discountValue: "",
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const getProductName = (id: string) => {
    const med = medicines.find(m => m._id === id || m.id === id);
    return med ? med.medicineName : id;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Product Bundles (BOGO)</h2>
          <p className="text-muted-foreground text-sm">Create "Buy X, Get Y" promotional logic.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreateNew}><Plus className="w-4 h-4 mr-2" /> Add Bundle</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-[#0a0a0a] border-border/40 shadow-2xl p-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
                <DialogTitle className="font-medium text-foreground tracking-wide">{editingId ? 'Edit Bundle' : 'Create New Bundle'}</DialogTitle>
              </div>
              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                <label className="block space-y-2">
                  <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Bundle Name</div>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Buy Shampoo, Get Conditioner 50% Off" 
                    className="h-11 bg-background/40 border-border/40 focus-visible:ring-primary text-base"
                    required 
                  />
                </label>
                
                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Trigger Product (Buy this...)</div>
                  <Select 
                    value={formData.triggerProductId}
                    onValueChange={val => setFormData({...formData, triggerProductId: val})}
                    required
                  >
                    <SelectTrigger className="h-11 bg-background/40 border-border/40">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines.map(m => (
                        <SelectItem key={m._id || m.id} value={m._id || m.id}>{m.medicineName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Reward Product (...Get this)</div>
                  <Select 
                    value={formData.rewardProductId}
                    onValueChange={val => setFormData({...formData, rewardProductId: val})}
                    required
                  >
                    <SelectTrigger className="h-11 bg-background/40 border-border/40">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines.map(m => (
                        <SelectItem key={m._id || m.id} value={m._id || m.id}>{m.medicineName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="e.g. 50" 
                      className="h-11 bg-background/40 border-border/40"
                      required 
                    />
                  </label>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-3 p-3 border border-border/40 rounded-lg bg-background/20 hover:bg-background/40 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive} 
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div className="text-sm font-medium">Bundle is Active</div>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingId ? 'Update' : 'Create'} Bundle</Button>
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
              <TableHead className="font-medium text-foreground/80">Name</TableHead>
              <TableHead className="font-medium text-foreground/80">Trigger (Buy)</TableHead>
              <TableHead className="font-medium text-foreground/80">Reward (Get)</TableHead>
              <TableHead className="font-medium text-foreground/80">Discount</TableHead>
              <TableHead className="font-medium text-foreground/80">Status</TableHead>
              <TableHead className="text-right font-medium text-foreground/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading bundles...
                </TableCell>
              </TableRow>
            ) : bundles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No bundles found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              bundles.map((bundle) => (
                <TableRow key={bundle.id} className="border-border/40">
                  <TableCell className="font-medium">{bundle.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">{getProductName(bundle.triggerProductId)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">{getProductName(bundle.rewardProductId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {bundle.discountType === 'percentage' ? `${bundle.discountValue}% Off` : `₹${bundle.discountValue} Off`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bundle.isActive ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50" onClick={() => handleEdit(bundle)}>
                      <Edit2 className="w-4 h-4 text-foreground/70" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete(bundle.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
