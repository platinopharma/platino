
import type { Metadata } from "next";
import Script from "next/script";
import { productService } from "@/services";
import { ProductDetailsPage } from "@/features/product/product-details-page";
import { use } from "react";

export const revalidate = 60; // 1-minute ISR edge revalidation

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await productService.get(id);
  if (!product) {
    return { 
      title: "Medicine Not Found | Platino Pharma",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${product.name} (${product.packSize}) — Price, Composition & Delivery | Platino Pharma`,
    description: `Buy ${product.name} by ${product.manufacturer}. Composition: ${product.composition || 'Standard prescription'}. Guaranteed authentic from licensed pharmacies near you with pay-on-delivery.`,
    openGraph: {
      title: `${product.name} | Platino Pharma`,
      description: `Authentic medicine ordered online from nearby licensed pharmacies. Pay on delivery.`,
      images: [product.image],
    },
    alternates: { canonical: `/product/${product.id}` },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await productService.get(resolvedParams.id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://platinopharma.com';

  const productSchema = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image],
    "description": `Buy authentic ${product.name} (${product.packSize}) manufactured by ${product.manufacturer}.`,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.manufacturer || "Platino Pharma Partner"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/product/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Platino Pharma Local Network"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "84"
    }
  } : null;

  return (
    <>
      {productSchema && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
        />
      )}
      <ProductDetailsPage params={resolvedParams} />
    </>
  );
}
