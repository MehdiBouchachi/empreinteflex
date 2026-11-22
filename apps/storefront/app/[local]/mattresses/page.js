export const dynamic = 'force-dynamic';
import Script from "next/script";
import { getTranslations } from "@/lib/i18n";
import { getProductsWithDetails } from "@/lib/data-services/products";
import { getAllCategories } from "@/lib/data-services/categories";
import { getAllDimensions } from "@/lib/data-services/dimensions";
import { getAllThicknesses } from "@/lib/data-services/thicknesses";
import MattressesClient from "./MattressesClient";
import { buildLocalizedMetadata, SITE_URL } from "@/lib/seo";

const SITE_NAME = "Empreinte Flex";

export async function generateMetadata({ params }) {
  const { local } = await params;

  const meta = {
    fr: {
      title:
        "Matelas en Algérie | Collection de Matelas Premium - Empreinte Flex",
      description:
        "Découvrez notre collection de matelas en Algérie : matelas orthopédiques, mousse HR, mémoire de forme et ressorts. Trouvez le modèle adapté à votre confort.",
      keywords: [
        "matelas Algérie",
        "matelas orthopédique Algérie",
        "matelas premium Algérie",
        "matelas mousse HR Algérie",
        "matelas mémoire de forme Algérie",
        "acheter matelas Algérie",
        "Empreinte Flex",
      ],
    },
    en: {
      title:
        "Mattresses in Algeria | Premium Mattress Collection - Empreinte Flex",
      description:
        "Browse our mattress collection in Algeria, including orthopedic, HR foam, memory foam, and spring mattresses designed for comfort and support.",
      keywords: [
        "mattress Algeria",
        "orthopedic mattress Algeria",
        "premium mattress Algeria",
        "HR foam mattress Algeria",
        "memory foam mattress Algeria",
        "buy mattress Algeria",
        "Empreinte Flex",
      ],
    },
    ar: {
      title: "مراتب في الجزائر | مجموعة مراتب فاخرة - Empreinte Flex",
      description:
        "تصفح مجموعة المراتب في الجزائر، بما في ذلك المراتب الطبية، الإسفنج عالي الكثافة، الذاكرة والمراتب ذات النوابض.",
      keywords: [
        "مراتب الجزائر",
        "مرتبة طبية الجزائر",
        "مراتب فاخرة الجزائر",
        "مرتبة ميموري فوم الجزائر",
        "شراء مرتبة في الجزائر",
        "Empreinte Flex",
      ],
    },
  };

  const current = meta[local] || meta.fr;
  const image = `${SITE_URL}/images/ressort/ressort-prestige-1.jpeg`;

  return buildLocalizedMetadata({
    locale: local,
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    pathByLocale: {
      fr: "/fr/mattresses",
      en: "/en/mattresses",
      ar: "/ar/mattresses",
    },
    openGraphImage: image,
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

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      local === "fr"
        ? "Matelas en Algérie"
        : local === "ar"
          ? "المراتب في الجزائر"
          : "Mattresses in Algeria",
    url: `${SITE_URL}/${local}/mattresses`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    description:
      local === "fr"
        ? "Collection de matelas Empreinte Flex en Algérie."
        : local === "ar"
          ? "مجموعة مراتب Empreinte Flex في الجزائر."
          : "Empreinte Flex mattress collection in Algeria.",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: local === "fr" ? "Accueil" : local === "ar" ? "الرئيسية" : "Home",
        item: `${SITE_URL}/${local}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name:
          local === "fr"
            ? "Matelas"
            : local === "ar"
              ? "المراتب"
              : "Mattresses",
        item: `${SITE_URL}/${local}/mattresses`,
      },
    ],
  };

  return (
    <>
      <Script
        id={`mattresses-collection-schema-${local}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />

      <Script
        id={`mattresses-breadcrumb-schema-${local}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <MattressesClient
        locale={local}
        translation={translation}
        searchParams={resolvedSearchParams}
        products={products}
        categories={categories}
        dimensions={dimensions}
        thicknesses={thicknesses}
      />
    </>
  );
}
