// Frontend-only analytics. Fires events to:
//   1. window.dataLayer (GTM-compatible — drop a GTM snippet later, zero code changes)
//   2. console.debug (dev visibility)
//   3. an in-memory ring buffer (accessible via window.__platinoEvents for debugging)
// When you later add a provider (PostHog, Plausible, custom endpoint), wire it
// inside `send()` — call sites do NOT change.

export type AnalyticsEvent =
  | "page_view"
  | "search"
  | "search_submit"
  | "pharmacy_view"
  | "product_view"
  | "category_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "cart_view"
  | "checkout_start"
  | "checkout_step"
  | "coupon_apply"
  | "order_placed"
  | "order_status_update"
  | "location_detect"
  | "location_manual"
  | "wishlist_toggle"
  | "rx_upload";

export type EventProps = Record<string, string | number | boolean | null | undefined>;

const BUFFER_MAX = 200;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    __platinoEvents?: Array<{ event: AnalyticsEvent; props: EventProps; at: number }>;
  }
}

function sessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let sid = sessionStorage.getItem("platino-sid");
    if (!sid) {
      sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem("platino-sid", sid);
    }
    return sid;
  } catch {
    return "no-session";
  }
}

function send(event: AnalyticsEvent, props: EventProps) {
  if (typeof window === "undefined") return; // no-op during SSR
  const payload = { event, props, at: Date.now(), sid: sessionId() };

  // 1. GTM-compatible push
  window.dataLayer ||= [];
  window.dataLayer.push({ event, ...props, _platino_sid: payload.sid });

  // 2. Ring buffer for debugging (window.__platinoEvents in DevTools)
  window.__platinoEvents ||= [];
  window.__platinoEvents.push({ event, props, at: payload.at });
  if (window.__platinoEvents.length > BUFFER_MAX) {
    window.__platinoEvents.splice(0, window.__platinoEvents.length - BUFFER_MAX);
  }

  // 3. Dev console
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, props);
  }
}

export const analytics = {
  track(event: AnalyticsEvent, props: EventProps = {}) {
    send(event, props);
  },
  pageView(path: string, title?: string) {
    send("page_view", { path, title: title ?? (typeof document !== "undefined" ? document.title : "") });
  },
};
