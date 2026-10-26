import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS_CATALOG, PRODUCT_SLUGS } from "@/lib/catalog";
import { formatRublesFromKopecks } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Каталог цифровых книг-подарков — «Я здесь»",
  description:
    "Четыре издания для самых близких: «Наша история» (4 990 ₽), «Мама, спасибо» (5 990 ₽), «Твой день» (5 990 ₽) и «Мой первый год» (4 990 ₽).",
};

export default function CatalogPage() {
  const products = PRODUCT_SLUGS.map((slug) => PRODUCTS_CATALOG[slug]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
              Каталог «Я здесь» · 4 издания
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#231C18]">
              Выберите повод для вашей книги
            </h1>
            <p className="text-base text-[#574940] leading-relaxed">
              Каждое издание включает пошаговый редактор с автосохранением,
              добавление до 30 фотографий, выбор цветовой темы, приватную ссылку с
              опциональным PIN-кодом, QR-код и 12 месяцев размещения.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>

          {/* Сводная таблица цен и условий согласно Разделу 2 ТЗ */}
          <section
            aria-label="Сравнение изданий и условий размещения"
            className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-8 space-y-4 overflow-x-auto"
          >
            <h2 className="font-serif text-2xl font-semibold text-[#231C18]">
              Прозрачные цены и условия размещения
            </h2>
            <p className="text-sm text-[#574940]">
              В MVP нет скрытых тарифов, допродаж или автоматических списаний с карты.
            </p>
            <table className="w-full min-w-[620px] text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E5DDD2] text-xs uppercase tracking-wider text-[#7A6B60]">
                  <th className="py-3 pr-4">Издание (SKU)</th>
                  <th className="py-3 px-4">Первоначальная покупка</th>
                  <th className="py-3 px-4">Продление после 1 года</th>
                  <th className="py-3 pl-4">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE4D8]">
                {products.map((p) => (
                  <tr key={p.slug}>
                    <td className="py-3.5 pr-4">
                      <div className="font-serif font-semibold text-base text-[#231C18]">
                        {p.title}
                      </div>
                      <div className="text-xs text-[#7A6B60]">{p.paletteSummary}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#231C18]">
                      {formatRublesFromKopecks(p.initialPriceKopecks)}{" "}
                      <span className="text-xs font-normal text-[#7A6B60]">
                        (12 мес.)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#4A3E36]">
                      {p.allowsRenewalInMvp && p.renewalPriceKopecks
                        ? `${formatRublesFromKopecks(p.renewalPriceKopecks)} за каждый последующий год (вручную)`
                        : "Нет в MVP (доступно скачивание архива)"}
                    </td>
                    <td className="py-3.5 pl-4">
                      <Link
                        href={`/create/${p.slug}`}
                        className="text-xs font-semibold text-[#6E2638] hover:underline"
                      >
                        Создать →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
