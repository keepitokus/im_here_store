import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { getProductBySlug, PRODUCT_SLUGS } from "@/lib/catalog";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import { LANDINGS, SHOW_MOTHERS_DAY_BANNER } from "@/lib/landing";
import { formatRublesFromKopecks } from "@/lib/utils";
import { trackServerEvent } from "@/lib/analytics";
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
  trackServerEvent({ event: "view_product", productSlug: product.slug });

  const price = formatRublesFromKopecks(product.initialPriceKopecks);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* 1. HERO ПРОДУКТОВОГО ЛЕНДИНГА С РЕАЛЬНОЙ ОБЛОЖКОЙ И ФОТОГРАФИЯМИ */}
        <section className={`${page.wash} border-b border-[#E5D9C8] px-4 py-12 sm:px-6 sm:py-20`}>
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs uppercase tracking-[0.2em] font-medium ${page.ink}`}>
                  {page.eyebrow}
                </span>
                {product.slug === "mother-thanks" && SHOW_MOTHERS_DAY_BANNER && (
                  <span className="rounded-full bg-[#1F3042] px-3 py-1 text-xs text-[#F7F2E9]">
                    Ко Дню матери — 29 ноября
                  </span>
                )}
              </div>

              <h1 className="font-serif text-4xl leading-[0.96] text-[#1F3042] sm:text-6xl">
                {page.hero}
              </h1>

              <p className="text-base leading-relaxed text-[#2F3E4E] sm:text-lg">
                {page.lead}
              </p>

              <div className="flex flex-wrap items-baseline gap-4 pt-1">
                <span className="font-serif text-4xl font-semibold text-[#1F3042]">
                  {price}
                </span>
                <span className="text-xs text-[#5C6B7A]">
                  {product.allowsRenewalInMvp
                    ? "12 месяцев размещения · продление со 2-го года 990 ₽/год (по желанию)"
                    : "12 месяцев размещения по приватной ссылке · полный архив включён"}
                </span>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <Link
                  href={`/create/${product.slug}`}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm sm:text-base font-medium text-[#F7F2E9] shadow-sm ${page.accent}`}
                >
                  <span>{page.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/demo/${product.slug}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1F3042] bg-[#FFFDF8] px-6 text-sm sm:text-base font-medium text-[#1F3042] hover:bg-[#F7F2E9]"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Посмотреть пример</span>
                </Link>
              </div>
            </div>

            {/* Правая колонка Hero: Обложка книги с большой фотографией и вторым разворотом */}
            <div className="relative lg:col-span-6">
              <div className="paper-shadow overflow-hidden rounded-3xl border border-[#DED0BE] bg-[#FFFDF8]">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={sample.coverImage}
                    alt={sample.coverImageAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-[#FFFDF8]">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#EAE0D2]">
                      Обложка демонстрационного издания
                    </p>
                    <h2 className="mt-1 font-serif text-3xl sm:text-4xl">
                      {sample.content.coverTitle}
                    </h2>
                    <p className="mt-1 text-xs text-[#F5EDE0]/90 sm:text-sm">
                      {sample.content.coverSubtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-6 py-4 bg-[#FFFDF8] text-xs text-[#5C5349]">
                  <span className="truncate">{sample.characterSummary}</span>
                  <Link
                    href={`/demo/${product.slug}`}
                    className="shrink-0 font-medium text-[#1F3042] underline decoration-[#B99273] underline-offset-4"
                  >
                    Листать все 8 разворотов →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. ШЕСТЬ КАДРОВ ИСТОРИИ (ВИЗУАЛЬНАЯ СЕРИЯ ОДНОЙ СЕМЬИ / ПАРЫ) */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8A7563]">
                Визуальная история внутри книги {product.title}
              </p>
              <h2 className="font-serif text-3xl text-[#1F3042] sm:text-5xl">
                Как раскрываются ваши фотографии на страницах
              </h2>
            </div>
            <p className="text-xs text-[#6E6256] max-w-sm">
              {sample.disclaimer}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sample.photos.map((photo, idx) => (
              <figure
                key={photo.id}
                className="paper-shadow group overflow-hidden rounded-2xl border border-[#DFD2C0] bg-[#FFFDF8] flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={photo.dataUrl}
                    alt={photo.altText}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#FFFDF8]">
                    0{idx + 1} · {photo.roleLabel}
                  </span>
                </div>
                <figcaption className="p-4 space-y-1">
                  <p className="font-serif text-lg font-medium text-[#1F3042] leading-snug">
                    {photo.caption}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* 3. ЧТО БУДЕТ ВНУТРИ И ПРИМЕРЫ РАЗВОРОТОВ */}
        <section className="border-t border-[#E5D9C8] bg-[#F3ECE0]/60 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7563]">
                Структура издания
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1F3042]">
                Что будет внутри вашей книги
              </h2>
              <ul className="space-y-3 pt-2">
                {page.inside.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-[#DFD2C0] bg-[#FFFDF8] p-4 text-sm text-[#1F3042]"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4D6256] mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7563]">
                Фрагменты текста и глав из примера
              </p>
              {page.spreads.map((spread, i) => {
                const spreadPhoto = sample.photos[(i + 1) % sample.photos.length];
                return (
                  <article
                    key={spread.title}
                    className={`overflow-hidden rounded-3xl border border-[#DFD2C0] ${page.wash} grid grid-cols-1 sm:grid-cols-12`}
                  >
                    <div className="relative min-h-[180px] sm:col-span-5">
                      <Image
                        src={spreadPhoto.dataUrl}
                        alt={spreadPhoto.altText}
                        fill
                        sizes="(max-width: 640px) 100vw, 260px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 sm:col-span-7 flex flex-col justify-center">
                      <p className={`text-xs uppercase tracking-[0.16em] ${page.ink}`}>
                        {spread.kicker}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1F3042]">
                        {spread.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#3E4C5C]">
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
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 space-y-8">
          <h2 className="font-serif text-4xl text-[#1F3042]">Вопросы перед созданием</h2>
          <div className="space-y-5">
            {page.faq.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-[#DFD2C0] bg-[#FFFDF8] p-6"
              >
                <h3 className="font-serif text-2xl text-[#1F3042]">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#3E4C5C]">
                  {item.a}
                </p>
              </div>
            ))}
            <div className="rounded-2xl border border-[#DFD2C0] bg-[#FAF6EE] p-5 text-xs leading-relaxed text-[#4E5D6C]">
              {product.hostingPolicyNote}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
            <Link
              href={`/create/${product.slug}`}
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm sm:text-base font-medium text-[#F7F2E9] ${page.accent}`}
            >
              <span>
                {page.cta} · {price}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/demo/${product.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#1F3042] px-6 text-sm font-medium text-[#1F3042]"
            >
              Посмотреть пример целиком
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
