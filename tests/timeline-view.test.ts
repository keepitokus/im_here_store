import { describe, expect, it } from "vitest";
import { sortTimelineEvents } from "@/lib/book-schema";
import { toTimelineEvents } from "@/lib/timeline-view";

const photos = [
  { id: "p1", dataUrl: "/images/a.webp", altText: "Первый кадр" },
  { id: "p2", dataUrl: "/images/b.webp", altText: "Второй кадр" },
];

describe("toTimelineEvents", () => {
  it("сохраняет порядок, идентификаторы и текст событий", () => {
    const events = toTimelineEvents(
      [
        { id: "late", dateLabel: "Позже", title: "Второе", description: "После" },
        { id: "early", dateLabel: "Раньше", title: "Первое", description: "До" },
      ],
      photos
    );

    expect(events.map((event) => event.id)).toEqual(["late", "early"]);
    expect(events[0]).toMatchObject({ date: "Позже", title: "Второе", description: "После" });
  });

  it("сохраняет порядок событий с одинаковой точной датой в предпросмотре", () => {
    const date = { eventDate: "2026-03-15", dateLabel: "15 марта 2026" };
    const events = [
      { ...date, id: "c", title: "В", description: "" },
      { ...date, id: "a", title: "А", description: "" },
      { ...date, id: "b", title: "Б", description: "" },
    ];

    const timeline = toTimelineEvents(sortTimelineEvents(events), []);

    expect(timeline.map(({ id, title }) => [id, title])).toEqual([
      ["c", "В"],
      ["a", "А"],
      ["b", "Б"],
    ]);
  });

  it("в демонстрационных книгах связывает фотографию с событием по порядку", () => {
    const events = toTimelineEvents(
      [
        { id: "a", dateLabel: "1", title: "А", description: "" },
        { id: "b", dateLabel: "2", title: "Б", description: "  " },
        { id: "c", dateLabel: "3", title: "В", description: "Есть" },
      ],
      photos,
      { pairByIndex: true }
    );

    expect(events[0].images).toEqual([{ src: "/images/a.webp", alt: "Первый кадр" }]);
    expect(events[1].images).toEqual([{ src: "/images/b.webp", alt: "Второй кадр" }]);
    expect(events[2].images).toEqual([{ src: "/images/a.webp", alt: "Первый кадр" }]);
    expect(events[0].description).toBeUndefined();
    expect(events[1].description).toBeUndefined();
  });

  it("в книге покупателя показывает фото только по явной связи и оставляет текстовое событие без кадра", () => {
    const events = toTimelineEvents(
      [
        { id: "linked", dateLabel: "День", title: "С кадром", description: "Рядом", mediaAssetId: "p2" },
        { id: "plain", dateLabel: "Другой день", title: "Без кадра", description: "Только слова" },
        { id: "missing", dateLabel: "Ещё", title: "Потерянный кадр", description: "Текст", mediaAssetId: "gone" },
      ],
      photos
    );

    expect(events[0].images).toEqual([{ src: "/images/b.webp", alt: "Второй кадр" }]);
    expect(events[1].images).toEqual([]);
    expect(events[2].images).toEqual([]);
    expect(events[2].description).toBe("Текст");
  });
});
