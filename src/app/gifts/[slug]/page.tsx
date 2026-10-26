import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { getProductBySlug, PRODUCT_SLUGS } from "@/lib/catalog";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import { formatRublesFromKopecks } from "@/lib/utils";
import { trackServerEvent } from "@/lib/analytics";
import {
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";

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
    return { title: "Подарок не найден — «Я здесь»" };
  }
  return {
    title: `${product.title} — ${formatRublesFromKopecks(product.initialPriceKopecks)} | Цифровая книга-подарок «Я здесь»`,
    description: product.seoDescription,
  };
}

export default async function GiftProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  trackServerEvent({
    event: "view_product",
    productSlug: product.slug,
  });

  const sample = DEMO_SAMPLE_BOOKS[product.slug];
  const primaryTheme = product.themes[0];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-14">
          {/* Хлебные крошки */}
          <nav aria-label="Хлебные крошки" className="text-xs text-[#7A6B60]">
            <Link href="/" className="hover:text-[#6E2638]">
              Главная
            </Link>{" "}
            /{" "}
            <Link href="/catalog" className="hover:text-[#6E2638]">
              Каталог
            </Link>{" "}
            / <span className="text-[#231C18] font-medium">{product.title}</span>
          </nav>

          {/* Первый блок продукта */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-6">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium ${primaryTheme.badgeClass}`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {product.badge}
              </span>

              <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#231C18] leading-tight">
                {product.title}
              </h1>

              <p className="text-base sm:text-lg text-[#4A3E36] leading-relaxed">
                {product.subtitle}
              </p>

              {/* Блок цены и условий */}
              <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#7A6B60]">
                      Первоначальная покупка (12 месяцев размещения)
                    </div>
                    <div className="font-serif text-3xl sm:text-4xl font-semibold text-[#231C18] mt-0.5">
                      {formatRublesFromKopecks(product.initialPriceKopecks)}
                    </div>
                  </div>

                  {product.allowsRenewalInMvp && product.renewalPriceKopecks ? (
                    <div className="rounded-2xl bg-[#E6EFE8] px-4 py-2.5 text-xs text-[#2E4033]">
                      <div className="font-semibold flex items-center gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Продление со 2-го года:{" "}
                        {formatRublesFromKopecks(product.renewalPriceKopecks)}/год
                      </div>
                      <div className="opacity-85 mt-0.5">
                        Только вручную по вашему желанию, без автосписаний
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#F4EFE6] px-4 py-2.5 text-xs text-[#574940]">
                      <div className="font-semibold flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />1 год размещения + скачивание
                        архива
                      </div>
                      <div className="opacity-85 mt-0.5">
                        Без подписок и скрытых платежей
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#695B50] leading-relaxed border-t border-[#ECE4D8] pt-3">
                  {product.hostingPolicyNote}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href={`/create/${product.slug}`}
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-[#6E2638] px-6 py-3 text-sm sm:text-base font-medium text-[#FAF4F4] hover:bg-[#581D2C] transition-colors shadow-sm"
                  >
                    <span>Начать создание книги</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/demo/${product.slug}`}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#D8CFC4] bg-[#FFFEFA] px-6 py-3 text-sm sm:text-base font-medium text-[#2B1E1A] hover:bg-[#F3EDE3] transition-colors"
                  >
                    <Eye className="h-4 w-4 text-[#6E2638]" />
                    <span>Открыть демо-образец</span>
                  </Link>
                </div>
              </div>

              {/* Состав и сценарии */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="rounded-2xl border border-[#E5DDD2] bg-[#FFFEFA] p-5 space-y-3">
                  <h2 className="font-serif text-xl font-semibold text-[#231C18]">
                    Состав книги
                  </h2>
                  <ul className="space-y-2 text-sm text-[#4A3E36]">
                    {product.compositionSummary.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#4A6151] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#E5DDD2] bg-[#FFFEFA] p-5 space-y-3">
                  <h2 className="font-serif text-xl font-semibold text-[#231C18]">
                    Когда дарят это издание
                  </h2>
                  <ul className="space-y-2 text-sm text-[#4A3E36]">
                    {product.idealFor.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#6E2638] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-[#ECE4D8] text-xs text-[#7A6B60]">
                    Палитра: <strong>{product.paletteSummary}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка: вопросы мастера и галерея демо */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#6E2638]">
                  Вопросы внутри редактора
                </div>
                <h2 className="font-serif text-2xl font-semibold text-[#231C18]">
                  О чём мы бережно спросим вас в мастере
                </h2>
                <p className="text-xs text-[#695B50]">
                  Вам не придётся выдумывать структуру — просто ответьте своими
                  словами на короткие карточки:
                </p>

                <ul className="space-y-3">
                  {product.fields.map((field) => (
                    <li
                      key={field.id}
                      className="rounded-2xl border border-[#ECE4D8] bg-[#FAF7F2] p-3.5"
                    >
                      <div className="text-sm font-medium text-[#231C18]">
                        {field.label}
                      </div>
                      <div className="text-xs text-[#7A6B60] mt-0.5 italic">
                        {field.placeholder}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {sample && sample.photos.length > 0 && (
                <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#7A6B60]">
                    Иллюстрации из демо-книги
                  </div>
                  <div className="space-y-3">
                    {sample.photos.slice(0, 2).map((ph) => (
                      <div
                        key={ph.id}
                        className="overflow-hidden rounded-2xl border border-[#E5DDD2]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ph.dataUrl}
                          alt={ph.altText}
                          className="w-full h-44 object-cover"
                        />
                        <div className="px-3.5 py-2 text-xs text-[#574940] bg-[#FAF7F2]">
                          {ph.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/demo/${product.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E2638] hover:underline"
                  >
                    <span>Пролистать весь демонстрационный образец</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
