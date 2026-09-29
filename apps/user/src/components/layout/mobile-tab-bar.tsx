'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, Package, User } from "lucide-react";
import { useCart, useUI } from "@/stores";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/pharmacies", label: "Explore", icon: Search },
  { to: "/cart", label: "Cart", icon: ShoppingBag, badge: true },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/account", label: "Account", icon: User },
] as const;

export function MobileTabBar() {
  const pathname = usePathname() || "";
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const cartCount = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border glass-strong pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((it) => {
          const active =
            it.to === "/" ? pathname === "/" : pathname === it.to || pathname.startsWith(it.to + "/");
          if (it.label === "Explore") {
            return (
              <li key={it.to} className="flex-1">
                <button
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    "flex min-h-11 w-full flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <it.icon className="h-5 w-5" />
                  <span>{it.label}</span>
                </button>
              </li>
            );
          }
          return (
            <li key={it.to} className="flex-1">
              <Link
                href={it.to}
                aria-label={it.label}
                className={cn(
                  "relative flex min-h-11 flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <it.icon className="h-5 w-5" />
                <span>{it.label}</span>
                {"badge" in it && it.badge && mounted && cartCount > 0 && (
                  <span className="absolute right-6 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
