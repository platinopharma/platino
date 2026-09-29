export type StepId = "signup" | "business" | "documents" | "store" | "delivery" | "verify" | "activate";

export type DocStatus = "idle" | "uploading" | "verified";

export interface DocItem {
  key: string;
  label: string;
  required: boolean;
}

export interface FormState {
  registrationId: string | null;
  phone: string;
  otp: string;
  otpSent: boolean;
  signupVerified: boolean;
  pharmacyName: string;
  ownerName: string;
  email: string;
  password: string;
  gst: string;
  license: string;
  address: string; // Used as addressLine1
  addressLine2: string;
  landmark: string;
  city: string;
  addressState: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  docs: Record<string, DocStatus>;
  opens: string;
  closes: string;
  radius: number;
  minOrder: number;
  payments: { upi: boolean; card: boolean; cod: boolean };
  deliveryMode: "platino" | "own" | null;
  subscriptionPlan: 1 | 3 | 6 | 12 | null;
}

export interface StepConfig {
  id: StepId;
  n: string;
  label: string;
  caption: string;
}
