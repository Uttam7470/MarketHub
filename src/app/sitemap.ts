import { db } from '@/lib/db';
import { MetadataRoute } from 'next';

const BASE_URL = 'https://markethub.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Category pages
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/products?category=${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Product pages
  const products = await db.product.findMany({
    where: { isActive: true, productStatus: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}