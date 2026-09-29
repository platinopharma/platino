'use client';
import { useQuery } from "@tanstack/react-query";
import { pharmacyService } from "@/services";
import { PharmacyCard } from "@/components/pharmacy/pharmacy-card";
import { PharmacyCardSkeleton } from "@/components/ui-parts/skeletons";
import { SectionHeader } from "@/components/ui-parts/section-header";

export function TopRated() {
  const { data, isLoading } = useQuery({
    queryKey: ["pharmacies-top"],
    queryFn: () => pharmacyService.listTopRated(),
  });

  return (
    <section>
      <SectionHeader
        eyebrow="Highest rated"
        title="Beloved by locals."
        hint="Pharmacies with the highest verified customer ratings."
        actionTo="/pharmacies"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <PharmacyCardSkeleton key={i} />)
          : data?.slice(0, 3).map((p, i) => <PharmacyCard key={p.id} pharmacy={p} index={i} />)}
      </div>
    </section>
  );
}
