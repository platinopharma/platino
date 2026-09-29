import { useRouter } from "next/navigation";

import { Search, Moon, Sun, Bell, LogOut, UserCog, Check } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore, ROLE_MODULES } from "@/stores/auth-store";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLES = Object.keys(ROLE_MODULES) as Role[];

export function Header() {
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);
  const { theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <MobileNav />
      <button
        onClick={() => setCommandOpen(true)}
        aria-label="Search"
        className="group flex h-9 w-9 flex-none items-center justify-center gap-2.5 rounded-xl border bg-muted/40 px-0 text-sm text-muted-foreground transition-colors hover:bg-muted sm:w-full sm:max-w-md sm:flex-1 sm:justify-start sm:px-3"
      >
        <Search className="h-4 w-4 flex-none" />
        <span className="hidden flex-1 truncate text-left sm:block">Search pharmacies, orders, medicines…</span>
        <kbd className="hidden items-center gap-0.5 rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
      >
        {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700 dark:text-slate-200" />}
      </button>

      <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-muted">
            <Avatar className="h-8 w-8 border">
              <AvatarFallback className="bg-gradient-to-br from-primary to-success text-xs font-semibold text-primary-foreground">
                {user?.avatar || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:block">
              <div className="text-sm font-medium">{user?.name || "Administrator"}</div>
              <div className="text-[11px] text-muted-foreground capitalize">{user?.role}</div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium">{user?.name || "Administrator"}</div>
            <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
