import type { ProductSlug } from "@/lib/catalog";

export interface PricingItem {
  slug: ProductSlug;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  note: string;
}
