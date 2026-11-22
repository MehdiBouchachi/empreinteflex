import { NextResponse } from "next/server";

import { getProductsWithDetails } from "@/lib/data-services/products";
import { normalizeProduct } from "@/components/features/chatbot/recommender";

/* Live, locale-aware catalog for the recommendation chatbot.
   Read-only, only-available products, cached at the edge. The client falls
   back to the static constants if this ever returns empty. */

const ALLOWED_LOCALES = ["fr", "en", "ar"];

export const revalidate = 900;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("locale");
  const locale = ALLOWED_LOCALES.includes(requested) ? requested : "fr";

  try {
    const products = await getProductsWithDetails({ available: true }, locale);
    const catalog = products.map(normalizeProduct).filter(Boolean);

    return NextResponse.json(
      { locale, catalog },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("[chatbot/catalog]", error.message);
    // Non-fatal: client falls back to bundled static catalog.
    return NextResponse.json({ locale, catalog: [], error: true }, { status: 200 });
  }
}
