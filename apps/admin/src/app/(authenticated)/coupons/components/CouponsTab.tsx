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

export function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minSpendAmount: "0",
    isFirstTimeOnly: false,
    expirationDate: "",
    isActive: true
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/admin/coupons');
      if (data.success) {
        setCoupons(data.coupons);
      } else {
        toast.error(data.error || "Failed to fetch coupons");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Error fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minSpendAmount: Number(formData.minSpendAmount),
        isFirstTimeOnly: Boolean(formData.isFirstTimeOnly),
        isActive: Boolean(formData.isActive)
      };

      let data;
      if (editingId) {
        data = await apiPut(`/admin/coupons/${editingId}`, payload);
      } else {
        data = await apiPost(`/admin/coupons`, payload);
      }
      
      if (data.success) {
        toast.success(`Coupon ${editingId ? 'updated' : 'created'} successfully`);
        setIsDialogOpen(false);
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to save coupon");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const data = await apiDelete(`/admin/coupons/${id}`);
      if (data.success) {
        toast.success("Coupon deleted");
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to delete coupon");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error deleting coupon");
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minSpendAmount: String(coupon.minSpendAmount || 0),
      isFirstTimeOnly: Boolean(coupon.isFirstTimeOnly),
      expirationDate: new Date(coupon.expirationDate).toISOString().split('T')[0],
      isActive: coupon.isActive
    });
    setIsDialogOpen(true);
  };

  const openCreateNew = () => {
    setEditingId(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minSpendAmount: "0",
      isFirstTimeOnly: false,
      expirationDate: "",
      isActive: true
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Discount Codes</h2>
          <p className="text-muted-foreground text-sm">Manage standard discount codes, min spends, and first-time offers.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchCoupons} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreateNew}><Plus className="w-4 h-4 mr-2" /> Add Coupon</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-[#0a0a0a] border-border/40 shadow-2xl p-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
                <DialogTitle className="font-medium text-foreground tracking-wide">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
              </div>
              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                <label className="block space-y-2">
                  <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Coupon Code</div>
                  <Input 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. SUMMER20" 
                    className="h-11 bg-background/40 border-border/40 focus-visible:ring-primary font-mono text-base"
                    required 
                  />
                </label>
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
                    <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Value</div>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.discountValue} 
                      onChange={e => setFormData({...formData, discountValue: e.target.value})}
                      placeholder="e.g. 20" 
                      className="h-11 bg-background/40 border-border/40"
                      required 
                    />
                  </label>
                </div>
                
                <label className="block space-y-2">
                  <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Min Spend Amount (₹)</div>
                  <Input 
                    type="number"
                    min="0"
                    value={formData.minSpendAmount} 
                    onChange={e => setFormData({...formData, minSpendAmount: e.target.value})}
                    placeholder="e.g. 1000" 
                    className="h-11 bg-background/40 border-border/40"
                  />
                  <p className="text-xs text-muted-foreground">0 means no minimum spend required.</p>
                </label>

                <label className="block space-y-2">
                  <div className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Expiration Date</div>
                  <Input 
                    type="date"
                    value={formData.expirationDate} 
                    onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                    className="h-11 bg-background/40 border-border/40"
                    required 
                  />
                </label>

                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-3 p-3 border border-border/40 rounded-lg bg-background/20 hover:bg-background/40 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.isFirstTimeOnly} 
                      onChange={e => setFormData({...formData, isFirstTimeOnly: e.target.checked})}
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div className="text-sm font-medium">First-Time Buyer Only</div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-border/40 rounded-lg bg-background/20 hover:bg-background/40 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive} 
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div className="text-sm font-medium">Coupon is Active</div>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingId ? 'Update' : 'Create'} Coupon</Button>
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
              <TableHead className="font-medium text-foreground/80">Code</TableHead>
              <TableHead className="font-medium text-foreground/80">Discount</TableHead>
              <TableHead className="font-medium text-foreground/80">Min Spend</TableHead>
              <TableHead className="font-medium text-foreground/80">First-Time</TableHead>
              <TableHead className="font-medium text-foreground/80">Status</TableHead>
              <TableHead className="font-medium text-foreground/80">Expires</TableHead>
              <TableHead className="text-right font-medium text-foreground/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading coupons...
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No coupons found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id} className="border-border/40">
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </TableCell>
                  <TableCell>
                    {coupon.minSpendAmount > 0 ? `₹${coupon.minSpendAmount}` : 'None'}
                  </TableCell>
                  <TableCell>
                    {coupon.isFirstTimeOnly ? (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Yes</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.isActive ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(coupon.expirationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50" onClick={() => handleEdit(coupon)}>
                      <Edit2 className="w-4 h-4 text-foreground/70" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete(coupon.id)}>
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
