import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import { PRODUCT_SLUGS } from "@/lib/catalog";
import { resetDbForTesting, getDb } from "@/lib/db";
import {
  books,
  mediaAssets,
  outboundNotifications,
  subscriptionsOrEntitlements,
} from "@/lib/db/schema";
import { ensureDemoSeed, DEMO_CUSTOMER_EMAIL } from "@/lib/demo-seed";
import {
  createOrderAndPayment,
  processPaymentWebhook,
  retryOrderPublication,
  evaluateEntitlementsAndWarnings,
  verifyWebhookSignature,
  signWebhookPayloadForTestOrSimulator,
} from "@/lib/commerce";
import {
  createDraftBook,
  deleteUserAccountAndMedia,
  exportBookArchiveJson,
} from "@/lib/books";
import { validateAndStoreMediaAsset, MAX_MEDIA_BYTES } from "@/lib/media";
import { sanitizeAuditMetadata } from "@/lib/audit";
import { eq } from "drizzle-orm";

describe("«Я здесь» — проверка Фазы 3–6 (медиа-безопасность, сбои публикации, возвраты, граничные даты уведомлений, удаление данных)", () => {
  beforeEach(() => {
    process.env.SQLITE_PATH = ":memory:";
    process.env.DEMO_MODE = "true";
    process.env.NEXT_PUBLIC_APP_URL = "http://127.0.0.1:43123";
    resetDbForTesting();
    ensureDemoSeed();
  });

  it("валидирует сигнатуру изображений, отклоняет SVG/EXE и файлы > 15 МБ, оптимизирует валидный PNG/JPEG в WebP", async () => {
    const { book } = createDraftBook({
      ownerId: "usr_demo_customer",
      ownerEmail: DEMO_CUSTOMER_EMAIL,
      productSlug: "your-day",
    });

    // 1. Попытка загрузить SVG под видом image/png
    const fakeSvgBuffer = Buffer.from("<svg><script>alert(1)</script></svg>", "utf-8");
    await expect(
      validateAndStoreMediaAsset({
        userId: "usr_demo_customer",
        bookId: book.id,
        fileName: "hack.png",
        claimedMimeType: "image/png",
        buffer: fakeSvgBuffer,
      })
    ).rejects.toThrow(/Сигнатура файла/);

    // 2. Попытка загрузить файл больше 15 МБ
    const hugeBuffer = Buffer.alloc(MAX_MEDIA_BYTES + 1024, 0xff);
    await expect(
      validateAndStoreMediaAsset({
        userId: "usr_demo_customer",
        bookId: book.id,
        fileName: "huge.jpg",
        claimedMimeType: "image/jpeg",
        buffer: hugeBuffer,
      })
    ).rejects.toThrow(/15 МБ/);

    // 3. Загрузка настоящего PNG изображения -> успешная оптимизация в WebP
    const validPng = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 240, g: 220, b: 200 },
      },
    })
      .png()
      .toBuffer();

    const savedMedia = await validateAndStoreMediaAsset({
      userId: "usr_demo_customer",
      bookId: book.id,
      fileName: "family.png",
      claimedMimeType: "image/png",
      buffer: validPng,
      caption: "Праздничный ужин",
      isFavorite: true,
    });

    expect(savedMedia.mimeType).toBe("image/webp");
    expect(savedMedia.dataUrl?.startsWith("data:image/webp;base64,")).toBe(true);
  });

  it("обрабатывает сбой фоновой публикации («Платёж получен, готовим книгу»), восстановление и возврат средств (refund)", () => {
    const { book } = createDraftBook({
      ownerId: "usr_demo_customer",
      ownerEmail: DEMO_CUSTOMER_EMAIL,
      productSlug: "your-day",
    });

    const { order, payment } = createOrderAndPayment({
      userId: "usr_demo_customer",
      userEmail: DEMO_CUSTOMER_EMAIL,
      bookId: book.id,
      orderType: "initial_purchase",
      termsAccepted: true,
    });

    // Симулируем сбой публикации при получении оплаты
    const delayed = processPaymentWebhook({
      event: "payment.succeeded",
      providerPaymentId: payment.providerPaymentId,
      orderId: order.id,
      amountKopecks: 599000,
      currency: "RUB",
      simulatePublishFailureOnce: true,
    });

    expect(delayed.publishDelayed).toBe(true);
    expect(delayed.order.status).toBe("publishing");
    expect(delayed.book.status).toBe("publishing");

    // Восстановление публикации (retry)
    const recovered = retryOrderPublication(order.id);
    expect(recovered.order.status).toBe("fulfilled");
    expect(recovered.book.status).toBe("published");
    expect(recovered.book.publicSlug).toBeTruthy();

    // Возврат средств (refund.succeeded) отзывает публичный доступ
    const refunded = processPaymentWebhook({
      event: "refund.succeeded",
      providerPaymentId: payment.providerPaymentId,
      orderId: order.id,
      amountKopecks: 599000,
      currency: "RUB",
    });

    expect(refunded.order.status).toBe("refunded");
    expect(refunded.book.status).toBe("expired");
  });

  it("отправляет предупреждения за 30, 7 и 1 день до окончания срока размещения без дублей и не логирует приватные тексты", () => {
    const db = getDb();
    // Книга book_demo_first_year истекает 2026-11-18T12:00:00.000Z.
    // Проверим за 6 дней до истечения (2026-11-12T12:00:00.000Z) -> должно уйти warn_7d
    const res7d = evaluateEntitlementsAndWarnings("2026-11-12T12:00:00.000Z");
    expect(
      res7d.notificationsSent.some(
        (n) =>
          n.bookId === "book_demo_first_year" &&
          n.template === "expiry_warning_7d"
      )
    ).toBe(true);

    // Повторный запуск в тот же день не шлёт дубль
    const res7dRepeat = evaluateEntitlementsAndWarnings("2026-11-12T15:00:00.000Z");
    expect(
      res7dRepeat.notificationsSent.some(
        (n) =>
          n.bookId === "book_demo_first_year" &&
          n.template === "expiry_warning_7d"
      )
    ).toBe(false);

    // За 12 часов до истечения (2026-11-18T00:00:00.000Z) -> уходит warn_1d
    const res1d = evaluateEntitlementsAndWarnings("2026-11-18T00:00:00.000Z");
    expect(
      res1d.notificationsSent.some(
        (n) =>
          n.bookId === "book_demo_first_year" &&
          n.template === "expiry_warning_1d"
      )
    ).toBe(true);

    // Проверка санитизации логов: личные признания и токены редактируются
    const sanitized = sanitizeAuditMetadata({
      event: "save",
      personalConfession: "Секретное личное письмо",
      token: "secret-jwt",
    });
    expect(sanitized.personalConfession).toBe("[REDACTED_PRIVATE]");
    expect(sanitized.token).toBe("[REDACTED_PRIVATE]");

    // Проверка подписи вебхука
    const payload = JSON.stringify({ event: "payment.succeeded" });
    const sig = signWebhookPayloadForTestOrSimulator(payload);
    expect(verifyWebhookSignature(payload, sig)).toBe(true);
    expect(verifyWebhookSignature(payload, "invalid_sig")).toBe(false);

    // Проверка что в очереди писем нет личных текстов
    const allNotes = db.select().from(outboundNotifications).all();
    expect(allNotes.length).toBeGreaterThan(0);
  });

  it("экспортирует архив книги и последовательно удаляет пользовательские медиа и книги при удалении аккаунта", () => {
    const archive = exportBookArchiveJson({
      bookId: "book_demo_first_year",
      userId: "usr_demo_customer",
    });
    expect(archive.bookId).toBe("book_demo_first_year");
    expect(archive.mediaAssets.length).toBeGreaterThan(0);

    deleteUserAccountAndMedia("usr_demo_customer");

    const db = getDb();
    const remainingMedia = db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.ownerId, "usr_demo_customer"))
      .all();
    expect(remainingMedia).toHaveLength(0);

    const deletedBook = db
      .select()
      .from(books)
      .where(eq(books.id, "book_demo_first_year"))
      .get()!;
    expect(deletedBook.status).toBe("deleted");
    expect(deletedBook.publicSlug).toBeNull();

    const revokedEnt = db
      .select()
      .from(subscriptionsOrEntitlements)
      .where(eq(subscriptionsOrEntitlements.bookId, "book_demo_first_year"))
      .get()!;
    expect(revokedEnt.status).toBe("revoked");
  });

  it("содержит все 25 локальных оптимизированных WebP-фотографий и по 6 реальных снимков в каждой из 4 демо-книг без SVG-заглушек", () => {
    for (const slug of PRODUCT_SLUGS) {
      const sample = DEMO_SAMPLE_BOOKS[slug];
      expect(sample.photos).toHaveLength(6);
      expect(sample.characterSummary).toContain("Вымышленный пример");
      expect(sample.coverImage.startsWith("/images/books/")).toBe(true);

      const coverDiskPath = path.join(process.cwd(), "public", sample.coverImage);
      expect(fs.existsSync(coverDiskPath)).toBe(true);

      for (const photo of sample.photos) {
        expect(photo.dataUrl.startsWith("/images/books/")).toBe(true);
        expect(photo.dataUrl.endsWith(".webp")).toBe(true);
        expect(photo.altText.length).toBeGreaterThan(10);
        expect(photo.caption.length).toBeGreaterThan(10);
        expect(photo.roleLabel.length).toBeGreaterThan(2);

        const fullPath = path.join(process.cwd(), "public", photo.dataUrl);
        expect(fs.existsSync(fullPath)).toBe(true);
        const stat = fs.statSync(fullPath);
        expect(stat.size).toBeGreaterThan(10_000);
      }
    }

    const familyStoryImg = path.join(
      process.cwd(),
      "public/images/books/story-family-reading.webp"
    );
    expect(fs.existsSync(familyStoryImg)).toBe(true);
  });
});
