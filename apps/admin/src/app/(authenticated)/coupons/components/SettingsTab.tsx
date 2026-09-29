'use client';
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost } from "@/lib/api";

export function SettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiGet('/admin/store-settings?key=free_shipping_threshold');
        if (data.success && data.setting) {
          setFreeShippingThreshold(String(data.setting.value));
        }
      } catch (err: any) {
        toast.error("Failed to load store settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await apiPost('/admin/store-settings', {
        key: 'free_shipping_threshold',
        value: Number(freeShippingThreshold)
      });

      if (data.success) {
        toast.success("Settings saved successfully");
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-medium">Store Settings</h2>
        <p className="text-muted-foreground text-sm">Configure global promotion rules and thresholds.</p>
      </div>
      
      <div className="border border-border/40 rounded-xl bg-[#0a0a0a] p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading settings...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-foreground/80 uppercase tracking-wider">Free Shipping Threshold (₹)</label>
              <p className="text-sm text-muted-foreground mb-3">
                Orders with a subtotal equal to or above this amount will automatically qualify for free delivery.
              </p>
              <div className="flex gap-4">
                <Input 
                  type="number"
                  min="0"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  placeholder="e.g. 1000"
                  className="max-w-xs h-11 bg-background/40 border-border/40 font-mono text-base"
                />
                <Button onClick={handleSave} disabled={saving} className="h-11 px-6">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Threshold
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
