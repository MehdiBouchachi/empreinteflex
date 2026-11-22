export const dynamic = 'force-dynamic';
import Script from "next/script";
import { getTranslations } from "@/lib/i18n";
import {
  getProductBySlug,
  getProductsWithDetails,
} from "@/lib/data-services/products";
import { notFound } from "next/navigation";
import ProductClient from "@/components/features/product/ProductClient";
import { buildLocalizedMetadata, SITE_URL } from "@/lib/seo";

const SITE_NAME = "Empreinte Flex";
const FALLBACK_PRODUCT_IMAGE = `${SITE_URL}/images/ressort/ressort-prestige-1.jpeg`;

function stripHtml(text = "") {
  return text.replace(/<[^>]*>/g, "").trim();
}

function getProductImageUrl(product) {
  const image = product.images?.[0];

  if (!image) return FALLBACK_PRODUCT_IMAGE;
  if (image.startsWith("http")) return image;

  return `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;
}

function buildProductDescription(product, locale) {
  const base = stripHtml(product.description || "");

  if (base) return base;

  const fallback = {
    fr: `${product.name} par Empreinte Flex. Matelas conçu pour le confort, le soutien et la durabilité en Algérie.`,
    en: `${product.name} by Empreinte Flex. Mattress designed for comfort, support, and durability in Algeria.`,
    ar: `${product.name} من Empreinte Flex. مرتبة مصممة للراحة والدعم والمتانة في الجزائر.`,
  };

  return fallback[locale] || fallback.fr;
}

export async function generateMetadata({ params }) {
  const { local, slug } = await params;
  const product = await getProductBySlug(slug, local);

  if (!product) {
    return {
      title: `Produit introuvable | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const description = buildProductDescription(product, local);
  const title = `${product.name} | ${SITE_NAME}`;

  const imageUrl = getProductImageUrl(product);

  return buildLocalizedMetadata({
    locale: local,
    title,
    description,
    keywords: [
      product.name,
      "Empreinte Flex",
      "matelas Algérie",
      "matelas premium",
      "matelas orthopédique",
      "mousse HR",
      "mémoire de forme",
    ],
    pathByLocale: {
      fr: `/fr/product/${product.slug}`,
      en: `/en/product/${product.slug}`,
      ar: `/ar/product/${product.slug}`,
    },
    openGraphImage: imageUrl,
  });
}
function ProductJsonLd({ product, locale, imageUrl }) {
  const minPrice = product.priceRange?.min || 0;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          brand: {
            "@type": "Brand",
            name: "Empreinte Flex",
          },
          image: imageUrl,
          offers: {
            "@type": "Offer",
            priceCurrency: "DZD",
            price: minPrice,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/${locale}/product/${product.slug}`,
          },
        }),
      }}
    />
  );
}

export default async function ProductPage({ params }) {
  const { local, slug } = await params;

  const product = await getProductBySlug(slug, local);

  if (!product) notFound();

  const { productPage } = getTranslations(local);
  const allProducts = await getProductsWithDetails({}, local);

  const description = buildProductDescription(product, local);
  const imageUrl = getProductImageUrl(product);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image: imageUrl ? [imageUrl] : [],
    brand: {
      "@type": "Brand",
      name: "Empreinte Flex",
    },
    url: `${SITE_URL}/${local}/product/${product.slug}`,
    category: product.category?.name || product.category?.value || undefined,
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
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE_URL}/${local}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <Script
        id={`product-schema-${product.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id={`breadcrumb-schema-${product.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductJsonLd product={product} locale={local} imageUrl={imageUrl} />

      <ProductClient
        product={product}
        locale={local}
        allProducts={allProducts}
        translation={productPage}
      />
    </>
  );
}
