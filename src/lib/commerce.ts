import crypto from "node:crypto";
import { getDb, getRawSqlite } from "./db";
import {
  books,
  orders,
  payments,
  subscriptionsOrEntitlements,
  renewalTransactions,
} from "./db/schema";
import { eq } from "drizzle-orm";
import {
  getProductBySlug,
  isValidProductSlug,
  SERVER_PRICING_KOPECKS,
  ProductSlug,
} from "./catalog";
import { isDemoMode, isSimulatedPaymentAllowed, getAppBaseUrl } from "./env";
import { enqueueNotification } from "./notifications";
import { recordAuditEvent } from "./audit";
import { trackServerEvent } from "./analytics";

export function addDaysUtc(isoDateString: string, days: number): string {
  const d = new Date(isoDateString);
  const next = new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
  return next.toISOString();
}

export function generateRandomPublicSlug(title: string): string {
  const randomSuffix = crypto.randomBytes(8).toString("base64url").toLowerCase();
  const safePrefix = title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18);
  const asciiPrefix = safePrefix.replace(/[^a-z0-9-]/g, "") || "story";
  return `${asciiPrefix}-${randomSuffix}`;
}

export function computeServerOrderPriceKopecks(
  productSlug: ProductSlug,
  orderType: "initial_purchase" | "renewal"
): number {
  const pricing = SERVER_PRICING_KOPECKS[productSlug];
  if (!pricing) {
    throw new Error("Неизвестный продукт каталога");
  }
  if (orderType === "initial_purchase") {
    return pricing.initial;
  }
  if (orderType === "renewal") {
    if (productSlug !== "first-year" || pricing.renewal === null) {
      throw new Error(
        "Продление размещения в MVP предусмотрено только для книги «Мой первый год»"
      );
    }
    return pricing.renewal;
  }
  throw new Error("Некорректный тип заказа");
}

export function createOrderAndPayment(params: {
  userId: string;
  userEmail: string;
  bookId: string;
  orderType: "initial_purchase" | "renewal";
  termsAccepted: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  clientClaimedPriceKopecks?: number; // игнорируется при расчёте, логируется при расхождении
}) {
  if (!params.termsAccepted) {
    throw new Error("Необходимо согласиться с условиями оферты и правилами размещения");
  }

  const db = getDb();
  const book = db.select().from(books).where(eq(books.id, params.bookId)).get();
  if (!book) {
    throw new Error("Книга не найдена");
  }
  if (book.ownerId !== params.userId) {
    recordAuditEvent({
      actorUserId: params.userId,
      eventType: "security_idor_blocked",
      entityType: "book",
      entityId: params.bookId,
      metadata: { reason: "checkout_foreign_book" },
    });
    throw new Error("Недостаточно прав для оформления заказа по этой книге");
  }

  if (!isValidProductSlug(book.productSlug)) {
    throw new Error("Некорректный продукт книги");
  }

  const product = getProductBySlug(book.productSlug)!;
  const serverAmountKopecks = computeServerOrderPriceKopecks(
    book.productSlug,
    params.orderType
  );

  if (
    typeof params.clientClaimedPriceKopecks === "number" &&
    params.clientClaimedPriceKopecks !== serverAmountKopecks
  ) {
    recordAuditEvent({
      actorUserId: params.userId,
      eventType: "security_client_price_tamper_ignored",
      entityType: "book",
      entityId: book.id,
      metadata: {
        clientClaimedPriceKopecks: params.clientClaimedPriceKopecks,
        enforcedServerPriceKopecks: serverAmountKopecks,
      },
    });
  }

  if (params.orderType === "renewal" && !product.allowsRenewalInMvp) {
    throw new Error(
      "Для данного продукта покупка продления в MVP не предусмотрена"
    );
  }

  const nowIso = new Date().toISOString();
  const orderId = "ord_" + crypto.randomBytes(10).toString("hex");
  const paymentId = "pay_" + crypto.randomBytes(10).toString("hex");
  const idempotencyKey = "idem_" + crypto.randomBytes(12).toString("hex");
  const demo = isDemoMode();
  const providerPaymentId = demo
    ? `yk_demo_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`
    : `yk_live_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const confirmationUrl = `${getAppBaseUrl()}/orders/${orderId}/result`;

  db.insert(orders)
    .values({
      id: orderId,
      userId: params.userId,
      bookId: book.id,
      productSlug: book.productSlug,
      orderType: params.orderType,
      amountKopecks: serverAmountKopecks,
      currency: "RUB",
      status: "pending_payment",
      customerEmail: params.userEmail,
      termsAcceptedAt: nowIso,
      utmSource: params.utmSource ?? null,
      utmMedium: params.utmMedium ?? null,
      utmCampaign: params.utmCampaign ?? null,
      publishAttempts: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    })
    .run();

  db.insert(payments)
    .values({
      id: paymentId,
      orderId,
      provider: "yookassa",
      providerPaymentId,
      amountKopecks: serverAmountKopecks,
      currency: "RUB",
      status: "pending",
      isDemo: demo,
      confirmationUrl,
      idempotencyKey,
      createdAt: nowIso,
      updatedAt: nowIso,
    })
    .run();

  if (params.orderType === "initial_purchase" && book.status === "draft") {
    db.update(books)
      .set({ status: "pending_payment", updatedAt: nowIso })
      .where(eq(books.id, book.id))
      .run();
  }

  trackServerEvent({
    event: params.orderType === "renewal" ? "renewal_started" : "begin_checkout",
    userId: params.userId,
    entityId: orderId,
    productSlug: book.productSlug,
    amountKopecks: serverAmountKopecks,
    utmSource: params.utmSource ?? null,
  });

  return {
    order: db.select().from(orders).where(eq(orders.id, orderId)).get()!,
    payment: db.select().from(payments).where(eq(payments.id, paymentId)).get()!,
  };
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined
): boolean {
  const secret =
    process.env.YOOKASSA_WEBHOOK_SECRET || "local-demo-webhook-secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  if (!signatureHeader) return false;
  if (signatureHeader.length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(expected)
  );
}

export function signWebhookPayloadForTestOrSimulator(rawBody: string): string {
  const secret =
    process.env.YOOKASSA_WEBHOOK_SECRET || "local-demo-webhook-secret";
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

export interface ProcessWebhookInput {
  event: "payment.succeeded" | "payment.canceled" | "refund.succeeded";
  providerPaymentId: string;
  orderId: string;
  amountKopecks: number;
  currency: string;
  isSimulatedDemo?: boolean;
  simulatePublishFailureOnce?: boolean;
  nowOverrideIso?: string;
}

/**
 * Транзакционная идемпотентная обработка результата платежа и публикация / продление.
 */
export function processPaymentWebhook(input: ProcessWebhookInput) {
  if (input.isSimulatedDemo && !isSimulatedPaymentAllowed()) {
    throw new Error(
      "Симуляция платежа запрещена вне локального режима DEMO_MODE"
    );
  }

  const sqlite = getRawSqlite();
  const db = getDb();
  const nowIso = input.nowOverrideIso || new Date().toISOString();

  const payment = db
    .select()
    .from(payments)
    .where(eq(payments.providerPaymentId, input.providerPaymentId))
    .get();

  if (!payment) {
    throw new Error("Платёж не найден по providerPaymentId");
  }

  const order = db
    .select()
    .from(orders)
    .where(eq(orders.id, payment.orderId))
    .get();

  if (!order || order.id !== input.orderId) {
    throw new Error("Несоответствие идентификатора заказа (orderId)");
  }

  if (
    payment.amountKopecks !== input.amountKopecks ||
    order.amountKopecks !== input.amountKopecks
  ) {
    throw new Error("Сумма в уведомлении не совпадает с серверной суммой заказа");
  }

  if (input.currency !== "RUB" || order.currency !== "RUB") {
    throw new Error("Неверная валюта платежа (ожидается RUB)");
  }

  // Идемпотентность: если платёж уже succeeded и заказ уже fulfilled — повторный вебхук ничего не удваивает
  if (
    input.event === "payment.succeeded" &&
    payment.status === "succeeded" &&
    order.status === "fulfilled"
  ) {
    return {
      idempotentSkip: true,
      order,
      payment,
      book: db.select().from(books).where(eq(books.id, order.bookId)).get()!,
    };
  }

  if (input.event === "payment.canceled") {
    db.update(payments)
      .set({ status: "canceled", updatedAt: nowIso })
      .where(eq(payments.id, payment.id))
      .run();
    db.update(orders)
      .set({ status: "payment_failed", updatedAt: nowIso })
      .where(eq(orders.id, order.id))
      .run();
    return {
      idempotentSkip: false,
      order: db.select().from(orders).where(eq(orders.id, order.id)).get()!,
      payment: db.select().from(payments).where(eq(payments.id, payment.id)).get()!,
      book: db.select().from(books).where(eq(books.id, order.bookId)).get()!,
    };
  }

  if (input.event === "refund.succeeded") {
    db.update(payments)
      .set({ status: "refunded", updatedAt: nowIso })
      .where(eq(payments.id, payment.id))
      .run();
    db.update(orders)
      .set({ status: "refunded", updatedAt: nowIso })
      .where(eq(orders.id, order.id))
      .run();
    db.update(books)
      .set({ status: "expired", updatedAt: nowIso })
      .where(eq(books.id, order.bookId))
      .run();
    db.update(subscriptionsOrEntitlements)
      .set({ status: "revoked", updatedAt: nowIso })
      .where(eq(subscriptionsOrEntitlements.bookId, order.bookId))
      .run();
    return {
      idempotentSkip: false,
      order: db.select().from(orders).where(eq(orders.id, order.id)).get()!,
      payment: db.select().from(payments).where(eq(payments.id, payment.id)).get()!,
      book: db.select().from(books).where(eq(books.id, order.bookId)).get()!,
    };
  }

  // Обработка payment.succeeded внутри SQLite-транзакции
  const txResult = sqlite.transaction(() => {
    const freshPayment = db
      .select()
      .from(payments)
      .where(eq(payments.id, payment.id))
      .get()!;
    const freshOrder = db
      .select()
      .from(orders)
      .where(eq(orders.id, order.id))
      .get()!;
    const freshBook = db
      .select()
      .from(books)
      .where(eq(books.id, order.bookId))
      .get()!;

    if (freshPayment.status === "succeeded" && freshOrder.status === "fulfilled") {
      return { idempotentSkip: true };
    }

    // 1. Помечаем платёж успешным и заказ paid
    db.update(payments)
      .set({
        status: "succeeded",
        paidAt: freshPayment.paidAt || nowIso,
        updatedAt: nowIso,
      })
      .where(eq(payments.id, freshPayment.id))
      .run();

    db.update(orders)
      .set({
        status: "paid",
        updatedAt: nowIso,
      })
      .where(eq(orders.id, freshOrder.id))
      .run();

    // Симуляция сбоя фоновой публикации (ТЗ Раздел 7: «Платёж получен, готовим книгу»)
    if (input.simulatePublishFailureOnce) {
      db.update(orders)
        .set({
          status: "publishing",
          publishAttempts: freshOrder.publishAttempts + 1,
          lastError:
            "Временная задержка генерации публичного издания (ожидает автоматического повтора)",
          updatedAt: nowIso,
        })
        .where(eq(orders.id, freshOrder.id))
        .run();

      db.update(books)
        .set({
          status: "publishing",
          updatedAt: nowIso,
        })
        .where(eq(books.id, freshBook.id))
        .run();

      return { idempotentSkip: false, publishDelayed: true };
    }

    if (freshOrder.orderType === "initial_purchase") {
      const publicSlug =
        freshBook.publicSlug || generateRandomPublicSlug(freshBook.title);
      const expiresAt = addDaysUtc(nowIso, 365);
      const graceUntil = addDaysUtc(expiresAt, 90);

      db.update(books)
        .set({
          publicSlug,
          status: "published",
          publishedAt: freshBook.publishedAt || nowIso,
          expiresAt,
          graceUntil,
          updatedAt: nowIso,
        })
        .where(eq(books.id, freshBook.id))
        .run();

      const existingEnt = db
        .select()
        .from(subscriptionsOrEntitlements)
        .where(eq(subscriptionsOrEntitlements.bookId, freshBook.id))
        .get();

      if (!existingEnt) {
        db.insert(subscriptionsOrEntitlements)
          .values({
            id: "ent_" + crypto.randomBytes(10).toString("hex"),
            bookId: freshBook.id,
            ownerId: freshBook.ownerId,
            productSlug: freshBook.productSlug,
            status: "active",
            startsAt: nowIso,
            expiresAt,
            graceUntil,
            autoRenewAllowed: false,
            createdAt: nowIso,
            updatedAt: nowIso,
          })
          .run();
      } else {
        db.update(subscriptionsOrEntitlements)
          .set({
            status: "active",
            expiresAt,
            graceUntil,
            autoRenewAllowed: false,
            updatedAt: nowIso,
          })
          .where(eq(subscriptionsOrEntitlements.id, existingEnt.id))
          .run();
      }
    } else if (freshOrder.orderType === "renewal") {
      // ТЗ Раздел 2 и 7: Продление только для first-year на 365 дней за 990 ₽.
      // Если текущий срок ещё не завершён, добавить 365 дней к текущей дате окончания,
      // иначе — к дате успешного платежа продления. Повторное событие платежа не продлевает повторно.
      if (freshBook.productSlug !== "first-year") {
        throw new Error(
          "Продление поддерживается только для продукта first-year"
        );
      }

      const existingRenewalTx = db
        .select()
        .from(renewalTransactions)
        .where(eq(renewalTransactions.paymentId, freshPayment.id))
        .get();

      if (existingRenewalTx) {
        return { idempotentSkip: true };
      }

      const currentExpiresIso = freshBook.expiresAt || nowIso;
      const currentExpiresMs = new Date(currentExpiresIso).getTime();
      const paymentTimeMs = new Date(nowIso).getTime();

      const baseDateIso =
        currentExpiresMs > paymentTimeMs ? currentExpiresIso : nowIso;
      const newExpiresAt = addDaysUtc(baseDateIso, 365);
      const newGraceUntil = addDaysUtc(newExpiresAt, 90);

      db.insert(renewalTransactions)
        .values({
          id: "ren_" + crypto.randomBytes(10).toString("hex"),
          bookId: freshBook.id,
          orderId: freshOrder.id,
          paymentId: freshPayment.id,
          previousExpiresAt: currentExpiresIso,
          newExpiresAt,
          newGraceUntil,
          amountKopecks: freshOrder.amountKopecks,
          createdAt: nowIso,
        })
        .run();

      db.update(books)
        .set({
          status: "published",
          expiresAt: newExpiresAt,
          graceUntil: newGraceUntil,
          updatedAt: nowIso,
        })
        .where(eq(books.id, freshBook.id))
        .run();

      const ent = db
        .select()
        .from(subscriptionsOrEntitlements)
        .where(eq(subscriptionsOrEntitlements.bookId, freshBook.id))
        .get();

      if (ent) {
        db.update(subscriptionsOrEntitlements)
          .set({
            status: "active",
            expiresAt: newExpiresAt,
            graceUntil: newGraceUntil,
            warn30SentAt: null,
            warn7SentAt: null,
            warn1SentAt: null,
            updatedAt: nowIso,
          })
          .where(eq(subscriptionsOrEntitlements.id, ent.id))
          .run();
      }
    }

    db.update(orders)
      .set({
        status: "fulfilled",
        publishAttempts: freshOrder.publishAttempts + 1,
        lastError: null,
        updatedAt: nowIso,
      })
      .where(eq(orders.id, freshOrder.id))
      .run();

    return { idempotentSkip: false, publishDelayed: false };
  })();

  const updatedOrder = db
    .select()
    .from(orders)
    .where(eq(orders.id, order.id))
    .get()!;
  const updatedPayment = db
    .select()
    .from(payments)
    .where(eq(payments.id, payment.id))
    .get()!;
  const updatedBook = db
    .select()
    .from(books)
    .where(eq(books.id, order.bookId))
    .get()!;

  if (!txResult.idempotentSkip) {
    if (txResult.publishDelayed) {
      enqueueNotification({
        userId: updatedOrder.userId,
        bookId: updatedBook.id,
        orderId: updatedOrder.id,
        recipientEmail: updatedOrder.customerEmail,
        template: "publication_failed",
        subject: "Платёж получен, мы завершаем подготовку вашей книги «Я здесь»",
        safeSummary: `Заказ ${updatedOrder.id} оплачен. Фоновая публикация поставлена на повторную попытку.`,
      });
    } else if (updatedOrder.orderType === "initial_purchase") {
      enqueueNotification({
        userId: updatedOrder.userId,
        bookId: updatedBook.id,
        orderId: updatedOrder.id,
        recipientEmail: updatedOrder.customerEmail,
        template: "payment_received",
        subject: "Оплата заказа в «Я здесь» подтверждена",
        safeSummary: `Платёж на сумму ${Math.round(updatedOrder.amountKopecks / 100)} ₽ успешно принят.`,
      });
      enqueueNotification({
        userId: updatedOrder.userId,
        bookId: updatedBook.id,
        orderId: updatedOrder.id,
        recipientEmail: updatedOrder.customerEmail,
        template: "publication_ready",
        subject: "Ваша книга «Я здесь» опубликована — ссылка и QR-код внутри",
        safeSummary: `Книга готова к вручению: /b/${updatedBook.publicSlug} (размещение активно до ${updatedBook.expiresAt?.slice(0, 10)}).`,
      });
      trackServerEvent({
        event: "payment_succeeded",
        userId: updatedOrder.userId,
        entityId: updatedOrder.id,
        productSlug: updatedOrder.productSlug,
        amountKopecks: updatedOrder.amountKopecks,
      });
      trackServerEvent({
        event: "publication_ready",
        userId: updatedOrder.userId,
        entityId: updatedBook.id,
        productSlug: updatedOrder.productSlug,
      });
    } else {
      enqueueNotification({
        userId: updatedOrder.userId,
        bookId: updatedBook.id,
        orderId: updatedOrder.id,
        recipientEmail: updatedOrder.customerEmail,
        template: "renewal_confirmed",
        subject: "Размещение книги «Мой первый год» продлено на 365 дней",
        safeSummary: `Срок размещения книги продлён до ${updatedBook.expiresAt?.slice(0, 10)}. Автосписания отключены.`,
      });
      trackServerEvent({
        event: "renewal_succeeded",
        userId: updatedOrder.userId,
        entityId: updatedOrder.id,
        productSlug: updatedOrder.productSlug,
        amountKopecks: updatedOrder.amountKopecks,
      });
    }
  }

  return {
    idempotentSkip: Boolean(txResult.idempotentSkip),
    publishDelayed: Boolean(txResult.publishDelayed),
    order: updatedOrder,
    payment: updatedPayment,
    book: updatedBook,
  };
}

/**
 * Повторная попытка публикации для заказа в статусе publishing (восстановление после сбоя).
 */
export function retryOrderPublication(orderId: string, nowOverrideIso?: string) {
  const db = getDb();
  const order = db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) throw new Error("Заказ не найден");
  const payment = db
    .select()
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .get();
  if (!payment || payment.status !== "succeeded") {
    throw new Error("Невозможно опубликовать книгу без подтверждённого платежа");
  }

  return processPaymentWebhook({
    event: "payment.succeeded",
    providerPaymentId: payment.providerPaymentId,
    orderId: order.id,
    amountKopecks: order.amountKopecks,
    currency: order.currency,
    nowOverrideIso,
  });
}

/**
 * Проверка сроков размещения, перевод в льготный период 90 дней и отправка уведомлений за 30, 7 и 1 день.
 */
export function evaluateEntitlementsAndWarnings(nowOverrideIso?: string) {
  const db = getDb();
  const nowIso = nowOverrideIso || new Date().toISOString();
  const nowMs = new Date(nowIso).getTime();

  const allEnts = db.select().from(subscriptionsOrEntitlements).all();
  const notificationsSent: { bookId: string; template: string }[] = [];

  for (const ent of allEnts) {
    if (ent.status === "revoked") continue;

    const book = db.select().from(books).where(eq(books.id, ent.bookId)).get();
    if (!book || book.status === "deleted") continue;

    const expiresMs = new Date(ent.expiresAt).getTime();
    const graceMs = new Date(ent.graceUntil).getTime();
    const daysUntilExpiry = (expiresMs - nowMs) / (24 * 60 * 60 * 1000);

    // Проверка истечения оплаченного срока
    if (nowMs >= expiresMs && nowMs < graceMs) {
      if (ent.status !== "grace_period" || book.status === "published") {
        db.update(subscriptionsOrEntitlements)
          .set({ status: "grace_period", updatedAt: nowIso })
          .where(eq(subscriptionsOrEntitlements.id, ent.id))
          .run();
        db.update(books)
          .set({ status: "expired", updatedAt: nowIso })
          .where(eq(books.id, book.id))
          .run();
      }
    } else if (nowMs >= graceMs) {
      if (ent.status !== "expired" || book.status !== "expired") {
        db.update(subscriptionsOrEntitlements)
          .set({ status: "expired", updatedAt: nowIso })
          .where(eq(subscriptionsOrEntitlements.id, ent.id))
          .run();
        db.update(books)
          .set({ status: "expired", updatedAt: nowIso })
          .where(eq(books.id, book.id))
          .run();
      }
    }

    // Уведомления за 30, 7 и 1 день до окончания (для активных книг)
    const ownerOrder = db
      .select()
      .from(orders)
      .where(eq(orders.bookId, book.id))
      .get();
    const recipientEmail = ownerOrder?.customerEmail || "customer@ya-zdes.ru";

    if (daysUntilExpiry <= 30 && daysUntilExpiry > 7 && !ent.warn30SentAt) {
      enqueueNotification({
        userId: book.ownerId,
        bookId: book.id,
        recipientEmail,
        template: "expiry_warning_30d",
        subject: "До окончания года размещения вашей книги осталось менее 30 дней",
        safeSummary:
          book.productSlug === "first-year"
            ? "Вы можете продлить размещение книги «Мой первый год» на 365 дней за 990 ₽ в личном кабинете."
            : "Вы можете скачать архив ваших материалов в личном кабинете до окончания срока размещения.",
      });
      db.update(subscriptionsOrEntitlements)
        .set({ warn30SentAt: nowIso, updatedAt: nowIso })
        .where(eq(subscriptionsOrEntitlements.id, ent.id))
        .run();
      notificationsSent.push({ bookId: book.id, template: "expiry_warning_30d" });
    } else if (daysUntilExpiry <= 7 && daysUntilExpiry > 1 && !ent.warn7SentAt) {
      enqueueNotification({
        userId: book.ownerId,
        bookId: book.id,
        recipientEmail,
        template: "expiry_warning_7d",
        subject: "Осталось 7 дней размещения вашей книги в «Я здесь»",
        safeSummary:
          book.productSlug === "first-year"
            ? "Напоминаем о возможности ручного продления на год за 990 ₽ (без автосписаний)."
            : "Напоминаем: сохраните экспорт вашей книги в личном кабинете.",
      });
      db.update(subscriptionsOrEntitlements)
        .set({ warn7SentAt: nowIso, updatedAt: nowIso })
        .where(eq(subscriptionsOrEntitlements.id, ent.id))
        .run();
      notificationsSent.push({ bookId: book.id, template: "expiry_warning_7d" });
    } else if (daysUntilExpiry <= 1 && daysUntilExpiry > -90 && !ent.warn1SentAt) {
      enqueueNotification({
        userId: book.ownerId,
        bookId: book.id,
        recipientEmail,
        template: "expiry_warning_1d",
        subject: "Завтра завершается оплаченный срок размещения вашей книги",
        safeSummary:
          book.productSlug === "first-year"
            ? "После окончания срока данные сохраняются на льготный период 90 дней. Доступно продление за 990 ₽."
            : "Успейте скачать полный архив ваших материалов в личном кабинете.",
      });
      db.update(subscriptionsOrEntitlements)
        .set({ warn1SentAt: nowIso, updatedAt: nowIso })
        .where(eq(subscriptionsOrEntitlements.id, ent.id))
        .run();
      notificationsSent.push({ bookId: book.id, template: "expiry_warning_1d" });
    }
  }

  return { notificationsSent };
}
