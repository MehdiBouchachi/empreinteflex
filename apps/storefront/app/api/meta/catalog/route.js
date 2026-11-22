import { getProductsWithDetails } from "@/lib/data-services/products";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://empreinteflex.com").replace(/\/+$/, "");
const DEFAULT_LOCALE = "fr";
const BRAND = "Empreinte Flex";
const GOOGLE_PRODUCT_CATEGORY =
  "Home & Garden > Furniture > Beds & Accessories > Mattresses";

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function escapeCsv(value = "") {
  const s = String(value ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatMetaPrice(amount) {
  return `${Number(amount || 0).toFixed(2)} DZD`;
}

function absoluteUrl(path = "") {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildImages(product) {
  const images = (product.images || [])
    .filter(Boolean)
    .map((img) => absoluteUrl(img));

  return {
    main: images[0] || absoluteUrl("/images/placeholder-product.jpg"),
    additional: images.slice(1).join(","),
  };
}

function buildProductType(product) {
  return ["Mattresses", product.category, product.subcategory]
    .filter(Boolean)
    .map((part) => cleanText(part))
    .join(" > ");
}

function buildBaseLink(slug) {
  return `${SITE_URL}/${DEFAULT_LOCALE}/product/${slug}`;
}

function discounted(price, discount) {
  const pct = Number(discount || 0);
  if (pct <= 0) return null;
  return Math.round(price * (1 - pct / 100));
}

function buildRows(products = []) {
  const rows = [];

  for (const product of products) {
    const description = cleanText(product.description);
    const availability = product.available ? "in stock" : "out of stock";
    const productType = buildProductType(product) || "Mattresses";
    const images = buildImages(product);

    // Match the product slug sent by Pixel/CAPI, with one starting price per product.
    const price = Number(
      product.pricingType === "SIMPLE"
        ? (product.basePrice ?? product.minPrice ?? 0)
        : (product.minPrice ?? 0),
    );
    const sale = discounted(price, product.discount);

    rows.push({
      id: product.slug,
      title: `${cleanText(product.name)} | ${BRAND}`,
      description,
      availability,
      condition: "new",
      price: formatMetaPrice(price),
      sale_price: sale !== null ? formatMetaPrice(sale) : "",
      link: buildBaseLink(product.slug),
      image_link: images.main,
      additional_image_link: images.additional,
      brand: BRAND,
      product_type: productType,
      google_product_category: GOOGLE_PRODUCT_CATEGORY,
    });
  }

  return rows;
}

export async function GET() {
  try {
    const products = await getProductsWithDetails({ available: true });
    const rows = buildRows(products);

    const headers = [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "sale_price",
      "link",
      "image_link",
      "additional_image_link",
      "brand",
      "product_type",
      "google_product_category",
    ];

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((key) => escapeCsv(row[key] || "")).join(","),
      ),
    ].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("[meta catalog feed]", error);
    return new Response("Failed to generate catalog feed", { status: 500 });
  }
}
