import { MetadataRoute } from 'next';
import { catalogService, pharmacyService, productService } from '@/services';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://platinopharma.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  
  const [categories, pharmacies, products] = await Promise.all([
    catalogService.categories(),
    pharmacyService.listNearby(),
    productService.listPopular(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pharmacies`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/category/${cat.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const pharmacyRoutes: MetadataRoute.Sitemap = pharmacies.map((pharm) => ({
    url: `${BASE_URL}/pharmacy/${pharm.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${BASE_URL}/product/${prod.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...pharmacyRoutes, ...productRoutes];
}
