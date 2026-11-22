import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/seo";

export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
