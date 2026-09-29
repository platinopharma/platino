import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageClient } from "@/features/search/search-page-client";

export const metadata: Metadata = {
  title: "Search Medicines & Local Pharmacies | Platino Pharma",
  description: "Search for authentic prescribed medicines and verified nearby pharmacies across India with pay-on-delivery.",
  alternates: { canonical: "/search" },
};

export default function SearchRoute() {
  return (
    <Suspense>
      <SearchPageClient />
    </Suspense>
  );
}
