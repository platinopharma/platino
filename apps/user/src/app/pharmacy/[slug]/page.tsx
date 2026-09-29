import type { Metadata } from "next";
import Script from "next/script";
import { PharmacyStorePage } from "@/features/pharmacy-store/pharmacy-store-page";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { pharmacyService, productService } from "@/services";

export async function generateStaticParams() {
  return []; // SSR / ISR for dynamic paths
}

export const revalidate = 60; // 1-minute ISR edge revalidation

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pharmacy = await pharmacyService.getBySlug(slug);
  if (!pharmacy) {
    return { 
      title: "Pharmacy Not Found | Platino Pharma",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${pharmacy.name} (${pharmacy.area}) | Verified Platino Pharma Partner`,
    description: `Order medicines online from ${pharmacy.name} in ${pharmacy.area}. ${pharmacy.tagline}. Pay on delivery with instant verification.`,
    openGraph: {
      title: `${pharmacy.name} | Platino Pharma`,
      description: `Licensed pharmacy in ${pharmacy.area}, ${pharmacy.city}. Fast home delivery with cash on delivery.`,
      images: [pharmacy.cover],
    },
    alternates: { canonical: `/pharmacy/${pharmacy.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const queryClient = new QueryClient();

  const pharmacy = await queryClient.fetchQuery({
    queryKey: ["pharmacy", resolvedParams.slug],
    queryFn: () => pharmacyService.getBySlug(resolvedParams.slug),
  });

  if (pharmacy) {
    await queryClient.prefetchQuery({
      queryKey: ["pharmacy-products", pharmacy.id],
      queryFn: () => productService.listByPharmacy(pharmacy.id),
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://platinopharma.com';
  const pharmacySchema = pharmacy ? {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Pharmacy"],
    "name": pharmacy.name,
    "image": [pharmacy.cover],
    "description": `Order medicines online from ${pharmacy.name} located in ${pharmacy.area}, ${pharmacy.city}. ${pharmacy.tagline}.`,
    "telephone": pharmacy.phone || "+91 98765 43210",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": pharmacy.address || `${pharmacy.area}, Near Main Market`,
      "addressLocality": pharmacy.area,
      "addressRegion": pharmacy.city,
      "addressCountry": "IN"
    },
    "priceRange": "₹₹",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "310"
    },
    "url": `${baseUrl}/pharmacy/${pharmacy.slug}`
  } : null;

  return (
    <>
      {pharmacySchema && (
        <Script
          id="pharmacy-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pharmacySchema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
        />
      )}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PharmacyStorePage params={resolvedParams} />
      </HydrationBoundary>
    </>
  );
}
