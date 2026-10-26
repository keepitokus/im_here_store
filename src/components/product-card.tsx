import Image from "next/image";
import Link from "next/link";
import { ProductSlug, PRODUCTS_CATALOG } from "@/lib/catalog";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import { formatRublesFromKopecks } from "@/lib/utils";
import { ArrowRight, BookOpen } from "lucide-react";

interface EditorialCardConfig {
  slug: ProductSlug;
  issueNumber: string;
  occasionTag: string;
  emotionalSentence: string;
  scenePhoto: string;
  sceneAlt: string;
  coverPhoto: string;
  coverAlt: string;
  coverMiniTitle: string;
  coverMiniSub: string;
  paperTone: string;
  spineColor: string;
  accentBadge: string;
  buttonBg: string;
  layoutVariant: "featured-split" | "vertical-editorial" | "magazine-frame" | "tender-album";
}

export const EDITORIAL_PRODUCT_CARDS: Record<ProductSlug, EditorialCardConfig> = {
  "mother-thanks": {
    slug: "mother-thanks",
    issueNumber: "Издание № 01 · Семейная благодарность",
    occasionTag: "Ко Дню матери · На день рождения мамы · Без повода",
    emotionalSentence:
      "Слова любви, детские фотографии и тепло родного дома в книге, которую мама будет перечитывать со слезами радости.",
    scenePhoto: "/images/books/mom-6-hug.webp",
    sceneAlt: "Тёплые объятия мамы Елены и взрослой дочери у солнечного окна",
    coverPhoto: "/images/books/mom-1-cover.webp",
    coverAlt: "Обложка книги Мама, спасибо: мама с маленькой дочкой на руках",
    coverMiniTitle: "Любимой маме",
    coverMiniSub: "За тёплые руки и дом",
    paperTone: "bg-[#EEF3F6]",
    spineColor: "bg-[#2C4A6B]",
    accentBadge: "bg-[#DDE8F0] text-[#243D59]",
    buttonBg: "bg-[#2C4A6B] hover:bg-[#213852]",
    layoutVariant: "featured-split",
  },
  "love-story": {
    slug: "love-story",
    issueNumber: "Издание № 02 · Для двоих",
    occasionTag: "Годовщина · Признание · День свадьбы",
    emotionalSentence:
      "От первой случайной встречи и прогулки под дождём до сегодняшнего дня — ваша личная история любви в одном альбоме.",
    scenePhoto: "/images/books/love-1-cover.webp",
    sceneAlt: "Влюблённая пара Анна и Михаил на старом каменном мосту на закате",
    coverPhoto: "/images/books/love-2-first-date.webp",
    coverAlt: "Обложка книги Наша история: первое свидание при свечах",
    coverMiniTitle: "Анна и Михаил",
    coverMiniSub: "Наша история · 14 сентября",
    paperTone: "bg-[#F6ECEA]",
    spineColor: "bg-[#6E2638]",
    accentBadge: "bg-[#EED9DC] text-[#6E2638]",
    buttonBg: "bg-[#6E2638] hover:bg-[#561C2B]",
    layoutVariant: "vertical-editorial",
  },
  "your-day": {
    slug: "your-day",
    issueNumber: "Издание № 03 · Праздничный выпуск",
    occasionTag: "День рождения · Юбилей · Близкому человеку",
    emotionalSentence:
      "Персональный коллекционный журнал, где именинник, общие приключения и главные слова восхищения — в центре внимания.",
    scenePhoto: "/images/books/day-2-dinner.webp",
    sceneAlt: "Праздничный ужин при свечах на открытой террасе в кругу близких друзей",
    coverPhoto: "/images/books/day-1-cover.webp",
    coverAlt: "Обложка книги Твой день: портрет именинника Александра",
    coverMiniTitle: "Александр · 30",
    coverMiniSub: "Твой день · Спецвыпуск",
    paperTone: "bg-[#F8F1E4]",
    spineColor: "bg-[#7A5828]",
    accentBadge: "bg-[#EFE1C6] text-[#6B4B1E]",
    buttonBg: "bg-[#7A5828] hover:bg-[#5E431D]",
    layoutVariant: "magazine-frame",
  },
  "first-year": {
    slug: "first-year",
    issueNumber: "Издание № 04 · Семейная хроника 0–12 мес.",
    occasionTag: "Рождение малыша · Первый годик · Молодым родителям",
    emotionalSentence:
      "Нежная летопись первых двенадцати месяцев жизни ребёнка: от первой улыбки в колыбели до первых самостоятельных шагов.",
    scenePhoto: "/images/books/baby-1-cover.webp",
    sceneAlt: "Новорождённый малыш в молочном вязаном пледе в объятиях мамы и папы",
    coverPhoto: "/images/books/baby-5-steps.webp",
    coverAlt: "Обложка книги Мой первый год: первые шаги малыша",
    coverMiniTitle: "Лев · Первый год",
    coverMiniSub: "0–12 месяцев света",
    paperTone: "bg-[#F3F6F2]",
    spineColor: "bg-[#43594B]",
    accentBadge: "bg-[#DFE9E1] text-[#33463A]",
    buttonBg: "bg-[#43594B] hover:bg-[#33463A]",
    layoutVariant: "tender-album",
  },
};

export function ProductCard({
  slug,
  featured = false,
}: {
  slug: ProductSlug;
  featured?: boolean;
}) {
  const product = PRODUCTS_CATALOG[slug];
  const sample = DEMO_SAMPLE_BOOKS[slug];
  const cfg = EDITORIAL_PRODUCT_CARDS[slug];
  const price = formatRublesFromKopecks(product.initialPriceKopecks);

  if (featured) {
    return (
      <article
        className={`paper-shadow group relative overflow-hidden rounded-3xl border border-[#DFD2C0] ${cfg.paperTone} p-5 sm:p-8 lg:col-span-2`}
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Левая часть: крупная журнальная фотография + наложенная 3D-обложка книги */}
          <div className="relative lg:col-span-7">
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-black/10 bg-[#EAE0D2] shadow-md">
              <Image
                src={cfg.scenePhoto}
                alt={cfg.sceneAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-36 text-xs text-[#FFFDF8]/90 sm:text-sm">
                <span className="uppercase tracking-[0.18em] text-[#EAE0D2] block text-[10px]">
                  {cfg.issueNumber}
                </span>
                <span>{sample.characterSummary}</span>
              </div>
            </div>

            {/* Миниатюра реальной обложки книги поверх кадра */}
            <div className="absolute -bottom-3 right-3 w-32 sm:right-6 sm:w-44 overflow-hidden rounded-xl border-2 border-[#FFFDF8] bg-[#FFFDF8] shadow-xl">
              <div className={`absolute inset-y-0 left-0 z-10 w-2 ${cfg.spineColor}`} />
              <div className="pl-2">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={cfg.coverPhoto}
                    alt={cfg.coverAlt}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
                <div className="p-2.5 bg-[#FFFDF8]">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#8A7563]">
                    Обложка книги
                  </p>
                  <p className="font-serif text-sm font-semibold leading-tight text-[#1F3042] truncate">
                    {cfg.coverMiniTitle}
                  </p>
                  <p className="text-[10px] text-[#5C6B7A] truncate">
                    {cfg.coverMiniSub}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Правая часть: типографика, одно эмоциональное предложение, цена и 2 CTA */}
          <div className="flex flex-col justify-between space-y-5 pt-2 lg:col-span-5">
            <div className="space-y-3">
              <span
                className={`inline-block rounded-full px-3.5 py-1 text-xs font-medium ${cfg.accentBadge}`}
              >
                {cfg.occasionTag}
              </span>
              <h3 className="font-serif text-3xl sm:text-5xl leading-none text-[#1F3042]">
                <Link href={`/gifts/${slug}`} className="hover:opacity-85">
                  {product.title}
                </Link>
              </h3>
              <p className="text-base leading-relaxed text-[#2F3E4E]">
                {cfg.emotionalSentence}
              </p>
            </div>

            <div className="border-t border-[#D8CBB8] pt-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-[0.16em] text-[#7A6855] block">
                    Стоимость издания
                  </span>
                  <span className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F3042]">
                    {price}
                  </span>
                </div>
                <span className="text-xs text-[#5C6B7A]">
                  12 мес. по ссылке · 6 глав и фотоальбом
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link
                  href={`/create/${slug}`}
                  className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-[#FFFDF8] transition-colors ${cfg.buttonBg}`}
                >
                  <span>Создать книгу</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/demo/${slug}`}
                  className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-[#1F3042]/30 bg-[#FFFDF8] px-5 text-sm font-medium text-[#1F3042] hover:bg-[#F7F2E9]"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Посмотреть пример</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`paper-shadow group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#DFD2C0] ${cfg.paperTone} p-5 sm:p-7`}
    >
      <div className="space-y-5">
        {/* Верхняя строка журнала */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className={`rounded-full px-3 py-1 font-medium ${cfg.accentBadge}`}>
            {cfg.occasionTag}
          </span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-[#7A6855]">
            {cfg.issueNumber.split("·")[0]}
          </span>
        </div>

        {/* Крупная фотография + наложенная обложка книги */}
        <div className="relative pb-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black/10 bg-[#EAE0D2] shadow-sm">
            <Image
              src={cfg.scenePhoto}
              alt={cfg.sceneAlt}
              fill
              sizes="(max-width: 768px) 100vw, 520px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>

          {/* Обложка книги с корешком */}
          <div className="absolute bottom-0 right-4 w-32 sm:w-36 overflow-hidden rounded-xl border-2 border-[#FFFDF8] bg-[#FFFDF8] shadow-lg">
            <div className={`absolute inset-y-0 left-0 z-10 w-2 ${cfg.spineColor}`} />
            <div className="pl-2">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={cfg.coverPhoto}
                  alt={cfg.coverAlt}
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </div>
              <div className="p-2 bg-[#FFFDF8]">
                <p className="text-[8px] uppercase tracking-[0.16em] text-[#8A7563]">
                  Обложка
                </p>
                <p className="font-serif text-xs font-semibold leading-tight text-[#1F3042] truncate">
                  {cfg.coverMiniTitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Название и одно эмоциональное предложение */}
        <div className="space-y-2 pt-1">
          <h3 className="font-serif text-3xl sm:text-4xl leading-none text-[#1F3042]">
            <Link href={`/gifts/${slug}`} className="hover:opacity-85">
              {product.title}
            </Link>
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-[#2F3E4E]">
            {cfg.emotionalSentence}
          </p>
        </div>
      </div>

      {/* Стоимость и две кнопки */}
      <div className="mt-6 border-t border-[#D8CBB8] pt-4 space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#7A6855] block">
              Первая покупка
            </span>
            <span className="font-serif text-3xl font-semibold text-[#1F3042]">
              {price}
            </span>
          </div>
          {slug === "first-year" ? (
            <span className="text-xs text-[#33463A] font-medium">
              Продление со 2-го года: 990 ₽/год (по желанию)
            </span>
          ) : (
            <span className="text-xs text-[#5C6B7A]">12 месяцев доступа по ссылке</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Link
            href={`/create/${slug}`}
            className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium text-[#FFFDF8] transition-colors ${cfg.buttonBg}`}
          >
            <span>Создать книгу</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/demo/${slug}`}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#1F3042]/30 bg-[#FFFDF8] px-4 text-sm font-medium text-[#1F3042] hover:bg-[#F7F2E9]"
          >
            <BookOpen className="h-4 w-4" />
            <span>Посмотреть пример</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
