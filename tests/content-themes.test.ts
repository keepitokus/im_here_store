import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PRODUCT_SLUGS, PRODUCTS_CATALOG, type ProductSlug } from "@/lib/catalog";
import { EDITOR_COPY } from "@/lib/editor-copy";
import { LANDINGS } from "@/lib/landing";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";

/** Чужие темы, которые не должны попадать в системный текст продукта. */
const FOREIGN: Record<ProductSlug, RegExp[]> = {
  "love-story": [/мамин[а-я]*/i, /малыш/i, /именинник/i, /днём рождения/i, /первый год ребёнка/i],
  "mother-thanks": [/первое свидание/i, /годовщин/i, /именинник/i, /признани[ея] в любви/i],
  "your-day": [/первое свидание/i, /годовщин/i, /мамин[а-я]*/i, /малыш/i, /письмо маме/i],
  "first-year": [/первое свидание/i, /годовщин/i, /именинник/i, /признани[ея] в любви/i],
};

function productSystemText(slug: ProductSlug): string {
  const product = PRODUCTS_CATALOG[slug];
  const landing = LANDINGS[slug];
  const editor = EDITOR_COPY[slug];
  return [
    product.subtitle,
    product.tagline,
    product.badge,
    product.seoDescription,
    ...product.compositionSummary,
    ...product.idealFor,
    ...product.chapterPrompts.flatMap((chapter) => [chapter.title, chapter.prompt, chapter.example]),
    landing.eyebrow,
    landing.hero,
    landing.lead,
    landing.cta,
    ...landing.inside,
    ...landing.spreads.flatMap((spread) => [spread.kicker, spread.title, spread.text]),
    ...landing.faq.flatMap((item) => [item.q, item.a]),
    ...Object.values(editor.fields).flatMap((field) => [
      field.label,
      field.hint,
      field.placeholder,
      field.example,
    ]),
    editor.dedication.hint,
    editor.dedication.placeholder,
    editor.dedication.example,
    editor.questionsLead,
    editor.preview.banner,
    editor.preview.emptyLetter,
    editor.publishLead,
  ].join("\n");
}

describe("тематическая чистота системных текстов", () => {
  it("не подставляет чужую тему в продукт", () => {
    for (const slug of PRODUCT_SLUGS) {
      const text = productSystemText(slug);
      for (const pattern of FOREIGN[slug]) {
        expect(text, `${slug} содержит ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("демо-книга рассказывает свою историю, а не чужую", () => {
    expect(DEMO_SAMPLE_BOOKS["love-story"].content.answers.howWeMet).toMatch(/книжн/i);
    expect(DEMO_SAMPLE_BOOKS["love-story"].content.finalLetterTitle).toMatch(/признан/i);
    expect(DEMO_SAMPLE_BOOKS["mother-thanks"].content.answers.motherName).toMatch(/мам/i);
    expect(DEMO_SAMPLE_BOOKS["your-day"].content.answers.mainGreeting || "").not.toMatch(/свидан/i);
    expect(DEMO_SAMPLE_BOOKS["first-year"].content.answers.babyName).toBe("Лев");
    expect(DEMO_SAMPLE_BOOKS["your-day"].content.coverTitle).toMatch(/Твой день/);
  });

  it("главная не смешивает маму и малыша в блоке про книгу пары", () => {
    const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
    const story = home.slice(home.indexOf("Помните, как всё начиналось"), home.indexOf("id=\"gifts\""));
    expect(story).toMatch(/Пролистать пример «Наша история»/);
    expect(story).not.toMatch(/Мамин/);
    expect(story).not.toMatch(/малыш/i);
    expect(story).not.toMatch(/день рождения/i);
  });

  it("цены в каталоге не изменены", () => {
    expect(PRODUCTS_CATALOG["love-story"].initialPriceKopecks).toBe(499000);
    expect(PRODUCTS_CATALOG["mother-thanks"].initialPriceKopecks).toBe(599000);
    expect(PRODUCTS_CATALOG["your-day"].initialPriceKopecks).toBe(599000);
    expect(PRODUCTS_CATALOG["first-year"].initialPriceKopecks).toBe(499000);
    expect(PRODUCTS_CATALOG["first-year"].renewalPriceKopecks).toBe(99000);
  });
});
