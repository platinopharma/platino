export type PharmacyBadge =
  | "verified"
  | "licensed"
  | "prescription"
  | "free_delivery"
  | "express"
  | "24x7";

export interface Pharmacy {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  cover: string;
  logo: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  etaMinutes: number;
  isOpen: boolean;
  hours: string;
  address: string;
  area: string;
  city: string;
  license: string;
  badges: PharmacyBadge[];
  todaysOffer?: string;
  deliveryFee: number;
  minOrder: number;
  gallery: string[];
  phone: string;
  lat?: number;
  lng?: number;
}

export type ProductCategory =
  | "medicines"
  | "otc"
  | "prescription"
  | "healthcare"
  | "personal-care"
  | "baby-care"
  | "mother-care"
  | "diabetes"
  | "heart"
  | "skin"
  | "hair"
  | "ayurveda"
  | "supplements"
  | "nutrition"
  | "devices"
  | "first-aid"
  | "senior"
  | "womens"
  | "mens";

export interface Product {
  id: string;
  medicineId?: string;
  name: string;
  brandName?: string;
  genericName?: string;
  manufacturer: string;
  image: string;
  images?: string[];
  category: ProductCategory;
  dosageForm?: string; // e.g. "Tablet", "Capsule", "Syrup"
  packSize: string; // e.g. "10 Tablets"
  unitsPerStrip?: number; // e.g. 10
  stripMrp?: number;
  stripPrice?: number;
  tabletMrp?: number;
  tabletPrice?: number;
  supportsIndividualUnits?: boolean;
  mrp: number;
  price: number;
  inStock: boolean;
  stock?: number;
  prescriptionRequired: boolean;
  pharmacyId: string;
  description: string;
  composition?: string;
  uses?: string[];
  dosage?: string;
  storage?: string;
  warnings?: string[];
  tags?: ("bestseller" | "featured" | "discount" | "new")[];
}

export interface Review {
  id: string;
  pharmacyId: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  text: string;
  photos?: string[];
  verified: boolean;
  helpful: number;
  reply?: { author: string; text: string; date: string };
}

export interface CartLine {
  productId: string;
  pharmacyId: string;
  quantity: number;
  unitType?: "strip" | "tablet"; // "strip" (full pack) or "tablet" (individual loose count)
  unitsPerStrip?: number;
  unitPrice?: number;
}

export type OrderStatus =
  | "PENDING"
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "REJECTED"
  | "CANCELLED"
  | "DELIVERED"
  | "confirmed"
  | "accepted"
  | "preparing"
  | "packed"
  | "out_for_delivery"
  | "delivered";

export interface Order {
  id: string;
  createdAt: string;
  pharmacyId: string;
  items: { productId: string; quantity: number; price: number }[];
  status: OrderStatus;
  total: number;
  deliveryFee: number;
  discount?: number;
  couponCode?: string;
  paymentMethod?: string;
  etaMinutes: number;
  address: string;
  partner?: { name: string; phone: string };
  razorpayOrderId?: string;
  deliveryCategory?: 'STANDARD' | 'AIRPORT' | 'TRAIN' | 'BUS';
  beneficiary?: {
    type: 'SELF' | 'OTHER';
    recipientName: string;
    recipientPhone: string;
    alternatePhone?: string;
  };
  transitDetails?: {
    hubName: string;
    hubCode?: string;
    terminalOrPlatform?: string;
    coachOrSeatOrBay?: string;
    pnrOrFlightNo?: string;
    departureTime?: string;
  };
}

export interface CategoryDef {
  id: ProductCategory;
  name: string;
  icon: string; // lucide name
  accent: string; // token key
}

export interface AreaOption {
  id: string;
  area: string;
  city: string;
}
