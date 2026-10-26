import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDraftBook, listUserBooks } from "@/lib/books";
import { ensureDemoSeed } from "@/lib/demo-seed";

export async function GET() {
  ensureDemoSeed();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Требуется авторизация" },
      { status: 401 }
    );
  }
  const items = listUserBooks(user.id);
  return NextResponse.json({ ok: true, books: items });
}

export async function POST(req: NextRequest) {
  try {
    ensureDemoSeed();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Пожалуйста, войдите по email перед сохранением черновика",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const productSlug = String(body.productSlug || "");
    const initialTitle = body.initialTitle
      ? String(body.initialTitle)
      : undefined;

    const created = createDraftBook({
      ownerId: user.id,
      ownerEmail: user.email,
      productSlug,
      initialTitle,
    });

    return NextResponse.json({
      ok: true,
      book: created.book,
      editToken: created.editToken,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Ошибка создания книги",
      },
      { status: 400 }
    );
  }
}
