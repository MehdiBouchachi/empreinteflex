import { jsPDF } from "jspdf";
import { readFileSync } from "node:fs";
import path from "node:path";
import { customerName, displayValue as safe, itemDetails } from "./order-document.js";

// Helper function to detect if text contains Arabic characters
function isArabicText(text) {
  if (!text) return false;
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

let arabicFonts;

function selectTextFont(doc, text, style, size) {
  const arabic = isArabicText(text);
  if (arabic && !doc.getFontList().Amiri) {
    arabicFonts ??= ["Regular", "Bold"].map((weight) =>
      readFileSync(path.join(process.cwd(), "public", "fonts", "amiri", `Amiri-${weight}.ttf`)).toString("base64"),
    );
    ["normal", "bold"].forEach((weight, index) => {
      const filename = `Amiri-${weight}.ttf`;
      doc.addFileToVFS(filename, arabicFonts[index]);
      doc.addFont(filename, "Amiri", weight);
    });
  }
  doc.setFont(arabic ? "Amiri" : "helvetica", style);
  doc.setFontSize(size);
}

function textOptions(text) {
  return {
    // Stored strings are logical Unicode. Let jsPDF reorder mixed Arabic/Latin
    // runs instead of reversing the entire string (which also reverses numbers).
    isInputVisual: false,
    isInputRtl: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(safe(text)),
    isOutputVisual: true,
    isOutputRtl: false,
  };
}

function wrapText(doc, text, width, style, size) {
  const value = safe(text);
  selectTextFont(doc, value, style, size);
  // Measure shaped glyphs with the same font and size used when drawing.
  return doc.splitTextToSize(isArabicText(value) ? doc.processArabic(value) : value, width);
}

function drawValue(doc, text, x, y, width, style, size, lines) {
  const value = safe(text);
  selectTextFont(doc, value, style, size);
  const arabic = isArabicText(value);
  doc.text(lines || value, arabic ? x + width : x, y, {
    ...textOptions(value),
    align: arabic ? "right" : "left",
  });
}

const BRAND = {
  blue: [26, 60, 158],
  ink: [30, 30, 30],
  muted: [110, 110, 110],
  light: [165, 165, 165],
  border: [220, 226, 240],
  graySoft: [247, 247, 247],
  green: [22, 163, 74],
  white: [255, 255, 255],
};

function formatPrice(value) {
  const n = Number(value || 0);
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 })
    .format(n)
    .replace(/\u202f/g, " ")
    .replace(/\u00a0/g, " ")} DA`;
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getPaymentMethodLabel(method) {
  return method === "cash_on_delivery"
    ? "Paiement à la livraison"
    : safe(method);
}

function createDoc() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  return doc;
}

function withLayout(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  return { pageWidth, pageHeight, margin, contentWidth };
}

function drawFooter(doc, ctx, text = "Empreinte Flex") {
  const { pageWidth, pageHeight, margin, contentWidth } = ctx;
  const y = pageHeight - 12;

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.25);
  doc.line(margin, y - 4, margin + contentWidth, y - 4);

  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.light);
  doc.text(text, pageWidth / 2, y, { align: "center" });
}

function drawHeader(doc, ctx, { title, subtitle, orderCode, variant }) {
  const { margin, contentWidth, pageWidth } = ctx;

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, 14, contentWidth, 36, 2, 2, "S");

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.25);
  doc.line(margin, 14, margin + contentWidth, 14);

  doc.setFont("times", "bold");
  doc.setFontSize(21);
  doc.setTextColor(...BRAND.ink);
  doc.text("Empreinte Flex", margin + 6, 24.5);

  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.muted);
  doc.text("Confort durable, précision et sommeil réparateur", margin + 6, 31);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...BRAND.ink);
  doc.text(title, pageWidth - margin - 6, 23, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.muted);
  doc.text(subtitle, pageWidth - margin - 6, 29, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.ink);
  doc.text(`Commande : ${orderCode}`, pageWidth - margin - 6, 35, {
    align: "right",
  });

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.25);
  doc.line(margin, 55, margin + contentWidth, 55);

  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.light);
  doc.text(
    variant === "customer" ? "Document client" : "Document interne",
    margin,
    60,
  );
}

function sectionTitle(doc, ctx, y, title) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.blue);
  doc.text(title, ctx.margin, y);

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.25);
  doc.line(ctx.margin, y + 2.5, ctx.margin + ctx.contentWidth, y + 2.5);

  return y + 8;
}

function infoRow(doc, ctx, y, label, value, options = {}) {
  const labelX = ctx.margin;
  const valueX = ctx.margin + 38;
  const valueWidth = ctx.contentWidth - 38;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.muted);
  doc.text(label, labelX, y);

  doc.setTextColor(...(options.color || BRAND.ink));
  const style = options.bold === false ? "normal" : "bold";
  const lines = wrapText(doc, value, valueWidth, style, 8.6);
  drawValue(doc, value, valueX, y, valueWidth, style, 8.6, lines);

  const h = Math.max(lines.length, 1) * 5;
  return y + h + 1;
}

function ensurePage(doc, ctx, y, minSpace = 20, footerText) {
  const limit = ctx.pageHeight - 22;

  if (y + minSpace <= limit) return y;

  drawFooter(doc, ctx, footerText);
  doc.addPage();
  return 18;
}

function drawPaymentStrip(doc, ctx, y, payment) {
  const boxH = 18;
  const boxW = ctx.contentWidth;
  const leftX = ctx.margin;

  doc.setFillColor(...BRAND.white);
  doc.rect(leftX, y, boxW, boxH, "F");

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.2);
  doc.rect(leftX, y, boxW, boxH);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text("Méthode de paiement", leftX + 4, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.ink);
  doc.text(getPaymentMethodLabel(payment?.method), leftX + 4, y + 12);

  return y + boxH + 5;
}

function drawItemsTable(doc, ctx, y, items, footerText) {
  const tableX = ctx.margin;
  const tableW = ctx.contentWidth;
  const rightEdge = tableX + tableW;

  const widths = {
    product: 66,
    details: 43,
    qty: 14,
    price: 26,
    subtotal: 29,
  };

  const col = {
    productX: tableX + 2,
    detailsX: tableX + widths.product + 3,
    qtyCenterX: tableX + widths.product + widths.details + widths.qty / 2 + 2,
    priceRightX:
      tableX + widths.product + widths.details + widths.qty + widths.price - 2,
    subtotalRightX: rightEdge - 2,
  };

  const drawHead = () => {
    doc.setFillColor(...BRAND.graySoft);
    doc.rect(tableX, y - 5, tableW, 8, "F");

    doc.setDrawColor(...BRAND.border);
    doc.setLineWidth(0.2);
    doc.rect(tableX, y - 5, tableW, 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(...BRAND.ink);

    doc.text("PRODUIT", col.productX, y);
    doc.text("DÉTAILS", col.detailsX, y);
    doc.text("QTÉ", col.qtyCenterX, y, { align: "center" });
    doc.text("PRIX", col.priceRightX, y, { align: "right" });
    doc.text("SOUS-TOTAL", col.subtotalRightX, y, { align: "right" });

    y += 9;
  };

  drawHead();

  items.forEach((item, index) => {
    const details = itemDetails(item);
    const nameLines = wrapText(doc, item.name, widths.product - 6, "bold", 8);
    const detailsLines = wrapText(doc, details, widths.details - 6, "normal", 7.1);
    const rowLines = Math.max(nameLines.length, detailsLines.length, 1);
    const rowHeight = Math.max(11, rowLines * 4.7 + 3);

    y = ensurePage(doc, ctx, y, rowHeight, footerText);
    if (y === 18) {
      y = sectionTitle(doc, ctx, y, "Articles commandés (suite)");
      drawHead();
    }

    doc.setFillColor(...(index % 2 === 0 ? BRAND.white : BRAND.graySoft));
    doc.rect(tableX, y - 4.5, tableW, rowHeight, "F");

    doc.setDrawColor(...BRAND.border);
    doc.setLineWidth(0.15);
    doc.rect(tableX, y - 4.5, tableW, rowHeight);

    doc.setTextColor(...BRAND.ink);
    drawValue(doc, item.name, col.productX, y, widths.product - 6, "bold", 8, nameLines);

    doc.setTextColor(...BRAND.muted);
    drawValue(doc, details, col.detailsX, y, widths.details - 6, "normal", 7.1, detailsLines);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.ink);
    doc.text(String(item.quantity || 0), col.qtyCenterX, y, {
      align: "center",
    });

    doc.text(formatPrice(item.price), col.priceRightX, y, { align: "right" });

    doc.setTextColor(...BRAND.blue);
    doc.text(formatPrice(item.subtotal), col.subtotalRightX, y, {
      align: "right",
    });

    y += rowHeight;
  });

  return y + 3;
}

function drawSummaryBox(doc, ctx, y, summary) {
  const boxW = 92;
  const boxX = ctx.margin + ctx.contentWidth - boxW;

  const subtotalPrice = Number(
    summary.subtotalPrice || summary.totalPrice || 0,
  );
  const discountAmount = Number(summary.discountAmount || 0);
  const discountPercent = Number(summary.discountPercent || 0);
  const totalPrice = Number(summary.totalPrice || 0);
  const couponCode = summary.couponCode || null;

  const rows = [
    {
      label: "Articles",
      value: String(summary.itemsCount || 0),
      color: BRAND.ink,
    },
    {
      label: "Quantité totale",
      value: String(summary.totalQuantity || 0),
      color: BRAND.ink,
    },
    {
      label: "Sous-total",
      value: formatPrice(subtotalPrice),
      color: BRAND.ink,
    },
  ];

  if (discountAmount > 0) {
    rows.push({
      label: couponCode
        ? `Réduction (${couponCode}${discountPercent ? ` · ${discountPercent}%` : ""})`
        : "Réduction",
      value: `-${formatPrice(discountAmount)}`,
      color: BRAND.green,
    });
  }

  const boxH = 18 + rows.length * 7 + 10;

  doc.setFillColor(...BRAND.white);
  doc.rect(boxX, y, boxW, boxH, "F");

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.25);
  doc.rect(boxX, y, boxW, boxH);

  let lineY = y + 8;

  rows.forEach((row) => {
    selectTextFont(doc, row.label, "normal", 8);
    doc.setTextColor(...BRAND.muted);
    doc.text(row.label, boxX + 6, lineY, textOptions(row.label));

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.4);
    doc.setTextColor(...row.color);
    doc.text(row.value, boxX + boxW - 6, lineY, {
      align: "right",
    });

    lineY += 7;
  });

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.2);
  doc.line(boxX + 6, lineY, boxX + boxW - 6, lineY);

  lineY += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.blue);
  doc.text("TOTAL", boxX + 6, lineY);

  doc.text(formatPrice(totalPrice), boxX + boxW - 6, lineY, {
    align: "right",
  });

  return y + boxH;
}

function drawCustomerClosing(doc, ctx, y) {
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.25);
  doc.rect(ctx.margin, y, ctx.contentWidth, 22);

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ink);
  doc.text("Merci pour votre confiance.", ctx.margin + 6, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(...BRAND.muted);
  doc.text(
    "Votre commande a bien été enregistrée. Notre équipe vous contactera prochainement pour confirmer les détails de livraison.",
    ctx.margin + 6,
    y + 14,
    { maxWidth: ctx.contentWidth - 12 },
  );
}

function drawInternalClosing(doc, ctx, y) {
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.25);
  doc.rect(ctx.margin, y, ctx.contentWidth, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.ink);
  doc.text("Note interne", ctx.margin + 6, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.1);
  doc.setTextColor(...BRAND.muted);
  doc.text(
    "Document destiné au suivi opérationnel, à la préparation et à la coordination de la livraison.",
    ctx.margin + 6,
    y + 14,
    { maxWidth: ctx.contentWidth - 12 },
  );
}

function buildBasePDF(orderData, orderCode, options = {}) {
  const { customer, shipping, payment, items, summary } = orderData;

  const doc = createDoc();
  const ctx = withLayout(doc);

  const footerText = options.footerText || "Empreinte Flex";
  const title = options.title || "Document";
  const subtitle = options.subtitle || `Émis le ${formatDate()}`;
  const variant = options.variant || "customer";

  drawHeader(doc, ctx, {
    title,
    subtitle,
    orderCode,
    variant,
  });

  let y = 66;

  y = sectionTitle(doc, ctx, y, "Informations client");
  y = infoRow(
    doc,
    ctx,
    y,
    "Nom",
    customerName(customer),
  );
  y = infoRow(doc, ctx, y, "Téléphone", customer.phone);
  y = infoRow(doc, ctx, y, "Email", customer.email);
  y += 4;

  y = ensurePage(doc, ctx, y, 36, footerText);
  y = sectionTitle(doc, ctx, y, "Adresse de livraison");
  y = infoRow(doc, ctx, y, "Wilaya", shipping.wilaya);
  y = infoRow(doc, ctx, y, "Ville", shipping.city);
  y = infoRow(doc, ctx, y, "Rue", shipping.street);

  if (shipping.mapLink) {
    y = infoRow(doc, ctx, y, "Localisation", shipping.mapLink, {
      bold: false,
      color: BRAND.muted,
    });
  }

  y += 4;

  y = sectionTitle(doc, ctx, y, "Paiement");
  y = drawPaymentStrip(doc, ctx, y, payment);

  y = ensurePage(doc, ctx, y, 42, footerText);
  y = sectionTitle(doc, ctx, y, "Articles commandés");
  y = drawItemsTable(doc, ctx, y, items, footerText);

  y = ensurePage(doc, ctx, y, 70, footerText);
  y = drawSummaryBox(doc, ctx, y, summary);

  return { doc, ctx, y, footerText };
}

export function generateCustomerOrderPDF(orderData, orderCode) {
  const { doc, ctx, y, footerText } = buildBasePDF(orderData, orderCode, {
    title: "Confirmation de commande",
    subtitle: `Document client · ${formatDate()}`,
    footerText: "Empreinte Flex · Document client",
    variant: "customer",
  });

  let nextY = y + 10;
  nextY = ensurePage(doc, ctx, nextY, 28, footerText);

  drawCustomerClosing(doc, ctx, nextY);
  drawFooter(doc, ctx, footerText);

  return Buffer.from(doc.output("arraybuffer"));
}

export function generateInternalOrderPDF(orderData, orderCode) {
  const { doc, ctx, y, footerText } = buildBasePDF(orderData, orderCode, {
    title: "Fiche de commande",
    subtitle: `Document interne · ${formatDate()}`,
    footerText: "Empreinte Flex · Document interne",
    variant: "internal",
  });

  let nextY = y + 10;
  nextY = ensurePage(doc, ctx, nextY, 24, footerText);

  drawInternalClosing(doc, ctx, nextY);
  drawFooter(doc, ctx, footerText);

  return Buffer.from(doc.output("arraybuffer"));
}
