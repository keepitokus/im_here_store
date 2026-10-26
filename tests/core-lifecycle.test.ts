import { beforeEach, describe, expect, it } from "vitest";
import { resetDbForTesting, getDb } from "@/lib/db";
import { products, books, renewalTransactions } from "@/lib/db/schema";
import { ensureDemoSeed, DEMO_CUSTOMER_EMAIL } from "@/lib/demo-seed";
import {
  computeServerOrderPriceKopecks,
  createOrderAndPayment,
  processPaymentWebhook,
  evaluateEntitlementsAndWarnings,
} from "@/lib/commerce";
import {
  createDraftBook,
  updateBookDraftOrContent,
  verifyPublicBookAccess,
  assertBookOwnerOrEditToken,
} from "@/lib/books";
import { eq } from "drizzle-orm";

describe("«Я здесь» — проверка Фазы 1 (ядро каталога, БД, безопасности и жизненного цикла)", () => {
  beforeEach(() => {
    process.env.SQLITE_PATH = ":memory:";
    process.env.DEMO_MODE = "true";
    process.env.NEXT_PUBLIC_APP_URL = "http://127.0.0.1:43123";
    resetDbForTesting();
    ensureDemoSeed();
  });

  it("хранит 4 продукта каталога с неизменными ценами в копейках (4 990 / 5 990 / 5 990 / 4 990 ₽ + продление 990 ₽ только для first-year)", () => {
    const db = getDb();
    const rows = db.select().from(products).all();
    expect(rows).toHaveLength(4);

    expect(computeServerOrderPriceKopecks("love-story", "initial_purchase")).toBe(499000);
    expect(computeServerOrderPriceKopecks("mother-thanks", "initial_purchase")).toBe(599000);
    expect(computeServerOrderPriceKopecks("your-day", "initial_purchase")).toBe(599000);
    expect(computeServerOrderPriceKopecks("first-year", "initial_purchase")).toBe(499000);
    expect(computeServerOrderPriceKopecks("first-year", "renewal")).toBe(99000);

    expect(() =>
      computeServerOrderPriceKopecks("love-story", "renewal")
    ).toThrow(/Мой первый год/);
    expect(() =>
      computeServerOrderPriceKopecks("mother-thanks", "renewal")
    ).toThrow(/Мой первый год/);
    expect(() =>
      computeServerOrderPriceKopecks("your-day", "renewal")
    ).toThrow(/Мой первый год/);
  });

  it("игнорирует подменённую клиентом цену и защищает черновик от чужого доступа (IDOR) и публичного чтения до оплаты", () => {
    const { book } = createDraftBook({
      ownerId: "usr_demo_customer",
      ownerEmail: DEMO_CUSTOMER_EMAIL,
      productSlug: "mother-thanks",
      initialTitle: "Маме от Оли",
    });

    // Попытка чужого пользователя изменить книгу блокируется
    expect(() =>
      assertBookOwnerOrEditToken({
        bookId: book.id,
        userId: "usr_demo_admin",
      })
    ).toThrow(/Доступ запрещён/);

    // Попытка клиента передать заниженную цену 100 копеек игнорируется сервером (выставляется 599 000 коп = 5 990 ₽)
    const { order, payment } = createOrderAndPayment({
      userId: "usr_demo_customer",
      userEmail: DEMO_CUSTOMER_EMAIL,
      bookId: book.id,
      orderType: "initial_purchase",
      termsAccepted: true,
      clientClaimedPriceKopecks: 100,
    });

    expect(order.amountKopecks).toBe(599000);
    expect(payment.amountKopecks).toBe(599000);

    // До подтверждения вебхука книга не опубликована
    const freshBook = getDb().select().from(books).where(eq(books.id, book.id)).get()!;
    expect(freshBook.publicSlug).toBeNull();
  });

  it("обеспечивает идемпотентность вебхука оплаты и публикацию книги ровно на 365 дней + проверка PIN", () => {
    const { book, editToken } = createDraftBook({
      ownerId: "usr_demo_customer",
      ownerEmail: DEMO_CUSTOMER_EMAIL,
      productSlug: "love-story",
      initialTitle: "Аня и Саша",
    });

    const current = JSON.parse(book.contentJson);
    updateBookDraftOrContent({
      bookId: book.id,
      editToken,
      content: { ...current, coverTitle: "Аня и Саша · 3 года" },
      rawPin: "2580",
    });

    const { order, payment } = createOrderAndPayment({
      userId: "usr_demo_customer",
      userEmail: DEMO_CUSTOMER_EMAIL,
      bookId: book.id,
      orderType: "initial_purchase",
      termsAccepted: true,
    });

    const paidAtIso = "2026-10-26T15:00:00.000Z";
    const firstCall = processPaymentWebhook({
      event: "payment.succeeded",
      providerPaymentId: payment.providerPaymentId,
      orderId: order.id,
      amountKopecks: 499000,
      currency: "RUB",
      nowOverrideIso: paidAtIso,
    });

    expect(firstCall.idempotentSkip).toBe(false);
    expect(firstCall.order.status).toBe("fulfilled");
    expect(firstCall.book.status).toBe("published");
    expect(firstCall.book.publicSlug).toBeTruthy();
    expect(firstCall.book.expiresAt).toBe("2027-10-26T15:00:00.000Z");

    // Повторный вебхук не меняет дату и не дублирует публикацию
    const secondCall = processPaymentWebhook({
      event: "payment.succeeded",
      providerPaymentId: payment.providerPaymentId,
      orderId: order.id,
      amountKopecks: 499000,
      currency: "RUB",
      nowOverrideIso: "2026-10-27T15:00:00.000Z",
    });
    expect(secondCall.idempotentSkip).toBe(true);
    expect(secondCall.book.expiresAt).toBe("2027-10-26T15:00:00.000Z");

    // Проверка PIN при публичном открытии
    const noPinAccess = verifyPublicBookAccess({
      publicSlug: firstCall.book.publicSlug!,
    });
    expect(noPinAccess.allowed).toBe(false);
    if (!noPinAccess.allowed) {
      expect(noPinAccess.reason).toBe("pin_required");
    }

    const wrongPinAccess = verifyPublicBookAccess({
      publicSlug: firstCall.book.publicSlug!,
      providedPin: "9999",
    });
    expect(wrongPinAccess.allowed).toBe(false);

    const validPinAccess = verifyPublicBookAccess({
      publicSlug: firstCall.book.publicSlug!,
      providedPin: "2580",
    });
    expect(validPinAccess.allowed).toBe(true);
  });

  it("корректно считает ручное продление «Мой первый год» (990 ₽): до истечения прибавляет 365 дней к текущей дате окончания, после истечения — к дате платежа, без дублей", () => {
    const db = getDb();
    // Книга из seed истекает 2026-11-18T12:00:00.000Z
    const { order, payment } = createOrderAndPayment({
      userId: "usr_demo_customer",
      userEmail: DEMO_CUSTOMER_EMAIL,
      bookId: "book_demo_first_year",
      orderType: "renewal",
      termsAccepted: true,
    });
    expect(order.amountKopecks).toBe(99000);

    // Оплата продления ДО окончания текущего срока (26 октября 2026) -> +365 дней к 2026-11-18
    const res1 = processPaymentWebhook({
      event: "payment.succeeded",
      providerPaymentId: payment.providerPaymentId,
      orderId: order.id,
      amountKopecks: 99000,
      currency: "RUB",
      nowOverrideIso: "2026-10-26T12:00:00.000Z",
    });

    expect(res1.book.expiresAt).toBe("2027-11-18T12:00:00.000Z");

    // Повторный вебхук того же платежа не продлевает повторно
    const duplicateRes = processPaymentWebhook({
      event: "payment.succeeded",
      providerPaymentId: payment.providerPaymentId,
      orderId: order.id,
      amountKopecks: 99000,
      currency: "RUB",
      nowOverrideIso: "2026-10-26T12:05:00.000Z",
    });
    expect(duplicateRes.idempotentSkip).toBe(true);
    expect(duplicateRes.book.expiresAt).toBe("2027-11-18T12:00:00.000Z");
    expect(db.select().from(renewalTransactions).all()).toHaveLength(1);

    // Сценарий: срок истёк (например, наступило 10 декабря 2027 в льготном периоде 90 дней)
    const evalExpired = evaluateEntitlementsAndWarnings("2027-12-10T12:00:00.000Z");
    expect(evalExpired).toBeDefined();

    const expiredAccess = verifyPublicBookAccess({
      publicSlug: "lev-first-year-demo7x9k",
      nowOverrideIso: "2027-12-10T12:00:00.000Z",
    });
    expect(expiredAccess.allowed).toBe(false);

    // Новое продление после истечения (10 декабря 2027) -> +365 дней к дате платежа (2027-12-10 -> 2028-12-09 в високосном 2028 году)
    const { order: order2, payment: payment2 } = createOrderAndPayment({
      userId: "usr_demo_customer",
      userEmail: DEMO_CUSTOMER_EMAIL,
      bookId: "book_demo_first_year",
      orderType: "renewal",
      termsAccepted: true,
    });

    const res2 = processPaymentWebhook({
      event: "payment.succeeded",
      providerPaymentId: payment2.providerPaymentId,
      orderId: order2.id,
      amountKopecks: 99000,
      currency: "RUB",
      nowOverrideIso: "2027-12-10T12:00:00.000Z",
    });

    expect(res2.book.status).toBe("published");
    expect(res2.book.expiresAt).toBe("2028-12-09T12:00:00.000Z");
  });
});
