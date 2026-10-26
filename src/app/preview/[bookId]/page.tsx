import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { BookReaderView } from "@/components/book-reader";
import { getCurrentUser } from "@/lib/auth";
import { assertBookOwnerOrEditToken, getBookWithRelations } from "@/lib/books";
import { getProductBySlug } from "@/lib/catalog";
import { formatRublesFromKopecks } from "@/lib/utils";
import { trackServerEvent } from "@/lib/analytics";
import { ensureDemoSeed } from "@/lib/demo-seed";
import { ArrowRight, Edit3, Lock, ShieldAlert } from "lucide-react";

export default async function PreviewBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string }>;
  searchParams: Promise<{ editToken?: string }>;
}) {
  ensureDemoSeed();
  const { bookId } = await params;
  const { editToken } = await searchParams;
  const user = await getCurrentUser();

  let authorized = false;
  try {
    assertBookOwnerOrEditToken({
      bookId,
      userId: user?.id,
      editToken: editToken || null,
    });
    authorized = true;
  } catch {
    authorized = false;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FBE9E7]">
              <Lock className="h-6 w-6 text-[#9E2A2B]" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-[#231C18]">
              Предпросмотр доступен только автору книги
            </h1>
            <p className="text-sm text-[#574940] leading-relaxed">
              Неоплаченные черновики и приватные предпросмотры защищены от
              постороннего доступа. Войдите в свой аккаунт в личном кабинете, чтобы
              открыть эту книгу.
            </p>
            <div className="pt-2">
              <Link
                href="/account"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#6E2638] px-6 py-2.5 text-sm font-medium text-[#FAF4F4]"
              >
                Войти в личный кабинет
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const full = getBookWithRelations(bookId);
  if (!full) {
    return null;
  }

  const product = getProductBySlug(full.book.productSlug);
  const isAlreadyPublished = full.book.status === "published";

  trackServerEvent({
    event: "view_preview",
    userId: user?.id,
    entityId: bookId,
    productSlug: full.book.productSlug,
  });

  const banner = (
    <div className="rounded-2xl border border-[#E8CC88] bg-[#FFF5DC] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B4800]">
          <ShieldAlert className="h-4 w-4" />
          <span>
            {isAlreadyPublished
              ? "Предпросмотр владельца (книга уже оплачена и опубликована)"
              : "Режим предпросмотра до оплаты · С водяным знаком"}
          </span>
        </div>
        <p className="text-xs text-[#6B4800]/90">
          {isAlreadyPublished
            ? `Публичная ссылка активна: /b/${full.book.publicSlug}`
            : "Публичная ссылка и QR-код появятся сразу после оплаты заказа."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/create/${full.book.productSlug}?bookId=${full.book.id}${
            editToken ? `&editToken=${encodeURIComponent(editToken)}` : ""
          }`}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[#D4B97B] bg-[#FFFEFA] px-4 py-2 text-xs font-medium text-[#231C18]"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Вернуться в редактор</span>
        </Link>

        {!isAlreadyPublished && product && (
          <Link
            href={`/checkout/${full.book.id}`}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-[#6E2638] px-5 py-2 text-xs sm:text-sm font-medium text-[#FAF4F4]"
          >
            <span>
              Оплатить и опубликовать (
              {formatRublesFromKopecks(product.initialPriceKopecks)})
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <BookReaderView
          content={full.content}
          photos={full.photos}
          watermarkText={
            isAlreadyPublished ? null : "Я ЗДЕСЬ · ПРЕДПРОСМОТР ДО ОПЛАТЫ"
          }
          modeBanner={banner}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
