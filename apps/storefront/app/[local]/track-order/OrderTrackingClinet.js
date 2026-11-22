// app/[locale]/track-order/OrderTrackingClinet.js
"use client";

import { useState } from "react";
import { formatPrice } from "@/utils/helpers";
import { trackOrderAction } from "@/lib/actions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const STATUS_STYLES = {
  unconfirmed: "bg-gray-200 text-gray-700",
  confirmed: "bg-blue-100 text-blue-900",
  in_delivering: "bg-amber-100 text-amber-700",
  inDelivering: "bg-amber-100 text-amber-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

/* Normalize DB status key to match whatever shape the translation object uses.
   DB stores snake_case (in_delivering), translations may use camelCase (inDelivering).
   Try both, fall back to the raw key. */
function getStatusLabel(tStatus, statusKey) {
  if (tStatus[statusKey]) return tStatus[statusKey];
  // snake_case → camelCase: in_delivering → inDelivering
  const camel = statusKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  if (tStatus[camel]) return tStatus[camel];
  // camelCase → snake_case: inDelivering → in_delivering
  const snake = statusKey.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);
  if (tStatus[snake]) return tStatus[snake];
  return statusKey;
}

function getStatusStyle(statusKey) {
  if (STATUS_STYLES[statusKey]) return STATUS_STYLES[statusKey];
  const camel = statusKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  if (STATUS_STYLES[camel]) return STATUS_STYLES[camel];
  return "bg-gray-200 text-gray-700";
}

function normalizeOrderCodeInput(value = "") {
  return String(value)
    .trim()
    .toUpperCase()
    .replace(/[‐-―−]/g, "-")
    .replace(/\s*[-]\s*/g, "-")
    .replace(/\s+/g, "");
}

export default function OrderTrackingClient({ locale, translation }) {
  const t = translation.orderTrackingPage;

  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRTL = locale === "ar";

  const handleTrack = async () => {
    const trimmed = normalizeOrderCodeInput(orderId);

    if (!trimmed || !phone.trim()) {
      setError(t.search.error);
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const result = await trackOrderAction(trimmed, phone.trim());

      if (!result) {
        setError(t.search.error);
        return;
      }

      setOrder(result);
    } catch (err) {
      console.error("[handleTrack]", err.message);
      setError(t.search.error);
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = order
    ? Object.keys(t.status).findIndex((key) => {
        // Match both snake_case and camelCase variants
        const camel = order.status.replace(/_([a-z])/g, (_, c) =>
          c.toUpperCase(),
        );
        const snake = order.status.replace(
          /([A-Z])/g,
          (c) => `_${c.toLowerCase()}`,
        );
        return key === order.status || key === camel || key === snake;
      })
    : -1;

  return (
    <div
      className="min-h-screen bg-white pt-24 sm:pt-24 pb-20 px-4 sm:px-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto space-y-10 sm:space-y-14">
        <TrackingHeader header={t.header} />

        <TrackingSearch
          t={t}
          orderId={orderId}
          setOrderId={setOrderId}
          phone={phone}
          setPhone={setPhone}
          locale={locale}
          onTrack={handleTrack}
          error={error}
          loading={loading}
        />

        {order && (
          <TrackingResult
            order={order}
            t={t}
            locale={locale}
            currentIndex={currentIndex}
            isRTL={isRTL}
          />
        )}
      </div>
    </div>
  );
}

/* 
   HEADER
 */

function TrackingHeader({ header }) {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
        {header.title}
      </h1>
      <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
        {header.description}
      </p>
    </div>
  );
}

/* 
   SEARCH
 */

function TrackingSearch({ t, orderId, setOrderId, phone, setPhone, locale, onTrack, error, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onTrack();
  };

  return (
    <div className="bg-white rounded-md sm:rounded-md p-5 sm:p-6 shadow-md border border-blue-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          name="orderId"
          placeholder={t.search.placeholder}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />

        <Input
          name="phone" type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={locale==='ar'?'رقم الهاتف في الطلب':locale==='en'?'Order phone number':'Téléphone de la commande'}
          className="flex-1"
        />
        <Button
          variant="cta"
          size="md"
          onClick={onTrack}
          disabled={loading}
          className="w-full sm:w-auto sm:min-w-[160px]"
        >
          {loading ? t.search.loading || "..." : t.search.button}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

/* 
   RESULT
 */

function TrackingResult({ order, t, locale, currentIndex, isRTL }) {
  return (
    <div className="bg-white rounded-md sm:rounded-md p-6 sm:p-8 shadow-md border border-blue-200 space-y-8">
      <OrderInfo order={order} t={t} locale={locale} isRTL={isRTL} />

      <TrackingProgress
        steps={t.steps}
        currentIndex={currentIndex}
        isRTL={isRTL}
      />

      <StatusMessage message={t.messages[order.status]} />
    </div>
  );
}

/* 
   ORDER INFO
 */

function OrderInfo({ order, t, locale, isRTL }) {
  const customerName = order.customer
    ? `${order.customer.firstName} ${order.customer.lastName}`
    : "—";

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-5 flex-wrap items-start">
      <InfoBlock label={t.details.orderId} value={order.orderCode} />
      <InfoBlock label={t.details.customer} value={customerName} />
      <InfoBlock
        label={t.details.total}
        value={formatPrice(order.total, locale)}
      />

      <span
        className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap self-start ${
          isRTL ? "self-end sm:self-start" : ""
        } ${getStatusStyle(order.status)}`}
      >
        {getStatusLabel(t.status, order.status)}
      </span>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-600">{label}</p>
      <p className="font-medium text-sm sm:text-base mt-1">{value}</p>
    </div>
  );
}

/* 
   PROGRESS
 */

function TrackingProgress({ steps, currentIndex, isRTL }) {
  const entries = Object.entries(steps);

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden sm:block">
        <div className="relative flex items-center">
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-blue-50" />

          <div
            className="absolute top-3 h-0.5 bg-blue-900 transition-all"
            style={{
              width:
                currentIndex >= 0
                  ? `${(currentIndex / (entries.length - 1)) * 100}%`
                  : "0%",
              right: isRTL ? 0 : "auto",
              left: isRTL ? "auto" : 0,
            }}
          />

          {entries.map(([key, label], index) => {
            const active = index <= currentIndex;

            return (
              <div
                key={key}
                className="flex-1 flex flex-col items-center relative z-10"
              >
                <div
                  className={`w-6 h-6 rounded-full transition ${
                    active ? "bg-blue-900" : "bg-blue-50"
                  }`}
                />

                <p
                  className={`mt-3 text-xs text-center ${
                    active ? "text-blue-900 font-medium" : "text-slate-500"
                  }`}
                >
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE */}
      <div className="sm:hidden space-y-6 relative">
        {entries.map(([key, label], index) => {
          const active = index <= currentIndex;

          return (
            <div key={key} className="flex items-start gap-4 relative">
              {index !== entries.length - 1 && (
                <div
                  className={`absolute ${
                    isRTL ? "right-3" : "left-3"
                  } top-6 w-0.5 h-full ${
                    active ? "bg-blue-900" : "bg-blue-50"
                  }`}
                />
              )}

              <div
                className={`w-6 h-6 rounded-full mt-1 z-10 ${
                  active ? "bg-blue-900" : "bg-blue-50"
                }`}
              />

              <p
                className={`text-xs ${
                  active ? "text-slate-900" : "text-slate-600"
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* 
   STATUS MESSAGE
 */

function StatusMessage({ message }) {
  return <div className="text-center text-sm text-slate-900">{message}</div>;
}
