"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

const HERO_SPREADS = [
  {
    id: "love-cover",
    edition: "Издание «Наша история» · Вымышленный пример",
    kicker: "Обложка книги · Глава I",
    title: "Анна и Михаил",
    subtitle:
      "Пять осеней, старый каменный мост и разговор, который не хотелось заканчивать.",
    mainImage: "/images/books/love-1-cover.webp",
    mainAlt: "Влюблённая пара Анна и Михаил на каменном мосту в золотой час",
    demoHref: "/demo/love-story",
    accentBg: "bg-[#F6ECEA]",
    accentText: "text-[#7A3E4A]",
    spineColor: "bg-[#6E2F3B]",
  },
  {
    id: "mom-spread",
    edition: "Издание «Мама, спасибо» · Вымышленный пример",
    kicker: "Семейный архив · Родной дом",
    title: "Любимой маме Елене",
    subtitle:
      "Синяя фарфоровая чашка у окна, яблочный пирог с корицей и твои тёплые руки.",
    mainImage: "/images/books/mom-1-cover.webp",
    mainAlt: "Мама Елена с маленькой дочкой Катей у солнечного окна",
    demoHref: "/demo/mother-thanks",
    accentBg: "bg-[#EEF3F6]",
    accentText: "text-[#2C4A6B]",
    spineColor: "bg-[#2C4A6B]",
  },
  {
    id: "baby-spread",
    edition: "Издание «Мой первый год» · Вымышленный пример",
    kicker: "Хроника 0–12 месяцев",
    title: "Лев · Наш первый год",
    subtitle:
      "От первого сонного утра в вязаном пледе до первых самостоятельных шагов.",
    mainImage: "/images/books/baby-1-cover.webp",
    mainAlt: "Новорождённый малыш Лев в объятиях мамы и папы",
    demoHref: "/demo/first-year",
    accentBg: "bg-[#F3F6F2]",
    accentText: "text-[#3B5243]",
    spineColor: "bg-[#3F5347]",
  },
  {
    id: "day-spread",
    edition: "Издание «Твой день» · Вымышленный пример",
    kicker: "Специальный выпуск к 30-летию",
    title: "Александр · Твой день",
    subtitle:
      "Рассветы в горах, открытие мастерской и тост от друзей, которые рядом.",
    mainImage: "/images/books/day-1-cover.webp",
    mainAlt: "Журнальный портрет именинника Александра",
    demoHref: "/demo/your-day",
    accentBg: "bg-[#F8F1E4]",
    accentText: "text-[#7A5828]",
    spineColor: "bg-[#6E512F]",
  },
];

export function HeroBook() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => {
      setIndex((v) => (v + 1) % HERO_SPREADS.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  const current = HERO_SPREADS[index];

  return (
    <div className="relative mx-auto w-full">
      {/* Подложка многостраничного книжного блока */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2 top-3 bottom-3 hidden rounded-r-3xl border border-[#DFD2C0] bg-[#FAF6EE] shadow-md sm:block w-full"
      />

      <div className="paper-shadow relative overflow-hidden rounded-3xl border border-[#D8C9B5] bg-[#FFFDF8]">
        {/* Переплёт / корешок слева */}
        <div
          aria-hidden
          className={`absolute inset-y-0 left-0 z-20 w-3 sm:w-4 ${current.spineColor}`}
        />

        <div className="pl-3 sm:pl-4">
          {/* Верхняя колонтитульная строка книги */}
          <div className="flex items-center justify-between gap-2 border-b border-[#EAE0D2] bg-[#FBF8F1] px-5 py-3 text-xs sm:text-sm text-[#5C5349]">
            <span className="truncate font-medium">{current.edition}</span>
            <span className="shrink-0 font-medium text-[#1F3042]">
              0{index + 1} / 0{HERO_SPREADS.length}
            </span>
          </div>

          {/* Чистая крупная фотография обложки без мелких плавающих миниатюр поверх лиц */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAE0D2]">
            <Image
              src={current.mainImage}
              alt={current.mainAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 620px"
              className="object-cover object-center"
            />
          </div>

          {/* Бумажный титульный лист под фотографией: высокая читаемость на всех экранах */}
          <div className={`p-6 sm:p-7 space-y-5 ${current.accentBg}`}>
            <div className="space-y-2">
              <p
                className={`text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] ${current.accentText}`}
              >
                {current.kicker}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl leading-tight text-[#1F3042]">
                {current.title}
              </h2>
              <p className="text-base leading-relaxed text-[#2F3E4E]">
                {current.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#D8CBB8] pt-4">
              <Link
                href={current.demoHref}
                className="inline-flex min-h-11 items-center gap-2 text-sm sm:text-base font-medium text-[#1F3042] underline decoration-[#B99273] underline-offset-4 hover:text-[#7A3E4A]"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>Листать эту книгу целиком</span>
              </Link>

              {/* Крупные органы управления перелистыванием (44x44px+) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-1">
                  {HERO_SPREADS.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Показать обложку ${item.title}`}
                      className={`h-3 rounded-full transition-all ${
                        i === index
                          ? "w-7 bg-[#1F3042]"
                          : "w-3 bg-[#1F3042]/25 hover:bg-[#1F3042]/50"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setIndex(
                      (index - 1 + HERO_SPREADS.length) % HERO_SPREADS.length
                    )
                  }
                  aria-label="Предыдущая книга"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C8B9A6] bg-[#FFFDF8] text-[#1F3042] hover:bg-[#EFE7DA]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((index + 1) % HERO_SPREADS.length)}
                  aria-label="Следующая книга"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C8B9A6] bg-[#FFFDF8] text-[#1F3042] hover:bg-[#EFE7DA]"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
