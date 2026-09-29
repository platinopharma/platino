'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  MapPin,
  ChevronDown,
  Sun,
  Moon,
  User,
  Package,
  Menu,
  Type,
  Minus,
  Plus,
  Loader2,
  Navigation,
  Users,
  Headphones,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useCart, useLocation, useTheme, useTextSize, useUI, useWishlist, type TextSize } from "../../stores";
import { catalogService } from "../../services";
import { cn } from "../../lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";

export function Navbar() {
  const pathname = usePathname() || "";
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCart((s) => s.count());
  const wishCount = useWishlist((s) => s.productIds.length + s.pharmacyIds.length);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);
  const areaId = useLocation((s) => s.areaId);
  const setArea = useLocation((s) => s.setArea);
  const areas = catalogService.areas();
  const currentArea = areas.find((a) => a.id === areaId) ?? areas[0];
  const [locOpen, setLocOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!locOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLocOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setLocOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[padding,background-color,box-shadow] duration-250",
        scrolled ? "glass-strong py-2 shadow-soft" : cn("py-3.5", isHome ? "bg-transparent" : "glass"),
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <div className="flex h-12 w-auto items-center">
            <Image src="/turtle-logo.png" alt="Platino Pharma Logo" width={150} height={100} quality={100} priority className="h-full w-auto object-contain" />
          </div>
          <span className="hidden font-display text-xl font-semibold tracking-tight sm:block">
            Platino <span className="text-primary">Pharma</span>
          </span>
        </Link>

        {/* Location — hidden on very small, visible from sm+ in header */}
        <div className="relative hidden shrink-0 sm:block">
          <button
            onClick={() => setLocOpen((v) => !v)}
            aria-label="Change delivery location"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm hover:bg-secondary"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span className="hidden font-medium md:inline">Deliver to</span>
            <span className="font-medium">{mounted ? currentArea.area : areas[0].area}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {locOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-popover p-2 shadow-elevated"
            >
              <DetectLocationButton onDone={() => setLocOpen(false)} />
              <div className="my-1 border-t border-border" />
              {areas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setArea(a.id);
                    setLocOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-secondary",
                    a.id === areaId && "bg-secondary",
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <div>
                    <div className="font-medium">{a.area}</div>
                    <div className="text-xs text-muted-foreground">{a.city}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>


        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-surface-elevated/60 px-3 py-2 text-left text-sm text-muted-foreground shadow-soft transition-colors hover:border-border-strong sm:px-4"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">
            <span className="sm:hidden">Search {mounted ? currentArea.area : areas[0].area}…</span>
            <span className="hidden sm:inline">Search medicines, pharmacies, healthcare…</span>
          </span>
          <kbd className="ml-auto hidden shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <NavIcon to="/orders" label="Orders" icon={<Package className="h-5 w-5" />} />
          <NavIcon
            to="/wishlist"
            label="Wishlist"
            icon={<Heart className="h-5 w-5" />}
            badge={mounted ? wishCount : 0}
          />
          <NavIcon
            to="/cart"
            label="Cart"
            icon={<ShoppingBag className="h-5 w-5" />}
            badge={mounted ? cartCount : 0}
            onClick={(e) => {
              e.preventDefault();
              setCartOpen(true);
            }}
          />
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            )}
          </button>
          <NavIcon to="/account" label="Account" icon={<User className="h-5 w-5" />} />
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu-sheet"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="right"
          id="mobile-menu-sheet"
          className="flex w-[86%] max-w-sm flex-col gap-0 border-l border-border bg-background p-0"
        >
          <SheetHeader className="space-y-0 border-b border-border px-5 py-4 text-left">
            <SheetTitle asChild>
              <div className="flex items-center gap-2 font-display text-lg font-semibold">
                <div className="flex h-12 w-auto items-center">
                  <Image src="/turtle-logo.png" alt="Platino Pharma Logo" width={150} height={100} quality={100} priority className="h-full w-auto object-contain" />
                </div>
                Platino <span className="text-primary">Pharma</span>
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation, delivery location, and appearance settings.
            </SheetDescription>
          </SheetHeader>

          <MobileMenuBody
            currentArea={mounted ? currentArea : areas[0]}
            areas={areas}
            areaId={mounted ? areaId : areas[0].id}
            setArea={setArea}
            theme={mounted ? theme : "light"}
            toggleTheme={toggleTheme}
            cartCount={mounted ? cartCount : 0}
            wishCount={mounted ? wishCount : 0}
            onNavigate={() => setMenuOpen(false)}
            mounted={mounted}
          />
        </SheetContent>
      </Sheet>
    </header>
  );
}

function MobileMenuBody({
  currentArea,
  areas,
  areaId,
  setArea,
  theme,
  toggleTheme,
  cartCount,
  wishCount,
  onNavigate,
  mounted,
}: {
  currentArea: { area: string; city: string };
  areas: { id: string; area: string; city: string }[];
  areaId: string;
  setArea: (id: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  cartCount: number;
  wishCount: number;
  onNavigate: () => void;
  mounted?: boolean;
}) {
  const items: { to: string; label: string; icon: React.ReactNode; badge?: number }[] = [
    { to: "/", label: "Home", icon: <MapPin className="h-5 w-5" /> },
    { to: "/pharmacies", label: "Pharmacies nearby", icon: <MapPin className="h-5 w-5" /> },
    { to: "/orders", label: "My orders", icon: <Package className="h-5 w-5" /> },
    { to: "/wishlist", label: "Wishlist", icon: <Heart className="h-5 w-5" />, badge: wishCount },
    { to: "/cart", label: "Cart", icon: <ShoppingBag className="h-5 w-5" />, badge: cartCount },
    { to: "/account", label: "Account", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <>
      <div className="border-b border-border px-5 py-4">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Deliver to
        </div>
        <div
          className="no-scrollbar swipe-x -mx-1 flex gap-2 overflow-x-auto px-1"
          role="group"
          aria-label="Choose delivery area"
        >
          <DetectLocationButton variant="chip" />
          {areas.map((a) => (
            <button
              key={a.id}
              onClick={() => setArea(a.id)}
              aria-pressed={a.id === areaId}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                a.id === areaId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-elevated hover:border-border-strong",
              )}
            >
              {a.area}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Currently: {currentArea.area}, {currentArea.city}
        </div>
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto py-2">
        {items.map((it) => (
          <Link
            key={it.to}
            href={it.to}
            onClick={onNavigate}
            className="flex min-h-11 items-center gap-4 px-5 py-3 text-sm font-medium hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary"
          >
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground"
            >
              {it.icon}
            </span>
            <span className="flex-1">{it.label}</span>
            {it.badge != null && it.badge > 0 && (
              <span
                aria-label={`${it.badge} items`}
                className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground"
              >
                {it.badge > 9 ? "9+" : it.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <TextSizeControl mounted={mounted} />
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex w-full min-h-11 items-center justify-between rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm font-medium hover:bg-secondary"
        >
          <span className="flex items-center gap-3">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
          <span className="text-xs text-muted-foreground">Tap to switch</span>
        </button>
      </div>
    </>
  );
}

function TextSizeControl({ mounted }: { mounted?: boolean }) {
  const sizeState = useTextSize((s) => s.size);
  const size = mounted ? sizeState : "md";
  const setSize = useTextSize((s) => s.set);
  const increase = useTextSize((s) => s.increase);
  const decrease = useTextSize((s) => s.decrease);
  const options: { value: TextSize; label: string }[] = [
    { value: "sm", label: "S" },
    { value: "md", label: "M" },
    { value: "lg", label: "L" },
    { value: "xl", label: "XL" },
  ];
  return (
    <div
      className="rounded-2xl border border-border bg-surface-elevated px-4 py-3"
      role="group"
      aria-label="Text size"
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Type className="h-4 w-4 text-primary" aria-hidden />
        Text size
        <span className="ml-auto text-xs uppercase tracking-wider text-muted-foreground">
          {size}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrease}
          disabled={size === "sm"}
          aria-label="Decrease text size"
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background hover:bg-secondary disabled:opacity-40"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <div className="flex flex-1 items-center justify-between gap-1" role="radiogroup" aria-label="Choose text size">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={size === o.value}
              onClick={() => setSize(o.value)}
              className={cn(
                "flex-1 min-h-11 rounded-full px-2 text-sm font-semibold transition-colors",
                size === o.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-secondary",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={increase}
          disabled={size === "xl"}
          aria-label="Increase text size"
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background hover:bg-secondary disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}



function NavIcon({
  to,
  label,
  icon,
  badge,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={to}
      onClick={onClick}
      aria-label={label}
      className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
    >
      {icon}
      {badge != null && badge > 0 && (
        <motion.span
          key={badge}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
        >
          {badge > 9 ? "9+" : badge}
        </motion.span>
      )}
    </Link>
  );
}

// Approximate coordinates for each service area (Hyderabad).
import { AREA_COORDS, distanceKm } from "../../lib/geo";
import { analytics } from "../../lib/analytics";

export function useDetectArea() {
  const setArea = useLocation((s) => s.setArea);
  const setCoords = useLocation((s) => s.setCoords);
  const setDetectStatus = useLocation((s) => s.setDetectStatus);
  const areas = catalogService.areas();
  const [detecting, setDetecting] = useState(false);

  const detect = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setDetectStatus("unavailable");
      toast.error("Location isn't available on this device");
      return;
    }
    if (!window.isSecureContext) {
      setDetectStatus("unavailable");
      toast.error("Location needs a secure (https) connection");
      return;
    }
    setDetecting(true);
    setDetectStatus("detecting");
    const t = toast.loading("Detecting your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords({ lat: here.lat, lng: here.lng, accuracy: pos.coords.accuracy });
        setDetectStatus("granted");
        let best: { id: string; area: string; dist: number } | null = null;
        for (const a of areas) {
          const c = AREA_COORDS[a.id];
          if (!c) continue;
          const d = distanceKm(here, c);
          if (!best || d < best.dist) best = { id: a.id, area: a.area, dist: d };
        }
        setDetecting(false);
        toast.dismiss(t);
        if (!best) {
          toast.error("Couldn't match a nearby service area");
          return;
        }
        setArea(best.id);
        analytics.track("location_detect", {
          areaId: best.id,
          distanceKm: Number(best.dist.toFixed(2)),
          accuracy: pos.coords.accuracy,
        });
        if (best.dist > 40) {
          toast.message(`We deliver in Hyderabad — set to nearest area: ${best.area}`);
        } else {
          toast.success(`Delivering to ${best.area} (${best.dist.toFixed(1)} km away)`);
        }
      },
      (err) => {
        setDetecting(false);
        toast.dismiss(t);
        if (err.code === err.PERMISSION_DENIED) {
          setDetectStatus("denied");
          analytics.track("location_detect", { status: "denied" });
          toast.error("Location permission denied. Enable it in your browser to auto-detect.");
        } else if (err.code === err.TIMEOUT) {
          setDetectStatus("error");
          analytics.track("location_detect", { status: "timeout" });
          toast.error("Location request timed out. Try again.");
        } else {
          setDetectStatus("error");
          analytics.track("location_detect", { status: "error" });
          toast.error("Couldn't detect your location");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }, [areas, setArea, setCoords, setDetectStatus]);

  return { detect, detecting };
}

export function DetectLocationButton({
  variant = "row",
  onDone,
}: {
  variant?: "row" | "chip";
  onDone?: () => void;
}) {
  const { detect, detecting } = useDetectArea();
  const handle = () => {
    detect();
    onDone?.();
  };
  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={handle}
        disabled={detecting}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary disabled:opacity-70"
      >
        {detecting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Navigation className="h-3.5 w-3.5" />
        )}
        {detecting ? "Detecting…" : "Use my location"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={handle}
      disabled={detecting}
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary-soft disabled:opacity-70"
    >
      {detecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Navigation className="h-4 w-4" />
      )}
      {detecting ? "Detecting your location…" : "Use my current location"}
    </button>
  );
}

