import { beforeEach, describe, expect, it } from "vitest";
import sharp from "sharp";
import { resetDbForTesting } from "@/lib/db";
import { ensureDemoSeed, DEMO_CUSTOMER_EMAIL } from "@/lib/demo-seed";
import {
  createDraftBook,
  updateBookDraftOrContent,
  verifyPublicBookAccess,
  getBookWithRelations,
} from "@/lib/books";
import { validateAndStoreMediaAsset } from "@/lib/media";
import {
  createOrderAndPayment,
  processPaymentWebhook,
  computeServerOrderPriceKopecks,
} from "@/lib/commerce";
import { PRODUCT_SLUGS, PRODUCTS_CATALOG } from "@/lib/catalog";

describe("«Я здесь» — Полная проверка 4 независимых E2E сценариев покупки и публикации", () => {
  beforeEach(() => {
    process.env.SQLITE_PATH = ":memory:";
    process.env.DEMO_MODE = "true";
    process.env.NEXT_PUBLIC_APP_URL = "http://127.0.0.1:43123";
    resetDbForTesting();
    ensureDemoSeed();
  });

  it.each([
    {
      slug: "love-story" as const,
      expectedInitialKopecks: 499000,
      sampleTitle: "Анна и Михаил · Наша история",
      keyAnswerField: "partnerNames",
      keyAnswerValue: "Анна и Михаил",
    },
    {
      slug: "mother-thanks" as const,
      expectedInitialKopecks: 599000,
      sampleTitle: "Любимой маме Елене",
      keyAnswerField: "motherName",
      keyAnswerValue: "Любимой маме Елене",
    },
    {
      slug: "your-day" as const,
      expectedInitialKopecks: 599000,
      sampleTitle: "Александр · 30 лет",
      keyAnswerField: "celebrantName",
      keyAnswerValue: "Александр",
    },
    {
      slug: "first-year" as const,
      expectedInitialKopecks: 499000,
      sampleTitle: "Малыш Лев · Первый год",
      keyAnswerField: "babyName",
      keyAnswerValue: "Лев",
    },
  ])(
    "Сценарий $slug ($expectedInitialKopecks коп.): выбор -> редактор -> фото -> превью -> оплата -> webhook -> публикация",
    async ({
      slug,
      expectedInitialKopecks,
      sampleTitle,
      keyAnswerField,
      keyAnswerValue,
    }) => {
      // 1. Проверка цены каталога на сервере
      expect(computeServerOrderPriceKopecks(slug, "initial_purchase")).toBe(
        expectedInitialKopecks
      );
      expect(PRODUCTS_CATALOG[slug].initialPriceKopecks).toBe(
        expectedInitialKopecks
      );

      // 2. Создание черновика в редакторе
      const { book, editToken } = createDraftBook({
        ownerId: "usr_demo_customer",
        ownerEmail: DEMO_CUSTOMER_EMAIL,
        productSlug: slug,
        initialTitle: sampleTitle,
      });
      expect(book.status).toBe("draft");

      // 3. Загрузка фотографии
      const pngBuffer = await sharp({
        create: {
          width: 600,
          height: 450,
          channels: 3,
          background: { r: 245, g: 238, b: 228 },
        },
      })
        .png()
        .toBuffer();

      const media = await validateAndStoreMediaAsset({
        userId: "usr_demo_customer",
        bookId: book.id,
        fileName: `${slug}-photo.png`,
        claimedMimeType: "image/png",
        buffer: pngBuffer,
        caption: `Памятный кадр ${sampleTitle}`,
        isFavorite: true,
      });
      expect(media.mimeType).toBe("image/webp");

      // 4. Сохранение ответов на вопросы и таймлайна
      const currentContent = JSON.parse(book.contentJson);
      updateBookDraftOrContent({
        bookId: book.id,
        editToken,
        content: {
          ...currentContent,
          coverTitle: sampleTitle,
          favoriteMediaId: media.id,
          answers: {
            ...currentContent.answers,
            [keyAnswerField]: keyAnswerValue,
          },
          finalLetterBody: "Спасибо за каждую минуту рядом. Я здесь.",
        },
      });

      const previewState = getBookWithRelations(book.id)!;
      expect(previewState.book.title).toBe(sampleTitle);
      expect(previewState.photos).toHaveLength(1);

      // 5. Создание заказа и платежа
      const { order, payment } = createOrderAndPayment({
        userId: "usr_demo_customer",
        userEmail: DEMO_CUSTOMER_EMAIL,
        bookId: book.id,
        orderType: "initial_purchase",
        termsAccepted: true,
      });
      expect(order.amountKopecks).toBe(expectedInitialKopecks);
      expect(order.status).toBe("pending_payment");

      // 6. Обработка подтверждённого вебхука
      const webhookRes = processPaymentWebhook({
        event: "payment.succeeded",
        providerPaymentId: payment.providerPaymentId,
        orderId: order.id,
        amountKopecks: expectedInitialKopecks,
        currency: "RUB",
        nowOverrideIso: "2026-10-26T12:00:00.000Z",
      });

      expect(webhookRes.order.status).toBe("fulfilled");
      expect(webhookRes.book.status).toBe("published");
      expect(webhookRes.book.publicSlug).toBeTruthy();
      expect(webhookRes.book.expiresAt).toBe("2027-10-26T12:00:00.000Z");

      // 7. Проверка публичного доступа получателя по ссылке
      const pubAccess = verifyPublicBookAccess({
        publicSlug: webhookRes.book.publicSlug!,
        nowOverrideIso: "2026-10-27T12:00:00.000Z",
      });
      expect(pubAccess.allowed).toBe(true);

      // 8. Для first-year дополнительно проверяем ручное продление 990 ₽/год и отсутствие продления у остальных
      if (slug === "first-year") {
        const { order: renOrder, payment: renPayment } = createOrderAndPayment({
          userId: "usr_demo_customer",
          userEmail: DEMO_CUSTOMER_EMAIL,
          bookId: book.id,
          orderType: "renewal",
          termsAccepted: true,
        });
        expect(renOrder.amountKopecks).toBe(99000);

        const renRes = processPaymentWebhook({
          event: "payment.succeeded",
          providerPaymentId: renPayment.providerPaymentId,
          orderId: renOrder.id,
          amountKopecks: 99000,
          currency: "RUB",
          nowOverrideIso: "2026-11-01T12:00:00.000Z",
        });
        expect(renRes.book.expiresAt).toBe("2028-10-25T12:00:00.000Z");
      } else {
        expect(() =>
          createOrderAndPayment({
            userId: "usr_demo_customer",
            userEmail: DEMO_CUSTOMER_EMAIL,
            bookId: book.id,
            orderType: "renewal",
            termsAccepted: true,
          })
        ).toThrow();
      }
    }
  );

  it("подтверждает, что в каталоге ровно 4 продукта с неизменными SKU", () => {
    expect(PRODUCT_SLUGS).toEqual([
      "love-story",
      "mother-thanks",
      "your-day",
      "first-year",
    ]);
  });
});
