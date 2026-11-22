import { getTranslations } from "@/lib/i18n";
import OrderTrackingClient from "./OrderTrackingClinet";
import { buildNoindexMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { local } = await params;

  return buildNoindexMetadata({
    locale: local,
    pathByLocale: {
      fr: "/fr/track-order",
      en: "/en/track-order",
      ar: "/ar/track-order",
    },
  });
}

export default async function Page({ params }) {
  const { local } = await params;

  const translation = getTranslations(local);

  return <OrderTrackingClient translation={translation} locale={local} />;
}
