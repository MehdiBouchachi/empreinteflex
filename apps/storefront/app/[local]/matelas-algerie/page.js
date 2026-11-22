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
      "Matelas en Algérie | Acheter Matelas Orthopédiques & Premium - Empreinte Flex",

    description:
      "Achetez des matelas de haute qualité en Algérie. Découvrez nos matelas orthopédiques, à mémoire de forme et mousse HR, conçus pour le confort, le soutien et la durabilité. Livraison rapide partout en Algérie.",

    keywords: [
      "matelas Algérie",
      "acheter matelas Algérie",
      "matelas orthopédique Algérie",
      "matelas mémoire de forme Algérie",
      "matelas mousse HR Algérie",
      "matelas premium Algérie",
      "meilleur matelas Algérie",
      "Empreinte Flex matelas",
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
