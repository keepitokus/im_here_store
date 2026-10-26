import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:43123";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/b/", "/preview/", "/create/", "/checkout/", "/orders/", "/account", "/admin", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
