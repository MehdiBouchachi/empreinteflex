// lib/meta-capi.js
//
// Server-side Meta Conversions API — reports Purchase events for orders that
// never touch the browser (agent console, WhatsApp), which the client-side
// pixel in lib/meta-pixel.js can never see. Skips cleanly if unconfigured.

import "server-only";
import crypto from "crypto";
import { toWhatsappDigits } from "@/lib/phone";

const CAPI_PIXEL_ID =
  process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
const CAPI_TOKEN = process.env.META_CAPI_TOKEN;
const GRAPH_VERSION = "v21.0";

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");
}

/**
 * Fire a server-side Purchase event to Meta CAPI.
 * Never throws — logs and returns on failure so order creation is unaffected.
 */
export async function sendPurchaseCapiEvent({
  orderCode,
  value,
  currency = "DZD",
  contentIds = [],
  customer = {},
}) {
  if (!CAPI_PIXEL_ID || !CAPI_TOKEN) return;

  try {
    const userData = { client_ip_address: undefined, client_user_agent: undefined };
    if (customer.email) userData.em = [sha256(customer.email)];
    const phone = toWhatsappDigits(customer.phone);
    if (phone) userData.ph = [sha256(phone)];

    const body = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: orderCode,
          action_source: "other",
          user_data: userData,
          custom_data: {
            currency,
            value: Number(value) || 0,
            content_ids: contentIds.filter(Boolean),
            content_type: "product",
            order_id: orderCode,
          },
        },
      ],
    };

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${CAPI_PIXEL_ID}/events?access_token=${CAPI_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[meta-capi] request failed", res.status, text);
    }
  } catch (error) {
    console.error("[meta-capi] send failed", error.message);
  }
}
