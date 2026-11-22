"use client";

import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartTotal,
  clearCart,
} from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import { checkoutOrderAction } from "@/lib/actions";
import { trackMetaEvent } from "@/lib/meta-pixel"; // ← NEW: Meta Pixel
import BackTitle from "@/components/ui/BackTitle";
import OrderSummary from "@/components/features/checkout/OrderSummary";
import CheckoutForm from "@/components/features/checkout/CheckoutForm";
import { splitFullName } from "@/lib/customer-name";

function toNullable(value) {
  const trimmed = typeof value === "string" ? value.trim() : value;
  return trimmed ? trimmed : null;
}

export default function CheckoutClient({ locale, translation = {} }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const items = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { header, contact, shipping, payment, button, summary } = translation;

  const handleSubmit = useCallback(
    async (fields) => {
      if (!items.length) {
        alert("Your cart is empty.");
        return;
      }

      setIsSubmitting(true);

      try {
        const idempotencyKey = window.localStorage.getItem("ef_checkout_request") || crypto.randomUUID();
        window.localStorage.setItem("ef_checkout_request", idempotencyKey);
        const orderData = {
          idempotencyKey,
          customer: {
            ...splitFullName(fields.fullName),
            email: toNullable(fields.email),
            phone: fields.phone.trim(),
          },
          shipping: {
            wilaya: toNullable(fields.wilaya),
            city: toNullable(fields.city),
            street: null,
            mapLink: null,
          },
          payment: {
            method: "cash_on_delivery",
            status: "pending",
          },
          coupon: null,
          items: items.map((item) => ({
            productId: item.id,
            variantId: item.variantId,
            slug: item.slug,
            name: item.name,
            size: item.size,
            thickness: item.thickness,
            density: item.density || null,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
          summary: {
            itemsCount: items.length,
            totalQuantity: items.reduce((t, i) => t + i.quantity, 0),
            subtotalPrice: cartTotal,
            discountAmount: 0,
            discountPercent: 0,
            couponCode: null,
            totalPrice: cartTotal,
          },
          status: "unconfirmed",
        };

        const result = await checkoutOrderAction(orderData);

        if (result.success) {
          // ── Track Purchase event before navigating ──
          // CRITICAL: content_ids MUST use item.slug (NOT item.id)
          trackMetaEvent("Purchase", {
            content_ids: items.map((item) => item.slug), // ✓ Using slugs
            content_type: "product",
            value: cartTotal,
            currency: "DZD",
            num_items: items.reduce((t, i) => t + i.quantity, 0),
          });

          localStorage.setItem("lastOrderCode", result.orderCode);
          localStorage.setItem("lastOrderToken", result.trackingToken);
          localStorage.removeItem("ef_checkout_request");
          dispatch(clearCart());
          router.push(`/${locale}/order-success`);
        }
      } catch (error) {
        console.error("[checkout]", error.message);
        alert("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [items, cartTotal, locale, dispatch, router],
  );

  return (
    <div className="relative min-h-screen bg-white">
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28 lg:px-8 lg:pb-16 lg:pt-36">
        <BackTitle
          locale={locale}
          onBack={() => router.back()}
          title={header.title}
          backLabel={header.back}
        />

        <div className="mt-6 grid grid-cols-1 items-start gap-8 sm:mt-8 sm:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="order-1">
            <CheckoutForm
              data={{ isSubmitting }}
              actions={{
                change: () => {},
                submit: handleSubmit,
              }}
              i18n={{ contact, shipping, payment, button }}
            />
          </div>

          <div className="order-2 lg:sticky lg:top-24">
            <OrderSummary
              data={{
                locale,
                items,
                subtotal: cartTotal,
                total: cartTotal,
              }}
              i18n={summary}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
