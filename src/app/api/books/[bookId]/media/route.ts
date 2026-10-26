import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { assertBookOwnerOrEditToken } from "@/lib/books";
import { validateAndStoreMediaAsset } from "@/lib/media";
import { getDb } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const user = await getCurrentUser();
    const formData = await req.formData();

    const editToken = formData.get("editToken")?.toString() || null;
    const book = assertBookOwnerOrEditToken({
      bookId,
      userId: user?.id,
      editToken,
    });

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Файл фотографии не передан" },
        { status: 400 }
      );
    }

    const caption = formData.get("caption")?.toString() || "";
    const altText = formData.get("altText")?.toString() || caption;
    const isFavorite = formData.get("isFavorite")?.toString() === "true";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const saved = await validateAndStoreMediaAsset({
      userId: book.ownerId,
      bookId: book.id,
      fileName: file.name,
      claimedMimeType: file.type,
      buffer,
      caption,
      altText,
      isFavorite,
    });

    return NextResponse.json({ ok: true, media: saved });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error ? err.message : "Ошибка загрузки фотографии",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const user = await getCurrentUser();
    const mediaId = req.nextUrl.searchParams.get("mediaId");
    const editToken = req.nextUrl.searchParams.get("editToken");

    if (!mediaId) {
      return NextResponse.json(
        { ok: false, error: "Не указан mediaId" },
        { status: 400 }
      );
    }

    assertBookOwnerOrEditToken({
      bookId,
      userId: user?.id,
      editToken,
    });

    const db = getDb();
    db.delete(mediaAssets)
      .where(and(eq(mediaAssets.id, mediaId), eq(mediaAssets.bookId, bookId)))
      .run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Ошибка удаления фото",
      },
      { status: 400 }
    );
  }
}
