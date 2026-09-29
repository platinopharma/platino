import { FormState, StepConfig, DocItem } from "./types";

export const ONBOARDING_STORAGE_KEY = "platinopharmacy:onboarding:v1";
export const LIVE_STORAGE_KEY = "platinopharmacy:live:v1";

export const STEPS: StepConfig[] = [
  { id: "signup", n: "01", label: "Create account", caption: "Phone + OTP" },
  { id: "business", n: "02", label: "Business details", caption: "Legal & licenses" },
  { id: "documents", n: "03", label: "Upload documents", caption: "Encrypted vault" },
  { id: "store", n: "04", label: "Set up store", caption: "Hours & delivery" },
  { id: "delivery", n: "05", label: "Delivery mode", caption: "Logistics & subscription" },
  { id: "verify", n: "06", label: "Verification", caption: "Compliance review" },
  { id: "activate", n: "07", label: "Go live", caption: "Accept orders" },
];

export const DOC_LIST: DocItem[] = [
  { key: "drugLicense", label: "Drug License", required: true },
  { key: "gstCertificate", label: "GST Certificate", required: true },
  { key: "ownerGovernmentId", label: "Owner ID Proof", required: true },
  { key: "storeFrontImage", label: "Store Front Photo", required: true },
  { key: "storeInsideImage1", label: "Store Inside Photo 1", required: true },
  { key: "storeInsideImage2", label: "Store Inside Photo 2", required: false },
  { key: "cancelledCheque", label: "Cancelled Cheque", required: true },
  { key: "businessRegistrationProof", label: "Address/Business Proof", required: true },
];

export const initialFormState: FormState = {
  registrationId: null,
  phone: "",
  otp: "",
  otpSent: false,
  signupVerified: false,
  pharmacyName: "",
  ownerName: "",
  email: "",
  password: "",
  gst: "",
  license: "",
  address: "",
  addressLine2: "",
  landmark: "",
  city: "",
  addressState: "",
  pincode: "",
  lat: null,
  lng: null,
  docs: Object.fromEntries(DOC_LIST.map((d) => [d.key, "idle"])) as FormState["docs"],
  opens: "08:00",
  closes: "23:00",
  radius: 5,
  minOrder: 99,
  payments: { upi: true, card: true, cod: false },
  deliveryMode: null,
  subscriptionPlan: null,
};
