"use client";

import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { IoBedOutline } from "react-icons/io5";
import { IoCheckmarkCircle } from "react-icons/io5";
import { FiArrowRight } from "react-icons/fi";

import { formatPrice } from "@/utils/helpers";
import { firmnessWord } from "./recommender";

/* Compact, grounded product recommendation — real name, real catalog price,
   real link to the product page. Never shows a product not in the catalog. */
export default function RecommendationCard({ product, content, botLang }) {
  const href = `/${botLang}/product/${product.slug}`;
  const hasDiscount = product.discount > 0 && product.minPrice > product.effectiveMinPrice;

  const firmnessLabel = content.result.firmnessLabels[firmnessWord(product.firmness)];
  const materialLabel = content.result.materialLabels[product.material] || null;

  return (
    <div className="overflow-hidden rounded-md border border-blue-200 bg-white shadow-sm">
      <div className="flex gap-3 p-3">
        <Link
          href={href}
          className="relative h-[86px] w-[86px] flex-shrink-0 overflow-hidden rounded-md bg-blue-50"
        >
          {product.image ? (
            <ProductImage
              src={product.image}
              alt={product.name}
              width={172}
              height={172}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-blue-300">
              <IoBedOutline className="h-8 w-8" />
            </span>
          )}
          {hasDiscount && (
            <span className="absolute start-1 top-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              <bdi>-{product.discount}%</bdi>
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={href}>
            <h4 className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-blue-900">
              {product.name}
            </h4>
          </Link>

          <div className="mt-1 flex flex-wrap gap-1">
            {materialLabel && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-900">
                {materialLabel}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {firmnessLabel}
            </span>
          </div>

          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              {content.result.from}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through">
                <bdi>{formatPrice(product.minPrice, botLang)}</bdi>
              </span>
            )}
            <span className="text-sm font-bold text-blue-900">
              <bdi>{formatPrice(product.effectiveMinPrice, botLang)}</bdi>
            </span>
          </div>
        </div>
      </div>

      {product.reasons?.length > 0 && (
        <ul className="space-y-1 border-t border-blue-100 bg-[var(--color-surface-muted)] px-3 py-2.5">
          {product.reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-1.5 text-[12px] leading-snug text-slate-600">
              <IoCheckmarkCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
              <span>{content.result.reasons[reason]}</span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={href}
        className="flex items-center justify-center gap-1.5 bg-blue-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
      >
        {content.result.viewProduct}
        <FiArrowRight className="h-4 w-4 rtl:rotate-180" />
      </Link>
    </div>
  );
}
