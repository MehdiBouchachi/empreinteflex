export const dynamic = 'force-dynamic';
import { getTranslations } from "@/lib/i18n";
import { getProductsWithDetails } from "@/lib/data-services/products";
import { getAllCategories } from "@/lib/data-services/categories";
import { getAllDimensions } from "@/lib/data-services/dimensions";
import { getAllThicknesses } from "@/lib/data-services/thicknesses";
import MattressesClient from "../mattresses/MattressesClient";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { local } = await params;

  return buildLocalizedMetadata({
    locale: local,
    title:
      "Mattress in Algeria | Buy Orthopedic & Premium Mattresses - Empreinte Flex",

    description:
      "Buy high-quality mattresses in Algeria. Discover orthopedic, memory foam, and HR foam mattresses designed for comfort, support, and durability. Fast delivery across Algeria.",

    keywords: [
      "mattress Algeria",
      "buy mattress Algeria",
      "orthopedic mattress Algeria",
      "memory foam mattress Algeria",
      "HR foam mattress Algeria",
      "premium mattress Algeria",
      "best mattress Algeria",
      "Empreinte Flex mattress",
    ],
    pathByLocale: {
      fr: "/fr/matelas-algerie",
      en: "/en/mattress-algeria",
      ar: "/ar/mattresses",
    },
    openGraphImage:
      "https://empreinteflex.com/images/ressort/ressort-prestige-1.jpeg",

    robots: {
      index: true,
      follow: true,
    },
  });
}
export default async function MattressesPage({ params, searchParams }) {
  const { local } = await params;
  const resolvedSearchParams = await searchParams;

  const translation = getTranslations(local);

  const [products, categories, dimensions, thicknesses] = await Promise.all([
    getProductsWithDetails({}, local),
    getAllCategories(),
    getAllDimensions(),
    getAllThicknesses(),
  ]);

  return (
    <MattressesClient
      locale={local}
      translation={translation}
      searchParams={resolvedSearchParams}
      products={products}
      categories={categories}
      dimensions={dimensions}
      thicknesses={thicknesses}
    />
  );
}
