import {
  LayoutDashboard,
  ShieldCheck,
  Store,
  Boxes,
  Pill,
  ShoppingBag,
  Users,
  Bell,
  LifeBuoy,
  BarChart3,
  ScrollText,
  Settings,
  Map as MapIcon,
  Ticket,
  IndianRupee,
  Cpu,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  to: string;
  icon: LucideIcon;
  group: string;
  badge?: "pending";
}

export const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, group: "Overview" },
  { key: "verification", label: "Verification", to: "/verification", icon: ShieldCheck, group: "Operations", badge: "pending" },
  { key: "pharmacies", label: "Pharmacies", to: "/pharmacies", icon: Store, group: "Operations" },
  { key: "inventory", label: "Inventory", to: "/inventory", icon: Boxes, group: "Operations" },
  { key: "medicines", label: "Medicines", to: "/medicines", icon: Pill, group: "Operations" },
  { key: "orders", label: "Orders", to: "/orders", icon: ShoppingBag, group: "Operations" },
  { key: "finance", label: "Finance & Payouts", to: "/finance", icon: IndianRupee, group: "Operations" },
  { key: "customers", label: "Customers", to: "/customers", icon: Users, group: "Operations" },
  { key: "maps", label: "Network Map", to: "/maps", icon: MapIcon, group: "Operations" },
  { key: "notifications", label: "Notifications", to: "/notifications", icon: Bell, group: "Engagement" },
  { key: "coupons", label: "Coupons", to: "/coupons", icon: Ticket, group: "Engagement" },
  { key: "support", label: "Support", to: "/support", icon: LifeBuoy, group: "Engagement" },
  { key: "analytics", label: "Analytics", to: "/analytics", icon: BarChart3, group: "Insights" },
  { key: "audit", label: "Audit Logs", to: "/audit", icon: ScrollText, group: "Insights" },
  { key: "automation", label: "Automation Engine", to: "/automation", icon: Cpu, group: "System" },
  { key: "settings", label: "Settings", to: "/settings", icon: Settings, group: "System" },
  { key: "admins", label: "Admin Control", to: "/admins", icon: ShieldCheck, group: "System" },
];

export const NAV_GROUPS = ["Overview", "Operations", "Engagement", "Insights", "System"];
