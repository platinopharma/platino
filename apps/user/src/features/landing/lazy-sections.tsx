'use client';
import dynamic from 'next/dynamic';

const CategoryStrip = dynamic(() => import("./sections/category-strip").then(m => m.CategoryStrip), { ssr: false });
const NearbyPharmacies = dynamic(() => import("./sections/nearby-pharmacies").then(m => m.NearbyPharmacies), { ssr: false });
const FeaturedPharmacies = dynamic(() => import("./sections/featured-pharmacies").then(m => m.FeaturedPharmacies), { ssr: false });
const TopRated = dynamic(() => import("./sections/top-rated").then(m => m.TopRated), { ssr: false });
const TodaysOffers = dynamic(() => import("./sections/todays-offers").then(m => m.TodaysOffers), { ssr: false });
const PopularMedicines = dynamic(() => import("./sections/popular-medicines").then(m => m.PopularMedicines), { ssr: false });
const SeasonalEssentials = dynamic(() => import("./sections/seasonal-essentials").then(m => m.SeasonalEssentials), { ssr: false });
const RecentlyViewed = dynamic(() => import("./sections/recently-viewed").then(m => m.RecentlyViewed), { ssr: false });
const WhyPlatino = dynamic(() => import("./sections/why-platino").then(m => m.WhyPlatino), { ssr: false });
const HowItWorks = dynamic(() => import("./sections/how-it-works").then(m => m.HowItWorks), { ssr: false });
const Testimonials = dynamic(() => import("./sections/testimonials").then(m => m.Testimonials), { ssr: false });
const AppCta = dynamic(() => import("./sections/app-cta").then(m => m.AppCta), { ssr: false });

import { useState, useEffect, useRef } from 'react';

export function LazySections() {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return <div ref={ref} className="h-[200vh] w-full" />; // Large placeholder to catch scroll
  }

  return (
    <>
      <CategoryStrip />
      <NearbyPharmacies />
      <FeaturedPharmacies />
      <TopRated />
      <TodaysOffers />
      <PopularMedicines />
      <SeasonalEssentials />
      <RecentlyViewed />
      <WhyPlatino />
      <HowItWorks />
      <Testimonials />
      <AppCta />
    </>
  );
}
