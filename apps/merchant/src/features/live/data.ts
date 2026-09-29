// Mock data for the Platino Pharma partner dashboard.
// Deterministic — no Date.now / Math.random at module scope — so SSR and
// client render match and tables don't flicker.

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "packed"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "rejected"
  | "cancelled"
  | "refund_requested";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  packed: "Packed",
  ready: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
  refund_requested: "Refund requested",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, "signal" | "brand" | "warn" | "alert" | "muted"> = {
  pending: "warn",
  accepted: "brand",
  preparing: "brand",
  packed: "brand",
  ready: "brand",
  out_for_delivery: "brand",
  delivered: "signal",
  rejected: "alert",
  cancelled: "muted",
  refund_requested: "alert",
};

export type Payment = "upi" | "card" | "cod" | "wallet";
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed";

export interface Order {
  id: string;
  createdAt: string;
  customer: { name: string; phone: string };
  address: string;
  items: { name: string; qty: number; price: number; rx: boolean }[];
  amount: number;
  payment: Payment;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  rider?: string;
  eta?: string;
  prescriptionUrl?: string;
  isEmergency?: boolean;
  emergencyNotes?: string;
  emergencyCategory?: string;
  priorityLevel?: 'NORMAL' | 'HIGH' | 'CRITICAL';
}

// Removed unused local mock data constants

function pad(n: number) { return n.toString().padStart(2, "0"); }

export const ORDERS: Order[] = [];

// -------- Inventory --------

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  generic: string;
  strength: string;
  manufacturer: string;
  category: string;
  batch: string;
  expiry: string; // YYYY-MM
  mrp: number;
  price: number;
  qty: number;
  minStock: number;
  rx: boolean;
  barcode: string;
  hidden?: boolean;
  archived?: boolean;
  images?: string[];
}

// Removed unused local mock data constants

export const INVENTORY: Medicine[] = [];

// -------- Customers derived from ORDERS --------

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  address: string;
  orders: number;
  spent: number;
  lastOrder: string;
  rxHistory: number;
  rating: number;
}

export const CUSTOMER_ROWS: CustomerRow[] = [];

// -------- Notifications --------

export type NoticeKind = "order" | "cancel" | "stock" | "expiry" | "verify" | "payment" | "system";

export interface Notice {
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  time: string;
  read?: boolean;
}

export const NOTICES: Notice[] = [];

// -------- Analytics series --------

export const REVENUE_30D = Array(30).fill(0);
export const ORDERS_30D  = Array(30).fill(0);
export const HOURLY_BARS = Array(24).fill(0);

export { money } from "@/lib/format";

// -------- Store snapshot from onboarding (client-only) --------

export interface StoreSnapshot {
  pharmacyName?: string;
  city?: string;
  opens?: string;
  closes?: string;
  radius?: number;
  minOrder?: number;
  payments?: { upi?: boolean; card?: boolean; cod?: boolean };
  email?: string;
  activatedAt?: string;
}

export function readStoreSnapshot(): StoreSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("platinopharmacy:live:v1");
    return raw ? (JSON.parse(raw) as StoreSnapshot) : null;
  } catch {
    return null;
  }
}

// -------- Prescriptions --------

export type RxStatus = "pending" | "approved" | "rejected" | "reupload";
export interface Prescription {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  uploadedAt: string;
  doctor: string;
  status: RxStatus;
  meds: string[];
  notes?: string;
}

export const PRESCRIPTIONS: Prescription[] = [];

// -------- Payments & Settlements --------

export interface Settlement {
  id: string;
  date: string;
  gross: number;
  fees: number;
  refunds: number;
  net: number;
  method: "UPI" | "Card" | "Wallet" | "COD";
  utr: string;
  status: "settled" | "processing" | "hold";
}

export const SETTLEMENTS: Settlement[] = [];

// -------- Staff --------

export type StaffRole = "Owner" | "Manager" | "Pharmacist" | "Delivery";
export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  email: string;
  shift: string;
  active: boolean;
  permissions: string[];
}

export const STAFF: Staff[] = [];

// -------- Compliance --------

export interface ComplianceItem {
  id: string;
  label: string;
  value: string;
  status: "ok" | "expiring" | "expired" | "review";
  expires?: string;
}

export const COMPLIANCE: ComplianceItem[] = [];

export interface AuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
}

export const AUDIT_LOGS: AuditLog[] = [];

// -------- Admin / Platform --------

export interface PartnerRow {
  id: string;
  pharmacy: string;
  city: string;
  owner: string;
  status: "approved" | "pending" | "review" | "suspended" | "rejected";
  submittedAt: string;
  monthlyOrders: number;
  compliance: number;
}

export const PARTNERS: PartnerRow[] = [];