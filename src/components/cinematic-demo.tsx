"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ProductSlug } from "@/lib/catalog";
import { DemoSampleBook } from "@/lib/demo-books";
import { formatRublesFromKopecks } from "@/lib/utils";

interface Spread {
  id: string;
  label: string;
  node: ReactNode;
}

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

  const quote =
    content.answers.personalConfession ||
    content.answers.finalLetterToMom ||
    content.answers.mainGreeting ||
    content.answers.letterToBaby ||
    "";

  const spreads: Spread[] = [
    {
      id: "cover",
      label: "Обложка",
      node: (
        <div className={`flex h-full flex-col justify-between p-8 sm:p-14 ${wash}`}>
          <p className="text-xs uppercase tracking-[0.22em]">Демонстрационное издание</p>
          <div>
            <h2 className="font-serif text-5xl leading-[0.95] sm:text-7xl">{content.coverTitle}</h2>
            <p className="mt-4 max-w-md text-lg">{content.coverSubtitle}</p>
          </div>
          <p className="font-script text-4xl">Я здесь</p>
        </div>
      ),
    },
    {
      id: "quote",
      label: "Эпиграф",
      node: (
        <div className="flex h-full items-center bg-[#FFFDF8] p-8 sm:p-16">
          <blockquote>
            <p className="font-serif text-3xl leading-snug sm:text-5xl">«{quote.slice(0, 180)}»</p>
            <p className="mt-6 text-sm uppercase tracking-[0.16em] text-[#8A7563]">{content.dedication}</p>
          </blockquote>
        </div>
      ),
    },
    {
      id: "chapter",
      label: "Глава",
      node: (
        <div className="grid h-full md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <p className="text-xs uppercase tracking-[0.18em]">Глава I</p>
            <h3 className="mt-3 font-serif text-4xl">{content.chapters[0]?.title}</h3>
            <p className="mt-4 leading-relaxed">{content.chapters[0]?.body}</p>
          </div>
          <div className={`${wash} flex items-end p-8`}>
            <p className="font-serif text-3xl">{content.chapters[1]?.title || "Дальше — ваши слова"}</p>
          </div>
        </div>
      ),
    },
    {
      id: "photo",
      label: "Кадр",
      node: photos[0] ? (
        <figure className="relative h-full min-h-[460px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[0].dataUrl} alt={photos[0].altText} className="h-full w-full object-cover" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-[#1F3042]/80 p-5 text-sm text-[#F7F2E9]">
            {photos[0].caption}
          </figcaption>
        </figure>
      ) : null,
    },
    {
      id: "timeline",
      label: "Хроника",
      node: (
        <div className="h-full overflow-auto bg-[#FFFDF8] p-8 sm:p-12">
          <p className="text-xs uppercase tracking-[0.18em]">Хроника</p>
          <ol className="mt-6 space-y-5">
            {content.timeline.map((event) => (
              <li key={event.id} className="grid gap-2 border-t border-[#EAE0D2] pt-4 sm:grid-cols-[140px_1fr]">
                <p className="text-xs uppercase tracking-[0.12em] text-[#8A7563]">{event.dateLabel}</p>
                <div>
                  <p className="font-serif text-2xl">{event.title}</p>
                  <p className="text-sm text-[#3E4C5C]">{event.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ),
    },
    {
      id: "collage",
      label: "Коллаж",
      node: (
        <div className="grid h-full min-h-[460px] gap-3 bg-[#EFE7DA] p-4 sm:grid-cols-2">
          {photos.map((photo) => (
            <figure key={photo.id} className="bg-[#FFFDF8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.dataUrl} alt={photo.altText} className="h-48 w-full object-cover sm:h-56" />
              <figcaption className="p-3 text-sm">{photo.caption}</figcaption>
            </figure>
          ))}
          <div className={`flex items-end p-6 sm:col-span-2 ${wash}`}>
            <p className="font-serif text-3xl">Персонажи вымышлены. Ваша книга соберётся из ваших кадров.</p>
          </div>
        </div>
      ),
    },
    {
      id: "letter",
      label: "Письмо",
      node: (
        <div className="flex h-full items-center justify-center bg-[#F7F2E9] p-6">
          <article className="paper-shadow max-w-xl bg-[#FFFDF8] p-8 sm:p-12">
            <p className="text-xs uppercase tracking-[0.18em]">Последние страницы</p>
            <h3 className="mt-3 font-serif text-4xl">{content.finalLetterTitle}</h3>
            <p className="mt-5 font-serif text-xl leading-relaxed">{content.finalLetterBody}</p>
          </article>
        </div>
      ),
    },
    {
      id: "end",
      label: "Финал",
      node: (
        <div className={`flex h-full flex-col items-start justify-center p-8 sm:p-14 ${wash}`}>
          <p className="font-script text-5xl">Я здесь</p>
          <p className="mt-4 max-w-md text-lg">Такую книгу можно собрать для своих людей. Пример ничего не списывает и не сохраняет.</p>
          <Link href={`/create/${slug}`} className={`mt-8 inline-flex min-h-12 items-center rounded-full px-6 text-[#F7F2E9] ${accent}`}>
            Создать свою · {formatRublesFromKopecks(price)}
          </Link>
        </div>
      ),
    },
  ];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") setIndex((value) => Math.min(spreads.length - 1, value + 1));
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spreads.length]);

  const spread = spreads[index];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#8A7563]">Пример · {sample.characterSummary}</p>
          <h1 className="font-serif text-4xl">{title}</h1>
        </div>
        <Link href={`/create/${slug}`} className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm text-[#F7F2E9] ${accent}`}>
          Создать книгу
        </Link>
      </div>
      <div className="paper-shadow min-h-[520px] overflow-hidden border border-[#EAE0D2] bg-white" aria-live="polite">
        {spread.node}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" className="min-h-11 px-3 disabled:opacity-40" disabled={index === 0} onClick={() => setIndex((v) => v - 1)}>
          Назад
        </button>
        <p className="text-sm">
          {index + 1} / {spreads.length} · {spread.label}
        </p>
        <button type="button" className="min-h-11 px-3 disabled:opacity-40" disabled={index === spreads.length - 1} onClick={() => setIndex((v) => v + 1)}>
          Дальше
        </button>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Развороты книги">
        {spreads.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={itemIndex === index}
            className={`min-h-11 shrink-0 px-3 text-sm ${itemIndex === index ? "border-b-2 border-[#1F3042]" : "text-[#5C6B7A]"}`}
            onClick={() => setIndex(itemIndex)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
