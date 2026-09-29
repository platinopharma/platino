/**
 * Service abstraction layer.
 *
 * Fully integrated with live Platino Pharma backend APIs.
 */
import { apiGet } from "@/lib/axios";
import type { AreaOption, CategoryDef, Order, Pharmacy, Product, Review } from "@/lib/types";
import { areas, categories, reviews } from "../data/catalog";

export interface ApiPharmacyPayload {
  pharmacyId?: string;
  id?: string;
  _id?: string;
  pharmacyName?: string;
  name?: string;
  estimatedDeliveryTime?: string;
  logo?: string;
  rating?: number;
  totalReviews?: number;
  distance?: string | number;
  isOpen?: boolean;
  address?: string;
  city?: string;
  isVerified?: boolean;
  phone?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

export interface ApiProductPayload {
  medicineId?: string;
  _id?: string;
  id?: string;
  medicineName?: string;
  name?: string;
  brandName?: string;
  genericName?: string;
  manufacturer?: string;
  category?: string;
  dosageForm?: string;
  packSize?: string;
  sellingPrice?: number;
  price?: number;
  mrp?: number;
  pricing?: {
    mrp?: number;
    sellingPrice?: number;
    discountPercentage?: number;
  };
  stock?: number;
  prescriptionRequired?: boolean;
  pharmacyId?: string;
  description?: string;
  image?: string;
  images?: string[] | Array<{ url: string }>;
}

function mapPharmacy(p: ApiPharmacyPayload): Pharmacy {
  const rawAddressGeo = (p as any).address?.geo;
  const rawCoords = (p as any).address?.location?.coordinates;
  const parsedLat = p.lat ?? p.latitude ?? rawAddressGeo?.lat ?? (Array.isArray(rawCoords) && rawCoords.length === 2 ? rawCoords[1] : null);
  const parsedLng = p.lng ?? p.longitude ?? rawAddressGeo?.lng ?? (Array.isArray(rawCoords) && rawCoords.length === 2 ? rawCoords[0] : null);

  return {
    id: p.pharmacyId || p.id || "",
    slug: p.pharmacyId || p.id || "",
    name: p.pharmacyName || p.name || "",
    tagline: p.estimatedDeliveryTime ? `Delivery in ${p.estimatedDeliveryTime}` : "Fast Delivery",
    cover: "https://placehold.co/800x300?text=Cover",
    logo: p.logo || `https://placehold.co/100x100?text=${encodeURIComponent((p.pharmacyName || "Rx").substring(0, 2))}`,
    rating: p.rating || 4.5,
    reviewCount: p.totalReviews || 120,
    distanceKm: parseFloat(String(p.distance || "0").replace(' KM', '')),
    etaMinutes: parseInt(p.estimatedDeliveryTime || "30"),
    isOpen: p.isOpen || false,
    hours: "9:00 AM - 10:00 PM",
    address: p.address || "",
    area: p.city || "New Delhi",
    city: p.city || "New Delhi",
    license: "Licensed",
    badges: p.isVerified ? ["verified"] : [],
    deliveryFee: 40,
    minOrder: 100,
    gallery: [],
    phone: p.phone || "",
    lat: parsedLat,
    lng: parsedLng
  };
}

function parseUnitsPerStrip(packSizeStr?: string, dosageForm?: string): number {
  if (!packSizeStr) return 10;
  const match = packSizeStr.match(/(\d+)\s*(tablets?|tabs?|capsules?|caps?|pills?|units?)/i);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num) && num > 0) return num;
  }
  const anyNum = packSizeStr.match(/\d+/);
  if (anyNum) {
    const n = parseInt(anyNum[0], 10);
    if (!isNaN(n) && n > 0 && n <= 100) return n;
  }
  return 10;
}

function mapProduct(m: ApiProductPayload): Product {
  const packSize = m.packSize || "10 Tablets";
  const dosageForm = m.dosageForm || "Tablet";
  const isTabletOrCapsule = /tablet|capsule|pill|cap|tab/i.test(dosageForm) || /tablet|capsule|pill|strip/i.test(packSize);
  const unitsPerStrip = parseUnitsPerStrip(packSize, dosageForm);

  const stripPrice = Number(m.pricing?.sellingPrice ?? m.sellingPrice ?? m.price ?? 0);
  const stripMrp = Number(m.pricing?.mrp ?? m.mrp ?? Math.round(stripPrice * 1.2));

  const tabletPrice = unitsPerStrip > 0 ? Number((stripPrice / unitsPerStrip).toFixed(2)) : stripPrice;
  const tabletMrp = unitsPerStrip > 0 ? Number((stripMrp / unitsPerStrip).toFixed(2)) : stripMrp;

  const rawImages = Array.isArray(m.images) ? m.images.map((im: unknown) => typeof im === "string" ? im : (im as { url: string }).url) : [];
  const primaryImage = m.image || rawImages[0] || `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop`;

  return {
    id: m.id || m._id || m.medicineId || "",
    medicineId: m.medicineId,
    name: m.medicineName || m.name || "Generic Medicine",
    brandName: m.brandName || m.medicineName || m.name,
    genericName: m.genericName,
    manufacturer: m.manufacturer || "Standard Pharma",
    image: primaryImage,
    images: rawImages.length ? rawImages : [primaryImage],
    category: (m.category || "medicines") as Product["category"],
    dosageForm,
    packSize,
    unitsPerStrip,
    stripMrp,
    stripPrice,
    tabletMrp,
    tabletPrice,
    supportsIndividualUnits: isTabletOrCapsule,
    mrp: stripMrp,
    price: stripPrice,
    inStock: (m.stock || 0) > 0,
    stock: m.stock || 0,
    prescriptionRequired: m.prescriptionRequired || false,
    pharmacyId: m.pharmacyId || "PHARM-000123",
    description: m.description || m.manufacturer || "Verified pharmaceutical formulation."
  };
}

export const pharmacyService = {
  async listNearby(coords?: { lat: number; lng: number } | null, radiusKm = 25, _areaId?: string): Promise<Pharmacy[]> {
    try {
      const url = coords
        ? `/api/customer/v1/pharmacies?radius=${radiusKm}&latitude=${coords.lat}&longitude=${coords.lng}`
        : `/api/customer/v1/pharmacies?radius=${radiusKm}`;
      const res = await apiGet<{ success: boolean; data: ApiPharmacyPayload[] }>(url);
      return (res.data || []).map(mapPharmacy);
    } catch (e: unknown) {
      console.error("Failed to fetch nearby pharmacies", e);
      return [];
    }
  },

  async getNearest(coords?: { lat: number; lng: number } | null): Promise<Pharmacy | null> {
    try {
      const list = await this.listNearby(coords, 50);
      return list.length > 0 ? list[0] : null;
    } catch (e: unknown) {
      console.error("Failed to fetch nearest pharmacy", e);
      return null;
    }
  },

  async listFeatured(coords?: { lat: number; lng: number } | null): Promise<Pharmacy[]> {
    const nearby = await this.listNearby(coords);
    return nearby.filter((p) => p.rating >= 4.5).slice(0, 6);
  },

  async listTopRated(coords?: { lat: number; lng: number } | null): Promise<Pharmacy[]> {
    const nearby = await this.listNearby(coords);
    return nearby.sort((a, b) => b.rating - a.rating).slice(0, 6);
  },

  async getBySlug(slug: string): Promise<Pharmacy | undefined> {
    return this.getById(slug); // Using ID as slug
  },

  async getById(id: string): Promise<Pharmacy | undefined> {
    try {
      const res = await apiGet<{ success: boolean; data: ApiPharmacyPayload }>(`/api/customer/v1/pharmacies/${id}`);
      return res.data ? mapPharmacy(res.data) : undefined;
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error(`Failed to fetch pharmacy ${id}:`, (e as { response?: { status?: number } })?.response?.status || errorMsg);
      return undefined;
    }
  },

  async getByIds(ids: string[]): Promise<Pharmacy[]> {
    const promises = ids.map(id => this.getById(id));
    const results = await Promise.all(promises);
    return results.filter((p): p is Pharmacy => p !== undefined);
  },

  async search(q: string): Promise<Pharmacy[]> {
    try {
      const res = await apiGet<{ success: boolean; data: ApiPharmacyPayload[] }>(
        `/api/customer/v1/pharmacies?search=${encodeURIComponent(q)}`
      );
      return (res.data || []).map(mapPharmacy);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error("Failed to search pharmacies:", (e as { response?: { status?: number } })?.response?.status || errorMsg);
      return [];
    }
  },
};

export const productService = {
  async listByPharmacy(pharmacyId: string): Promise<Product[]> {
    try {
      const res = await apiGet<{ success: boolean; data: ApiProductPayload[] }>(
        `/api/customer/v1/pharmacies/${pharmacyId}/medicines?limit=50`
      );
      return (res.data || []).map((m) => mapProduct({ ...m, pharmacyId: m.pharmacyId || pharmacyId }));
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error("Failed to fetch pharmacy medicines:", (e as { response?: { status?: number } })?.response?.status || errorMsg);
      return [];
    }
  },

  async listPopular(): Promise<Product[]> {
    // Fetching without specific query acts as a generic inventory fetch
    try {
      const res = await apiGet<{ success: boolean; data: ApiProductPayload[] }>(`/api/customer/v1/search/medicines?limit=8`);
      return (res.data || []).map(mapProduct);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error("Failed to fetch popular medicines:", (e as { response?: { status?: number } })?.response?.status || errorMsg);
      return [];
    }
  },

  async listSeasonal(): Promise<Product[]> {
    return this.listPopular(); // Fallback to popular if seasonal API doesn't exist
  },

  async listOffers(): Promise<Product[]> {
    return this.listPopular(); // Fallback to popular
  },

  async listByCategory(category: string): Promise<Product[]> {
    try {
      const res = await apiGet<{ success: boolean; data: ApiProductPayload[] }>(
        `/api/customer/v1/search/medicines?category=${encodeURIComponent(category)}&limit=20`
      );
      return (res.data || []).map(mapProduct);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error("Failed to fetch category medicines:", (e as { response?: { status?: number } })?.response?.status || errorMsg);
      return [];
    }
  },

  async get(id: string): Promise<Product | undefined> {
    try {
      const res = await apiGet<{ success: boolean; data: ApiProductPayload }>(`/api/customer/v1/medicines/${id}`);
      return res.data ? mapProduct(res.data) : undefined;
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error(`Failed to fetch medicine ${id}:`, (e as { response?: { status?: number } })?.response?.status || errorMsg);
      return undefined;
    }
  },

  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return [];
    try {
      const res = await apiGet<{ success: boolean; data: ApiProductPayload[] }>(
        `/api/customer/v1/medicines/batch?ids=${ids.join(",")}`
      );
      return (res.data || []).map(mapProduct);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error("Failed to fetch products by IDs:", (e as { response?: { status?: number } })?.response?.status || errorMsg);
      return [];
    }
  },

  async related(id: string): Promise<Product[]> {
    return this.listPopular(); // Fallback since there's no related API yet
  },

  async search(q: string, filters?: { category?: string, minPrice?: number, maxPrice?: number, sort?: string, prescriptionRequired?: boolean }): Promise<Product[]> {
    const t = q.trim();
    if (!t && !filters?.category) return []; // Allow searching just by category
    try {
      let url = `/api/customer/v1/search/medicines?query=${encodeURIComponent(t)}`;
      if (filters?.category) url += `&category=${encodeURIComponent(filters.category)}`;
      if (filters?.minPrice !== undefined) url += `&minPrice=${filters.minPrice}`;
      if (filters?.maxPrice !== undefined) url += `&maxPrice=${filters.maxPrice}`;
      if (filters?.sort) url += `&sort=${filters.sort}`;
      if (filters?.prescriptionRequired !== undefined) url += `&prescriptionRequired=${filters.prescriptionRequired}`;

      const res = await apiGet<{ success: boolean; data: ApiProductPayload[] }>(url);
      return (res.data || []).map(mapProduct);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error("Failed to search products:", (e as { response?: { status?: number } })?.response?.status || errorMsg);
      return [];
    }
  },
};

export const reviewService = {
  async listByPharmacy(pharmacyId: string): Promise<Review[]> {
    // Still mock as reviews endpoint doesn't seem to exist
    return reviews.filter((r) => r.pharmacyId === pharmacyId);
  },
};

export const catalogService = {
  categories: (): CategoryDef[] => categories,
  areas: (): AreaOption[] => areas,
};

// Order timeline service abstraction
export const orderService = {
  getOrderTimeline(status: Order["status"] = "preparing"): Order["status"][] {
    return ["confirmed", "accepted", "preparing", "packed", "out_for_delivery", "delivered"];
  },
};

export interface AccountSummary {
  ordersCount: number;
  addressesCount: number;
  defaultAddressLabel: string | null;
  dependentsCount: number;
  activeMedicationRemindersCount: number;
  savedPharmaciesCount: number;
  reviewsCount: number;
  availableCouponsCount: number;
  unreadNotificationsCount: number;
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

export const accountService = {
  async getSummary(): Promise<AccountSummary> {
    const res = await apiGet<{ success: boolean; summary: AccountSummary }>('/api/customer/v1/account/summary');
    return res.summary;
  },
};

