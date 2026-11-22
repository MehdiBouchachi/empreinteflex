// Shared display rules for order emails and PDF attachments.
export function displayValue(value, fallback = "-") {
  return value == null ? fallback : String(value).trim() || fallback;
}

export function customerName(customer = {}) {
  return displayValue(
    [customer.firstName, customer.lastName]
      .map((part) => displayValue(part, ""))
      .filter(Boolean)
      .join(" "),
  );
}

export function itemDetails(item = {}) {
  const thickness = displayValue(item.thickness, "");
  return displayValue(
    [
      displayValue(item.size, ""),
      thickness && (/^\d+(?:[.,]\d+)?$/.test(thickness) ? `${thickness} cm` : thickness),
      displayValue(item.density, ""),
    ].filter(Boolean).join(" · "),
  );
}

export function escapeHtml(value) {
  return displayValue(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}
