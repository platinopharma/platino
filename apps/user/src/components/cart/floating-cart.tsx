'use client';
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart, useUI } from "@/stores";
import { usePathname } from "next/navigation";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/utils";

export function FloatingCart() {
  const setCartOpen = useUI((s) => s.setCartOpen);
  const count = useCart((s) => s.count());
  const pathname = usePathname() || "";
  const isHydrated = useHydrated();

  // Hide during server SSR hydration or on cart/checkout pages to prevent hydration mismatches and clutter
  if (!isHydrated || pathname.startsWith("/cart") || pathname.startsWith("/checkout") || count === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart, ${count} items`}
          className={cn(
            "fixed bottom-24 right-4 z-30 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-primary-foreground shadow-elevated md:bottom-6 md:right-6",
            pathname.startsWith("/pharmacy") && "lg:hidden"
          )}
        >
          <ShoppingBag className="h-5 w-5" />
        <span className="text-sm font-medium">{count} in cart</span>
      </motion.button>
    </AnimatePresence>
  );
}
