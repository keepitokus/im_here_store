import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  assertBookOwnerOrEditToken,
  getBookWithRelations,
  updateBookDraftOrContent,
} from "@/lib/books";
import { trackServerEvent } from "@/lib/analytics";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const user = await getCurrentUser();
    const editToken = req.nextUrl.searchParams.get("editToken");

    assertBookOwnerOrEditToken({
      bookId,
      userId: user?.id,
      editToken,
    });

    const data = getBookWithRelations(bookId);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Доступ запрещён",
      },
      { status: 403 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const user = await getCurrentUser();
    const body = await req.json();
    const editToken = body.editToken ? String(body.editToken) : null;

    const updated = updateBookDraftOrContent({
      bookId,
      userId: user?.id,
      editToken,
      content: body.content,
      rawPin: body.rawPin,
    });

    if (body.completedEditorStep) {
      trackServerEvent({
        event: "complete_editor",
        userId: user?.id,
        entityId: bookId,
        productSlug: updated?.book.productSlug,
      });
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Ошибка сохранения черновика",
      },
      { status: 400 }
    );
  }
}
