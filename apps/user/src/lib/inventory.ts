import type { Product } from "./types";

/**
 * Deterministic mock inventory. Real backend would query pharmacy stock.
 * Formula gives values in [3, 12] so tests can reliably trigger over-stock.
 * Products flagged inStock=false report 0.
 */
export function getStock(product: Pick<Product, "id" | "inStock">): number {
  // Test hook: window.__STOCK_OVERRIDE__ = { [productId]: number }
  if (typeof window !== "undefined") {
    const override = (window as unknown as { __STOCK_OVERRIDE__?: Record<string, number> })
      .__STOCK_OVERRIDE__;
    if (override && Object.prototype.hasOwnProperty.call(override, product.id)) {
      return Math.max(0, override[product.id]);
    }
  }
  if (!product.inStock) return 0;
  let h = 0;
  for (let i = 0; i < product.id.length; i++) {
    h = (h * 31 + product.id.charCodeAt(i)) >>> 0;
  }
  return 3 + (h % 10); // 3..12
}
