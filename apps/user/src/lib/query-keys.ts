/**
 * Centralized, typed Query Key Factory for TanStack React Query across Platino Pharma frontends.
 * Prevents key collision, standardizes array structures, and enables precise domain-scoped cache invalidation.
 */

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  catalog: {
    all: ["catalog"] as const,
    product: (id: string) => ["product", id] as const,
    related: (id: string) => ["related", id] as const,
    pharmacy: (slugOrId: string) => ["pharmacy", slugOrId] as const,
    pharmacyProducts: (pharmacyId: string) => ["pharmacy-products", pharmacyId] as const,
    pharmacyReviews: (pharmacyId: string) => ["pharmacy-reviews", pharmacyId] as const,
    nearby: (areaId?: string) => ["pharmacies-nearby", areaId ?? "default"] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: () => [...queryKeys.orders.all, "list"] as const,
    detail: (id: string) => [...queryKeys.orders.all, "detail", id] as const,
  },
  wishlist: {
    products: (ids: string) => ["wish-products", ids] as const,
    pharmacies: (ids: string) => ["wish-pharms", ids] as const,
  },
  location: {
    geocode: (lat: number, lng: number) => ["geocode", lat, lng] as const,
  },
  account: {
    summary: () => ["account", "summary"] as const,
  },
};

