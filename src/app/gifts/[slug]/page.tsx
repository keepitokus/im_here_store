import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { getProductBySlug, PRODUCT_SLUGS } from "@/lib/catalog";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import { LANDINGS, SHOW_MOTHERS_DAY_BANNER } from "@/lib/landing";
import { formatRublesFromKopecks } from "@/lib/utils";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

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
  if (!product) return { title: "Подарок не найден" };
  const sample = DEMO_SAMPLE_BOOKS[product.slug];
  return {
    title: `${product.title} — ${formatRublesFromKopecks(product.initialPriceKopecks)}`,
    description: product.seoDescription,
    openGraph: {
      title: LANDINGS[product.slug].hero,
      description: product.seoDescription,
      images: [sample.coverImage],
    },
  };
}

export default async function GiftProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const page = LANDINGS[product.slug];
  const sample = DEMO_SAMPLE_BOOKS[product.slug];

  const price = formatRublesFromKopecks(product.initialPriceKopecks);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* 1. HERO ПРОДУКТОВОГО ЛЕНДИНГА */}
        <section className={`${page.wash} border-b border-[#DFD2C0] py-12 sm:py-16 lg:py-20`}>
          <div className="layout-container grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold ${page.ink}`}>
                  {page.eyebrow}
                </span>
                {product.slug === "mother-thanks" && SHOW_MOTHERS_DAY_BANNER && (
                  <span className="rounded-full bg-[#1F3042] px-3.5 py-1 text-xs sm:text-[13px] font-medium text-[#F7F2E9]">
                    Ко Дню матери — 29 ноября
                  </span>
                )}
              </div>

              <h1 className="font-serif text-[36px] leading-[1.05] text-[#1F3042] sm:text-5xl xl:text-[58px]">
                {page.hero}
              </h1>

              <p className="text-base sm:text-lg leading-[1.6] text-[#2F3E4E]">
                {page.lead}
              </p>

              <div className="flex flex-wrap items-baseline gap-4 pt-1">
                <span className="font-serif text-4xl font-semibold text-[#1F3042]">
                  {price}
                </span>
                <span className="text-sm text-[#3E4C5C]">
                  {product.allowsRenewalInMvp
                    ? "12 месяцев размещения · далее 990 ₽/год по желанию (без автосписаний)"
                    : "12 месяцев доступа по ссылке · скачивание архива включено"}
                </span>
              </div>

              <div className="flex flex-col gap-3.5 pt-2 sm:flex-row sm:items-center">
                <Link
                  href={`/create/${product.slug}`}
                  className={`inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full px-7 text-base font-medium text-[#F7F2E9] shadow-xs ${page.accent}`}
                >
                  <span>{page.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/demo/${product.slug}`}
                  className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#1F3042] bg-[#FFFDF8] px-6 text-base font-medium text-[#1F3042] hover:bg-[#F7F2E9]"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Посмотреть пример</span>
                </Link>
              </div>
            </div>

            {/* Правая колонка Hero: Обложка книги с чистой фотографией и бумажным титулом под ней */}
            <div className="lg:col-span-6">
              <div className="paper-shadow overflow-hidden rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8]">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAE0D2]">
                  <Image
                    src={sample.coverImage}
                    alt={sample.coverImageAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 580px"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-7 space-y-3 bg-[#FFFDF8]">
                  <p className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-[#7A6855]">
                    Обложка демонстрационного издания
                  </p>
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#1F3042]">
                    {sample.content.coverTitle}
                  </h2>
                  <p className="text-base text-[#2F3E4E]">
                    {sample.content.coverSubtitle}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EAE0D2] pt-3 text-sm text-[#4E5D6C]">
                    <span>{sample.characterSummary}</span>
                    <Link
                      href={`/demo/${product.slug}`}
                      className="font-medium text-[#1F3042] underline decoration-[#B99273] underline-offset-4"
                    >
                      Листать все 8 разворотов →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. ШЕСТЬ КАДРОВ ИСТОРИИ */}
        <section className="py-14 sm:py-20">
          <div className="layout-container space-y-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
                  Визуальная история внутри книги {product.title}
                </p>
                <h2 className="font-serif text-3xl text-[#1F3042] sm:text-4xl lg:text-[42px]">
                  Как раскрываются ваши фотографии на страницах
                </h2>
              </div>
              <p className="text-sm text-[#4E5D6C] max-w-md">
                {sample.disclaimer}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sample.photos.map((photo, idx) => (
                <figure
                  key={photo.id}
                  className="paper-shadow group overflow-hidden rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8] flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAE0D2]">
                    <Image
                      src={photo.dataUrl}
                      alt={photo.altText}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="p-5 space-y-1.5">
                    <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A6855] block">
                      Глава 0{idx + 1} · {photo.roleLabel}
                    </span>
                    <p className="font-serif text-xl font-medium text-[#1F3042] leading-snug">
                      {photo.caption}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 3. ЧТО БУДЕТ ВНУТРИ И ПРИМЕРЫ РАЗВОРОТОВ */}
        <section className="border-y border-[#DFD2C0] bg-[#EFE7DA]/65 py-14 sm:py-20">
          <div className="layout-container grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
                Структура издания
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1F3042]">
                Что будет внутри вашей книги
              </h2>
              <ul className="space-y-3 pt-1">
                {page.inside.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-[#D8CBB8] bg-[#FFFDF8] p-4 text-base text-[#1F3042]"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4D6256] mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6855]">
                Фрагменты текста и глав из примера
              </p>
              {page.spreads.map((spread, i) => {
                const spreadPhoto = sample.photos[(i + 1) % sample.photos.length];
                return (
                  <article
                    key={spread.title}
                    className={`overflow-hidden rounded-3xl border border-[#D8CBB8] ${page.wash} grid grid-cols-1 sm:grid-cols-12`}
                  >
                    <div className="relative min-h-[200px] sm:col-span-5">
                      <Image
                        src={spreadPhoto.dataUrl}
                        alt={spreadPhoto.altText}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, 260px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 sm:p-7 sm:col-span-7 flex flex-col justify-center space-y-2">
                      <p className={`text-xs sm:text-[13px] font-semibold uppercase tracking-[0.16em] ${page.ink}`}>
                        {spread.kicker}
                      </p>
                      <h3 className="font-serif text-2xl sm:text-3xl text-[#1F3042]">
                        {spread.title}
                      </h3>
                      <p className="text-base leading-relaxed text-[#2F3E4E]">
                        {spread.text}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. FAQ И ФИНАЛЬНЫЙ ПРИЗЫВ */}
        <section className="py-14 sm:py-20">
          <div className="layout-container">
            <div className="mx-auto max-w-4xl space-y-8">
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1F3042]">
                Вопросы перед созданием
              </h2>
              <div className="space-y-4">
                {page.faq.map((item) => (
                  <div
                    key={item.q}
                    className="rounded-3xl border border-[#D8CBB8] bg-[#FFFDF8] p-6 sm:p-7"
                  >
                    <h3 className="font-serif text-2xl text-[#1F3042]">{item.q}</h3>
                    <p className="mt-2 text-base leading-relaxed text-[#2F3E4E]">
                      {item.a}
                    </p>
                  </div>
                ))}
                <div className="rounded-3xl border border-[#D8CBB8] bg-[#FAF6EE] p-6 text-sm sm:text-base leading-relaxed text-[#3E4C5C]">
                  {product.hostingPolicyNote}
                </div>
              </div>

              <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center pt-2">
                <Link
                  href={`/create/${product.slug}`}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-base font-medium text-[#F7F2E9] ${page.accent}`}
                >
                  <span>
                    {page.cta} · {price}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/demo/${product.slug}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#1F3042] bg-[#FFFDF8] px-6 text-base font-medium text-[#1F3042]"
                >
                  Посмотреть пример целиком
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
