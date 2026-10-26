import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import {
  AccountLoginForm,
  AccountSessionControls,
} from "@/components/account-client";
import { getCurrentUser } from "@/lib/auth";
import { listUserBooks } from "@/lib/books";
import { getProductBySlug } from "@/lib/catalog";
import { ensureDemoSeed } from "@/lib/demo-seed";
import {
  formatRublesFromKopecks,
  formatRuDate,
} from "@/lib/utils";
import {
  BookOpen,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default async function AccountPage() {
  ensureDemoSeed();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 py-12 sm:py-16 px-4">
          <AccountLoginForm />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const userBooks = listUserBooks(user.id);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="layout-container space-y-10">
          {/* Заголовок кабинета */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-8">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
                Личный кабинет автора
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#231C18]">
                Мои книги и издания ({userBooks.length})
              </h1>
              <p className="text-sm text-[#574940]">
                Вы вошли как <strong>{user.email}</strong>
                {user.role === "admin" && (
                  <>
                    {" "}
                    ·{" "}
                    <Link
                      href="/admin"
                      className="font-semibold text-[#6E2638] underline"
                    >
                      Перейти в админ-панель
                    </Link>
                  </>
                )}
              </p>
            </div>

            <AccountSessionControls />
          </div>

          {/* Список книг */}
          {userBooks.length === 0 ? (
            <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-10 text-center space-y-4">
              <BookOpen className="mx-auto h-10 w-10 text-[#7A6B60]" />
              <h2 className="font-serif text-2xl font-semibold text-[#231C18]">
                У вас пока нет созданных книг
              </h2>
              <p className="text-sm text-[#574940] max-w-md mx-auto">
                Выберите повод в каталоге и создайте первую цифровую книгу за
                10–15 минут.
              </p>
              <Link
                href="/catalog"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[#6E2638] px-6 py-2.5 text-sm font-medium text-[#FAF4F4]"
              >
                <Plus className="h-4 w-4" />
                <span>Выбрать повод в каталоге</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {userBooks.map(({ book, photos, entitlement }) => {
                const product = getProductBySlug(book.productSlug);
                const isPublished = book.status === "published";
                const isFirstYear = book.productSlug === "first-year";

                return (
                  <article
                    key={book.id}
                    className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-8 shadow-xs space-y-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#ECE4D8] pb-5">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isPublished
                                ? "bg-[#E5F2E8] text-[#255431]"
                                : book.status === "expired"
                                ? "bg-[#FBE9E7] text-[#872D23]"
                                : "bg-[#FFF5DC] text-[#6B4800]"
                            }`}
                          >
                            {isPublished
                              ? "Опубликована"
                              : book.status === "expired"
                              ? "Срок размещения истёк"
                              : "Черновик (не оплачена)"}
                          </span>
                          <span className="text-xs text-[#7A6B60]">
                            Издание: <strong>{product?.title}</strong> · Фото:{" "}
                            {photos.length}
                          </span>
                        </div>

                        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C18]">
                          {book.title}
                        </h2>

                        {book.publicSlug && (
                          <p className="text-xs text-[#574940]">
                            Приватный адрес:{" "}
                            <Link
                              href={`/b/${book.publicSlug}`}
                              className="font-mono text-[#6E2638] underline"
                            >
                              /b/{book.publicSlug}
                            </Link>
                          </p>
                        )}
                      </div>

                      {/* Блок сроков размещения */}
                      <div className="rounded-2xl bg-[#FAF7F2] border border-[#EAE2D6] px-4 py-3 text-xs text-[#4A3E36] space-y-1">
                        {book.expiresAt ? (
                          <>
                            <div className="flex items-center gap-1.5 font-semibold text-[#231C18]">
                              <Clock className="h-3.5 w-3.5 text-[#6E2638]" />
                              <span>
                                Оплачено до: {formatRuDate(book.expiresAt)}
                              </span>
                            </div>
                            {isFirstYear && book.graceUntil && (
                              <div className="text-[#695B50]">
                                Льготное хранение (90 дн.) до:{" "}
                                {formatRuDate(book.graceUntil)}
                              </div>
                            )}
                            <div className="text-[13px] text-[#4A6151] flex items-center gap-1 pt-0.5">
                              <ShieldCheck className="h-3 w-3" />
                              <span>
                                Автосписания отключены (
                                {entitlement?.autoRenewAllowed ? "вкл" : "нет"})
                              </span>
                            </div>
                          </>
                        ) : (
                          <div>
                            Ожидает оплаты (12 мес. размещения после покупки)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Уведомление об услових продления для first-year vs остальных */}
                    {isFirstYear ? (
                      <div className="rounded-2xl border border-[#D3E0D6] bg-[#F3F8F4] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1 text-xs text-[#2B3D30]">
                          <div className="font-semibold text-sm">
                            Журнал «Мой первый год» можно дополнять весь срок и
                            продлевать вручную за 990 ₽/год
                          </div>
                          <p>
                            При продлении до окончания текущего срока 365 дней
                            прибавляются к {formatRuDate(book.expiresAt)}. Без
                            скрытых автосписаний.
                          </p>
                        </div>

                        {isPublished || book.status === "expired" ? (
                          <Link
                            href={`/checkout/${book.id}?type=renewal`}
                            className="inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-full bg-[#4A6151] px-5 py-2 text-xs font-medium text-white hover:bg-[#3B4F41] transition-colors"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Продлить на 365 дней за 990 ₽</span>
                          </Link>
                        ) : null}
                      </div>
                    ) : (
                      isPublished && (
                        <div className="rounded-2xl border border-[#ECE4D8] bg-[#FAF7F2] px-4 py-3 text-xs text-[#695B50]">
                          Для издания {product?.title} покупка продления в MVP не
                          предусмотрена. Вы можете в любой момент скачать полный
                          архив своих материалов кнопкой «Скачать архив (JSON + фото)».
                        </div>
                      )
                    )}

                    {/* Кнопки действий с книгой */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/create/${book.productSlug}?bookId=${book.id}`}
                        className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[#D8CFC4] bg-[#FFFEFA] px-4 py-2 text-xs font-medium text-[#2B1E1A] hover:bg-[#F3EDE3]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Редактировать книгу</span>
                      </Link>

                      <Link
                        href={`/preview/${book.id}`}
                        className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[#D8CFC4] bg-[#FFFEFA] px-4 py-2 text-xs font-medium text-[#2B1E1A] hover:bg-[#F3EDE3]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Предпросмотр</span>
                      </Link>

                      {isPublished && book.publicSlug ? (
                        <Link
                          href={`/b/${book.publicSlug}`}
                          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-[#2B1E1A] px-4 py-2 text-xs font-medium text-[#FAF7F2]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Открыть публичную книгу</span>
                        </Link>
                      ) : (
                        product && (
                          <Link
                            href={`/checkout/${book.id}`}
                            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-[#6E2638] px-5 py-2 text-xs font-medium text-[#FAF4F4]"
                          >
                            <span>
                              Оплатить и опубликовать (
                              {formatRublesFromKopecks(product.initialPriceKopecks)}
                              )
                            </span>
                          </Link>
                        )
                      )}

                      <a
                        href={`/api/books/${book.id}/export`}
                        className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[#D8CFC4] bg-[#FAF7F2] px-4 py-2 text-xs font-medium text-[#4A3E36] hover:bg-[#EFE9DE]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Скачать архив (JSON + фото)</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
