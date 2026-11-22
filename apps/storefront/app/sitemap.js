export const dynamic = 'force-dynamic';
import { SITE_URL } from "@/lib/seo";

import { getProductsWithDetails } from "@/lib/data-services/products";

export default async function sitemap() {
  const products = await getProductsWithDetails();

  const locales = ["fr", "en", "ar"];

  const now = new Date();

  // Canonical indexable static pages
  const staticRoutes = locales.flatMap((locale) => [
    {
      url: `${SITE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/${locale}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/${locale}/mattresses`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]);

  const seoLandingRoutes = [
    {
      url: `${SITE_URL}/fr/matelas-algerie`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/en/mattress-algeria`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Product pages
  const productRoutes = products.flatMap((product) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/product/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    })),
  );

  return [...staticRoutes, ...seoLandingRoutes, ...productRoutes];
}
