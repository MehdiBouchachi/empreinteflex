// Shared scale for every size: 200 cm = 120 SVG units before projection.
// Both floor axes have identical foreshortening; the viewport never auto-fits.
export const CM_TO_SVG = 0.6;
export function mattressGeometry(size) {
  const [width, length] = size.split(/[x×]/).map(Number);
  if (!(width > 0 && length > 0)) return null;
  const dx = CM_TO_SVG * Math.cos(Math.PI / 6);
  const dy = CM_TO_SVG * Math.sin(Math.PI / 6);
  const origin = { x: 180 - (width - length) * dx / 2, y: 125 - (width + length) * dy / 2 };
  const point = (x, y, depth = 0) => ({ x: origin.x + (x - y) * dx, y: origin.y + (x + y) * dy + depth });
  return { width, length, dx, dy, origin, point, corners: [point(0, 0), point(width, 0), point(width, length), point(0, length)] };
}
