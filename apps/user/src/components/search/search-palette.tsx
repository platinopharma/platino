'use client';
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Command } from "cmdk";
import { Search, Clock, TrendingUp, Pill, Store, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecent, useUI } from "@/stores";
import { pharmacyService, productService } from "@/services";
import { formatINR } from "@/lib/format";

export function SearchPalette() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const history = useRecent((s) => s.searchHistory);
  const addSearch = useRecent((s) => s.addSearch);
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Awaited<ReturnType<typeof productService.search>>>([]);
  const [pharms, setPharms] = useState<Awaited<ReturnType<typeof pharmacyService.search>>>([]);
  const navigate = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setPharms([]);
      return;
    }
    let live = true;
    Promise.all([productService.search(q), pharmacyService.search(q)]).then(([pr, ph]) => {
      if (!live) return;
      setProducts(pr.slice(0, 5));
      setPharms(ph.slice(0, 4));
    });
    return () => {
      live = false;
    };
  }, [q]);

  const submit = (searchTerm: string) => {
    addSearch(searchTerm);
    setOpen(false);
    navigate.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[8vh] z-50 w-[min(640px,92vw)] -translate-x-1/2 overflow-hidden rounded-3xl border border-border glass-strong shadow-elevated"
          >
            <Command shouldFilter={false} loop>
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Command.Input
                  autoFocus
                  value={q}
                  onValueChange={setQ}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setOpen(false);
                    }
                    if (e.key === "Enter" && q.trim()) {
                      e.preventDefault();
                      submit(q);
                    }
                  }}
                  placeholder="Search medicines, pharmacies, categories…"
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close search"
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {q ? "Nothing matched. Try a different term." : "Start typing to search."}
                </Command.Empty>

                {!q && history.length > 0 && (
                  <Section title="Recent" icon={Clock}>
                    {history.map((h) => (
                      <Command.Item
                        key={h}
                        onSelect={() => submit(h)}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm data-[selected=true]:bg-secondary"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {h}
                      </Command.Item>
                    ))}
                  </Section>
                )}

                {!q && (
                  <Section title="Trending" icon={TrendingUp}>
                    {["Paracetamol", "Diabetes strips", "Vitamin D3", "Baby diapers", "24×7 pharmacy"].map(
                      (t) => (
                        <Command.Item
                          key={t}
                          onSelect={() => submit(t)}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm data-[selected=true]:bg-secondary"
                        >
                          <TrendingUp className="h-4 w-4 text-primary" />
                          {t}
                        </Command.Item>
                      ),
                    )}
                  </Section>
                )}

                {pharms.length > 0 && (
                  <Section title="Pharmacies" icon={Store}>
                    {pharms.map((p) => (
                      <Command.Item
                        key={p.id}
                        onSelect={() => {
                          setOpen(false);
                          navigate.push(`/pharmacy/${p.slug}`);
                        }}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm data-[selected=true]:bg-secondary"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image src={p.logo} alt={p.name} width={40} height={40} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.area} &bull; Rating {p.rating}
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Section>
                )}

                {products.length > 0 && (
                  <Section title="Medicines & products" icon={Pill}>
                    {products.map((p) => (
                      <Command.Item
                        key={p.id}
                        onSelect={() => {
                          setOpen(false);
                          navigate.push(`/product/${p.id}`);
                        }}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm data-[selected=true]:bg-secondary"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image src={p.image} alt={p.name} width={40} height={40} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.manufacturer}</div>
                        </div>
                        <div className="text-xs font-semibold">{formatINR(p.price)}</div>
                      </Command.Item>
                    ))}
                  </Section>
                )}
              </Command.List>

              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                <span>↑↓ to navigate · ↵ to open</span>
                <span>esc to close</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Command.Group>
      <div className="flex items-center gap-2 px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {title}
      </div>
      {children}
    </Command.Group>
  );
}
