export function getAvailableSizes(products = []) {
  const sizes = new Map();
  for (const product of products) {
    if (!product.available) continue;
    const seen = new Set();
    for (const dimension of product.details?.dimensions || []) {
      if (!dimension.size || !dimension.options?.length || seen.has(dimension.size)) continue;
      seen.add(dimension.size);
      sizes.set(dimension.size, (sizes.get(dimension.size) || 0) + 1);
    }
  }
  return [...sizes].map(([size, count]) => ({ size, count })).sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }));
}
