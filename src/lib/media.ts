import crypto from "node:crypto";
import sharp from "sharp";
import { getDb } from "./db";
import { books, mediaAssets } from "./db/schema";
import { eq } from "drizzle-orm";
import { recordAuditEvent } from "./audit";
import { trackServerEvent } from "./analytics";

export const MAX_MEDIA_BYTES = 15 * 1024 * 1024; // 15 МБ
export const MAX_PHOTOS_PER_BOOK = 30;
export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function detectImageSignatureMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: "RIFF" .... "WEBP"
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    return "image/webp";
  }

  return null;
}

export async function validateAndStoreMediaAsset(params: {
  userId: string;
  bookId: string;
  fileName: string;
  claimedMimeType: string;
  buffer: Buffer;
  caption?: string;
  altText?: string;
  isFavorite?: boolean;
}) {
  if (params.buffer.length === 0) {
    throw new Error("Файл пуст");
  }

  if (params.buffer.length > MAX_MEDIA_BYTES) {
    throw new Error(
      "Размер файла превышает допустимый лимит 15 МБ. Пожалуйста, выберите файл меньшего размера."
    );
  }

  const lowerName = params.fileName.toLowerCase();
  if (
    lowerName.endsWith(".svg") ||
    lowerName.endsWith(".html") ||
    lowerName.endsWith(".exe") ||
    lowerName.endsWith(".js") ||
    params.claimedMimeType.includes("svg") ||
    params.claimedMimeType.includes("html")
  ) {
    throw new Error(
      "Недопустимый формат файла. Разрешены только фотографии JPEG, PNG и WebP."
    );
  }

  const detectedMime = detectImageSignatureMime(params.buffer);
  if (!detectedMime || !ALLOWED_IMAGE_MIMES.has(detectedMime)) {
    throw new Error(
      "Сигнатура файла не соответствует безопасному изображению JPEG, PNG или WebP."
    );
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
      entityType: "book_media",
      entityId: params.bookId,
    });
    throw new Error("Нет прав на добавление фотографий в чужую книгу");
  }

  const existingPhotos = db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.bookId, book.id))
    .all();

  if (existingPhotos.length >= MAX_PHOTOS_PER_BOOK) {
    throw new Error(
      `В книгу можно загрузить не более ${MAX_PHOTOS_PER_BOOK} фотографий в рамках MVP.`
    );
  }

  // Авто-ориентация EXIF и оптимизация в WebP через sharp
  const optimized = await sharp(params.buffer)
    .rotate() // auto-orient based on EXIF
    .resize({
      width: 1400,
      height: 1400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const dataUrl = `data:image/webp;base64,${optimized.data.toString("base64")}`;
  const mediaId = "med_" + crypto.randomBytes(10).toString("hex");
  const nowIso = new Date().toISOString();

  db.insert(mediaAssets)
    .values({
      id: mediaId,
      bookId: book.id,
      ownerId: params.userId,
      storageKey: `uploads/${book.id}/${mediaId}.webp`,
      mimeType: "image/webp",
      sizeBytes: optimized.info.size,
      width: optimized.info.width,
      height: optimized.info.height,
      caption: (params.caption || "").trim().slice(0, 220),
      altText:
        (params.altText || params.caption || "Фотография из семейного архива")
          .trim()
          .slice(0, 220),
      sortOrder: existingPhotos.length,
      isFavorite: Boolean(params.isFavorite),
      dataUrl,
      createdAt: nowIso,
    })
    .run();

  trackServerEvent({
    event: "upload_photos",
    userId: params.userId,
    entityId: book.id,
    productSlug: book.productSlug,
  });

  return db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, mediaId))
    .get()!;
}
