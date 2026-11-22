import Button from "@/components/ui/Button";
import { formatPrice } from "@/utils/helpers";

function CartSummary({ data, actions, i18n = {}, locale }) {
  const { total, totalQuantity, totalSavings } = data;
  const { checkout } = actions;

  const {
    title,
    items,
    totalSavings: savingsLabel,
    delivery,
    free,
    total: totalLabel,
    checkout: checkoutLabel,
  } = i18n;

  const isRTL = locale === "ar";

  return (
    <div
      className="
      bg-white
      rounded-md sm:rounded-md
      p-5 sm:p-6 lg:p-8
      border border-blue-200
      shadow-[0_18px_50px_rgba(3,26,74,0.08)]
      lg:sticky lg:top-24
    "
    >
      {/* TITLE */}
      <div className="mb-6 border-b border-blue-100 pb-5 sm:mb-8">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-blue-700">
          Empreinte Flex
        </p>
        <h2 className="text-lg font-semibold text-blue-950 sm:text-xl">
          {title}
        </h2>
      </div>

      {/* ITEMS */}
      <div className="flex justify-between text-xs sm:text-sm mb-3 sm:mb-4">
        <span className="text-slate-500">
          {items} ({totalQuantity})
        </span>

        <span className="text-slate-900 font-medium">
          {formatPrice(total, locale)}
        </span>
      </div>

      {/* SAVINGS */}
      {totalSavings > 0 && (
        <div className="flex justify-between text-xs sm:text-sm mb-3 sm:mb-4 text-red-600 font-semibold">
          <span>{savingsLabel}</span>
          <span>- {formatPrice(totalSavings, locale)}</span>
        </div>
      )}

      {/* DELIVERY */}
      <div className="flex justify-between text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6">
        <span>{delivery}</span>
        <span className="text-slate-900 font-medium">{free}</span>
      </div>

      <div className="border-t border-blue-200 my-5 sm:my-6" />

      {/* TOTAL */}
      <div className="flex justify-between items-center">
        <span className="text-base sm:text-lg font-semibold text-slate-900">
          {totalLabel}
        </span>

        <span className="text-xl sm:text-2xl font-bold text-blue-900">
          {formatPrice(total, locale)}
        </span>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-slate-500">
        {i18n.secure}
      </p>

      {/* CTA */}
      <Button
        className="mt-6 sm:mt-8"
        variant="cta"
        size="lg"
        fullWidth
        onClick={checkout}
      >
        {checkoutLabel}
      </Button>
    </div>
  );
}

export default CartSummary;
