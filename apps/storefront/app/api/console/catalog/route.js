import { NextResponse } from "next/server";
import { getProductsWithDetails } from "@/lib/data-services/products";
import { applyDiscount } from "@/components/features/chatbot/recommender";

// Catalog feed for the agent console — unlike /api/chatbot/catalog (which
// collapses each size down to a single cheapest price for the recommender),
// this preserves the full size × thickness price grid so agents can pick the
// exact variant a customer wants, same as the website's product page does.

const ALLOWED_LOCALES = ["fr", "en", "ar"];

export const revalidate = 900;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("locale");
  const locale = ALLOWED_LOCALES.includes(requested) ? requested : "ar";

  try {
    const products = await getProductsWithDetails({ available: true }, locale);

    const catalog = products.map((product) => {
      const discount = Number(product.discount) || 0;

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] || null,
        pricingType: product.pricingType,
        basePrice:
          product.pricingType === "SIMPLE"
            ? applyDiscount(product.basePrice, discount)
            : null,
        dimensions: (product.details?.dimensions || []).map((d) => ({
          size: d.size,
          options: d.options.map((o) => ({
            thickness: o.thickness,
            price: applyDiscount(o.price, discount),
          })),
        })),
      };
    });

    return NextResponse.json(
      { locale, catalog },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("[console/catalog]", error.message);
    return NextResponse.json({ locale, catalog: [], error: true }, { status: 200 });
  }
}
