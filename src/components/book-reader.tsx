"use client";

import React, { useState, useMemo } from "react";
import { BookContentJsonV1, sortTimelineEvents } from "@/lib/book-schema";
import { editorCopy } from "@/lib/editor-copy";
import { BookTimeline } from "@/components/book-timeline";
import { toTimelineEvents } from "@/lib/timeline-view";
import { getProductBySlug, isValidProductSlug } from "@/lib/catalog";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  MapPin,
  MailOpen,
  Sparkles,
  BookOpen,
  Layers,
  Award,
  MessageCircleHeart,
} from "lucide-react";

export interface BookReaderPhoto {
  id: string;
  caption?: string | null;
  altText: string;
  isFavorite?: boolean;
  dataUrl?: string | null;
}

export interface BookReaderViewProps {
  content: BookContentJsonV1;
  photos: BookReaderPhoto[];
  watermarkText?: string | null;
  modeBanner?: React.ReactNode;
}

export function BookReaderView({
  content,
  photos,
  watermarkText,
  modeBanner,
}: BookReaderViewProps) {
  const product = getProductBySlug(content.productSlug);
  const theme = useMemo(() => {
    if (!product) return null;
    return (
      product.themes.find((t) => t.id === content.themeId) || product.themes[0]
    );
  }, [product, content.themeId]);

  const sortedTimeline = useMemo(
    () => sortTimelineEvents(content.timeline || []),
    [content.timeline]
  );

  const favoritePhoto = useMemo(() => {
    if (content.favoriteMediaId) {
      const found = photos.find((p) => p.id === content.favoriteMediaId);
      if (found) return found;
    }
    const userFav = photos.find((p) => p.isFavorite) || photos[0];
    if (userFav) return userFav;
    if (isValidProductSlug(content.productSlug)) {
      const fallback = DEMO_SAMPLE_BOOKS[content.productSlug];
      return {
        id: "fallback-cover",
        dataUrl: fallback.coverImage,
        altText: fallback.coverImageAlt,
        caption: "Иллюстративная обложка издания (вы можете загрузить свою фотографию в редакторе)",
      };
    }
    return null;
  }, [photos, content.favoriteMediaId, content.productSlug]);

  const [viewMode, setViewMode] = useState<"spreads" | "scroll">("spreads");
  const [currentSpread, setCurrentSpread] = useState(0);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);

  const bgClass = theme?.bgClass || "bg-[#FAF7F2]";
  const cardClass = theme?.cardClass || "bg-[#FFFFFF]";
  const accentClass = theme?.accentClass || "bg-[#6E2638] text-[#FAF4F4]";
  const badgeClass = theme?.badgeClass || "bg-[#F3E1E4] text-[#6E2638]";
  const borderClass = theme?.borderClass || "border-[#E6CDD2]";
  const textClass = theme?.textClass || "text-[#231C18]";
  const mutedClass = theme?.mutedClass || "text-[#6E5D53]";

  const previewCopy = isValidProductSlug(content.productSlug)
    ? editorCopy(content.productSlug).preview
    : null;
  const emptyFragment = previewCopy?.emptyFragment ?? "";

  const spreads = useMemo(() => {
    const items: { id: string; label: string; node: React.ReactNode }[] = [];

    // 1. Титульная обложка
    items.push({
      id: "cover",
      label: "Обложка",
      node: (
        <div
          className={`relative overflow-hidden rounded-3xl border ${borderClass} ${cardClass} p-6 sm:p-12 shadow-sm`}
        >
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-5 py-6 sm:py-10">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium ${badgeClass}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {product?.title || "Коллекционное издание «Я здесь»"}
            </span>

            <h1
              className={`font-serif text-3xl sm:text-5xl font-semibold tracking-tight leading-tight ${textClass}`}
            >
              {content.coverTitle}
            </h1>

            {content.coverSubtitle && (
              <p className={`text-base sm:text-lg leading-relaxed ${mutedClass}`}>
                {content.coverSubtitle}
              </p>
            )}

            {content.dedication && (
              <div
                className={`mt-2 inline-block border-y ${borderClass} px-6 py-2.5 font-serif italic text-base ${textClass}`}
              >
                {content.dedication}
              </div>
            )}

            {favoritePhoto?.dataUrl && (
              <div className="mt-6 w-full max-w-lg overflow-hidden rounded-2xl border border-black/10 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={favoritePhoto.dataUrl}
                  alt={favoritePhoto.altText}
                  className="w-full h-56 sm:h-72 object-cover"
                />
                {favoritePhoto.caption && (
                  <p
                    className={`px-4 py-2.5 text-xs italic ${mutedClass} bg-black/[0.02]`}
                  >
                    {favoritePhoto.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ),
    });

    // 2. Уникальный тематический разворот по типу подарка
    if (content.productSlug === "love-story") {
      items.push({
        id: "story-core",
        label: "Знакомство и свидание",
        node: (
          <div
            className={`rounded-3xl border ${borderClass} ${cardClass} p-6 sm:p-10 space-y-8 shadow-sm`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-4">
              <div>
                <p className={`text-xs uppercase tracking-widest ${mutedClass}`}>
                  Глава I · Точка отсчёта
                </p>
                <h2 className={`font-serif text-2xl sm:text-3xl font-semibold ${textClass}`}>
                  {content.answers.partnerNames || content.coverTitle}
                </h2>
              </div>
              {content.answers.meetingDate && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium ${badgeClass}`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {content.answers.meetingDate}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                  {product?.fields.find((field) => field.id === "howWeMet")?.label || "Как всё начиналось?"}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.howWeMet || emptyFragment}
                </p>
              </div>

              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                  {product?.fields.find((field) => field.id === "firstDate")?.label || "Наш самый счастливый момент"}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.firstDate || emptyFragment}
                </p>
              </div>
            </div>

            {content.answers.favoritePlace && (
              <div
                className={`flex items-start gap-3 rounded-2xl ${badgeClass} p-4`}
              >
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider">
                    Наше особенное место на карте
                  </div>
                  <div className="text-sm sm:text-base font-medium mt-0.5">
                    {content.answers.favoritePlace}
                  </div>
                </div>
              </div>
            )}
          </div>
        ),
      });
    } else if (content.productSlug === "mother-thanks") {
      items.push({
        id: "mother-core",
        label: "Детство и мудрость",
        node: (
          <div
            className={`rounded-3xl border ${borderClass} ${cardClass} p-6 sm:p-10 space-y-7 shadow-sm`}
          >
            <div className="border-b border-black/10 pb-4">
              <p className={`text-xs uppercase tracking-widest ${mutedClass}`}>
                Глава I · Родной дом
              </p>
              <h2 className={`font-serif text-2xl sm:text-3xl font-semibold ${textClass}`}>
                {content.answers.motherName || "Любимой маме"}
              </h2>
              {content.answers.childhoodNickname && (
                <p className={`mt-1 text-sm italic ${mutedClass}`}>
                  Ты ласково называла меня: {content.answers.childhoodNickname}
                </p>
              )}
            </div>

            <div className="space-y-5">
              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                  {product?.fields.find((field) => field.id === "vividMemory")?.label || "Моё любимое воспоминание"}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.vividMemory}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                  <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                    Чему главному ты меня научила
                  </h3>
                  <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                    {content.answers.whatSheTaught}
                  </p>
                </div>

                <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                  <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                    {product?.fields.find((field) => field.id === "gratitudeList")?.label || "За что я тебе благодарен"}
                  </h3>
                  <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                    {content.answers.gratitudeList}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
      });
    } else if (content.productSlug === "your-day") {
      items.push({
        id: "your-day-core",
        label: "Поздравление и моменты",
        node: (
          <div
            className={`rounded-3xl border ${borderClass} ${cardClass} p-6 sm:p-10 space-y-7 shadow-sm`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-4">
              <div>
                <p className={`text-xs uppercase tracking-widest ${mutedClass}`}>
                  Праздничный выпуск
                </p>
                <h2 className={`font-serif text-2xl sm:text-3xl font-semibold ${textClass}`}>
                  {content.answers.celebrantName || content.coverTitle}
                </h2>
              </div>
              {content.answers.celebrantAge && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-semibold ${badgeClass}`}
                >
                  <Award className="h-3.5 w-3.5" />
                  {content.answers.celebrantAge}
                </span>
              )}
            </div>

            <div className={`rounded-2xl ${badgeClass} p-5 sm:p-6`}>
              <p className="font-serif text-lg sm:text-xl leading-relaxed">
                {content.answers.mainGreeting
                  ? `«${content.answers.mainGreeting}»`
                  : emptyFragment}
              </p>
              {content.answers.fromWho && (
                <p className="mt-2 text-xs font-medium uppercase tracking-wider opacity-80">
                  — {content.answers.fromWho}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                  {product?.fields.find((field) => field.id === "bestMoments")?.label || "Наше любимое воспоминание"}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.bestMoments}
                </p>
              </div>

              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                  {product?.fields.find((field) => field.id === "whyWeLoveYou")?.label || "За что мы тебя любим"}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.whyWeLoveYou}
                </p>
              </div>
            </div>

            {content.answers.finalCongrats && (
              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                  {product?.fields.find((field) => field.id === "finalCongrats")?.label}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.finalCongrats}
                </p>
              </div>
            )}
          </div>
        ),
      });
    } else if (content.productSlug === "first-year") {
      items.push({
        id: "first-year-core",
        label: "0–12 месяцев и открытия",
        node: (
          <div
            className={`rounded-3xl border ${borderClass} ${cardClass} p-6 sm:p-10 space-y-7 shadow-sm`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-4">
              <div>
                <p className={`text-xs uppercase tracking-widest ${mutedClass}`}>
                  Приватный семейный альбом · 0–12 месяцев
                </p>
                <h2 className={`font-serif text-2xl sm:text-3xl font-semibold ${textClass}`}>
                  {content.answers.babyName || content.coverTitle}
                </h2>
                {content.answers.birthDate && (
                  <p className={`text-xs sm:text-sm ${mutedClass}`}>
                    Дата рождения: {content.answers.birthDate}
                  </p>
                )}
              </div>
              {content.answers.birthMetrics && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium ${badgeClass}`}
                >
                  {content.answers.birthMetrics}
                </span>
              )}
            </div>

            {content.answers.howWeWelcomed && (
              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                  {product?.fields.find((field) => field.id === "howWeWelcomed")?.label}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.howWeWelcomed}
                </p>
              </div>
            )}

            {content.answers.firstSmile && (
              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                  {product?.fields.find((field) => field.id === "firstSmile")?.label}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.firstSmile}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                  {product?.fields.find((field) => field.id === "firstAchievements")?.label || "Первые достижения"}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.firstAchievements}
                </p>
              </div>

              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium flex items-center gap-2 ${textClass}`}>
                  <MessageCircleHeart className="h-5 w-5 opacity-75" />
                  {product?.fields.find((field) => field.id === "firstWords")?.label || "Первые слова и звуки"}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.firstWords || emptyFragment}
                </p>
              </div>
            </div>

            {content.answers.monthsHighlights && (
              <div className={`rounded-2xl border ${borderClass} p-5 space-y-2`}>
                <h3 className={`font-serif text-xl font-medium ${textClass}`}>
                  Дневник по месяцам (0–12 мес.)
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}>
                  {content.answers.monthsHighlights}
                </p>
              </div>
            )}
          </div>
        ),
      });
    }

    // 3. Авторские главы и таймлайн
    if (
      (content.chapters && content.chapters.some((c) => c.body.trim())) ||
      sortedTimeline.length > 0
    ) {
      items.push({
        id: "chapters-timeline",
        label: "Главы и хроника",
        node: (
          <div
            className={`rounded-3xl border ${borderClass} ${cardClass} p-6 sm:p-10 space-y-8 shadow-sm`}
          >
            {content.chapters &&
              content.chapters.filter((c) => c.body.trim()).length > 0 && (
                <div className="space-y-4">
                  <p className={`text-xs uppercase tracking-widest ${mutedClass}`}>
                    Авторские главы
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {content.chapters
                      .filter((c) => c.body.trim())
                      .map((ch) => (
                        <div
                          key={ch.id}
                          className={`rounded-2xl border ${borderClass} p-5 space-y-2`}
                        >
                          <h3 className={`font-serif text-xl font-semibold ${textClass}`}>
                            {ch.title}
                          </h3>
                          <p
                            className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${textClass}`}
                          >
                            {ch.body}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {sortedTimeline.length > 0 && (
              <div className="space-y-4">
                <p className={`text-xs uppercase tracking-widest ${mutedClass}`}>
                  Хронология ключевых моментов
                </p>
                <BookTimeline events={toTimelineEvents(sortedTimeline, photos)} />
              </div>
            )}
          </div>
        ),
      });
    }

    // 4. Фотогалерея
    if (photos.length > 0) {
      items.push({
        id: "gallery",
        label: `Фотогалерея (${photos.length})`,
        node: (
          <div
            className={`rounded-3xl border ${borderClass} ${cardClass} p-6 sm:p-10 space-y-6 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase tracking-widest ${mutedClass}`}>
                  Фотоархив издания
                </p>
                <h2 className={`font-serif text-2xl sm:text-3xl font-semibold ${textClass}`}>
                  Кадры, к которым хочется возвращаться
                </h2>
              </div>
              <span className={`text-xs font-medium ${mutedClass}`}>
                {photos.length} фото
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {photos.map((photo) => (
                <figure
                  key={photo.id}
                  className={`overflow-hidden rounded-2xl border ${borderClass} bg-black/[0.02] flex flex-col`}
                >
                  {photo.dataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.dataUrl}
                      alt={photo.altText}
                      className="w-full h-56 sm:h-64 object-cover"
                    />
                  ) : (
                    <div className="h-56 flex items-center justify-center text-xs text-neutral-400">
                      Фотография
                    </div>
                  )}
                  <figcaption className="p-4 flex items-start justify-between gap-2">
                    <span className={`text-sm leading-snug ${textClass}`}>
                      {photo.caption || photo.altText}
                    </span>
                    {photo.isFavorite && (
                      <Heart className="h-4 w-4 shrink-0 text-[#6E2638] fill-[#6E2638]" />
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ),
      });
    }

    // 5. Финальное письмо
    const finalLetterText =
      content.finalLetterBody ||
      (content.productSlug === "love-story" ? content.answers.personalConfession : "") ||
      (content.productSlug === "mother-thanks" ? content.answers.finalLetterToMom : "") ||
      (content.productSlug === "your-day"
        ? content.answers.finalCongrats || content.answers.wishesForFuture
        : "") ||
      (content.productSlug === "first-year" ? content.answers.letterToBaby : "") ||
      previewCopy?.emptyLetter ||
      emptyFragment;

    items.push({
      id: "final-letter",
      label: "Финальное письмо",
      node: (
        <div
          className={`rounded-3xl border ${borderClass} ${cardClass} p-6 sm:p-12 text-center shadow-sm`}
        >
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
              <MailOpen className="h-6 w-6 text-[#6E2638]" />
            </div>

            <p className={`text-xs uppercase tracking-widest ${mutedClass}`}>
              Завершающая страница книги
            </p>
            <h2 className={`font-serif text-2xl sm:text-4xl font-semibold ${textClass}`}>
              {content.finalLetterTitle || "Личное послание"}
            </h2>

            {!envelopeOpened && viewMode === "spreads" ? (
              <div className="space-y-4 py-4">
                <p className={`text-sm ${mutedClass}`}>
                  Нажмите, чтобы распечатать конверт и прочитать финальные слова
                </p>
                <Button
                  type="button"
                  onClick={() => setEnvelopeOpened(true)}
                  className={accentClass}
                >
                  Открыть личное письмо
                </Button>
              </div>
            ) : (
              <div
                className={`rounded-2xl border ${borderClass} p-6 sm:p-8 text-left bg-[#FFFEFA] shadow-inner`}
              >
                <p
                  className={`font-serif text-lg sm:text-xl leading-relaxed whitespace-pre-line ${textClass}`}
                >
                  {finalLetterText}
                </p>
                <div
                  className={`mt-6 pt-4 border-t ${borderClass} flex items-center justify-between text-xs ${mutedClass}`}
                >
                  <span>С любовью и теплом</span>
                  <span className="font-serif italic text-sm">«Я здесь»</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    });

    return items;
  }, [
    badgeClass,
    borderClass,
    cardClass,
    content,
    envelopeOpened,
    favoritePhoto,
    mutedClass,
    photos,
    product,
    previewCopy,
    emptyFragment,
    sortedTimeline,
    textClass,
    viewMode,
    accentClass,
  ]);

  return (
    <div className={`min-h-screen ${bgClass} py-6 sm:py-10 px-3 sm:px-6 relative`}>
      {/* Водяной знак для неоплаченного предпросмотра (ТЗ Раздел 3 и 12) */}
      {watermarkText && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-30 flex flex-wrap items-center justify-center gap-16 overflow-hidden opacity-[0.08] select-none"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="-rotate-12 font-serif text-2xl sm:text-4xl font-bold uppercase tracking-widest text-[#231C18]"
            >
              {watermarkText}
            </span>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-6 relative z-10">
        {modeBanner}

        {/* Панель управления чтением книги */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border ${borderClass} ${cardClass} px-4 py-3 shadow-xs`}
        >
          <div className="no-scrollbar flex w-full min-w-0 gap-2 overflow-x-auto py-1">
            {spreads.map((sp, idx) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => {
                  setViewMode("spreads");
                  setCurrentSpread(idx);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  viewMode === "spreads" && currentSpread === idx
                    ? accentClass
                    : `${mutedClass} hover:bg-black/5`
                }`}
              >
                {idx + 1}. {sp.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "spreads" ? "scroll" : "spreads")}
              className={`inline-flex items-center gap-1.5 rounded-full border ${borderClass} px-3 py-1.5 text-xs font-medium ${textClass} hover:bg-black/5`}
            >
              {viewMode === "spreads" ? (
                <>
                  <Layers className="h-3.5 w-3.5" />
                  <span>Все страницы сразу</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Режим листания</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Контент книги */}
        {viewMode === "spreads" ? (
          <div className="space-y-6">
            {spreads[currentSpread]?.node}

            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                aria-label="Предыдущая страница"
                disabled={currentSpread === 0}
                onClick={() => setCurrentSpread((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Предыдущая страница</span>
              </Button>

              <span className={`min-w-0 text-center text-xs font-medium ${mutedClass}`}>
                Разворот {currentSpread + 1} из {spreads.length}
              </span>

              <Button
                type="button"
                variant="default"
                aria-label="Следующая страница"
                disabled={currentSpread === spreads.length - 1}
                onClick={() =>
                  setCurrentSpread((p) => Math.min(spreads.length - 1, p + 1))
                }
              >
                <span className="hidden sm:inline">Следующая страница</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {spreads.map((sp) => (
              <section key={sp.id} aria-label={sp.label}>
                {sp.node}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
