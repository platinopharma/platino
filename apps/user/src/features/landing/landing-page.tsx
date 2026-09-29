import { Hero } from "./sections/hero";
import { LocationPrompt } from "./sections/location-prompt";
import { LazySections } from "./lazy-sections";
import { NearestPharmacyShowcase } from "@/components/pharmacy/nearest-pharmacy-showcase";
import { TransitHandoffBanner } from "@/components/home/TransitHandoffBanner";
export function LandingPage() {
  return (
    <>
      <TransitHandoffBanner />
      <LocationPrompt />
      <Hero />
      <div className="mx-auto w-full max-w-7xl space-y-20 px-4 py-8 sm:px-6 lg:px-8">
        <NearestPharmacyShowcase />
        <LazySections />
      </div>
    </>
  );
}
