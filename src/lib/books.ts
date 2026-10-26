import crypto from "node:crypto";
import { getDb, getRawSqlite } from "./db";
import {
  books,
  chapters,
  timelineEvents,
  mediaAssets,
  subscriptionsOrEntitlements,
  users,
} from "./db/schema";
import { eq, desc } from "drizzle-orm";
import {
  getProductBySlug,
  isValidProductSlug,
  ProductSlug,
} from "./catalog";
import {
  BookContentJsonV1,
  BookContentJsonV1Schema,
  sortTimelineEvents,
  createDefaultBookContent,
} from "./book-schema";
import { hashSecretValue } from "./auth";
import { recordAuditEvent } from "./audit";
import { enqueueNotification } from "./notifications";
import { trackServerEvent } from "./analytics";

export { createDefaultBookContent };

export function createDraftBook(params: {
  ownerId: string;
  ownerEmail: string;
  productSlug: string;
  initialTitle?: string;
}) {
  if (!isValidProductSlug(params.productSlug)) {
    throw new Error("Выбран неизвестный продукт");
  }
  const product = getProductBySlug(params.productSlug)!;
  const db = getDb();
  const nowIso = new Date().toISOString();
  const bookId = "book_" + crypto.randomBytes(10).toString("hex");
  const rawEditToken = crypto.randomBytes(24).toString("hex");
  const content = createDefaultBookContent(params.productSlug);

  if (params.initialTitle?.trim()) {
    content.coverTitle = params.initialTitle.trim();
  }

  db.insert(books)
    .values({
      id: bookId,
      ownerId: params.ownerId,
      productSlug: params.productSlug,
      title: content.coverTitle,
      publicSlug: null,
      editTokenHash: hashSecretValue(rawEditToken),
      theme: content.themeId,
      contentJson: JSON.stringify(content),
      status: "draft",
      createdAt: nowIso,
      updatedAt: nowIso,
    })
    .run();

  enqueueNotification({
    userId: params.ownerId,
    bookId,
    recipientEmail: params.ownerEmail,
    template: "book_created",
    subject: `Черновик книги ${product.title} сохранён в «Я здесь»`,
    safeSummary: `Создан черновик ${product.title}. Вы можете вернуться к редактированию в любой момент.`,
  });

  trackServerEvent({
    event: "start_creation",
    userId: params.ownerId,
    entityId: bookId,
    productSlug: params.productSlug,
  });

  return {
    book: db.select().from(books).where(eq(books.id, bookId)).get()!,
    editToken: rawEditToken,
  };
}

export function assertBookOwnerOrEditToken(params: {
  bookId: string;
  userId?: string | null;
  editToken?: string | null;
}) {
  const db = getDb();
  const book = db.select().from(books).where(eq(books.id, params.bookId)).get();
  if (!book || book.status === "deleted") {
    throw new Error("Книга не найдена или была удалена");
  }

  const isOwner = Boolean(params.userId && book.ownerId === params.userId);
  const isValidEditToken = Boolean(
    params.editToken &&
      hashSecretValue(params.editToken) === book.editTokenHash
  );

  if (!isOwner && !isValidEditToken) {
    recordAuditEvent({
      actorUserId: params.userId ?? null,
      eventType: "security_unauthorized_book_access",
      entityType: "book",
      entityId: params.bookId,
    });
    throw new Error("Доступ запрещён: редактировать книгу может только её владелец");
  }

  return book;
}

export function updateBookDraftOrContent(params: {
  bookId: string;
  userId?: string | null;
  editToken?: string | null;
  content: BookContentJsonV1;
  rawPin?: string | null; // если передана строка из 4-8 цифр — ставим хеш, если "" — снимаем PIN
}) {
  const book = assertBookOwnerOrEditToken({
    bookId: params.bookId,
    userId: params.userId,
    editToken: params.editToken,
  });

  const parsed = BookContentJsonV1Schema.parse(params.content);
  parsed.timeline = sortTimelineEvents(parsed.timeline);

  const sqlite = getRawSqlite();
  const db = getDb();
  const nowIso = new Date().toISOString();

  let nextPinHash = book.pinHash;
  if (params.rawPin !== undefined) {
    if (params.rawPin === null || params.rawPin.trim() === "") {
      nextPinHash = null;
      parsed.pinEnabled = false;
    } else {
      const cleanPin = params.rawPin.trim();
      if (!/^\d{4,8}$/.test(cleanPin)) {
        throw new Error("PIN-код должен состоять из 4–8 цифр");
      }
      nextPinHash = hashSecretValue(`pin:${book.id}:${cleanPin}`);
      parsed.pinEnabled = true;
    }
  } else {
    parsed.pinEnabled = Boolean(book.pinHash);
  }

  sqlite.transaction(() => {
    db.update(books)
      .set({
        title: parsed.coverTitle.trim() || book.title,
        theme: parsed.themeId,
        contentJson: JSON.stringify(parsed),
        pinHash: nextPinHash,
        updatedAt: nowIso,
      })
      .where(eq(books.id, book.id))
      .run();

    db.delete(chapters).where(eq(chapters.bookId, book.id)).run();
    for (let i = 0; i < parsed.chapters.length; i++) {
      const ch = parsed.chapters[i];
      db.insert(chapters)
        .values({
          id: ch.id.startsWith("ch_")
            ? `${book.id}_${ch.id}`
            : ch.id,
          bookId: book.id,
          sortOrder: i,
          title: ch.title,
          body: ch.body,
          promptKey: ch.promptKey ?? null,
          createdAt: nowIso,
          updatedAt: nowIso,
        })
        .run();
    }

    db.delete(timelineEvents).where(eq(timelineEvents.bookId, book.id)).run();
    for (let i = 0; i < parsed.timeline.length; i++) {
      const tl = parsed.timeline[i];
      db.insert(timelineEvents)
        .values({
          id: tl.id.startsWith("tl_")
            ? `${book.id}_${tl.id}`
            : tl.id,
          bookId: book.id,
          sortOrder: i,
          eventDate: tl.eventDate ?? null,
          dateLabel: tl.dateLabel,
          title: tl.title,
          description: tl.description,
          mediaAssetId: tl.mediaAssetId ?? null,
          createdAt: nowIso,
          updatedAt: nowIso,
        })
        .run();
    }
  })();

  return getBookWithRelations(book.id);
}

export function getBookWithRelations(bookId: string) {
  const db = getDb();
  const book = db.select().from(books).where(eq(books.id, bookId)).get();
  if (!book) return null;

  let content: BookContentJsonV1;
  try {
    content = JSON.parse(book.contentJson) as BookContentJsonV1;
  } catch {
    content = createDefaultBookContent(book.productSlug as ProductSlug);
  }

  const photos = db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.bookId, book.id))
    .all();

  const entitlement = db
    .select()
    .from(subscriptionsOrEntitlements)
    .where(eq(subscriptionsOrEntitlements.bookId, book.id))
    .get();

  return {
    book,
    content,
    photos,
    entitlement: entitlement || null,
  };
}

export function verifyPublicBookAccess(params: {
  publicSlug: string;
  providedPin?: string | null;
  nowOverrideIso?: string;
}) {
  const db = getDb();
  const book = db
    .select()
    .from(books)
    .where(eq(books.publicSlug, params.publicSlug))
    .get();

  if (!book || book.status === "deleted") {
    return { allowed: false as const, reason: "not_found" as const };
  }

  // ТЗ Раздел 12: Неоплаченная книга не доступна публично
  if (book.status !== "published") {
    return { allowed: false as const, reason: "not_published" as const, status: book.status };
  }

  const nowMs = new Date(params.nowOverrideIso || new Date().toISOString()).getTime();
  if (book.expiresAt && new Date(book.expiresAt).getTime() <= nowMs) {
    return {
      allowed: false as const,
      reason: "expired" as const,
      productSlug: book.productSlug,
      expiresAt: book.expiresAt,
      graceUntil: book.graceUntil,
    };
  }

  if (book.pinHash) {
    if (!params.providedPin) {
      return {
        allowed: false as const,
        reason: "pin_required" as const,
        bookTitle: book.title,
      };
    }
    const candidateHash = hashSecretValue(`pin:${book.id}:${params.providedPin.trim()}`);
    if (candidateHash !== book.pinHash) {
      return {
        allowed: false as const,
        reason: "pin_invalid" as const,
        bookTitle: book.title,
      };
    }
  }

  const full = getBookWithRelations(book.id)!;
  return {
    allowed: true as const,
    book: full.book,
    content: full.content,
    photos: full.photos,
    entitlement: full.entitlement,
  };
}

export function exportBookArchiveJson(params: {
  bookId: string;
  userId: string;
}) {
  const book = assertBookOwnerOrEditToken({
    bookId: params.bookId,
    userId: params.userId,
  });
  const full = getBookWithRelations(book.id)!;

  recordAuditEvent({
    actorUserId: params.userId,
    eventType: "book_exported",
    entityType: "book",
    entityId: book.id,
  });

  return {
    exportedAt: new Date().toISOString(),
    service: "Я здесь — магазин цифровых книг-подарков",
    bookId: full.book.id,
    productSlug: full.book.productSlug,
    title: full.book.title,
    theme: full.book.theme,
    status: full.book.status,
    publishedAt: full.book.publishedAt,
    expiresAt: full.book.expiresAt,
    content: full.content,
    mediaAssets: full.photos.map((p) => ({
      id: p.id,
      caption: p.caption,
      altText: p.altText,
      mimeType: p.mimeType,
      width: p.width,
      height: p.height,
      dataUrl: p.dataUrl,
    })),
  };
}

/**
 * ТЗ Раздел 8: Удаление книги или аккаунта запускает последовательное удаление
 * пользовательских медиа и данных с учётом применимых сроков хранения документов об оплате.
 */
export function deleteUserAccountAndMedia(userId: string) {
  const sqlite = getRawSqlite();
  const db = getDb();
  const nowIso = new Date().toISOString();

  sqlite.transaction(() => {
    const userBooks = db
      .select()
      .from(books)
      .where(eq(books.ownerId, userId))
      .all();

    for (const b of userBooks) {
      db.delete(mediaAssets).where(eq(mediaAssets.bookId, b.id)).run();
      db.delete(chapters).where(eq(chapters.bookId, b.id)).run();
      db.delete(timelineEvents).where(eq(timelineEvents.bookId, b.id)).run();
      db.update(books)
        .set({
          title: "[Удалено пользователем]",
          publicSlug: null,
          contentJson: JSON.stringify({ schemaVersion: 1, redacted: true }),
          status: "deleted",
          pinHash: null,
          updatedAt: nowIso,
        })
        .where(eq(books.id, b.id))
        .run();
      db.update(subscriptionsOrEntitlements)
        .set({ status: "revoked", updatedAt: nowIso })
        .where(eq(subscriptionsOrEntitlements.bookId, b.id))
        .run();
    }

    // Платежи и заказы (документы об оплате) сохраняются в обезличенном виде согласно требованиям бухучёта
    db.update(users)
      .set({
        name: "[Удалённый пользователь]",
        deletedAt: nowIso,
        updatedAt: nowIso,
      })
      .where(eq(users.id, userId))
      .run();
  })();

  recordAuditEvent({
    actorUserId: userId,
    eventType: "account_deleted_with_media_purge",
    entityType: "user",
    entityId: userId,
  });
}

export function listUserBooks(userId: string) {
  const db = getDb();
  const rows = db
    .select()
    .from(books)
    .where(eq(books.ownerId, userId))
    .orderBy(desc(books.updatedAt))
    .all();

  return rows
    .filter((r) => r.status !== "deleted")
    .map((r) => getBookWithRelations(r.id)!);
}
