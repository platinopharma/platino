import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Store, ShoppingBag, Pill, Users, Settings, LayoutDashboard } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui-store";
import { NAV } from "@/lib/nav";

const pharmacies: any[] = [];
const orders: any[] = [];
const medicines: any[] = [];
const customers: any[] = [];

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (e.key === "/" && /input|textarea/i.test((e.target as HTMLElement)?.tagName)) return;
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandOpen, setCommandOpen]);

  const go = (to: string) => {
    setCommandOpen(false);
    router.push(to);
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {NAV.map((n) => (
            <CommandItem key={n.key} value={`nav ${n.label}`} onSelect={() => go(n.to)}>
              <n.icon className="mr-2 h-4 w-4" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pharmacies">
          {pharmacies.slice(0, 5).map((p) => (
            <CommandItem key={p.id} value={`pharmacy ${p.storeName} ${p.city}`} onSelect={() => go("/pharmacies")}>
              <Store className="mr-2 h-4 w-4" />
              {p.storeName} · {p.city}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Orders">
          {orders.slice(0, 4).map((o) => (
            <CommandItem key={o.id} value={`order ${o.id} ${o.customer}`} onSelect={() => go("/orders")}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              {o.id} · {o.customer}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Medicines">
          {medicines.slice(0, 4).map((m) => (
            <CommandItem key={m.id} value={`medicine ${m.name}`} onSelect={() => go("/medicines")}>
              <Pill className="mr-2 h-4 w-4" />
              {m.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Customers">
          {customers.slice(0, 3).map((c) => (
            <CommandItem key={c.id} value={`customer ${c.name}`} onSelect={() => go("/customers")}>
              <Users className="mr-2 h-4 w-4" />
              {c.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem value="go dashboard" onSelect={() => go("/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
          </CommandItem>
          <CommandItem value="open settings" onSelect={() => go("/settings")}>
            <Settings className="mr-2 h-4 w-4" /> Open Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
