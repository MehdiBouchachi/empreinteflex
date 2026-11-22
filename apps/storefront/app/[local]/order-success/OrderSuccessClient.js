"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/helpers";
import { getOrderByCodeAction } from "@/lib/actions";
import Button from "@/components/ui/Button";

export default function OrderSuccessClient({ locale, translation }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const orderCode = localStorage.getItem("lastOrderCode");

      if (!orderCode) {
        router.push(`/${locale}`);
        return;
      }

      try {
        const fetchedOrder = await getOrderByCodeAction(orderCode, localStorage.getItem("lastOrderToken"));

        if (!fetchedOrder) {
          router.push(`/${locale}`);
          return;
        }

        setOrder(fetchedOrder);
      } catch (error) {
        console.error("[OrderSuccess] Failed to fetch order:", error.message);
        router.push(`/${locale}`);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [locale, router]);

  if (loading) return <LoadingSkeleton />;
  if (!order) return null;

  const { header, details, infoBox, button } = translation;

  const handleGoHome = () => {
    localStorage.removeItem("lastOrderCode");
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 pt-24 lg:pt-32 pb-16 sm:pb-20">
      <div className="max-w-3xl mx-auto">
        <SuccessHeader header={header} />

        <div className="rounded-md border border-blue-200 bg-white p-6 shadow-[0_18px_50px_rgba(var(--rgb-brand-primary),0.06)] sm:p-8 lg:p-10">
          <OrderMeta
            locale={locale}
            order={order}
            details={details}
            isRTL={locale === "ar"}
          />

          <OrderFinancialSummary locale={locale} order={order} />

          <OrderItems locale={locale} items={order.items} />

          <InfoBox infoBox={infoBox} />

          <Button variant="cta" size="lg" fullWidth onClick={handleGoHome}>
            {button}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 pt-24 lg:pt-32 pb-16 sm:pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <div className="mx-auto mb-6 h-16 w-16 animate-pulse rounded-full bg-blue-100" />
          <div className="mx-auto mb-3 h-7 w-48 animate-pulse rounded-md bg-blue-100" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded-md bg-blue-50" />
        </div>

        <div className="rounded-md border border-blue-200 bg-white p-6 shadow-[0_15px_40px_rgba(var(--rgb-black),0.05)] lg:p-8">
          <div className="flex justify-between mb-8">
            <div>
              <div className="mb-2 h-3 w-24 animate-pulse rounded bg-blue-50" />
              <div className="h-6 w-32 animate-pulse rounded bg-blue-100" />
            </div>
            <div className="text-right">
              <div className="mb-2 h-3 w-16 animate-pulse rounded bg-blue-50" />
              <div className="h-7 w-28 animate-pulse rounded bg-blue-100" />
            </div>
          </div>

          <div className="mb-8 h-28 animate-pulse rounded-md bg-blue-50" />

          <div className="space-y-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex justify-between border-b border-blue-200 pb-4"
              >
                <div>
                  <div className="mb-2 h-4 w-36 animate-pulse rounded bg-blue-50" />
                  <div className="h-3 w-24 animate-pulse rounded bg-blue-50/60" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-blue-50" />
              </div>
            ))}
          </div>

          <div className="mb-8 h-24 animate-pulse rounded-md bg-blue-50" />
          <div className="h-12 animate-pulse rounded-md bg-blue-100" />
        </div>
      </div>
    </div>
  );
}

function SuccessHeader({ header }) {
  return (
    <div className="text-center mb-8 sm:mb-10">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-800 text-xl text-white shadow-md">
        ✓
      </div>
      <h1 className="mb-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
        {header.title}
      </h1>
      <p className="text-sm sm:text-base text-slate-600">
        {header.description}
      </p>
    </div>
  );
}

function OrderMeta({ locale, order, details, isRTL }) {
  return (
    <div className="flex justify-between items-start mb-8 sm:mb-10 flex-wrap gap-6">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-[0.16em]">
          {details.orderNumber}
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{order.id}</p>
      </div>

      <div className={isRTL ? "text-left" : "text-right"}>
        <p className="text-xs text-slate-500 uppercase tracking-[0.16em]">
          {details.total}
        </p>
        <p className="mt-2 text-2xl font-bold text-blue-900 sm:text-3xl">
          {formatPrice(order.summary.totalPrice, locale)}
        </p>
      </div>
    </div>
  );
}

function OrderFinancialSummary({ locale, order }) {
  const labels = {
    fr: { title: 'Récapitulatif de la commande', intro: 'Montant de votre commande. Paiement à la livraison.', subtotal: 'Sous-total', discount: 'Réduction', total: 'Total de la commande', coupon: 'Code appliqué' },
    en: { title: 'Order summary', intro: 'Your order total. Pay on delivery.', subtotal: 'Subtotal', discount: 'Discount', total: 'Order total', coupon: 'Applied code' },
    ar: { title: 'ملخص الطلب', intro: 'إجمالي الطلب، الدفع عند الاستلام.', subtotal: 'المجموع الفرعي', discount: 'التخفيض', total: 'إجمالي الطلب', coupon: 'الرمز المطبق' },
  }[locale] || { title: 'Order summary', intro: 'Pay on delivery.', subtotal: 'Subtotal', discount: 'Discount', total: 'Order total', coupon: 'Applied code' };
  const subtotal = Number(
    order.summary?.subtotalPrice || order.summary?.totalPrice || 0,
  );
  const discountAmount = Number(order.summary?.discountAmount || 0);
  const discountPercent = Number(order.summary?.discountPercent || 0);
  const total = Number(order.summary?.totalPrice || 0);
  const couponCode = order.summary?.couponCode || null;

  return (
    <div className="mb-8 rounded-md border border-blue-200 bg-slate-50 p-5 sm:mb-10 sm:p-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {labels.title}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {labels.intro}
          </p>
        </div>

        {couponCode && discountAmount > 0 && (
          <div className="inline-flex items-center rounded-full border border-green-100 bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 sm:text-sm">
            {labels.coupon} : {couponCode}
            {discountPercent > 0 && (
              <span className="ml-1">· {discountPercent}%</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <Row label={labels.subtotal} value={formatPrice(subtotal, locale)} />

        {discountAmount > 0 && (
          <Row
            label={labels.discount}
            value={`-${formatPrice(discountAmount, locale)}`}
            valueClassName="text-green-600"
          />
        )}

        <div className="border-t border-blue-100 pt-3">
          <Row
            label={labels.total}
            value={formatPrice(total, locale)}
            labelClassName="font-semibold text-slate-900"
            valueClassName="text-lg font-bold text-blue-900"
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, labelClassName = "", valueClassName = "" }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm sm:text-base">
      <span className={`text-slate-600 ${labelClassName}`}>{label}</span>
      <span className={`font-medium text-slate-900 ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

function OrderItems({ locale, items }) {
  return (
    <div className="space-y-6 mb-8">
      {items.map((item) => (
        <OrderItem
          key={`${item.id}-${item.size}-${item.thickness}-${item.density || "default"}`}
          locale={locale}
          item={item}
        />
      ))}
    </div>
  );
}

function OrderItem({ locale, item }) {
  const { size, name, quantity, price, thickness, density } = item;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-blue-200 pb-5 last:border-none">
      <div>
        <p className="text-sm font-medium text-slate-900 sm:text-base">
          {name}
        </p>
        <div className="text-xs sm:text-sm text-slate-600 mt-1.5 space-y-1">
          {density && <p>{density}</p>}
          <p>
            <span dir="ltr">{size}</span>
            {thickness && (
              <>
                {" × "}
                <span dir="ltr">{thickness} cm</span>
              </>
            )}
            {" × "}
            <span dir="ltr">{quantity}</span>
          </p>
        </div>
      </div>

      <p className="whitespace-nowrap text-sm font-semibold text-blue-900 sm:text-base">
        {formatPrice(price * quantity, locale)}
      </p>
    </div>
  );
}

function InfoBox({ infoBox }) {
  return (
    <div className="mb-8 rounded-md border border-blue-200 bg-blue-50 p-5 text-sm leading-relaxed text-slate-600 sm:p-6">
      {infoBox.text}
      <br />
      {infoBox.payment}{" "}
      <span className="font-medium text-blue-900">{infoBox.paymentMethod}</span>
      .
    </div>
  );
}
