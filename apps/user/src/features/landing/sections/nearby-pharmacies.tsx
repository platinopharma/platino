'use client';
import { useQuery } from "@tanstack/react-query";
import { pharmacyService } from "@/services";
import { PharmacyCard } from "@/components/pharmacy/pharmacy-card";
import { PharmacyCardSkeleton } from "@/components/ui-parts/skeletons";
import { SectionHeader } from "@/components/ui-parts/section-header";
import { useLocation } from "@/stores";

export function NearbyPharmacies() {
  const coords = useLocation((s) => s.coords);
  const areaId = useLocation((s) => s.areaId);
  const radiusKm = useLocation((s) => s.radiusKm);

  const { data, isLoading } = useQuery({
    queryKey: ["pharmacies-nearby", coords?.lat, coords?.lng, radiusKm, areaId],
    queryFn: () => pharmacyService.listNearby(coords, radiusKm, areaId),
  });

  return (
    <section id="nearby" className="scroll-mt-24">
      <SectionHeader
        eyebrow="Nearby now"
        title="Pharmacies close to you."
        hint="Ranked by distance, ratings, and delivery time."
        actionTo="/pharmacies"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <PharmacyCardSkeleton key={i} />)
          : data?.slice(0, 6).map((p, i) => <PharmacyCard key={p.id} pharmacy={p} index={i} />)}
      </div>
    </section>
  );
}
