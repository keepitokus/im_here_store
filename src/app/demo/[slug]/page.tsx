import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { BookReaderView } from "@/components/book-reader";
import { getProductBySlug, PRODUCT_SLUGS } from "@/lib/catalog";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import { formatRublesFromKopecks } from "@/lib/utils";
import { trackServerEvent } from "@/lib/analytics";
import { ArrowRight, Sparkles } from "lucide-react";

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
  if (!product) {
    return { title: "Демо не найдено — «Я здесь»" };
  }
  return {
    title: `Демо-образец ${product.title} — Листать живую книгу | «Я здесь»`,
    description: `Живой интерактивный образец книги ${product.title}. Посмотрите, как выглядят обложка, таймлайн, фотографии и финальное письмо.`,
  };
}

export default async function DemoBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const demoBook = DEMO_SAMPLE_BOOKS[product.slug];
  if (!demoBook) {
    notFound();
  }

  trackServerEvent({
    event: "open_demo",
    productSlug: product.slug,
  });

  const banner = (
    <div className="rounded-2xl border border-[#DFD2C5] bg-[#FFFEFA] p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E2638]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Демонстрационный образец книги {product.title}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#574940]">
            Персонажи и события вымышлены: {demoBook.characterSummary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/create/${product.slug}`}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-[#6E2638] px-4 py-2 text-xs sm:text-sm font-medium text-[#FAF4F4] hover:bg-[#581D2C] transition-colors"
          >
            <span>
              Создать свою за {formatRublesFromKopecks(product.initialPriceKopecks)}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Переключатель между 4 демо-книгами */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[#ECE4D8] pt-3 text-xs">
        <span className="text-[#7A6B60] mr-1">Другие образцы:</span>
        {PRODUCT_SLUGS.map((s) => {
          const item = getProductBySlug(s)!;
          const active = s === product.slug;
          return (
            <Link
              key={s}
              href={`/demo/${s}`}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                active
                  ? "bg-[#2B1E1A] text-[#FAF7F2]"
                  : "bg-[#F4EFE6] text-[#4A3E36] hover:bg-[#E7DFD2]"
              }`}
            >
              {item.title}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <BookReaderView
          content={demoBook.content}
          photos={demoBook.photos}
          modeBanner={banner}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
