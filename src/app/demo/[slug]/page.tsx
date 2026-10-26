import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { CinematicDemo } from "@/components/cinematic-demo";
import { getProductBySlug, PRODUCT_SLUGS } from "@/lib/catalog";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import { LANDINGS } from "@/lib/landing";
import { trackServerEvent } from "@/lib/analytics";

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Пример не найден" };
  return {
    title: `Пример ${product.title}`,
    description: `Вымышленная книга ${product.title}: обложка, хроника, фотографии и письмо.`,
    robots: { index: true, follow: true },
  };
}

export default async function DemoBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const sample = DEMO_SAMPLE_BOOKS[product.slug];
  const landing = LANDINGS[product.slug];
  trackServerEvent({ event: "open_demo", productSlug: product.slug });

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F2E9]">
      <SiteHeader />
      <main className="flex-1">
        <CinematicDemo
          slug={product.slug}
          title={product.title}
          price={product.initialPriceKopecks}
          sample={sample}
          accent={landing.accent}
          wash={landing.wash}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
