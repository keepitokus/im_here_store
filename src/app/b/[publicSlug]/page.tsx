import Link from "next/link";
import type { Metadata } from "next";
import { BookReaderView } from "@/components/book-reader";
import { verifyPublicBookAccess } from "@/lib/books";
import { ensureDemoSeed } from "@/lib/demo-seed";
import { formatRuDate } from "@/lib/utils";
import { Lock, Clock, BookOpen, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Приватное цифровое издание — «Я здесь»",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function PublicBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicSlug: string }>;
  searchParams: Promise<{ pin?: string }>;
}) {
  ensureDemoSeed();
  const { publicSlug } = await params;
  const { pin } = await searchParams;

  const access = verifyPublicBookAccess({
    publicSlug,
    providedPin: pin || null,
  });

  if (!access.allowed) {
    if (access.reason === "pin_required" || access.reason === "pin_invalid") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] p-4">
          <div className="max-w-md w-full rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-7 sm:p-9 text-center space-y-5 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3E1E4]">
              <Lock className="h-5 w-5 text-[#6E2638]" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
                Приватное издание «Я здесь»
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C18]">
                {access.bookTitle}
              </h1>
              <p className="text-sm text-[#574940]">
                Автор защитил эту книгу персональным PIN-кодом. Пожалуйста,
                введите код, чтобы открыть страницы.
              </p>
            </div>

            {access.reason === "pin_invalid" && (
              <div className="rounded-xl bg-[#FBE9E7] px-3 py-2 text-xs font-medium text-[#9E2A2B]">
                Неверный PIN-код. Проверьте цифры и попробуйте ещё раз.
              </div>
            )}

            <form method="GET" className="space-y-3">
              <input
                type="password"
                name="pin"
                inputMode="numeric"
                required
                placeholder="Введите PIN-код (4–8 цифр)"
                className="flex min-h-[46px] w-full rounded-xl border border-[#D8CFC4] bg-[#FAF7F2] px-4 py-2.5 text-center text-base tracking-widest text-[#231C18] focus:outline-none focus:ring-2 focus:ring-[#6E2638]"
              />
              <button
                type="submit"
                className="w-full min-h-[46px] rounded-full bg-[#6E2638] px-6 py-2.5 text-sm font-medium text-[#FAF4F4] hover:bg-[#581D2C] transition-colors"
              >
                Открыть книгу
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (access.reason === "expired") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] p-4">
          <div className="max-w-md w-full rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-7 sm:p-9 text-center space-y-5 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE9DE]">
              <Clock className="h-6 w-6 text-[#6E2638]" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C18]">
              Срок публичного размещения этой книги завершился
            </h1>
            <p className="text-sm text-[#574940] leading-relaxed">
              Оплаченный период хостинга истёк ({formatRuDate(access.expiresAt)}).
              {access.productSlug === "first-year"
                ? " Владелец книги может вручную продлить размещение на 365 дней за 990 ₽ в личном кабинете (данные бережно хранятся 90 дней)."
                : " Владелец книги может скачать полный архив материалов в личном кабинете."}
            </p>
            <div className="pt-2">
              <Link
                href="/account"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#2B1E1A] px-6 py-2.5 text-sm font-medium text-[#FAF7F2]"
              >
                Перейти в кабинет владельца
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] p-4">
        <div className="max-w-md w-full rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-7 sm:p-9 text-center space-y-5 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE9DE]">
            <BookOpen className="h-6 w-6 text-[#2B1E1A]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C18]">
            Книга не найдена или ещё не опубликована
          </h1>
          <p className="text-sm text-[#574940] leading-relaxed">
            Проверьте правильность ссылки. Неоплаченные черновики недоступны по
            публичным адресам до завершения оплаты.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#2B1E1A] px-6 py-2.5 text-sm font-medium text-[#FAF7F2]"
            >
              На главную «Я здесь»
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const topGiftHeader = (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xs px-4 py-2.5 text-xs text-[#574940]">
      <div className="inline-flex items-center gap-1.5">
        <ShieldCheck className="h-4 w-4 text-[#4A6151]" />
        <span>
          Приватное издание «Я здесь» · Активно до{" "}
          {formatRuDate(access.book.expiresAt)}
        </span>
      </div>
      <Link href="/" className="font-medium text-[#6E2638] hover:underline">
        Создать свою книгу →
      </Link>
    </div>
  );

  return (
    <BookReaderView
      content={access.content}
      photos={access.photos}
      modeBanner={topGiftHeader}
    />
  );
}
