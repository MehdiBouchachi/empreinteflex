export const SITE_URL = "https://empreinteflex.com";
export const SITE_NAME = "Empreinte Flex";
export const SUPPORTED_LOCALES = ["fr", "en", "ar"];
export const DEFAULT_LOCALE = "fr";

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

function normalizePath(path = "") {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/";
}

function toAbsoluteUrl(path = "/") {
  return `${SITE_URL}${normalizePath(path)}`;
}

export function buildLanguageAlternates(
  pathByLocale,
  xDefaultLocale = DEFAULT_LOCALE,
) {
  const languages = {};

  for (const locale of SUPPORTED_LOCALES) {
    const path = pathByLocale?.[locale];
    if (path) {
      languages[locale] = toAbsoluteUrl(path);
    }
  }

  const xDefaultPath =
    pathByLocale?.[xDefaultLocale] || pathByLocale?.[DEFAULT_LOCALE];
  if (xDefaultPath) {
    languages["x-default"] = toAbsoluteUrl(xDefaultPath);
  }

  return languages;
}

export function buildLocalizedMetadata({
  locale,
  title,
  description,
  keywords,
  pathByLocale,
  openGraphImage,
  ogLocale,
  robots,
}) {
  const canonicalPath =
    pathByLocale?.[locale] || pathByLocale?.[DEFAULT_LOCALE] || "/fr";
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const languages = buildLanguageAlternates(pathByLocale);

  const metadata = {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
  };

  if (keywords?.length) {
    metadata.keywords = keywords;
  }

  if (robots) {
    metadata.robots = robots;
  }

  if (openGraphImage) {
    metadata.openGraph = {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
      locale: ogLocale,
      images: [
        {
          url: openGraphImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    };

    metadata.twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [openGraphImage],
    };
  }

  return metadata;
}

export function buildNoindexMetadata({ locale, pathByLocale }) {
  const canonicalPath =
    pathByLocale?.[locale] || pathByLocale?.[DEFAULT_LOCALE];

  return {
    metadataBase: new URL(SITE_URL),
    alternates: canonicalPath
      ? {
          canonical: toAbsoluteUrl(canonicalPath),
          languages: buildLanguageAlternates(pathByLocale),
        }
      : undefined,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}
