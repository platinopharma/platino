'use client';
import { useQuery } from "@tanstack/react-query";
import { pharmacyService } from "@/services";
import { PharmacyCard } from "@/components/pharmacy/pharmacy-card";
import { PharmacyCardSkeleton } from "@/components/ui-parts/skeletons";
import { SectionHeader } from "@/components/ui-parts/section-header";

export function FeaturedPharmacies() {
  const { data, isLoading } = useQuery({
    queryKey: ["pharmacies-featured"],
    queryFn: () => pharmacyService.listFeatured(),
  });

  return (
    <section>
      <SectionHeader
        eyebrow="Featured this week"
        title="Editor's picks."
        hint="Curated pharmacies with outstanding service and range."
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
