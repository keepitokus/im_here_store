import { describe, expect, it } from "vitest";
import { PRODUCT_SLUGS, PRODUCTS_CATALOG, type ProductSlug } from "@/lib/catalog";
import { EDITOR_COPY, insertExample } from "@/lib/editor-copy";
import { BookContentJsonV1Schema, createDefaultBookContent } from "@/lib/book-schema";

const FOREIGN: Record<ProductSlug, string[]> = {
  "love-story": ["именинник", "с днём рождения", "малыш", "письмо маме"],
  "mother-thanks": ["именинник", "с днём рождения", "первое свидание", "малыш"],
  "your-day": [
    "первое свидание",
    "с любовью в наш особенный день",
    "малыш",
    "письмо маме",
    "годовщин",
  ],
  "first-year": ["именинник", "первое свидание", "с любовью в наш особенный день", "с днём рождения"],
};

function corpus(slug: ProductSlug): string {
  const copy = EDITOR_COPY[slug];
  const chunks = [
    ...copy.steps.flatMap((step) => [step.title, step.lead]),
    ...Object.values(copy.fields).flatMap((field) => [
      field.label,
      field.hint,
      field.placeholder,
      field.example,
    ]),
    copy.coverTitle.label,
    copy.coverTitle.hint,
    copy.coverTitle.placeholder,
    copy.coverTitle.example,
    copy.dedication.label,
    copy.dedication.hint,
    copy.dedication.placeholder,
    copy.dedication.example,
    copy.photos.title,
    copy.photos.lead,
    copy.photos.caption.hint,
    copy.photos.caption.placeholder,
    copy.questionsLead,
    copy.timeline.hint,
    copy.timeline.datePlaceholder,
    copy.timeline.titlePlaceholder,
    copy.timeline.descriptionPlaceholder,
    copy.preview.banner,
    copy.preview.emptyLetter,
    copy.publishLead,
    copy.finalLetterTitle,
  ];
  return chunks.join("\n").toLowerCase();
}

describe("подсказки редактора по типу подарка", () => {
  it("для каждого продукта связывает поля каталога с собственной конфигурацией", () => {
    for (const slug of PRODUCT_SLUGS) {
      const product = PRODUCTS_CATALOG[slug];
      expect(product.fields.length).toBeGreaterThan(0);
      for (const field of product.fields) {
        const copy = EDITOR_COPY[slug].fields[field.id];
        expect(copy, `${slug}.${field.id}`).toBeTruthy();
        expect(field.label).toBe(copy.label);
        expect(field.helperText).toBe(copy.hint);
        expect(field.placeholder).toBe(copy.placeholder);
        expect(field.example).toBe(copy.example);
        expect(field.helperText.trim()).not.toBe(field.placeholder.trim());
        expect(field.placeholder.trim().length).toBeGreaterThan(0);
        expect(field.example.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("не подмешивает примеры другого подарка", () => {
    for (const slug of PRODUCT_SLUGS) {
      const text = corpus(slug);
      for (const phrase of FOREIGN[slug]) {
        expect(text, `${slug} содержит «${phrase}»`).not.toContain(phrase);
      }
    }
  });

  it("меняет посвящение вместе с шаблоном и не хранит романтический fallback", () => {
    expect(EDITOR_COPY["your-day"].dedication.example).toBe(
      "Сегодня всё самое тёплое — для тебя!"
    );
    expect(EDITOR_COPY["mother-thanks"].dedication.example).toContain("Маме");
    expect(EDITOR_COPY["first-year"].dedication.example).toContain("первый год");
    expect(EDITOR_COPY["love-story"].dedication.example).toContain("особенным");
    expect(EDITOR_COPY["your-day"].fields.wishesForFuture.hint).toContain("имениннику");
    expect(EDITOR_COPY["your-day"].fields.wishesForFuture.placeholder).not.toBe(
      EDITOR_COPY["your-day"].fields.wishesForFuture.hint
    );
  });

  it("не записывает placeholder и пример в новый черновик и не затирает введённый текст", () => {
    for (const slug of PRODUCT_SLUGS) {
      const draft = createDefaultBookContent(slug);
      const parsed = BookContentJsonV1Schema.parse(draft);
      expect(parsed.dedication).toBe("");
      expect(parsed.finalLetterBody).toBe("");
      expect(parsed.finalLetterTitle).toBe(EDITOR_COPY[slug].finalLetterTitle);
      expect(parsed.timeline[0]?.description).toBe("");
      expect(parsed.timeline[0]?.title).toBe(EDITOR_COPY[slug].timeline.defaultTitle);
      for (const field of PRODUCTS_CATALOG[slug].fields) {
        expect(parsed.answers[field.id]).toBe("");
        expect(parsed.answers[field.id]).not.toBe(field.placeholder);
        expect(parsed.answers[field.id]).not.toBe(field.example);
      }
    }

    expect(insertExample("Уже написано", "Чужой пример")).toBe("Уже написано");
    expect(insertExample("  ", "Нужный пример")).toBe("Нужный пример");
  });

  it("даёт предпросмотру нейтральную заглушку своего продукта, а не чужое письмо", () => {
    for (const slug of PRODUCT_SLUGS) {
      const preview = EDITOR_COPY[slug].preview;
      expect(preview.emptyFragment).not.toMatch(/свидан|именин|малыш|маме/i);
      expect(preview.emptyLetter.toLowerCase()).not.toContain("с любовью в наш особенный день");
    }
    expect(EDITOR_COPY["your-day"].preview.emptyLetter).not.toBe(
      EDITOR_COPY["love-story"].preview.emptyLetter
    );
    expect(EDITOR_COPY["first-year"].preview.banner).toContain("первого года");
    expect(EDITOR_COPY["mother-thanks"].preview.banner).toContain("мама");
  });
});
