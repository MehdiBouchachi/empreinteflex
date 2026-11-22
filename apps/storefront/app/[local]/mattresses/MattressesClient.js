"use client";

import { useState } from "react";
import Filters from "@/components/features/products/Filters";
import ProductGrid from "@/components/features/products/ProductGrid";
import Pagination from "@/components/features/products/Pagination";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Heading from "@/components/ui/Heading";

import { filterProducts } from "@/lib/filterProducts";
import { itemsPerPage } from "@/constants/products";
import { getAvailableSizes } from "@/lib/mattress-sizes";

/* ── ICONS ────────────────────────────────────────────────────────────── */
function IconGrid2() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="16" height="5" rx="1.5" fill="currentColor" />
      <rect x="1" y="7.5" width="16" height="5" rx="1.5" fill="currentColor" />
      <rect x="1" y="14" width="16" height="3" rx="1.5" fill="currentColor" />
    </svg>
  );
}

/* ── PRICE EXTRACTOR — pricing_type aware ─────────────────────────────────
   SIMPLE            → basePrice (with discount applied if any)
   VARIANT_DIMENSION → priceRange.min or from details
   VARIANT_FULL      → priceRange.min or from details
   Fallback: minPrice field computed by data service
────────────────────────────────────────────────────────────────────────── */
function getProductMinPrice(p) {
  const pricingType =
    p.pricingType || (p.basePrice != null ? "SIMPLE" : "VARIANT_FULL");

  if (pricingType === "SIMPLE") {
    const raw = Number(p.basePrice) || 0;
    const discountPct = Number(p.discount) || 0;
    return discountPct > 0 ? Math.round(raw * (1 - discountPct / 100)) : raw;
  }

  // VARIANT_FULL or VARIANT_DIMENSION
  if (p.priceRange?.min != null) return p.priceRange.min;
  if (p.minPrice != null) return p.minPrice;

  // Last fallback: compute from details
  if (p.details?.dimensions) {
    const all = p.details.dimensions.flatMap(
      (d) => d.options?.map((o) => o.price) ?? [],
    );
    return all.length ? Math.min(...all) : 0;
  }

  return 0;
}

/* ======================================================
   MAIN PAGE
====================================================== */
export default function MattressesClient({
  locale,
  translation,
  searchParams,
  products,
  categories,
  dimensions,
  thicknesses,
}) {
  const [mobileLayout, setMobileLayout] = useState("grid");
  const [sortOrder, setSortOrder] = useState("default");

  const isRTL = locale === "ar";
  const availableSizes = new Set(getAvailableSizes(products).map(({ size }) => size));

  /* ================= URL FILTERS ================= */
  const filters = {
    category: searchParams?.category || "all",
    subcategory: searchParams?.subcategory || "all",
    minPrice: searchParams?.min ? Number(searchParams.min) : 0,
    maxPrice: searchParams?.max ? Number(searchParams.max) : Infinity,
    size: searchParams?.size || "",
    thickness: searchParams?.thickness ? Number(searchParams.thickness) : null,
    page: searchParams?.page ? Number(searchParams.page) : 1,
  };

  /* ================= FILTER ================= */
  const filteredProducts = filterProducts(products, filters);

  /* ================= SORT ================= */
  const sortedProducts =
    sortOrder === "default"
      ? filteredProducts
      : [...filteredProducts].sort((a, b) =>
          sortOrder === "asc"
            ? getProductMinPrice(a) - getProductMinPrice(b)
            : getProductMinPrice(b) - getProductMinPrice(a),
        );

  /* ================= PAGINATE ================= */
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (filters.page - 1) * itemsPerPage,
    filters.page * itemsPerPage,
  );

  const {
    mattressesPage: {
      breadcrumbHome,
      breadcrumbCurrent,
      title,
      description,
      showing,
      products: productsLabel,
      filters: filtersTranslation,
    },
    home: {
      products: { productCard: productCardTranslation },
    },
  } = translation;

  return (
    <div className="min-h-screen bg-[var(--color-surface-muted)]">
      <PageHeader
        locale={locale}
        title={title}
        description={description}
        breadcrumbItems={[
          { label: breadcrumbHome, href: `/${locale}` },
          { label: breadcrumbCurrent },
        ]}
      />

      {/* FILTERS */}
      <Filters
        locale={locale}
        filtersTranslation={filtersTranslation}
        categories={categories}
        dimensions={dimensions.filter((dimension) => availableSizes.has(dimension.label))}
        thicknesses={thicknesses}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {/* PRODUCTS */}
      <section
        className="overflow-hidden border-t border-[rgba(var(--rgb-brand-border),0.7)] bg-white py-8 sm:py-10"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* ── COUNT + TOGGLE ROW ── */}
          <div className="mb-6 flex items-end justify-between border-b border-[rgba(var(--rgb-brand-border),0.65)] pb-4 sm:mb-8 sm:pb-5">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-900 sm:text-xs">
                {isRTL ? "المراتب" : locale === "fr" ? "Les matelas" : "Mattresses"}
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">
              {showing}{" "}
              <span className="font-medium text-slate-700">
                {paginatedProducts.length}
              </span>{" "}
              {productsLabel}
              </p>
            </div>

            {/* Layout toggle — mobile only */}
            <div className="flex sm:hidden items-center gap-1 p-0.5 bg-blue-50 rounded-md border border-blue-100">
              <button
                onClick={() => setMobileLayout("grid")}
                aria-label="2-column grid"
                aria-pressed={mobileLayout === "grid"}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-md
                  transition-all duration-300 ease-out
                  ${
                    mobileLayout === "grid"
                      ? "bg-blue-900 text-white shadow-sm"
                      : "text-slate-400 hover:text-blue-600"
                  }
                `}
              >
                <IconGrid2 />
              </button>
              <button
                onClick={() => setMobileLayout("list")}
                aria-label="Single column list"
                aria-pressed={mobileLayout === "list"}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-md
                  transition-all duration-300 ease-out
                  ${
                    mobileLayout === "list"
                      ? "bg-blue-900 text-white shadow-sm"
                      : "text-slate-400 hover:text-blue-600"
                  }
                `}
              >
                <IconList />
              </button>
            </div>
          </div>

          <ProductGrid
            products={paginatedProducts}
            productCardTranslation={productCardTranslation}
            locale={locale}
            mobileLayout={mobileLayout}
          />

          <div className="mt-10 sm:mt-14 lg:mt-16">
            <Pagination totalPages={totalPages} page={filters.page} />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ======================================================
   PAGE HEADER
====================================================== */
function PageHeader({ locale, title, description, breadcrumbItems }) {
  return (
    <section className="border-b border-[rgba(var(--rgb-brand-border),0.75)] bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-9 pt-[clamp(5.5rem,11vh,7rem)] sm:px-8 sm:pb-10 lg:pb-12">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mt-7 max-w-3xl sm:mt-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--color-danger)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-900">
              {locale === "fr" ? "Notre collection" : locale === "ar" ? "مجموعتنا" : "Our collection"}
            </span>
          </div>
          <Heading as="h1" size="h1" color="brand" className="mb-3">
            {title}
          </Heading>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
