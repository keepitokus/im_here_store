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
    subtitle: "Пять осеней, старый каменный мост и разговор, который не хотелось заканчивать.",
    quote: "«Не просто подарок. Ваша история, которую можно открыть снова»",
    mainImage: "/images/books/love-1-cover.webp",
    mainAlt: "Влюблённая пара Анна и Михаил на каменном мосту в золотой час",
    secondaryImage: "/images/books/love-2-first-date.webp",
    secondaryAlt: "Первое свидание пары в уютной книжной кофейне",
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
    subtitle: "Синяя фарфоровая чашка у окна, яблочный пирог с корицей и твои тёплые руки.",
    quote: "«Мама, спасибо. За всё, что не успел сказать вслух»",
    mainImage: "/images/books/mom-1-cover.webp",
    mainAlt: "Мама Елена с маленькой дочкой Катей у солнечного окна",
    secondaryImage: "/images/books/mom-6-hug.webp",
    secondaryAlt: "Тёплые объятия мамы и взрослой дочери",
    demoHref: "/demo/mother-thanks",
    accentBg: "bg-[#EEF3F6]",
    accentText: "text-[#3E5874]",
    spineColor: "bg-[#2E4660]",
  },
  {
    id: "baby-spread",
    edition: "Издание «Мой первый год» · Вымышленный пример",
    kicker: "Хроника 0–12 месяцев",
    title: "Лев · Наш первый год",
    subtitle: "От первого сонного утра в вязаном пледе до первых самостоятельных шагов.",
    quote: "«Первый год пролетает. Пусть каждый момент останется рядом»",
    mainImage: "/images/books/baby-1-cover.webp",
    mainAlt: "Новорождённый малыш Лев в объятиях мамы и папы",
    secondaryImage: "/images/books/baby-5-steps.webp",
    secondaryAlt: "Первые шаги малыша к папиным рукам",
    demoHref: "/demo/first-year",
    accentBg: "bg-[#F3F6F2]",
    accentText: "text-[#4D6256]",
    spineColor: "bg-[#3F5347]",
  },
  {
    id: "day-spread",
    edition: "Издание «Твой день» · Вымышленный пример",
    kicker: "Специальный выпуск к 30-летию",
    title: "Александр · Твой день",
    subtitle: "Рассветы в горах, открытие мастерской и тост от друзей, которые рядом.",
    quote: "«Целая книга о человеке, которого хочется поздравить»",
    mainImage: "/images/books/day-1-cover.webp",
    mainAlt: "Журнальный портрет именинника Александра",
    secondaryImage: "/images/books/day-2-dinner.webp",
    secondaryAlt: "Праздничный ужин при свечах на террасе",
    demoHref: "/demo/your-day",
    accentBg: "bg-[#F8F1E4]",
    accentText: "text-[#8A6840]",
    spineColor: "bg-[#6E512F]",
  },
];

export function HeroBook() {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  function goToSlide(nextIndex: number) {
    setIsFlipping(true);
    setTimeout(() => {
      setIndex(nextIndex);
      setIsFlipping(false);
    }, 180);
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => {
      setIndex((v) => (v + 1) % HERO_SPREADS.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  const current = HERO_SPREADS[index];

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Подложка многостраничного книжного блока */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2.5 top-3 bottom-3 w-full rounded-r-2xl border border-[#DFD2C0] bg-[#FAF6EE] shadow-md sm:-right-4"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1.5 top-1.5 bottom-1.5 w-full rounded-r-2xl border border-[#E5D9C8] bg-[#FDFBF6]"
      />

      {/* Реалистичный книжный разворот с тканевым корешком */}
      <div
        className={`paper-shadow relative overflow-hidden rounded-2xl border border-[#DED0BE] bg-[#FFFDF9] transition-opacity duration-200 ${
          isFlipping ? "opacity-80" : "opacity-100"
        }`}
      >
        {/* Переплёт / корешок слева */}
        <div
          aria-hidden
          className={`absolute inset-y-0 left-0 z-20 w-3 sm:w-4 ${current.spineColor} shadow-inner`}
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-3 z-20 w-px bg-white/30 sm:left-4"
        />

        <div className="pl-3 sm:pl-4">
          {/* Верхняя колонтитульная строка книги */}
          <div className="flex items-center justify-between border-b border-[#ECE2D4] bg-[#FBF8F1] px-4 py-2.5 text-[11px] text-[#7A6855] sm:px-6">
            <span className="truncate font-medium">{current.edition}</span>
            <span className="shrink-0 uppercase tracking-[0.18em]">
              Лист 0{index + 1} / 0{HERO_SPREADS.length}
            </span>
          </div>

          {/* Главная фотография обложки/разворота */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAE0D2]">
            <Image
              src={current.mainImage}
              alt={current.mainAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1412]/75 via-[#1A1412]/15 to-transparent" />

            {/* Миниатюра второго кадра разворота в правом верхнем углу */}
            <div className="absolute right-3 top-3 hidden w-28 overflow-hidden rounded-lg border-2 border-[#FFFDF8] shadow-lg sm:block">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={current.secondaryImage}
                  alt={current.secondaryAlt}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Титульная типографика на обложке */}
            <div className="absolute inset-x-0 bottom-0 p-5 text-[#FFFDF8] sm:p-7">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#EFE4D4]">
                {current.kicker}
              </p>
              <h2 className="mt-1.5 font-serif text-3xl leading-none sm:text-5xl">
                {current.title}
              </h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-[#F5EDE0]/95 sm:text-sm">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Нижний бумажный лист разворота с цитатой и управлением перелистыванием */}
          <div className={`px-5 py-4 sm:px-7 sm:py-5 ${current.accentBg}`}>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <p className={`font-serif text-base italic sm:text-lg ${current.accentText}`}>
                  {current.quote}
                </p>
                <div className="flex items-center gap-3 text-xs text-[#5C5349]">
                  <span className="font-script text-xl text-[#1F3042]">Я здесь</span>
                  <span>·</span>
                  <Link
                    href={current.demoHref}
                    className="inline-flex items-center gap-1 font-medium text-[#1F3042] underline decoration-[#B99273] underline-offset-4 hover:text-[#7A3E4A]"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Открыть эту книгу целиком</span>
                  </Link>
                </div>
              </div>

              {/* Кнопки перелистывания обложек */}
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <div className="flex items-center gap-1.5">
                  {HERO_SPREADS.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToSlide(i)}
                      aria-label={`Показать книгу ${item.title}`}
                      className={`h-2.5 rounded-full transition-all ${
                        i === index
                          ? "w-6 bg-[#1F3042]"
                          : "w-2.5 bg-[#1F3042]/25 hover:bg-[#1F3042]/50"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      goToSlide(
                        (index - 1 + HERO_SPREADS.length) % HERO_SPREADS.length
                      )
                    }
                    aria-label="Предыдущий разворот"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D4C5B3] bg-[#FFFDF8] text-[#1F3042] hover:bg-[#EFE7DA]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToSlide((index + 1) % HERO_SPREADS.length)}
                    aria-label="Следующий разворот"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D4C5B3] bg-[#FFFDF8] text-[#1F3042] hover:bg-[#EFE7DA]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
