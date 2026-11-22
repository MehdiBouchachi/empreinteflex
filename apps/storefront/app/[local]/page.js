import Script from "next/script";
import { unstable_cache } from "next/cache";
import FinalCTA from "@/components/sections/FinalCTA";
import ProductsSection from "@/components/sections/ProductsSection";
import TrustStrip from "@/components/sections/TrustStrip";
import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import MattressSizesSection from "@/components/sections/MattressSizesSection";
import ShopLocationSection from "@/components/sections/ShopLocationSection";

import { getTranslations } from "@/lib/i18n";
import { getProductsWithDetails } from "@/lib/data-services/products";
import TestimonialsSection from "@/components/sections/Testimonialssection";
import { buildLocalizedMetadata, SITE_URL } from "@/lib/seo";

const SITE_NAME = "Empreinte Flex";
const DEFAULT_OG_IMAGE =
  "https://empreinteflex.com/images/ressort/ressort-prestige-1.jpeg";

// Homepage catalog data is identical for every visitor of a given locale —
// cache it so the route can be served from ISR instead of re-querying
// Supabase (and re-rendering) on every single request.
export const dynamic = 'force-dynamic';

const getCachedFeaturedProducts = unstable_cache(
  (local) => getProductsWithDetails({}, local),
  ["home-featured-products"],
  { revalidate: 180 },
);

function getHomeMeta(local) {
  const meta = {
    en: {
      title: "Mattresses in Algeria | Premium Comfort by Empreinte Flex",
      description:
        "Discover premium mattresses in Algeria with Empreinte Flex. Explore orthopedic, HR foam, memory foam, and spring mattresses designed for comfort, support, and durability.",
      keywords: [
        "mattress Algeria",
        "premium mattress Algeria",
        "orthopedic mattress Algeria",
        "memory foam mattress Algeria",
        "HR foam mattress Algeria",
        "spring mattress Algeria",
        "buy mattress Algeria",
        "Empreinte Flex",
      ],
      ogLocale: "en_US",
      pageName: "Mattresses in Algeria",
      pageDescription:
        "Premium mattress collection by Empreinte Flex in Algeria.",
    },
    fr: {
      title:
        "Matelas en Algérie | Matelas Orthopédiques Premium - Empreinte Flex",
      description:
        "Achetez des matelas en Algérie avec Empreinte Flex. Découvrez nos matelas orthopédiques, mousse HR, mémoire de forme et ressorts, conçus pour le confort, le soutien et la durabilité.",
      keywords: [
        "matelas Algérie",
        "matelas premium Algérie",
        "matelas orthopédique Algérie",
        "matelas mémoire de forme Algérie",
        "matelas mousse HR Algérie",
        "matelas ressort Algérie",
        "acheter matelas Algérie",
        "Empreinte Flex",
      ],
      ogLocale: "fr_FR",
      pageName: "Matelas en Algérie",
      pageDescription:
        "Collection de matelas premium Empreinte Flex en Algérie.",
    },
    ar: {
      title: "مراتب في الجزائر | مراتب فاخرة وطبية من Empreinte Flex",
      description:
        "اكتشف مراتب Empreinte Flex في الجزائر، بما في ذلك المراتب الطبية، الإسفنج عالي الكثافة، الميموري فوم والمراتب ذات النوابض، المصممة للراحة والدعم والمتانة.",
      keywords: [
        "مراتب الجزائر",
        "مراتب فاخرة الجزائر",
        "مرتبة طبية الجزائر",
        "مرتبة ميموري فوم الجزائر",
        "مرتبة إسفنج عالي الكثافة الجزائر",
        "مراتب نوابض الجزائر",
        "شراء مرتبة في الجزائر",
        "Empreinte Flex",
      ],
      ogLocale: "ar_DZ",
      pageName: "مراتب في الجزائر",
      pageDescription: "مجموعة مراتب Empreinte Flex في الجزائر.",
    },
  };

  return meta[local] || meta.fr;
}

export async function generateMetadata({ params }) {
  const { local = "fr" } = await params;
  const current = getHomeMeta(local);
  return buildLocalizedMetadata({
    locale: local,
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    pathByLocale: {
      fr: "/fr",
      en: "/en",
      ar: "/ar",
    },
    openGraphImage: DEFAULT_OG_IMAGE,
    ogLocale: current.ogLocale,
    robots: {
      index: true,
      follow: true,
    },
  });
}

export default async function Home({ params }) {
  const { local = "fr" } = await params;

  const translation = getTranslations(local);
  const products = await getCachedFeaturedProducts(local);
  const featuredProducts = products.slice(0, 3);

  const enhancedProducts = featuredProducts.map((product) => {
    const allPrices =
      product.details?.dimensions?.flatMap(
        (dimension) => dimension.options?.map((option) => option.price) || [],
      ) || [];

    if (!allPrices.length) return product;

    return {
      ...product,
      priceRange: {
        min: Math.min(...allPrices),
        max: Math.max(...allPrices),
      },
    };
  });

  const current = getHomeMeta(local);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: local,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${local}/mattresses?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: current.pageName,
    url: `${SITE_URL}/${local}`,
    description: current.pageDescription,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <>
      <Script
        id={`website-schema-${local}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <Script
        id={`homepage-schema-${local}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
      />

      <div className="min-h-screen bg-white text-slate-900">
        <HeroSection translation={translation} />

        <TrustStrip translation={translation} />

        <CategoriesSection locale={local} translation={translation} />

        <MattressSizesSection products={products} locale={local} />

        <ProductsSection
          translation={translation}
          locale={local}
          enhancedProducts={enhancedProducts}
        />

        {/* <MattressFinderSection locale={local} /> */}

        <TestimonialsSection locale={local} />

        <ShopLocationSection {...translation.home.location} locale={local} />

        <FinalCTA translation={translation} locale={local} />
      </div>
    </>
  );
}
