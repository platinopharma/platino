'use client';
import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { api } from "@/lib/axios";

export function FlashSaleTimer({ productId }: { productId: string }) {
  const [saleEndTime, setSaleEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get('/v1/cart-evaluation');
        if (res.data?.success && res.data.flashSales) {
          const activeSales = res.data.flashSales;
          const relevantSale = activeSales.find((s: { applicableProductIds: string[]; endTime: string }) => s.applicableProductIds.includes(productId));
          if (relevantSale) {
            setSaleEndTime(new Date(relevantSale.endTime));
          }
        }
      } catch (err) {
        // fail silently
      }
    };
    fetchSales();
  }, [productId]);

  useEffect(() => {
    if (!saleEndTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = saleEndTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Sale Ended");
        clearInterval(interval);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      setTimeLeft(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [saleEndTime]);

  if (!saleEndTime || timeLeft === "Sale Ended") return null;

  return (
    <div className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-full text-sm font-medium border border-rose-500/20 mb-4 animate-pulse">
      <Timer className="w-4 h-4" />
      Ends in: <span className="font-mono">{timeLeft}</span>
    </div>
  );
}
