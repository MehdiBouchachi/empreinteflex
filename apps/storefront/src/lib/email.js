import { Resend } from "resend";
import { generateCustomerOrderPDF, generateInternalOrderPDF } from "@/lib/pdf";
import { customerName, displayValue, escapeHtml, itemDetails } from "./order-document.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_COLORS = {
  surface: "#EEF2FB",
  surfaceBase: "#ffffff",
  primary: "#1A3C9E",
  primaryDark: "#162F80",
  primaryBorder: "#C7D7F5",
  accent: "#DC2626",
  text: "#111827",
  muted: "#64748b",
  soft: "#94a3b8",
  warning: "#d97706",
  success: "#16A34A",
  shadowPrimary: "rgba(26,60,158,0.08)",
  accentLine: "rgba(199,215,245,0.25)",
};

function formatPrice(value) {
  const number = Number(value || 0);
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 })
    .format(number)
    .replace(/\u202f/g, " ")
    .replace(/\u00a0/g, " ")} DA`;
}

export async function sendOrderEmail(orderData, orderCode) {
  const { customer, shipping, payment, items, summary } = orderData;
  const name = customerName(customer);
  const customerEmail = displayValue(customer.email, "");

  const subtotalPrice = Number(
    summary?.subtotalPrice || summary?.totalPrice || 0,
  );
  const discountAmount = Number(summary?.discountAmount || 0);
  const discountPercent = Number(summary?.discountPercent || 0);
  const totalPrice = Number(summary?.totalPrice || 0);
  const couponCode = summary?.couponCode || null;

  let customerPdfBuffer = null;
  let internalPdfBuffer = null;

  try {
    customerPdfBuffer = generateCustomerOrderPDF(orderData, orderCode);
    internalPdfBuffer = generateInternalOrderPDF(orderData, orderCode);
    console.log("[PDF] ✓ Customer + Internal PDFs generated");
  } catch (pdfError) {
    console.error("[PDF] ✗ PDF generation failed:", pdfError.message);
  }

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td class="cell product-cell">
          <div class="product-name" dir="auto">${escapeHtml(item.name)}</div>
          <div class="product-meta" dir="auto">
            ${escapeHtml(itemDetails(item))}
          </div>
        </td>
        <td class="cell qty-cell">${item.quantity}</td>
        <td class="cell price-cell">${formatPrice(item.price)}</td>
        <td class="cell subtotal-cell">${formatPrice(item.subtotal)}</td>
      </tr>`,
    )
    .join("");

  const paymentMethodLabel =
    payment?.method === "cash_on_delivery"
      ? "Paiement à la livraison"
      : displayValue(payment?.method);

  const discountRow =
    discountAmount > 0
      ? `
      <tr>
        <td class="summary-label">
          Réduction${couponCode ? ` (${escapeHtml(couponCode)}${discountPercent ? ` · ${discountPercent}%` : ""})` : ""}
        </td>
        <td class="summary-value summary-discount">-${formatPrice(discountAmount)}</td>
      </tr>`
      : "";

  const internalHtml = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: ${EMAIL_COLORS.surface};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      }
      table { border-collapse: collapse; width: 100%; }

      .wrapper { width: 100%; background: ${EMAIL_COLORS.surface}; padding: 20px 12px; }
      .container { max-width: 640px; margin: 0 auto; }

      .header {
        background: ${EMAIL_COLORS.primary};
        border-radius: 16px 16px 0 0;
        padding: 24px 20px 20px;
        text-align: center;
      }
      .header-eyebrow {
        margin: 0 0 6px;
        color: ${EMAIL_COLORS.primaryBorder};
        font-size: 10px;
        letter-spacing: 0.45em;
        text-transform: uppercase;
        font-weight: 500;
      }
      .header-title {
        margin: 0;
        color: ${EMAIL_COLORS.surfaceBase};
        font-size: 22px;
        font-weight: 700;
        line-height: 1.25;
        letter-spacing: -0.02em;
      }
      .header-code {
        margin: 10px 0 0;
        color: ${EMAIL_COLORS.primaryBorder};
        font-size: 12px;
      }
      .header-code strong { color: ${EMAIL_COLORS.surfaceBase}; }

      .accent-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 20px;
        background: ${EMAIL_COLORS.primaryDark};
      }
      .accent-line { flex: 1; height: 1px; background: ${EMAIL_COLORS.accentLine}; }
      .accent-dot { width: 5px; height: 5px; border-radius: 50%; background: ${EMAIL_COLORS.accent}; }

      .card {
        background: ${EMAIL_COLORS.surfaceBase};
        padding: 22px 18px;
        border-radius: 0 0 16px 16px;
        box-shadow: 0 8px 32px ${EMAIL_COLORS.shadowPrimary};
      }

      .section-title {
        margin: 0 0 12px;
        font-size: 13px;
        color: ${EMAIL_COLORS.primary};
        border-bottom: 1px solid ${EMAIL_COLORS.primaryBorder};
        padding-bottom: 7px;
        font-weight: 700;
        letter-spacing: 0.01em;
      }

      .info-table { margin-bottom: 22px; }
      .label {
        padding: 5px 0;
        color: ${EMAIL_COLORS.muted};
        width: 110px;
        font-size: 11.5px;
        vertical-align: top;
      }
      .value {
        padding: 5px 0;
        color: ${EMAIL_COLORS.text};
        font-weight: 600;
        font-size: 11.5px;
        line-height: 1.5;
      }

      .payment-text {
        font-size: 12px;
        color: ${EMAIL_COLORS.text};
        margin: 0 0 22px;
        line-height: 1.6;
      }
      .muted { color: ${EMAIL_COLORS.muted}; }

      .items-table { margin-bottom: 20px; table-layout: fixed; }
      .items-head th {
        background: ${EMAIL_COLORS.surface};
        padding: 9px 10px;
        font-size: 9.5px;
        color: ${EMAIL_COLORS.primary};
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-weight: 700;
      }
      .items-head .th-product  { text-align: left; width: 44%; }
      .items-head .th-qty      { text-align: center; width: 12%; }
      .items-head .th-price,
      .items-head .th-subtotal { text-align: right; width: 22%; }

      .cell {
        padding: 10px;
        border-bottom: 1px solid ${EMAIL_COLORS.surface};
        font-size: 12px;
        color: ${EMAIL_COLORS.text};
        vertical-align: top;
      }
      .product-cell  { text-align: left; }
      .product-name  { font-size: 12px; font-weight: 600; color: ${EMAIL_COLORS.text}; line-height: 1.5; word-break: break-word; }
      .product-meta  { margin-top: 3px; font-size: 10px; color: ${EMAIL_COLORS.muted}; word-break: break-word; line-height: 1.5; }
      .qty-cell      { text-align: center; }
      .price-cell    { text-align: right; font-size: 11px; white-space: nowrap; color: ${EMAIL_COLORS.muted}; }
      .subtotal-cell { text-align: right; font-size: 11px; font-weight: 700; color: ${EMAIL_COLORS.primary}; white-space: nowrap; }

      .summary-box {
        background: ${EMAIL_COLORS.surface};
        border: 1px solid ${EMAIL_COLORS.primaryBorder};
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 8px;
      }
      .summary-label { padding: 4px 0; color: ${EMAIL_COLORS.muted}; font-size: 12px; }
      .summary-value { padding: 4px 0; text-align: right; color: ${EMAIL_COLORS.text}; font-size: 12px; font-weight: 600; }
      .summary-discount { color: ${EMAIL_COLORS.success}; }
      .summary-total-label,
      .summary-total-value {
        padding: 10px 0 4px;
        border-top: 1px solid ${EMAIL_COLORS.primaryBorder};
        color: ${EMAIL_COLORS.primary};
        font-size: 15px;
        font-weight: 700;
      }
      .summary-total-value { text-align: right; white-space: nowrap; }

      .pdf-note {
        text-align: center;
        color: ${EMAIL_COLORS.soft};
        font-size: 11px;
        margin-top: 14px;
        line-height: 1.5;
      }

      .footer {
        text-align: center;
        color: ${EMAIL_COLORS.soft};
        font-size: 11px;
        line-height: 1.6;
        margin-top: 18px;
        padding: 0 8px;
      }

      @media only screen and (max-width: 600px) {
        .wrapper  { padding: 12px 6px !important; }
        .header   { padding: 18px 12px 16px !important; border-radius: 12px 12px 0 0 !important; }
        .header-title { font-size: 18px !important; }
        .card     { padding: 16px 12px !important; border-radius: 0 0 12px 12px !important; }
        .section-title { font-size: 12px !important; }
        .label, .value, .payment-text, .summary-label, .summary-value { font-size: 11px !important; }
        .items-head th { padding: 8px 6px !important; font-size: 8.5px !important; }
        .cell     { padding: 8px 6px !important; }
        .product-name { font-size: 11px !important; }
        .product-meta { font-size: 9px !important; }
        .qty-cell, .price-cell, .subtotal-cell { font-size: 10px !important; }
        .summary-box  { padding: 12px !important; }
        .summary-total-label, .summary-total-value { font-size: 13px !important; }
        .pdf-note, .footer { font-size: 10px !important; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">

        <div class="header">
          <p class="header-eyebrow">Empreinte Flex · Nouvelle commande</p>
          <h1 class="header-title">Commande reçue</h1>
          <p class="header-code">Code : <strong>${escapeHtml(orderCode)}</strong></p>
        </div>

        <div class="accent-bar">
          <div class="accent-line"></div>
          <div class="accent-dot"></div>
          <div class="accent-line"></div>
        </div>

        <div class="card">

          <h2 class="section-title">Informations client</h2>
          <table class="info-table">
            <tr>
              <td class="label">Nom</td>
              <td class="value" dir="auto">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td class="label">Téléphone</td>
              <td class="value" dir="ltr">${escapeHtml(customer.phone)}</td>
            </tr>
            <tr>
              <td class="label">Email</td>
              <td class="value" dir="ltr">${escapeHtml(customer.email)}</td>
            </tr>
          </table>

          <h2 class="section-title">Adresse de livraison</h2>
          <table class="info-table">
            <tr>
              <td class="label">Wilaya</td>
              <td class="value" dir="auto">${escapeHtml(shipping.wilaya)}</td>
            </tr>
            <tr>
              <td class="label">Ville</td>
              <td class="value" dir="auto">${escapeHtml(shipping.city)}</td>
            </tr>
            <tr>
              <td class="label">Rue</td>
              <td class="value" dir="auto">${escapeHtml(shipping.street)}</td>
            </tr>
            ${
              shipping.mapLink
                ? `
            <tr>
              <td class="label">Localisation</td>
              <td class="value">
                <a href="${escapeHtml(shipping.mapLink)}" style="color:${EMAIL_COLORS.primary};text-decoration:underline;">Ouvrir dans Maps</a>
              </td>
            </tr>`
                : ""
            }
          </table>

          <h2 class="section-title">Paiement</h2>
          <p class="payment-text">
            ${escapeHtml(paymentMethodLabel)}
          </p>

          <h2 class="section-title">Articles commandés</h2>
          <table class="items-table">
            <thead class="items-head">
              <tr>
                <th class="th-product">Produit</th>
                <th class="th-qty">Qté</th>
                <th class="th-price">Prix</th>
                <th class="th-subtotal">Sous-total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>

          <div class="summary-box">
            <table>
              <tr>
                <td class="summary-label">Nombre d'articles</td>
                <td class="summary-value">${summary.itemsCount}</td>
              </tr>
              <tr>
                <td class="summary-label">Quantité totale</td>
                <td class="summary-value">${summary.totalQuantity}</td>
              </tr>
              <tr>
                <td class="summary-label">Sous-total</td>
                <td class="summary-value">${formatPrice(subtotalPrice)}</td>
              </tr>
              ${discountRow}
              <tr>
                <td class="summary-total-label">Total</td>
                <td class="summary-total-value">${formatPrice(totalPrice)}</td>
              </tr>
            </table>
          </div>

          ${internalPdfBuffer ? '<p class="pdf-note">📎 Document PDF joint</p>' : ""}

        </div>

        <p class="footer">
          Empreinte Flex · Notification automatique de commande<br/>
          Ne pas répondre à cet email
        </p>

      </div>
    </div>
  </body>
  </html>
  `;

  const customerDiscountBlock =
    discountAmount > 0
      ? `
      <p style="margin:8px 0 0;line-height:1.6;color:${EMAIL_COLORS.success};">
        Réduction appliquée${couponCode ? ` avec le code <strong>${escapeHtml(couponCode)}</strong>` : ""} :
        <strong>-${formatPrice(discountAmount)}</strong>
      </p>
      <p style="margin:8px 0 0;line-height:1.6;color:${EMAIL_COLORS.muted};">
        Sous-total : <strong>${formatPrice(subtotalPrice)}</strong><br/>
        Total payé : <strong style="color:${EMAIL_COLORS.primary};">${formatPrice(totalPrice)}</strong>
      </p>
    `
      : `
      <p style="margin:8px 0 0;line-height:1.6;color:${EMAIL_COLORS.muted};">
        Total payé : <strong style="color:${EMAIL_COLORS.primary};">${formatPrice(totalPrice)}</strong>
      </p>
    `;

  const customerHtml = `
    <div style="font-family:Arial,sans-serif;padding:24px;color:${EMAIL_COLORS.text};">
      <h2 style="margin:0 0 12px;color:${EMAIL_COLORS.primary};">Merci pour votre commande</h2>
      <p style="margin:0 0 10px;line-height:1.6;">
        Votre commande <strong>${escapeHtml(orderCode)}</strong> a bien été enregistrée.
      </p>
      ${customerDiscountBlock}
      <p style="margin:12px 0 0;line-height:1.6;">
        Vous trouverez votre document récapitulatif en pièce jointe.
      </p>
    </div>
  `;

  try {
    if (customerEmail && customerPdfBuffer) {
      await resend.emails.send({
        from: "Empreinte Flex <contact@empreinteflex.com>",
        to: customerEmail,
        subject: `Confirmation de votre commande ${orderCode} | Empreinte Flex`,
        html: customerHtml,
        attachments: [
          {
            filename: `confirmation-commande-${orderCode}.pdf`,
            content: customerPdfBuffer.toString("base64"),
          },
        ],
      });

      console.log("[Email] ✓ Customer email sent");
    }

    const internalPayload = {
      from: "Empreinte Flex <contact@empreinteflex.com>",
      to: process.env.ORDER_EMAIL,
      subject: `Nouvelle commande - ${orderCode} | ${name}`,
      html: internalHtml,
    };

    if (internalPdfBuffer) {
      internalPayload.attachments = [
        {
          filename: `commande-interne-${orderCode}.pdf`,
          content: internalPdfBuffer.toString("base64"),
        },
      ];
    }

    const response = await resend.emails.send(internalPayload);

    if (response?.error) {
      console.error("[Email] ✗ Resend error:", response.error);
      throw new Error(response.error.message || "Failed to send email");
    }

    console.log("[Email] ✓ Internal email sent:", response?.data?.id);
    return response;
  } catch (error) {
    console.error("[Email] ✗ Send failed:", error.message);
    throw error;
  }
}
