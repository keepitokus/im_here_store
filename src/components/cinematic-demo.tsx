"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductSlug, PRODUCTS_CATALOG } from "@/lib/catalog";
import { DemoSampleBook } from "@/lib/demo-books";
import { formatRublesFromKopecks } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sparkles, MailOpen, Calendar } from "lucide-react";

interface Spread {
  id: string;
  label: string;
  node: ReactNode;
}

const SLUG_LABELS: { slug: ProductSlug; title: string }[] = [
  { slug: "love-story", title: "«Наша история»" },
  { slug: "mother-thanks", title: "«Мама, спасибо»" },
  { slug: "your-day", title: "«Твой день»" },
  { slug: "first-year", title: "«Мой первый год»" },
];

export function CinematicDemo({
  slug,
  title,
  price,
  sample,
  accent,
  wash,
}: {
  slug: ProductSlug;
  title: string;
  price: number;
  sample: DemoSampleBook;
  accent: string;
  wash: string;
}) {
  const content = sample.content;
  const photos = sample.photos;
  const [index, setIndex] = useState(0);
  const [activeTimelineIdx, setActiveTimelineIdx] = useState(0);

  const p0 = photos[0];
  const p1 = photos[1] || photos[0];
  const p2 = photos[2] || photos[0];
  const p3 = photos[3] || photos[1] || photos[0];
  const p4 = photos[4] || photos[2] || photos[0];
  const p5 = photos[5] || photos[0];

  const introQuote =
    content.answers.howWeMet ||
    content.answers.vividMemory ||
    content.answers.mainGreeting ||
    content.answers.firstAchievements ||
    "";

  const secondaryStory =
    content.answers.firstDate ||
    content.answers.whatSheTaught ||
    content.answers.whyWeLoveYou ||
    content.answers.monthsHighlights ||
    "";

  const spreads: Spread[] = [
    // 1. Обложка с большой фотографией
    {
      id: "cover",
      label: "1. Обложка",
      node: (
        <div className="grid min-h-[540px] grid-cols-1 lg:grid-cols-12">
          <div className="relative min-h-[340px] lg:col-span-7 lg:min-h-[540px]">
            <Image
              src={p0.dataUrl}
              alt={p0.altText}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 640px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/20" />
            <div className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3.5 py-1 text-[11px] text-[#FFFDF8] backdrop-blur-xs">
              {p0.caption}
            </div>
          </div>

          <div
            className={`flex flex-col justify-between p-7 sm:p-12 lg:col-span-5 ${wash}`}
          >
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#7A6855]">
                Коллекционное цифровое издание · Лист I
              </p>
              <span className="inline-block rounded-full border border-[#1F3042]/20 bg-[#FFFDF8]/80 px-3 py-1 text-xs font-medium text-[#1F3042]">
                Вымышленный демонстрационный пример
              </span>
            </div>

            <div className="my-8 space-y-4">
              <h2 className="font-serif text-4xl leading-[0.96] text-[#1F3042] sm:text-6xl">
                {content.coverTitle}
              </h2>
              <p className="text-base leading-relaxed text-[#2F3E4E] sm:text-lg">
                {content.coverSubtitle}
              </p>
              {content.dedication && (
                <p className="border-t border-[#D8CBB8] pt-4 font-serif text-base italic text-[#5C5349]">
                  {content.dedication}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#D8CBB8] pt-4">
              <span className="font-script text-3xl text-[#1F3042]">Я здесь</span>
              <span className="text-xs uppercase tracking-[0.16em] text-[#7A6855]">
                Листайте далее →
              </span>
            </div>
          </div>
        </div>
      ),
    },

    // 2. Первая страница с эмоциональным вступлением
    {
      id: "opening",
      label: "2. Вступление",
      node: (
        <div className="grid min-h-[540px] grid-cols-1 bg-[#FFFDF8] lg:grid-cols-12">
          <div className="flex flex-col justify-between p-7 sm:p-12 lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.22em] text-[#8A7563]">
              Пролог · С чего начинается память
            </p>
            <blockquote className="my-6 space-y-5">
              <p className="font-serif text-2xl leading-relaxed text-[#1F3042] sm:text-4xl">
                «{introQuote}»
              </p>
              <footer className="text-xs uppercase tracking-[0.18em] text-[#8A7563]">
                — {content.dedication || content.coverTitle}
              </footer>
            </blockquote>
            <p className="text-xs text-[#6E6256]">
              Каждая страница бережно хранит ваши подлинные слова и фотографии.
            </p>
          </div>

          <div className={`flex flex-col justify-center p-6 sm:p-10 lg:col-span-5 ${wash}`}>
            <figure className="overflow-hidden rounded-2xl border border-[#DED0BE] bg-[#FFFDF8] shadow-md">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={p1.dataUrl}
                  alt={p1.altText}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-4">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8A7563] block">
                  {p1.roleLabel}
                </span>
                <p className="mt-1 font-serif text-base text-[#1F3042]">
                  {p1.caption}
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      ),
    },

    // 3. Полноэкранная фотография
    {
      id: "full-bleed",
      label: "3. Панорамный кадр",
      node: (
        <figure className="relative min-h-[540px] w-full overflow-hidden bg-[#1F3042]">
          <Image
            src={p2.dataUrl}
            alt={p2.altText}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 p-7 text-[#FFFDF8] sm:p-12">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#E5D7C3]">
              Полноэкранный разворот · {p2.roleLabel}
            </span>
            <h3 className="mt-2 font-serif text-3xl sm:text-5xl">
              {p2.caption}
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-[#EFE6D8]/90">
              {content.chapters[0]?.body}
            </p>
          </figcaption>
        </figure>
      ),
    },

    // 4. Разворот с историей и фотографией
    {
      id: "story-chapter",
      label: "4. История и фото",
      node: (
        <div className="grid min-h-[540px] grid-cols-1 bg-[#FFFDF8] lg:grid-cols-12">
          <div className="relative min-h-[320px] lg:col-span-6 lg:min-h-[540px]">
            <Image
              src={p3.dataUrl}
              alt={p3.altText}
              fill
              sizes="(max-width: 1024px) 100vw, 520px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-between p-7 sm:p-12 lg:col-span-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8A7563]">
                Глава истории · {p3.roleLabel}
              </p>
              <h3 className="font-serif text-3xl text-[#1F3042] sm:text-4xl">
                {content.chapters[0]?.title || "Моменты, которые остаются с нами"}
              </h3>
              <p className="text-base leading-relaxed text-[#2F3E4E]">
                {content.chapters[0]?.body}
              </p>
              {secondaryStory && (
                <div className={`rounded-2xl p-5 ${wash}`}>
                  <h4 className="font-serif text-xl font-medium text-[#1F3042]">
                    {content.chapters[1]?.title || "То, что особенно дорого"}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#2F3E4E]">
                    {secondaryStory}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-[#EAE0D2] pt-4 text-xs italic text-[#7A6855]">
              На фотографии: {p3.caption}
            </div>
          </div>
        </div>
      ),
    },

    // 5. Красивый фотоколлаж из всех 6 фотографий истории
    {
      id: "collage",
      label: "5. Фотоколлаж (6 фото)",
      node: (
        <div className="min-h-[540px] bg-[#FBF8F1] p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#E5D9C8] pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7563]">
                Фотоархив книги · Единая семейная история
              </p>
              <h3 className="font-serif text-3xl text-[#1F3042] sm:text-4xl">
                Шесть глав в фотографиях
              </h3>
            </div>
            <span className="text-xs text-[#6E6256]">
              В вашей книге может быть до 30 собственных снимков
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, i) => (
              <figure
                key={photo.id}
                className="group overflow-hidden rounded-2xl border border-[#DFD2C0] bg-[#FFFDF8] shadow-xs"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={photo.dataUrl}
                    alt={photo.altText}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-[#FFFDF8]">
                    0{i + 1} · {photo.roleLabel}
                  </span>
                </div>
                <figcaption className="p-3.5 text-xs leading-snug text-[#2F3E4E]">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ),
    },

    // 6. Интерактивная хронология
    {
      id: "timeline",
      label: "6. Хронология",
      node: (
        <div className="grid min-h-[540px] grid-cols-1 bg-[#FFFDF8] lg:grid-cols-12">
          <div className="p-7 sm:p-10 lg:col-span-7 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7563]">
                Интерактивная линия времени
              </p>
              <h3 className="font-serif text-3xl text-[#1F3042] sm:text-4xl">
                Памятные даты и события
              </h3>
              <p className="text-xs text-[#6E6256] mt-1">
                Нажмите на любую дату, чтобы рассмотреть карточку момента:
              </p>
            </div>

            <ol className="space-y-3">
              {content.timeline.map((event, idx) => {
                const isSelected = idx === activeTimelineIdx;
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => setActiveTimelineIdx(idx)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? `border-[#1F3042] ${wash} shadow-xs`
                          : "border-[#EAE0D2] bg-[#FAF6EE]/60 hover:bg-[#F3ECE0]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-[#7A6855]">
                        <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em]">
                          <Calendar className="h-3.5 w-3.5" />
                          {event.dateLabel}
                        </span>
                        <span>Глава 0{idx + 1}</span>
                      </div>
                      <p className="mt-1 font-serif text-xl font-semibold text-[#1F3042]">
                        {event.title}
                      </p>
                      <p className="mt-1 text-sm text-[#3E4C5C]">
                        {event.description}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div
            className={`flex flex-col justify-between p-7 sm:p-10 lg:col-span-5 ${wash}`}
          >
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.18em] text-[#7A6855]">
                Кадр выбранной главы
              </span>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#DED0BE] shadow-md">
                <Image
                  src={(photos[activeTimelineIdx % photos.length] || p0).dataUrl}
                  alt={(photos[activeTimelineIdx % photos.length] || p0).altText}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover"
                />
              </div>
              <h4 className="font-serif text-2xl text-[#1F3042]">
                {content.timeline[activeTimelineIdx]?.title}
              </h4>
              <p className="text-sm leading-relaxed text-[#2F3E4E]">
                {content.timeline[activeTimelineIdx]?.description}
              </p>
            </div>
            <p className="text-xs text-[#6E6256] pt-4">
              В редакторе можно указывать как точные даты, так и тёплые свободные
              формулировки («Той самой осенью»).
            </p>
          </div>
        </div>
      ),
    },

    // 7. Страница с личным письмом
    {
      id: "letter",
      label: "7. Личное письмо",
      node: (
        <div
          className={`grid min-h-[540px] grid-cols-1 lg:grid-cols-12 ${wash} p-6 sm:p-10 gap-8 items-center`}
        >
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border-2 border-[#FFFDF8] bg-[#FFFDF8] shadow-lg">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={p4.dataUrl}
                  alt={p4.altText}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-xs text-[#5C5349]">
                <strong>{p4.roleLabel}:</strong> {p4.caption}
              </div>
            </div>
          </div>

          <article className="paper-shadow rounded-2xl border border-[#E2D5C3] bg-[#FFFDF8] p-7 sm:p-11 lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EAE0D2] pb-3 text-xs uppercase tracking-[0.18em] text-[#8A7563]">
              <span className="inline-flex items-center gap-1.5">
                <MailOpen className="h-4 w-4 text-[#B99273]" />
                Запечатанное письмо
              </span>
              <span>Предпоследний разворот</span>
            </div>
            <h3 className="font-serif text-3xl text-[#1F3042] sm:text-4xl">
              {content.finalLetterTitle}
            </h3>
            <p className="font-serif text-xl leading-relaxed text-[#1F3042] sm:text-2xl whitespace-pre-line">
              «{content.finalLetterBody}»
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-[#EAE0D2]">
              <span className="text-xs text-[#6E6256]">
                {content.dedication}
              </span>
              <span className="font-script text-3xl text-[#1F3042]">Я здесь</span>
            </div>
          </article>
        </div>
      ),
    },

    // 8. Финальный эмоциональный разворот
    {
      id: "finale",
      label: "8. Финал",
      node: (
        <div className="grid min-h-[540px] grid-cols-1 lg:grid-cols-12">
          <div className="relative min-h-[340px] lg:col-span-7 lg:min-h-[540px]">
            <Image
              src={p5.dataUrl}
              alt={p5.altText}
              fill
              sizes="(max-width: 1024px) 100vw, 640px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-[#FFFDF8]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#EAE0D2]">
                {p5.roleLabel}
              </p>
              <p className="mt-1 font-serif text-2xl sm:text-3xl">
                {p5.caption}
              </p>
            </div>
          </div>

          <div
            className={`flex flex-col justify-between p-7 sm:p-12 lg:col-span-5 ${wash}`}
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#7A6855]">
                <Sparkles className="h-3.5 w-3.5" />
                Конец демонстрационного образца
              </span>
              <p className="font-script text-5xl text-[#1F3042]">Я здесь</p>
            </div>

            <div className="my-6 space-y-4">
              <h3 className="font-serif text-3xl leading-tight text-[#1F3042] sm:text-4xl">
                Создайте такую книгу со своими фотографиями и словами
              </h3>
              <p className="text-sm leading-relaxed text-[#2F3E4E]">
                Вы посмотрели вымышленный пример издания {title}. В редакторе вы
                сможете загрузить до 30 своих снимков, ответить на короткие
                вопросы и сразу увидеть готовый предпросмотр.
              </p>
              <div className="pt-2">
                <Link
                  href={`/create/${slug}`}
                  className={`inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 text-sm font-medium text-[#FFFDF8] shadow-sm ${accent}`}
                >
                  Создать свою книгу · {formatRublesFromKopecks(price)}
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-[#6E6256]">
              {sample.disclaimer}
            </p>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setIndex((value) => Math.min(spreads.length - 1, value + 1));
      }
      if (event.key === "ArrowLeft") {
        setIndex((value) => Math.max(0, value - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spreads.length]);

  const spread = spreads[index];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      {/* Переключатель между 4 демо-книгами и шапка образца */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#DFD2C0] bg-[#FFFDF8] p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#8A7563]">
              {sample.characterSummary}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1F3042] mt-0.5">
              Демонстрационная книга {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/gifts/${slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[#1F3042]/30 px-4 text-xs sm:text-sm font-medium text-[#1F3042] hover:bg-[#EFE7DA]"
            >
              О подарке
            </Link>
            <Link
              href={`/create/${slug}`}
              className={`inline-flex min-h-11 items-center rounded-full px-5 text-xs sm:text-sm font-medium text-[#F7F2E9] ${accent}`}
            >
              Создать свою · {formatRublesFromKopecks(price)}
            </Link>
          </div>
        </div>

        {/* Быстрое переключение между 4 примерами */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#ECE2D4] pt-3 text-xs">
          <span className="text-[#7A6855] font-medium">Все 4 примера книг:</span>
          {SLUG_LABELS.map((item) => {
            const active = item.slug === slug;
            const prod = PRODUCTS_CATALOG[item.slug];
            return (
              <Link
                key={item.slug}
                href={`/demo/${item.slug}`}
                className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
                  active
                    ? "bg-[#1F3042] text-[#F7F2E9]"
                    : "bg-[#F3ECE0] text-[#2F3E4E] hover:bg-[#E5D9C8]"
                }`}
              >
                {item.title} ({formatRublesFromKopecks(prod.initialPriceKopecks)})
              </Link>
            );
          })}
        </div>
      </div>

      {/* Вкладки всех 8 разворотов */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Развороты демонстрационной книги"
      >
        {spreads.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={itemIndex === index}
            onClick={() => setIndex(itemIndex)}
            className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-medium transition-colors ${
              itemIndex === index
                ? "bg-[#1F3042] text-[#FFFDF8]"
                : "border border-[#DFD2C0] bg-[#FFFDF8] text-[#4E5D6C] hover:bg-[#EFE7DA]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Основной книжный разворот */}
      <div
        className="paper-shadow overflow-hidden rounded-3xl border border-[#DFD2C0] bg-[#FFFDF8]"
        aria-live="polite"
      >
        {spread.node}
      </div>

      {/* Нижняя панель навигации по страницам */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#DFD2C0] bg-[#FFFDF8] px-4 py-3">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#D4C5B3] px-4 text-sm font-medium text-[#1F3042] disabled:opacity-40 hover:bg-[#EFE7DA]"
          disabled={index === 0}
          onClick={() => setIndex((v) => v - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Предыдущий разворот</span>
        </button>
        <p className="text-xs sm:text-sm font-medium text-[#4E5D6C]">
          Разворот {index + 1} из {spreads.length} · {spread.label}
        </p>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#1F3042] px-5 text-sm font-medium text-[#FFFDF8] disabled:opacity-40 hover:bg-[#162433]"
          disabled={index === spreads.length - 1}
          onClick={() => setIndex((v) => v + 1)}
        >
          <span>Следующий разворот</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
