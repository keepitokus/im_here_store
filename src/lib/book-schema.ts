import { z } from "zod";
import { PRODUCT_SLUGS, ProductSlug, getProductBySlug } from "./catalog";

export const TimelineEventInputSchema = z.object({
  id: z.string().min(1),
  eventDate: z.string().nullable().optional(),
  dateLabel: z.string().min(1).max(120),
  title: z.string().min(1).max(160),
  description: z.string().max(1500).default(""),
  mediaAssetId: z.string().nullable().optional(),
});

export const ChapterInputSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(160),
  body: z.string().max(3000).default(""),
  promptKey: z.string().nullable().optional(),
});

export const BookContentJsonV1Schema = z.object({
  schemaVersion: z.literal(1),
  productSlug: z.enum(PRODUCT_SLUGS as [string, ...string[]]),
  coverTitle: z.string().min(1).max(160),
  coverSubtitle: z.string().max(240).default(""),
  dedication: z.string().max(500).default(""),
  themeId: z.string().min(1).max(80),
  answers: z.record(z.string(), z.string()),
  chapters: z.array(ChapterInputSchema).max(20).default([]),
  timeline: z.array(TimelineEventInputSchema).max(24).default([]),
  favoriteMediaId: z.string().nullable().optional(),
  finalLetterTitle: z.string().max(160).default("Письмо для тебя"),
  finalLetterBody: z.string().max(4000).default(""),
  pinEnabled: z.boolean().default(false),
});

export type BookContentJsonV1 = z.infer<typeof BookContentJsonV1Schema>;

export function sortTimelineEvents<
  T extends { eventDate?: string | null; dateLabel: string }
>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const aHasIso = Boolean(a.eventDate && /^\d{4}-\d{2}-\d{2}/.test(a.eventDate));
    const bHasIso = Boolean(b.eventDate && /^\d{4}-\d{2}-\d{2}/.test(b.eventDate));
    if (aHasIso && bHasIso) {
      return a.eventDate!.localeCompare(b.eventDate!);
    }
    if (aHasIso && !bHasIso) return -1;
    if (!aHasIso && bHasIso) return 1;
    return 0;
  });
}

export function createDefaultBookContent(slug: ProductSlug): BookContentJsonV1 {
  const product = getProductBySlug(slug)!;
  const defaultTheme = product.themes[0].id;

  const defaultAnswers: Record<string, string> = {};
  for (const field of product.fields) {
    defaultAnswers[field.id] = "";
  }

  return {
    schemaVersion: 1,
    productSlug: slug,
    coverTitle: product.title.replace(/[«»]/g, ""),
    coverSubtitle: product.subtitle,
    dedication: "",
    themeId: defaultTheme,
    answers: defaultAnswers,
    chapters: product.chapterPrompts.map((p, idx) => ({
      id: `ch_${idx + 1}`,
      title: p.title,
      body: "",
      promptKey: p.id,
    })),
    timeline: [
      {
        id: "tl_1",
        eventDate: null,
        dateLabel: "Особенный день",
        title: "Начало истории",
        description: "",
      },
    ],
    favoriteMediaId: null,
    finalLetterTitle:
      slug === "mother-thanks"
        ? "Письмо маме"
        : slug === "first-year"
        ? "Письмо малышу в будущее"
        : slug === "your-day"
        ? "Главное пожелание"
        : "Моё признание тебе",
    finalLetterBody: "",
    pinEnabled: false,
  };
}
