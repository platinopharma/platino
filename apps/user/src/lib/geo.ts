// Shared geo utilities: area coordinates + Haversine distance.
// Keep in sync with the AREA_COORDS block previously used inside the navbar.

export type LatLng = { lat: number; lng: number };

export const AREA_COORDS: Record<string, LatLng> = {
  madhapur: { lat: 17.4483, lng: 78.3915 },
  "banjara-hills": { lat: 17.4126, lng: 78.4356 },
  gachibowli: { lat: 17.4401, lng: 78.3489 },
  "jubilee-hills": { lat: 17.4325, lng: 78.4071 },
  kondapur: { lat: 17.4647, lng: 78.3641 },
  "hitech-city": { lat: 17.4435, lng: 78.3772 },
  kukatpally: { lat: 17.4849, lng: 78.4138 },
  secunderabad: { lat: 17.4399, lng: 78.4983 },
};

// Reverse map: area label (e.g. "HITEC City") -> id
export const AREA_LABEL_TO_ID: Record<string, string> = {
  Madhapur: "madhapur",
  "Banjara Hills": "banjara-hills",
  Gachibowli: "gachibowli",
  "Jubilee Hills": "jubilee-hills",
  Kondapur: "kondapur",
  "HITEC City": "hitech-city",
  Kukatpally: "kukatpally",
  Secunderabad: "secunderabad",
};

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Given a pharmacy's area label + a user position, return the effective
// straight-line distance (km). Falls back to `fallbackKm` when we can't
// resolve coordinates for the pharmacy's area.
export function pharmacyDistanceFrom(
  user: LatLng | null,
  areaLabel: string,
  fallbackKm: number,
): number {
  if (!user) return fallbackKm;
  const id = AREA_LABEL_TO_ID[areaLabel];
  const c = id ? AREA_COORDS[id] : undefined;
  if (!c) return fallbackKm;
  return distanceKm(user, c);
}

// ETA estimator. Prep time from pharmacy characteristics + travel time from distance.
// Returns { minutes, closed } — when closed, minutes is still a best-effort estimate
// for when the pharmacy reopens (not modeled; callers can hide the value).
export function estimatePharmacyEta(
  distanceKm: number,
  opts: { isOpen: boolean; badges?: readonly string[]; fallbackMinutes?: number },
): { minutes: number; closed: boolean } {
  const badges = opts.badges ?? [];
  const isExpress = badges.includes("express");
  const is247 = badges.includes("24x7");
  const prepMin = isExpress ? 6 : is247 ? 8 : 12;
  const speedKmh = isExpress ? 32 : 22;
  const travelMin = Math.max(0, (distanceKm / speedKmh) * 60);
  const raw = prepMin + travelMin;
  // Round to nearest 5 for a clean UX (min 10)
  const rounded = Math.max(10, Math.round(raw / 5) * 5);
  return {
    minutes: rounded || opts.fallbackMinutes || 30,
    closed: !opts.isOpen,
  };
}

// Format ETA as "~25 min" or a range for longer waits ("35–45 min").
export function formatEta(minutes: number): string {
  if (minutes < 30) return `~${minutes} min`;
  const low = minutes - 5;
  const high = minutes + 5;
  return `${low}–${high} min`;
}

// Parse an "hours" string ("Open 24 hours", "8:00 AM – 11:00 PM", "7:00 AM – 12:00 AM").
// Returns null when the format isn't recognizable; callers should fall back.
export function isOpenAt(hours: string, now: Date = new Date()): boolean | null {
  if (!hours) return null;
  const s = hours.toLowerCase();
  if (s.includes("24 hour") || s.includes("24x7") || s.includes("24/7")) return true;
  // Match "H[:MM] AM/PM – H[:MM] AM/PM" (en-dash, em-dash, or hyphen).
  const m = hours.match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–—-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i,
  );
  if (!m) return null;
  const to24 = (h: number, mer: string) => {
    const H = h % 12;
    return mer.toUpperCase() === "PM" ? H + 12 : H;
  };
  const startH = to24(parseInt(m[1], 10), m[3]);
  const startM = m[2] ? parseInt(m[2], 10) : 0;
  const endH = to24(parseInt(m[4], 10), m[6]);
  const endM = m[5] ? parseInt(m[5], 10) : 0;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = startH * 60 + startM;
  let endMin = endH * 60 + endM;
  // Overnight window (e.g. 7:00 AM – 12:00 AM) — treat end as next-day.
  if (endMin <= startMin) endMin += 24 * 60;
  const nowMinAdj = nowMin < startMin ? nowMin + 24 * 60 : nowMin;
  return nowMinAdj >= startMin && nowMinAdj < endMin;
}
