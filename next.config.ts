import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_PAGES === "1";
const pagesBase = "/im_here_store";

const nextConfig: NextConfig = {
  ...(githubPages
    ? {
        output: "export",
        basePath: pagesBase,
        assetPrefix: pagesBase,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        serverExternalPackages: ["better-sqlite3", "sharp"],
        images: {
          formats: ["image/avif", "image/webp"],
        },
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
              ],
            },
            {
              source: "/b/:path*",
              headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
            },
            {
              source: "/preview/:path*",
              headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
            },
            {
              source: "/images/:path*",
              headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
          ];
        },
      }),
};

export default nextConfig;
