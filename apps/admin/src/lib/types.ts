export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "suspended"
  | "blacklisted"
  | "docs_requested";

export type PharmacyStatus = "active" | "offline" | "pending" | "suspended";

export type OrderStatus =
  | "pending"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type Role = "Super Admin" | "Operations" | "Verification Team" | "Support Team" | "Finance";

export interface Document {
  id: string;
  type:
    | "Drug License"
    | "GST Certificate"
    | "Owner ID"
    | "Store Photos"
    | "Cancelled Cheque"
    | "Business Registration";
  url: string;
  uploadedAt: string;
  verified: boolean;
}

export interface Pharmacy {
  id: string;
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  registeredAt: string;
  verification: VerificationStatus;
  status: PharmacyStatus;
  rating: number;
  totalOrders: number;
  revenue: number;
  deliveryRadius: number;
  operatingHours: string;
  licenseNo: string;
  gstNo: string;
  documents: Document[];
  avatarColor: string;
}

export interface MedicineImage {
  url: string;
  type: string;
  alt?: string;
}

export interface AdminInventoryItem {
  id: string;
  _id?: string;
  medicineId: string;
  medicineName: string;
  name?: string;
  brandName: string;
  genericName?: string;
  category: string;
  subcategory?: string;
  description?: string;
  images: MedicineImage[];
  dosageForm: string;
  strength?: string;
  packSize: string;
  manufacturer: string;
  pricing: {
    mrp: number;
    sellingPrice: number;
    discountPercentage: number;
  };
  inventory: {
    quantity: number;
    unit: string;
    batchNumber: string;
    expiryDate: string;
    manufacturingDate?: string;
    lowStockThreshold: number;
  };
  prescriptionRequired: boolean;
  storage?: {
    temperature: string;
    storageInstructions: string;
  };
  status: "active" | "inactive" | "out_of_stock" | "draft" | "approved" | "hidden" | "flagged" | "pending";
  pharmacy?: {
    pharmacyId?: string;
    storeName?: string;
    city?: string;
  };
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
  };
  // Flat legacy aliases for compatibility
  mrp?: number;
  sellingPrice?: number;
  stock?: number;
  batchNo?: string;
  expiry?: string;
  expiryDate?: string;
}

export interface Medicine {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  batchNo: string;
  expiry: string;
  stock: number;
  mrp: number;
  sellingPrice: number;
  prescriptionRequired: boolean;
  status: "approved" | "hidden" | "flagged" | "pending" | "active" | "inactive" | "out_of_stock" | "draft";
  pharmacy: string;
}

export interface Order {
  id: string;
  customer: string;
  pharmacy: string;
  city: string;
  items: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  paymentStatus: "paid" | "pending" | "refunded";
  prescription: boolean;
  driver?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  orders: number;
  totalSpend: number;
  since: string;
  blocked: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  customer: string;
  status: "open" | "pending" | "resolved";
  priority: "low" | "medium" | "high";
  assignee: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  admin: string;
  action: string;
  target: string;
  ip: string;
  at: string;
}

export interface Activity {
  id: string;
  type: "registration" | "order" | "approval" | "system";
  text: string;
  at: string;
}
