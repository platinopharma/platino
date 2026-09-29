import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV, NAV_GROUPS } from "@/lib/nav";
import { useAuthStore, canAccess } from "@/stores/auth-store";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const role = useAuthStore((s) => s.user?.role);
  const pathname = usePathname();
  const items = NAV.filter((n) => canAccess(role, n.key));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl lg:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[270px] bg-sidebar p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-16 items-center px-4">
          <Logo />
        </div>
        <nav className="space-y-4 overflow-y-auto px-3 py-2">
          {NAV_GROUPS.map((group) => {
            const groupItems = items.filter((i) => i.group === group);
            if (!groupItems.length) return null;
            return (
              <div key={group}>
                <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </div>
                {groupItems.map((item) => {
                  const active = pathname.startsWith(item.to);
                  return (
                    <Link key={item.key}
                      href={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
                        active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80",
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
