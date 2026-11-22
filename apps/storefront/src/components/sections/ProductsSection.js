// ─────────────────────────────────────────────────────────────────────────────
// FILE 5 — ProductsSectionClient.jsx
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import ProductCard from "../features/products/ProductCard";
import { SECTION_BG } from "@/lib/sectionBackground";

const GRID_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 44 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const HEADER_VARIANTS = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

function LuxuryProductCard({ product, translation, locale, isFirst }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`group relative ${isFirst ? "sm:col-span-2 lg:col-span-1" : ""}`}
      variants={CARD_VARIANTS}
      whileHover={
        prefersReducedMotion
          ? {}
          : { y: -3, transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] } }
      }
    >
      <ProductCard
        product={product}
        translation={translation}
        locale={locale}
      />
    </motion.div>
  );
}

export default function ProductsSectionClient({
  translation,
  locale,
  enhancedProducts,
}) {
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const gridInView = useInView(gridRef, { once: true, amount: 0.1 });

  const prefersReducedMotion = useReducedMotion();

  const {
    title,
    desc,
    viewAll,
    productCard: productCardTranslation,
  } = translation.home.products;

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24 lg:py-36"
      id="collections"
      style={{ background: "white" }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <motion.div
          ref={headerRef}
          className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between lg:mb-12"
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate={headerInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.18 } },
          }}
        >
          <motion.div
            className="text-center sm:text-start max-w-lg"
            variants={HEADER_VARIANTS}
            transition={{ duration: 0.75, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <Heading as="h2">{title}</Heading>
            <p className="text-slate-600 mt-3 sm:mt-4 max-w-md mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed">
              {desc}
            </p>
          </motion.div>

          <motion.div
            className="w-full sm:w-auto"
            variants={HEADER_VARIANTS}
            transition={{ duration: 0.75, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <Button
              href={`/${locale}/mattresses`}
              variant="secondary"
              size="md"
              fullWidth
              className="sm:w-auto"
            >
              {viewAll}
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          ref={gridRef}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-14"
          variants={GRID_VARIANTS}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate={gridInView ? "visible" : "hidden"}
        >
          {enhancedProducts?.map((product, index) => (
            <LuxuryProductCard
              key={product.id}
              product={product}
              translation={productCardTranslation}
              locale={locale}
              index={index}
              isFirst={index === 0}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
