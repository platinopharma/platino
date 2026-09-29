import type { Metadata } from "next";
import { catalogService } from "@/services";
import { CategoryPageClient } from "@/features/category/category-page-client";

export const revalidate = 3600; // 1-hour ISR edge revalidation

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = catalogService.categories();
  const category = categories.find((c) => c.id === slug);
  if (!category) {
    return { 
      title: "Category Not Found | Platino Pharma",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${category.name} Medicines & Products — Fast Local Delivery | Platino Pharma`,
    description: `Browse verified ${category.name} items from licensed nearby pharmacies. Pay on delivery with inspection before payment.`,
    openGraph: {
      title: `${category.name} | Platino Pharma`,
      description: `Verified ${category.name} healthcare supplies from trusted local chemists in your neighborhood.`,
    },
    alternates: { canonical: `/category/${category.id}` },
  };
}

export default async function CategoryRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryPageClient slug={slug} />;
}
