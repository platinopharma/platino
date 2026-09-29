'use client';
import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { MobileTabBar } from "./mobile-tab-bar";
import dynamic from "next/dynamic";
import { FloatingCart } from "@/components/cart/floating-cart";
import { ActiveOrderFloatingBanner } from "@/components/orders/ActiveOrderFloatingBanner";
import { useTheme, useTextSize, TEXT_SIZE_SCALE } from "@/stores";

const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer), {
  ssr: false,
});
const SearchPalette = dynamic(() => import("@/components/search/search-palette").then((m) => m.SearchPalette), {
  ssr: false,
});

const AUTH_ROUTES = ["/login", "/register", "/verify", "/forgot-password", "/reset-password"];

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme((s) => s.theme);
  const textSize = useTextSize((s) => s.size);
  const pathname = usePathname() || "";
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  useEffect(() => {
    document.documentElement.style.fontSize = TEXT_SIZE_SCALE[textSize];
  }, [textSize]);

  if (isAuthRoute) {
    return (
      <div className="relative flex min-h-dvh flex-col">
        <main className="flex-1 focus:outline-none">{children}</main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 pb-24 lg:pb-0 focus:outline-none">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
      <FloatingCart />
      <ActiveOrderFloatingBanner />
      <CartDrawer />
      <SearchPalette />
    </div>
  );
}
