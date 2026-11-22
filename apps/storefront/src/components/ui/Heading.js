/**
 * Heading.js — Unified heading component
 * ─────────────────────────────────────────────────────────────────────────
 * PROBLEM SOLVED:
 *   Across the project, the same semantic level had different sizes on
 *   different pages:
 *     - h1: text-2xl (OrderSuccess) vs text-xl sm:text-2xl lg:text-3xl (EmptyCart/Product)
 *             vs text-2xl sm:text-3xl lg:text-4xl (TrackOrder)
 *     - h2: text-base sm:text-lg (CheckoutForm) vs text-lg sm:text-xl (CartSummary)
 *             vs text-xl sm:text-2xl lg:text-3xl (TechnicalSpecs/WhyChoose)
 *     - Section titles: text-2xl sm:text-3xl lg:text-4xl (ProductsSection)
 *             vs text-2xl sm:text-3xl lg:text-5xl (FinalCTA)
 *
 * SCALE (mobile → desktop):
 *
 *   display  — Hero/landing only. clamp-based fluid.
 *              text-[clamp(34px,8vw,76px)]
 *
 *   h1       — Page title (one per page: product name, page hero, order success)
 *              text-2xl sm:text-3xl lg:text-4xl
 *
 *   h2       — Section title (major sections: Why Choose, Specs, Related, Cart title)
 *              text-xl sm:text-2xl lg:text-3xl
 *
 *   h3       — Sub-section / card title (checkout form sections, order summary title)
 *              text-base sm:text-lg
 *
 *   h4       — Small label heading (product card name, cart item name)
 *              text-sm sm:text-base
 *
 * USAGE — standard:
 *   <Heading as="h1">Product Name</Heading>
 *   <Heading as="h2" className="mb-8">Section Title</Heading>
 *   <Heading as="h3" size="h2">Override size while keeping semantic tag</Heading>
 *   <Heading as="h1" size="display">Hero Headline</Heading>
 *
 * USAGE — motion elements (Framer Motion owns the tag, can't wrap):
 *   import { headingClasses } from "@/components/ui/Heading";
 *
 *   <motion.h1 className={headingClasses({ size: "display", className: "mt-8" })}>
 *   <motion.h2 className={headingClasses({ size: "h1", color: "brand", className: "mb-5" })}>
 *   <motion.h3 className={headingClasses({ size: "h2", className: "mb-6" })}>
 *
 * PROPS:
 *   as        — HTML tag: "h1" | "h2" | "h3" | "h4" | "p" | "span" (default: "h2")
 *   size      — Visual size scale: "display" | "h1" | "h2" | "h3" | "h4"
 *               Defaults to match `as` if not provided.
 *   weight    — "semibold" (default) | "bold"
 *   color     — "default" (slate-900) | "brand" (blue-900) | "muted" | "white" | "inherit"
 *   className — Additional Tailwind classes (spacing, margin, etc.)
 *   children  — Content
 * ─────────────────────────────────────────────────────────────────────────
 */

const SIZE_CLASSES = {
  display: "text-[clamp(34px,8vw,76px)] leading-[1.02] tracking-[-0.03em]",
  h1: "text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight",
  h2: "text-xl sm:text-2xl lg:text-3xl leading-snug tracking-tight",
  h3: "text-base sm:text-lg leading-snug",
  h4: "text-sm sm:text-base leading-snug",
};

const WEIGHT_CLASSES = {
  semibold: "font-semibold",
  bold: "font-bold",
};

const COLOR_CLASSES = {
  default: "text-slate-900",
  brand: "text-blue-900",
  muted: "text-slate-500",
  white: "text-white",
  inherit: "",
};

/**
 * headingClasses — returns the same class string Heading uses.
 * Use this on motion elements where you can't swap the tag.
 *
 * @example
 * <motion.h2 className={headingClasses({ size: "h1", className: "mb-6" })}>
 */
export function headingClasses({
  size = "h2",
  weight = "semibold",
  color = "default",
  className = "",
} = {}) {
  return [
    SIZE_CLASSES[size] || SIZE_CLASSES.h2,
    WEIGHT_CLASSES[weight] || WEIGHT_CLASSES.semibold,
    COLOR_CLASSES[color] || COLOR_CLASSES.default,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Heading({
  as: Tag = "h2",
  size,
  weight = "semibold",
  color = "default",
  className = "",
  children,
  ...props
}) {
  const resolvedSize = size || Tag;
  const classes = headingClasses({
    size: resolvedSize,
    weight,
    color,
    className,
  });

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
