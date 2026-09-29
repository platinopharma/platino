'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Truck } from "lucide-react";
import { api } from "@/lib/axios";
import { formatINR } from "@/lib/format";

export function FreeShippingBar({ currentSubtotal }: { currentSubtotal: number }) {
  const [threshold, setThreshold] = useState<number | null>(null);

  useEffect(() => {
    const fetchThreshold = async () => {
      try {
        const res = await api.get('/v1/cart-evaluation');
        if (res.data?.success && res.data.freeShippingThreshold !== null) {
          setThreshold(Number(res.data.freeShippingThreshold));
        }
      } catch (err) {
        // fail silently
      }
    };
    fetchThreshold();
  }, []);

  if (threshold === null || threshold === Infinity) return null;

  const amountRemaining = Math.max(0, threshold - currentSubtotal);
  const progress = Math.min(100, (currentSubtotal / threshold) * 100);
  const isUnlocked = currentSubtotal >= threshold;

  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck className={`w-5 h-5 ${isUnlocked ? 'text-emerald-500' : 'text-primary'}`} />
          <span className="font-medium text-sm">
            {isUnlocked 
              ? <span className="text-emerald-500">Congratulations! You've unlocked free shipping!</span>
              : <span>You are <span className="font-bold text-primary">{formatINR(amountRemaining)}</span> away from free shipping!</span>
            }
          </span>
        </div>
        {isUnlocked && (
          <div className="bg-emerald-500/20 text-emerald-500 rounded-full p-1">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>
      
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${isUnlocked ? 'bg-emerald-500' : 'bg-primary'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
