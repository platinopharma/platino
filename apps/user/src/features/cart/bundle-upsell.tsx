'use client';
import { useState, useEffect } from "react";
import { Plus, Gift } from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";

interface BundleUpsellProps {
  cartProductIds: string[];
  onAddProduct: (productId: string) => void;
}
interface Bundle {
  triggerProductId: string;
  rewardProductId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export function BundleUpsell({ cartProductIds, onAddProduct }: BundleUpsellProps) {
  const [upsells, setUpsells] = useState<Bundle[]>([]);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const res = await api.get('/v1/cart-evaluation');
        if (res.data?.success && res.data.bundles) {
          const activeBundles = res.data.bundles as Bundle[];
          // Find bundles where we have the trigger, but NOT the reward in the cart
          const relevant = activeBundles.filter((b: Bundle) => 
            cartProductIds.includes(b.triggerProductId) && !cartProductIds.includes(b.rewardProductId)
          );
          setUpsells(relevant);
        }
      } catch (err) {
        // fail silently
      }
    };
    fetchBundles();
  }, [cartProductIds]);

  if (upsells.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {upsells.map((bundle, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Special Offer Unlocked!</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add the reward product to get {bundle.discountType === 'percentage' ? `${bundle.discountValue}% off` : `₹${bundle.discountValue} off`} it!
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="shrink-0" onClick={() => onAddProduct(bundle.rewardProductId)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Offer
          </Button>
        </div>
      ))}
    </div>
  );
}
