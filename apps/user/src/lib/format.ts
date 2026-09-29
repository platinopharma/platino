import type { PharmacyBadge } from "./types";

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

export const badgeLabel: Record<PharmacyBadge, string> = {
  verified: "Verified",
  licensed: "Licensed",
  prescription: "Rx accepted",
  free_delivery: "Free delivery",
  express: "Express",
  "24x7": "24×7",
};
