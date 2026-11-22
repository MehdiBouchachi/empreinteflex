import { getAvailableSizes } from "@/lib/mattress-sizes";
import MattressSizesExplorer from "./MattressSizesExplorer";

export default function MattressSizesSection({ products, locale = "fr" }) {
  return <MattressSizesExplorer sizes={getAvailableSizes(products)} locale={locale} />;
}
