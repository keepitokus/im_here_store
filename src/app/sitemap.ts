import type { MetadataRoute } from "next";
import { PRODUCT_SLUGS } from "@/lib/catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:43123";
  const now = new Date();
  const staticRoutes = ["", "/catalog", "/support", "/legal/offer", "/legal/privacy", "/legal/terms"];
  const pages = [
    ...staticRoutes.map((path) => ({
      url: `${base}${path || "/"}`,
      lastModified: now,
    })),
    ...PRODUCT_SLUGS.flatMap((slug) => [
      { url: `${base}/gifts/${slug}`, lastModified: now },
      { url: `${base}/demo/${slug}`, lastModified: now },
    ]),
  ];
  return pages;
}
