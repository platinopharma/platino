import Link from "next/link";
import { usePathname } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { NAV, NAV_GROUPS } from "@/lib/nav";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore, canAccess } from "@/stores/auth-store";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const role = useAuthStore((s) => s.user?.role);
  const pathname = usePathname();

  const items = NAV.filter((n) => canAccess(role, n.key));

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-sidebar transition-[width] duration-300 ease-out lg:flex",
        sidebarCollapsed ? "w-[76px]" : "w-[256px]",
      )}
    >
      <div className={cn("flex h-16 items-center px-4", sidebarCollapsed && "justify-center px-0")}>
        <Logo collapsed={sidebarCollapsed} />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {NAV_GROUPS.map((group) => {
          const groupItems = items.filter((i) => i.group === group);
          if (!groupItems.length) return null;
          return (
            <div key={group}>
              {!sidebarCollapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </div>
              )}
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const active = pathname.startsWith(item.to);
                  const Icon = item.icon;
                  const link = (
                    <Link href={item.to}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        sidebarCollapsed && "justify-center px-0",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl bg-sidebar-primary shadow-sm"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <Icon className="relative z-10 h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                      {!sidebarCollapsed && <span className="relative z-10 flex-1">{item.label}</span>}
                      {!sidebarCollapsed && item.badge === "pending" && (
                        <span
                          className={cn(
                            "relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            active ? "bg-white/20" : "bg-primary/15 text-primary",
                          )}
                        >
                          New
                        </span>
                      )}
                    </Link>
                  );
                  return sidebarCollapsed ? (
                    <Tooltip key={item.key} delayDuration={0}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={item.key}>{link}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {sidebarCollapsed ? <PanelLeft className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
          <AnimatePresence>{!sidebarCollapsed && <span>Collapse</span>}</AnimatePresence>
        </button>
      </div>
    </aside>
  );
}
