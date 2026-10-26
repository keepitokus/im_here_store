import Image from "next/image";
import Link from "next/link";
import { ProductSlug, PRODUCTS_CATALOG } from "@/lib/catalog";
import { formatRublesFromKopecks } from "@/lib/utils";
import { ArrowRight, BookOpen } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

interface EditorialCardConfig {
  slug: ProductSlug;
  issueNumber: string;
  occasionTag: string;
  emotionalSentence: string;
  scenePhoto: string;
  sceneAlt: string;
  coverMiniTitle: string;
  paperTone: string;
  spineColor: string;
  accentBadge: string;
  buttonBg: string;
}

export const EDITORIAL_PRODUCT_CARDS: Record<ProductSlug, EditorialCardConfig> = {
  "mother-thanks": {
    slug: "mother-thanks",
    issueNumber: "Издание № 01 · Ко Дню матери 29 ноября",
    occasionTag: "Маме · День матери · День рождения мамы",
    emotionalSentence:
      "Слова благодарности, детские фотографии и тепло родного дома в книге, которую мама будет перечитывать снова и снова.",
    scenePhoto: "/images/books/mom-1-cover.webp",
    sceneAlt: "Мама Елена держит на руках маленькую дочку у солнечного окна",
    coverMiniTitle: "Мама, спасибо",
    paperTone: "bg-[#EEF3F6]",
    spineColor: "bg-[#2C4A6B]",
    accentBadge: "bg-[#DDE8F0] text-[#1F3852]",
    buttonBg: "bg-[#2C4A6B] hover:bg-[#213852]",
  },
  "love-story": {
    slug: "love-story",
    issueNumber: "Издание № 02 · Для пары",
    occasionTag: "Годовщина · Признание · Свадьба",
    emotionalSentence:
      "От первой случайной встречи и прогулки под дождём до сегодняшнего дня — ваша личная история любви в одном альбоме.",
    scenePhoto: "/images/books/love-1-cover.webp",
    sceneAlt: "Влюблённая пара Анна и Михаил на старом каменном мосту на закате",
    coverMiniTitle: "Наша история",
    paperTone: "bg-[#F6ECEA]",
    spineColor: "bg-[#6E2638]",
    accentBadge: "bg-[#EED9DC] text-[#6E2638]",
    buttonBg: "bg-[#6E2638] hover:bg-[#561C2B]",
  },
  "your-day": {
    slug: "your-day",
    issueNumber: "Издание № 03 · Праздничный выпуск",
    occasionTag: "День рождения · Юбилей · Близкому человеку",
    emotionalSentence:
      "Персональный коллекционный журнал, где именинник, общие приключения и главные слова восхищения — в центре внимания.",
    scenePhoto: "/images/books/day-1-cover.webp",
    sceneAlt: "Портрет именинника Александра в солнечной студии",
    coverMiniTitle: "Твой день",
    paperTone: "bg-[#F8F1E4]",
    spineColor: "bg-[#7A5828]",
    accentBadge: "bg-[#EFE1C6] text-[#6B4B1E]",
    buttonBg: "bg-[#7A5828] hover:bg-[#5E431D]",
  },
  "first-year": {
    slug: "first-year",
    issueNumber: "Издание № 04 · Хроника 0–12 месяцев",
    occasionTag: "Рождение малыша · Первый годик · Родителям",
    emotionalSentence:
      "Нежная летопись первых двенадцати месяцев жизни ребёнка: от первой улыбки в колыбели до первых самостоятельных шагов.",
    scenePhoto: "/images/books/baby-1-cover.webp",
    sceneAlt: "Новорождённый малыш в молочном вязаном пледе в объятиях мамы и папы",
    coverMiniTitle: "Мой первый год",
    paperTone: "bg-[#F3F6F2]",
    spineColor: "bg-[#43594B]",
    accentBadge: "bg-[#DFE9E1] text-[#2F4236]",
    buttonBg: "bg-[#43594B] hover:bg-[#33463A]",
  },
};

export function ProductCard({
  slug,
  priority = false,
}: {
  slug: ProductSlug;
  priority?: boolean;
}) {
  const product = PRODUCTS_CATALOG[slug];
  const cfg = EDITORIAL_PRODUCT_CARDS[slug];
  const price = formatRublesFromKopecks(product.initialPriceKopecks);

  return (
    <article
      className={`paper-shadow group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#D8CBB8] ${cfg.paperTone}`}
    >
      {/* Верхняя часть: обложка книги с переплётом без перекрывающих лица плавающих миниатюр */}
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-[#E2D6C5] bg-[#FFFDF8]/80 px-6 py-2.5 text-xs sm:text-[13px] font-medium text-[#5C5349]">
          <span>{cfg.issueNumber}</span>
          <BrandLogo size="sm" />
        </div>

        <div className="px-5 pt-5 sm:px-7 sm:pt-6">
          <div className="relative overflow-hidden rounded-2xl border border-[#D8CBB8] bg-[#FFFDF8] shadow-sm">
            {/* Корешок обложки книги */}
            <div
              aria-hidden
              className={`absolute inset-y-0 left-0 z-10 w-3 ${cfg.spineColor}`}
            />
            <div className="pl-3">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAE0D2]">
                <Image
                  src={cfg.scenePhoto}
                  alt={cfg.sceneAlt}
                  fill
                  priority={priority}
                  loading={priority ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between border-t border-[#ECE2D4] bg-[#FFFDF8] px-4 py-2.5 text-xs sm:text-[13px] text-[#5C5349]">
                <span className="font-medium text-[#1F3042]">
                  Обложка издания «{cfg.coverMiniTitle}»
                </span>
                <span>До 30 фото · 6 глав</span>
              </div>
            </div>
          </div>
        </div>

        {/* Текстовая часть карточки */}
        <div className="px-6 pt-6 sm:px-7 space-y-3">
          <span
            className={`inline-block rounded-full px-3.5 py-1 text-xs sm:text-[13px] font-medium ${cfg.accentBadge}`}
          >
            {cfg.occasionTag}
          </span>

          <h3 className="font-serif text-3xl sm:text-4xl font-medium leading-tight text-[#1F3042]">
            <Link href={`/gifts/${slug}`} className="hover:opacity-80">
              {product.title}
            </Link>
          </h3>

          <p className="text-base leading-relaxed text-[#2F3E4E]">
            {cfg.emotionalSentence}
          </p>
        </div>
      </div>

      {/* Нижняя часть: выровненная цена и две крупные кнопки */}
      <div className="px-6 pb-6 pt-6 sm:px-7 sm:pb-7 mt-6 border-t border-[#D8CBB8]/80 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="block text-xs sm:text-[13px] uppercase tracking-[0.12em] text-[#6E6256]">
              Стоимость книги
            </span>
            <span className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F3042]">
              {price}
            </span>
          </div>
          <div className="text-right text-xs sm:text-sm text-[#3E4C5C]">
            {slug === "first-year" ? (
              <span className="font-medium text-[#2F4236]">
                1 год включён · далее 990 ₽/год по желанию
              </span>
            ) : (
              <span>12 месяцев доступа по ссылке + архив</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/create/${slug}`}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-medium text-[#FFFDF8] transition-colors shadow-xs ${cfg.buttonBg}`}
          >
            <span>Создать книгу</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/demo/${slug}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1F3042]/35 bg-[#FFFDF8] px-5 text-[15px] font-medium text-[#1F3042] hover:bg-[#F7F2E9] transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>Посмотреть пример</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
