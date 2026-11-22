import { formatPrice } from "@/utils/helpers";
import ProductImage from "@/components/ui/ProductImage";
import QuantitySelector from "./QuantitySelector";

function CartItemCard({ data, actions, i18n = {}, locale }) {
  const {
    id,
    size,
    thickness,
    density, // ✅ NEW
    name,
    image,
    price,
    oldPrice,
    quantity,
  } = data;

  const { increase, decrease, remove: removeAction } = actions;

  const {
    size: sizeLabel,
    thickness: thicknessLabel,
    save,
    each,
    remove,
  } = i18n;

  const isRTL = locale === "ar";
  const hasDiscount = oldPrice && oldPrice > price;

  return (
    <div
      className="
      bg-white
      rounded-md sm:rounded-md
      p-4 sm:p-5 lg:p-6
      border border-blue-200
      shadow-sm hover:shadow-md
      transition
    "
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* IMAGE */}
        <div
          className="
          relative
          w-full sm:w-28 lg:w-32
          h-28 sm:h-28 lg:h-32
          rounded-md sm:rounded-md
          overflow-hidden
          bg-blue-50
          shrink-0
        "
        >
          <ProductImage src={image} alt={name} fill className="object-cover" />
        </div>

        <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
          {/* LEFT SIDE */}
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2 leading-snug">
              {name}
            </h3>

            {/* OPTIONS */}
            <div className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-5 space-y-1">
              {/* DENSITY (ONLY CLASSIC) */}
              {density && (
                <p>
                  Density: <span>{density}</span>
                </p>
              )}

              {/* SIZE */}
              <p>
                {sizeLabel}: <span dir="ltr">{size}</span>
                {isRTL ? " سم" : " cm"}
              </p>

              {/* THICKNESS */}
              {thickness && (
                <p>
                  {thicknessLabel}: <span dir="ltr">{thickness}</span>{" "}
                  {isRTL ? " سم" : " cm"}
                </p>
              )}
            </div>

            <QuantitySelector
              data={{ quantity }}
              actions={{
                increase: () =>
                  increase(id, size, thickness, density, quantity),
                decrease: () => decrease(id, size, thickness, density),
                remove: () => removeAction(id, size, thickness, density),
              }}
              i18n={{ remove }}
            />
          </div>

          {/* RIGHT SIDE */}
          <div
            className={`
              ${isRTL ? "sm:text-left" : "sm:text-right"}
              text-left sm:text-right
              mt-2 sm:mt-0
            `}
          >
            <p className="text-lg sm:text-xl font-bold text-blue-900">
              {formatPrice(price * quantity, locale)}
            </p>

            {hasDiscount && (
              <>
                <p className="text-xs sm:text-sm text-slate-400 line-through mt-1">
                  {formatPrice(oldPrice * quantity, locale)}
                </p>

                <p className="text-xs sm:text-sm text-red-600 mt-1 font-semibold">
                  {save} {formatPrice((oldPrice - price) * quantity, locale)}
                </p>
              </>
            )}

            <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3">
              {formatPrice(price, locale)} {each}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItemCard;
