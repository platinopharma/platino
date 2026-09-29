"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  Users,
  Truck,
  Bell,
  FileText,
  Settings,
  ShieldCheck,
  FileSignature,
  IndianRupee,
  UserCog,
  LifeBuoy,
  Building2,
} from "lucide-react";
import { type ComponentType, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socketManager } from "@/lib/socket";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
};

export const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Operate",
    items: [
      { to: "/live", label: "Dashboard", icon: LayoutDashboard },
      { to: "/live/orders", label: "Orders", icon: ShoppingBag, badge: "12" },
      { to: "/live/prescriptions", label: "Prescriptions", icon: FileSignature, badge: "3" },
      { to: "/live/inventory", label: "Inventory", icon: Package },
      { to: "/live/delivery", label: "Delivery", icon: Truck },
    ],
  },
  {
    section: "Grow",
    items: [
      { to: "/live/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/live/customers", label: "Customers", icon: Users },
      { to: "/live/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    section: "Finance",
    items: [
      { to: "/live/finance", label: "Finance & Earnings", icon: IndianRupee },
      { to: "/live/finance/transactions", label: "Ledger", icon: FileText },
      { to: "/live/finance/withdrawals", label: "Withdrawals", icon: Truck },
    ],
  },
  {
    section: "Account",
    items: [
      { to: "/live/notifications", label: "Notifications", icon: Bell, badge: "5" },
      { to: "/live/staff", label: "Staff", icon: UserCog },
      { to: "/live/compliance", label: "Compliance", icon: ShieldCheck },
      { to: "/live/settings", label: "Store settings", icon: Settings },
      { to: "/live/profile", label: "Verification", icon: ShieldCheck },
      { to: "/live/support", label: "Support", icon: LifeBuoy },
      { to: "/live/admin", label: "Admin console", icon: Building2 },
    ],
  },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);

  useEffect(() => {
    const socket = socketManager.connect();
    
    const joinGlobal = () => {
      socket.emit('support:join_global');
    };
    joinGlobal();
    socket.on('connect', joinGlobal);

    const handleMsg = (data: any) => {
      if (data && data.message && data.message.senderType === 'USER') {
        setUnreadSupportCount(prev => prev + 1);
      }
    };

    socket.on('support:global_message_received', handleMsg);

    const handleDrawerOpen = () => {
      setUnreadSupportCount(0);
    };
    window.addEventListener('support:drawer_opened', handleDrawerOpen);

    return () => {
      socket.off('connect', joinGlobal);
      socket.off('support:global_message_received', handleMsg);
      window.removeEventListener('support:drawer_opened', handleDrawerOpen);
    };
  }, []);

  const allNavPaths = NAV.flatMap((g) => g.items.map((i) => i.to));

  const isActive = (to: string) => {
    if (pathname === to) return true;
    if (!pathname.startsWith(to + "/")) return false;
    const hasMoreSpecificMatch = allNavPaths.some(
      (otherTo) => otherTo !== to && (pathname === otherTo || pathname.startsWith(otherTo + "/")) && otherTo.startsWith(to + "/")
    );
    return !hasMoreSpecificMatch;
  };

  return (
    <nav aria-label="Primary" className="flex h-full flex-col">
      <div className="border-b border-line px-4 py-4">
        <Link href="/live" className="flex items-center gap-2.5" onClick={onNavigate}>
          <span className="flex h-12 w-auto shrink-0 items-center">
            <Image src="/turtle-logo.png" alt="Platino Pharma Logo" width={150} height={100} quality={100} priority className="h-full w-auto object-contain" />
          </span>
          <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink">
            PLATINO<span className="text-brand">PHARMA</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        {NAV.map((group) => (
          <div key={group.section} className="mb-4">
            <div className="mb-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-subtle">
              {group.section}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      href={item.to}
                      onClick={onNavigate}
                      className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors ${
                        active
                          ? "bg-ink text-paper"
                          : "text-ink-muted hover:bg-hover hover:text-ink"
                      }`}
                    >
                      <Icon className={`size-4 shrink-0 ${active ? "text-paper" : "text-ink-subtle group-hover:text-ink"}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {(item.label === 'Support' && unreadSupportCount > 0) ? (
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] bg-red-500/20 text-red-500 font-bold`}
                        >
                          {unreadSupportCount}
                        </span>
                      ) : item.badge ? (
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                            active ? "bg-paper/15 text-paper" : "bg-ink/5 text-ink-muted"
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-full bg-brand/15 font-mono text-[11px] font-semibold text-brand">
            PP
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-ink">Partner console</div>
            <div className="truncate font-mono text-[10px] text-ink-subtle">v2.4 · Bengaluru</div>
          </div>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.localStorage.removeItem("platino_merchant_token");
                queryClient.clear();
                window.location.href = "/login";
              }
            }}
            title="Sign out"
            className="grid size-8 place-items-center rounded-md text-ink-subtle hover:bg-hover hover:text-ink transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </button>
        </div>
      </div>
    </nav>
  );
}