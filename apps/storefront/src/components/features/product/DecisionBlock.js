"use client";

import { useProduct } from "./ProductContext";

export default function DecisionBlock() {
  const { product, locale } = useProduct();
  const keyPoints = product.details?.keyPoints ?? [];

  if (!keyPoints.length) return null;

  return (
    <section className="bg-white border-t border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6 text-slate-900">
          Is this mattress right for you?
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {keyPoints.map((point, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5 text-blue-900"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {point.translations?.[locale] ??
                  point.translations?.en ??
                  point}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
