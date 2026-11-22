import {
  Playfair_Display,
  Inter,
  IBM_Plex_Sans_Arabic,
} from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";

import "@/styles/globals.css";
import Providers from "../providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getTranslations } from "@/lib/i18n";
import { META_PIXEL_ID } from "@/lib/meta-pixel";
import MetaPixelPageView from "@/components/ui/MetaPixelPageView";
import WhatsAppFloatingButton from "@/components/ui/WhatsAppFloatingButton";
import ChatbotWidget from "@/components/features/chatbot/ChatbotWidget";
import CartHydrator from "@/components/features/cart/CartHydrator";
import {
  SITE_URL,
  SITE_NAME,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "@/lib/seo";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((local) => ({ local }));
}

const DEFAULT_OG_IMAGE =
  "https://empreinteflex.com/images/ressort/ressort-prestige-1.jpeg";

const headingFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  preload: false,
});

function getLocaleMetadata(local) {
  const meta = {
    en: {
      title: "Empreinte Flex | Premium Mattresses in Algeria",
      description:
        "Discover premium mattresses in Algeria with Empreinte Flex. Orthopedic, HR foam, memory foam, and spring mattresses designed for comfort, support, and durability.",
      keywords: [
        "mattress Algeria",
        "premium mattress Algeria",
        "orthopedic mattress Algeria",
        "memory foam mattress Algeria",
        "HR foam mattress Algeria",
        "spring mattress Algeria",
        "buy mattress Algeria",
        "best mattress Algeria",
        "Empreinte Flex",
      ],
      locale: "en_US",
    },
    fr: {
      title: "Empreinte Flex | Matelas Premium en Algérie",
      description:
        "Découvrez les matelas premium Empreinte Flex en Algérie : matelas orthopédiques, mousse HR, mémoire de forme et ressorts, conçus pour le confort, le soutien et la durabilité.",
      keywords: [
        "matelas Algérie",
        "matelas premium Algérie",
        "matelas orthopédique Algérie",
        "matelas mémoire de forme Algérie",
        "matelas mousse HR Algérie",
        "matelas ressort Algérie",
        "acheter matelas Algérie",
        "prix matelas Algérie",
        "Empreinte Flex",
      ],
      locale: "fr_FR",
    },
    ar: {
      title: "Empreinte Flex | مراتب فاخرة في الجزائر",
      description:
        "اكتشف مراتب Empreinte Flex في الجزائر: مراتب طبية، إسفنج عالي الكثافة، ميموري فوم ومراتب ذات نوابض، مصممة للراحة والدعم والمتانة.",
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
      locale: "ar_DZ",
    },
  };

  return meta[local] || meta.fr;
}

export async function generateMetadata({ params }) {
  const { local = "fr" } = await params;

  if (!isSupportedLocale(local)) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const current = getLocaleMetadata(local);

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      default: current.title,
      template: `%s | ${SITE_NAME}`,
    },

    description: current.description,

    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,

    keywords: current.keywords,

    openGraph: {
      type: "website",
      url: `${SITE_URL}/${local}`,
      siteName: SITE_NAME,
      title: current.title,
      description: current.description,
      locale: current.locale,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: current.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
      images: [DEFAULT_OG_IMAGE],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    icons: {
      icon: [
        {
          url: "/favicon.png",
          sizes: "any",
          type: "image/png",
        },
      ],
      shortcut: "/favicon.png",
      apple: "/apple-touch-icon.png",
    },

    category: "shopping",

    other: {
      "facebook-domain-verification": "v78vbzpv3uimlgyy2wn5k2da9zh4ct",
    },

    colorScheme: "light",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
    ],
  };
}

export default async function RootLayout({ children, params }) {
  const { local } = await params;

  if (!isSupportedLocale(local)) {
    notFound();
  }

  const isArabic = local === "ar";
  const translation = getTranslations(local);

  return (
    <html lang={local} dir={isArabic ? "rtl" : "ltr"}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Empreinte Flex" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>

      <body
        style={{ colorScheme: "light", backgroundColor: "#ffffff" }}
        className={`
          ${headingFont.variable}
          ${bodyFont.variable}
          ${arabicFont.variable}
          antialiased bg-white text-blue-900
          pb-19 md:pb-0
        `}
      >
        <Providers>
          <CartHydrator>
            <Header translation={translation} />
            {children}
            <Footer translation={translation} />
            <WhatsAppFloatingButton local={local} />
            {/*  <ChatbotWidget local={local} /> */}
          </CartHydrator>
        </Providers>

        {META_PIXEL_ID && (
          <>
            <Script
              id="meta-pixel-init"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s){
                    if(f.fbq)return;
                    n=f.fbq=function(){
                      n.callMethod
                        ? n.callMethod.apply(n,arguments)
                        : n.queue.push(arguments)
                    };
                    if(!f._fbq)f._fbq=n;
                    n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];
                    t=b.createElement(e);t.async=!0;
                    t.src=v;
                    s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)
                  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

                  fbq('init', '${META_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />

            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>

            <MetaPixelPageView />
          </>
        )}
      </body>
    </html>
  );
}
