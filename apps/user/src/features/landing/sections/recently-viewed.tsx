'use client';
import { useQuery } from "@tanstack/react-query";
import { pharmacyService } from "@/services";
import { PharmacyCard } from "@/components/pharmacy/pharmacy-card";
import { SectionHeader } from "@/components/ui-parts/section-header";
import { useRecent } from "@/stores";

export function RecentlyViewed() {
  const viewed = useRecent((s) => s.viewed);
  const { data } = useQuery({
    queryKey: ["pharmacies-recent", viewed.join(",")],
    queryFn: async () => {
      const list = await pharmacyService.listNearby();
      return viewed.map((id) => list.find((p) => p.id === id)).filter(Boolean);
    },
    enabled: viewed.length > 0,
  });

  if (viewed.length === 0 || !data || data.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="Continue where you left off"
        title="Recently viewed."
        hint="Pharmacies you visited — one tap to jump back in."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.slice(0, 3).map((p, i) => p && <PharmacyCard key={p.id} pharmacy={p} index={i} />)}
      </div>
    </section>
  );
}
