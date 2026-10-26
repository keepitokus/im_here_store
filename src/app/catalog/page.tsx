import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { PRODUCTS_CATALOG, PRODUCT_SLUGS } from "@/lib/catalog";
import { LANDINGS } from "@/lib/landing";
import { formatRublesFromKopecks } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Подарки",
  description: "Четыре цифровые книги: для мамы, для пары, на день рождения и на первый год ребёнка. От 4 990 ₽.",
};

export default function CatalogPage() {
  const ordered = ["mother-thanks", "love-story", "your-day", "first-year"] as const;
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8A7563]">Подарки</p>
        <h1 className="mt-3 max-w-2xl font-serif text-5xl leading-tight">Кому вы хотите это подарить?</h1>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {ordered.map((slug) => {
            const product = PRODUCTS_CATALOG[slug];
            const landing = LANDINGS[slug];
            return (
              <article key={slug} className={`flex min-h-64 flex-col justify-between p-6 ${landing.wash}`}>
                <div>
                  <p className={`text-xs uppercase tracking-[0.16em] ${landing.ink}`}>{landing.eyebrow}</p>
                  <h2 className="mt-3 font-serif text-4xl">{product.title.replace(/[«»]/g, "")}</h2>
                  <p className="mt-2 text-sm text-[#3E4C5C]">{landing.lead}</p>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="font-serif text-3xl">{formatRublesFromKopecks(product.initialPriceKopecks)}</p>
                  <div className="flex gap-2">
                    <Link href={`/demo/${slug}`} className="inline-flex min-h-11 items-center px-2 text-sm underline">Пример</Link>
                    <Link href={`/gifts/${slug}`} className="inline-flex min-h-11 items-center px-2 text-sm">О книге</Link>
                    <Link href={`/create/${slug}`} className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm text-[#F7F2E9] ${landing.accent}`}>Создать</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-[#5C6B7A]">В каталоге ровно {PRODUCT_SLUGS.length} книги. Других тарифов нет.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
