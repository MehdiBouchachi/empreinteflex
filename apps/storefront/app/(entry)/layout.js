import { DEFAULT_LOCALE } from "@/lib/seo";

// The home redirect needs its own root layout alongside storefront and console.
export default function EntryLayout({ children }) {
  return (
    <html lang={DEFAULT_LOCALE} dir="ltr">
      <body>{children}</body>
    </html>
  );
}
