import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Order } from "@/lib/types";
import { analytics } from "@/lib/analytics";

interface CartState {
  lines: CartLine[];
  add: (
    productId: string,
    pharmacyId: string,
    qty?: number,
    maxStock?: number,
    unitType?: "strip" | "tablet",
    unitsPerStrip?: number,
    unitPrice?: number
  ) => void;
  remove: (productId: string, pharmacyId: string, unitType?: "strip" | "tablet") => void;
  setQty: (
    productId: string,
    pharmacyId: string,
    qty: number,
    maxStock?: number,
    unitType?: "strip" | "tablet"
  ) => void;
  clear: () => void;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (productId, pharmacyId, rawQty = 1, maxStock, unitType = "strip", unitsPerStrip = 10, unitPrice) => {
        let qty = Math.max(1, Math.floor(rawQty)); // Sanitize decimals/negatives
        analytics.track("add_to_cart", { productId, pharmacyId, qty, unitType });
        set((s) => {
          const uType = unitType || "strip";
          const existing = s.lines.find(
            (l) =>
              l.productId === productId &&
              l.pharmacyId === pharmacyId &&
              (l.unitType || "strip") === uType
          );
          if (existing) {
            const nextQty = existing.quantity + qty;
            const finalQty = maxStock !== undefined ? Math.min(nextQty, maxStock) : nextQty;
            return {
              lines: s.lines.map((l) =>
                l === existing ? { ...l, quantity: finalQty } : l
              ),
            };
          }
          const finalQty = maxStock !== undefined ? Math.min(qty, maxStock) : qty;
          return {
            lines: [
              ...s.lines,
              {
                productId,
                pharmacyId,
                quantity: finalQty,
                unitType: uType,
                unitsPerStrip,
                unitPrice,
              },
            ],
          };
        });
      },
      remove: (productId, pharmacyId, unitType) => {
        analytics.track("remove_from_cart", { productId, pharmacyId, unitType });
        set((s) => ({
          lines: s.lines.filter(
            (l) =>
              !(
                l.productId === productId &&
                l.pharmacyId === pharmacyId &&
                (!unitType || (l.unitType || "strip") === unitType)
              )
          ),
        }));
      },
      setQty: (productId, pharmacyId, rawQty, maxStock, unitType = "strip") => {
        const qty = Math.floor(rawQty);
        const uType = unitType || "strip";
        if (qty <= 0) {
          get().remove(productId, pharmacyId, uType);
          return;
        }
        const finalQty = maxStock !== undefined ? Math.min(qty, maxStock) : qty;
        set((s) => ({
          lines: s.lines.map((l) =>
            l.productId === productId &&
            l.pharmacyId === pharmacyId &&
            (l.unitType || "strip") === uType
              ? { ...l, quantity: finalQty }
              : l
          ),
        }));
      },
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
    }),
    { name: "platino-cart" }
  )
);

export function getCartCatalogKey(lines: CartLine[]): [string, string] {
  return ["cart-catalog", lines.map((l) => `${l.productId}:${l.pharmacyId}`).sort().join(",")];
}

interface WishlistState {
  productIds: string[];
  pharmacyIds: string[];
  toggleProduct: (id: string) => void;
  togglePharmacy: (id: string) => void;
  hasProduct: (id: string) => boolean;
  hasPharmacy: (id: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      pharmacyIds: [],
      toggleProduct: (id) =>
        set((s) => {
          const added = !s.productIds.includes(id);
          analytics.track("wishlist_toggle", { kind: "product", id, added });
          return {
            productIds: added ? [...s.productIds, id] : s.productIds.filter((x) => x !== id),
          };
        }),
      togglePharmacy: (id) =>
        set((s) => {
          const added = !s.pharmacyIds.includes(id);
          analytics.track("wishlist_toggle", { kind: "pharmacy", id, added });
          return {
            pharmacyIds: added ? [...s.pharmacyIds, id] : s.pharmacyIds.filter((x) => x !== id),
          };
        }),
      hasProduct: (id) => get().productIds.includes(id),
      hasPharmacy: (id) => get().pharmacyIds.includes(id),
    }),
    { name: "platino-wishlist" },
  ),
);

export type DetectStatus = "idle" | "detecting" | "granted" | "denied" | "unavailable" | "error";

interface LocationState {
  areaId: string;
  setArea: (id: string) => void;
  coords: { lat: number; lng: number; accuracy?: number; at: number } | null;
  setCoords: (c: { lat: number; lng: number; accuracy?: number } | null) => void;
  radiusKm: number;
  setRadius: (km: number) => void;
  detectStatus: DetectStatus;
  setDetectStatus: (s: DetectStatus) => void;
  promptDismissed: boolean;
  dismissPrompt: () => void;
}

export const useLocation = create<LocationState>()(
  persist(
    (set) => ({
      areaId: "madhapur",
      setArea: (id) => set({ areaId: id }),
      coords: null,
      setCoords: (c) =>
        set({ coords: c ? { ...c, at: Date.now() } : null }),
      radiusKm: 10,
      setRadius: (km) => set({ radiusKm: km }),
      detectStatus: "idle",
      setDetectStatus: (s) => set({ detectStatus: s }),
      promptDismissed: false,
      dismissPrompt: () => set({ promptDismissed: true }),
    }),
    {
      name: "platino-location",
      partialize: (s) =>
        ({
          areaId: s.areaId,
          coords: s.coords,
          radiusKm: s.radiusKm,
          promptDismissed: s.promptDismissed,
        }) as Partial<LocationState>,
    },
  ),
);

interface RecentState {
  viewed: string[]; // pharmacy ids
  searchHistory: string[];
  addViewed: (id: string) => void;
  addSearch: (q: string) => void;
}

export const useRecent = create<RecentState>()(
  persist(
    (set) => ({
      viewed: [],
      searchHistory: [],
      addViewed: (id) => {
        analytics.track("pharmacy_view", { id });
        set((s) => ({ viewed: [id, ...s.viewed.filter((x) => x !== id)].slice(0, 8) }));
      },
      addSearch: (q) =>
        set((s) => {
          const t = q.trim();
          if (!t) return s;
          analytics.track("search_submit", { q: t });
          return { searchHistory: [t, ...s.searchHistory.filter((x) => x !== t)].slice(0, 8) };
        }),
    }),
    { name: "platino-recent" },
  ),
);

interface OrdersState {
  orders: Order[];
  place: (order: Order) => Promise<Order>;
  initiateOrder: (payload: Record<string, unknown>) => Promise<Order>;
  advance: (id: string) => void;
}

const STATUS_FLOW: Order["status"][] = [
  "confirmed",
  "accepted",
  "preparing",
  "packed",
  "out_for_delivery",
  "delivered",
];

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      place: async (order) => {
        // Fire to live backend API
        try {
          const { apiPost } = await import("@/lib/axios");
          const res = await apiPost<{ success?: boolean; order?: { orderNumber?: string; _id?: string; totalAmount?: number; discount?: number; deliveryFee?: number; orderStatus?: string }; razorpayOrderId?: string }>("/api/customer/v1/orders", {
            pharmacyId: order.pharmacyId,
            deliveryAddress: order.address,
            customerPhone: order.partner?.phone || "",
            paymentMethod: order.paymentMethod || "PAY_ON_DELIVERY",
            couponCode: order.couponCode,
            items: order.items.map(i => ({ medicineId: i.productId, quantity: i.quantity })),
          }, {
            headers: { 'x-idempotency-key': crypto.randomUUID() }
          });
          
          let placedOrder = order;
          if (res.success && res.order) {
            placedOrder = {
              ...order,
              id: res.order.orderNumber || res.order._id || order.id,
              total: res.order.totalAmount ?? order.total,
              discount: res.order.discount ?? order.discount,
              deliveryFee: res.order.deliveryFee ?? order.deliveryFee,
              status: res.order.orderStatus === "PLACED" ? "confirmed" : order.status,
              razorpayOrderId: res.razorpayOrderId,
            };
          }

          analytics.track("order_placed", {
            orderId: placedOrder.id,
            pharmacyId: placedOrder.pharmacyId,
            total: placedOrder.total,
            itemCount: placedOrder.items.length,
          });

          // Save to state only after backend success
          set((s) => ({ orders: [placedOrder, ...s.orders] }));
          return placedOrder;
        } catch (err) {
          console.error("Failed to place order in backend", err);
          throw err; // bubble up so the UI can prevent clearing cart
        }
      },
      initiateOrder: async (payload) => {
        try {
          const { apiPost } = await import("@/lib/axios");
          let res: any;
          try {
            res = await apiPost<{ success?: boolean; order?: { _id?: string; id?: string }; razorpayOrderId?: string; orderId?: string; status?: string }>("/api/customer/v1/orders/initiate", payload);
          } catch (initErr) {
            // Fallback to primary B2C order creation endpoint
            res = await apiPost<{ success?: boolean; order?: { _id?: string; id?: string }; razorpayOrderId?: string; orderId?: string; status?: string }>("/api/customer/v1/orders", payload);
          }

          if (res.order?.id || res.order?._id || res.orderId || res.success) {
            return { id: res.order?.id || res.order?._id || res.orderId || "unknown", status: res.status || "preparing" } as unknown as Order;
          }
          throw new Error("Order initiation failed");
        } catch (err) {
          console.error("Failed to initiate order in backend", err);
          throw err;
        }
      },
      advance: (id) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id) return o;
            const idx = STATUS_FLOW.indexOf(o.status);
            if (idx < 0 || idx >= STATUS_FLOW.length - 1) return o;
            const nextStatus = STATUS_FLOW[idx + 1];
            const decay = [0.7, 0.55, 0.35, 0.15, 0][idx] ?? 0;
            const nextEta =
              nextStatus === "delivered" ? 0 : Math.max(1, Math.round(o.etaMinutes * decay));
            analytics.track("order_status_update", { orderId: id, status: nextStatus });
            return { ...o, status: nextStatus, etaMinutes: nextEta };
          }),
        })),
    }),
    { name: "platino-orders" },
  ),
);

interface ThemeState {
  theme: "light" | "dark";
  toggle: () => void;
  set: (t: "light" | "dark") => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggle: () =>
        set((s) => {
          const next = s.theme === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next === "dark");
          }
          return { theme: next };
        }),
      set: (t) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", t === "dark");
        }
        set({ theme: t });
      },
    }),
    { name: "platino-theme" },
  ),
);

export type TextSize = "sm" | "md" | "lg" | "xl";

interface TextSizeState {
  size: TextSize;
  set: (s: TextSize) => void;
  increase: () => void;
  decrease: () => void;
}

const ORDER: TextSize[] = ["sm", "md", "lg", "xl"];

export const TEXT_SIZE_SCALE: Record<TextSize, string> = {
  sm: "93.75%",
  md: "100%",
  lg: "112.5%",
  xl: "125%",
};

export const useTextSize = create<TextSizeState>()(
  persist(
    (set, get) => ({
      size: "md",
      set: (s) => set({ size: s }),
      increase: () => {
        const i = ORDER.indexOf(get().size);
        set({ size: ORDER[Math.min(ORDER.length - 1, i + 1)] });
      },
      decrease: () => {
        const i = ORDER.indexOf(get().size);
        set({ size: ORDER[Math.max(0, i - 1)] });
      },
    }),
    { name: "platino-text-size" },
  ),
);

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  setSearchOpen: (v) => set({ searchOpen: v }),
}));
