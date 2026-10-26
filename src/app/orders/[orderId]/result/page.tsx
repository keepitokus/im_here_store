import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import {
  CopyLinkButton,
  OrderRecoveryActions,
} from "@/components/order-result-actions";
import { getDb } from "@/lib/db";
import { orders, books } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getProductBySlug } from "@/lib/catalog";
import { getAppBaseUrl, isSimulatedPaymentAllowed } from "@/lib/env";
import {
  formatRublesFromKopecks,
  formatRuDate,
  formatRuDateTime,
} from "@/lib/utils";
import { ensureDemoSeed } from "@/lib/demo-seed";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  QrCode,
  BookOpen,
} from "lucide-react";

export default async function OrderResultPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  ensureDemoSeed();
  const { orderId } = await params;
  const db = getDb();

  // ТЗ Раздел 3 и 12: статус заказа читается исключительно из БД, любые URL-параметры игнорируются
  const order = db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) {
    notFound();
  }

  const book = db
    .select()
    .from(books)
    .where(eq(books.id, order.bookId))
    .get();
  if (!book) {
    notFound();
  }

  const product = getProductBySlug(order.productSlug);
  const publicUrl = book.publicSlug
    ? `${getAppBaseUrl()}/b/${book.publicSlug}`
    : null;

  const qrDataUrl = publicUrl
    ? await QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#231C18",
          light: "#FFFEFA",
        },
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          {/* Состояние 1: Заказ выполнен (fulfilled) и книга опубликована */}
          {order.status === "fulfilled" && publicUrl && (
            <div className="rounded-3xl border border-[#BBDCC2] bg-[#FFFEFA] p-6 sm:p-10 shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE4D8] pb-6">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F2E8] px-3.5 py-1 text-xs font-semibold text-[#255431]">
                    <CheckCircle2 className="h-4 w-4" />
                    {order.orderType === "renewal"
                      ? "Продление оплачено и активировано"
                      : "Оплачено · Книга опубликована"}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231C18]">
                    {order.orderType === "renewal"
                      ? `Срок размещения книги «${book.title}» продлён`
                      : `Подарок «${book.title}» готов к вручению!`}
                  </h1>
                  <p className="text-sm text-[#574940]">
                    Заказ <code>{order.id}</code> · Сумма:{" "}
                    <strong>{formatRublesFromKopecks(order.amountKopecks)}</strong>{" "}
                    · Обновлено: {formatRuDateTime(order.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-5">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#6E2638]">
                      Приватная ссылка для получателя
                    </div>
                    <div className="rounded-2xl border border-[#DFD6CA] bg-[#FAF7F2] p-4 font-mono text-xs sm:text-sm break-all text-[#231C18]">
                      {publicUrl}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <CopyLinkButton url={publicUrl} />
                      <Link
                        href={`/b/${book.publicSlug}`}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#6E2638] px-4 py-1.5 text-xs font-medium text-[#FAF4F4]"
                      >
                        <span>Открыть опубликованную книгу</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#EAE2D6] bg-[#FAF7F2] p-4 space-y-1.5 text-xs text-[#574940]">
                    <div>
                      <strong>Срок активного размещения:</strong> до{" "}
                      {formatRuDate(book.expiresAt)}
                    </div>
                    <div>
                      <strong>Защита PIN-кодом:</strong>{" "}
                      {book.pinHash
                        ? "Включена (получателю потребуется ввести ваш PIN)"
                        : "Не установлена (доступна всем, у кого есть секретная ссылка)"}
                    </div>
                    {product?.allowsRenewalInMvp && (
                      <div>
                        <strong>Продление:</strong> ручное продление 990 ₽/год в
                        личном кабинете (без автосписаний).
                      </div>
                    )}
                  </div>
                </div>

                {/* Блок QR-кода */}
                <div className="md:col-span-5 flex flex-col items-center justify-center rounded-3xl border border-[#DFD6CA] bg-[#FAF7F2] p-6 text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#231C18]">
                    <QrCode className="h-4 w-4 text-[#6E2638]" />
                    <span>QR-код вашей книги</span>
                  </div>
                  {qrDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt="QR-код для открытия цифровой книги"
                      className="h-48 w-48 rounded-2xl border border-[#E2D9CC] bg-white p-2 shadow-xs"
                    />
                  )}
                  <p className="text-xs text-[#695B50]">
                    Сохраните или распечатайте QR-код для бумажной открытки
                  </p>
                  {qrDataUrl && (
                    <a
                      href={qrDataUrl}
                      download={`ya-zdes-qr-${book.publicSlug}.png`}
                      className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-[#D8CFC4] bg-[#FFFEFA] px-4 py-1.5 text-xs font-medium text-[#2B1E1A] hover:bg-[#EFE9DE]"
                    >
                      Скачать PNG QR-код
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Состояние 2: Платёж получен, готовим книгу (publishing / paid) — ТЗ Раздел 7 */}
          {(order.status === "publishing" || order.status === "paid") && (
            <div className="rounded-3xl border border-[#E8CC88] bg-[#FFFEFA] p-6 sm:p-10 space-y-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5DC] px-3.5 py-1 text-xs font-semibold text-[#6B4800]">
                <Clock className="h-4 w-4" />
                <span>Платёж получен, готовим книгу</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#231C18]">
                Оплата подтверждена! Завершаем выпуск вашего издания
              </h1>
              <p className="text-sm text-[#574940] leading-relaxed">
                Ваш платёж на сумму{" "}
                <strong>{formatRublesFromKopecks(order.amountKopecks)}</strong>{" "}
                надёжно зафиксирован в системе, администратор уже оповещён. Вы
                можете запустить повторную выдачу прямо сейчас одной кнопкой:
              </p>
              <OrderRecoveryActions
                orderId={order.id}
                orderStatus={order.status}
                demoSimulatorEnabled={isSimulatedPaymentAllowed()}
              />
            </div>
          )}

          {/* Состояние 3: Ожидание оплаты или ошибка оплаты (возврат с платёжной страницы без вебхука не считается оплатой) */}
          {(order.status === "pending_payment" ||
            order.status === "payment_failed" ||
            order.status === "draft" ||
            order.status === "refunded" ||
            order.status === "cancelled") && (
            <div className="rounded-3xl border border-[#EABAB4] bg-[#FFFEFA] p-6 sm:p-10 space-y-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FBE9E7] px-3.5 py-1 text-xs font-semibold text-[#872D23]">
                <AlertTriangle className="h-4 w-4" />
                <span>Статус заказа в БД: {order.status}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#231C18]">
                {order.status === "payment_failed"
                  ? "Оплата не была завершена"
                  : order.status === "refunded"
                  ? "По заказу выполнен возврат средств"
                  : "Ожидаем подтверждения платежа от провайдера"}
              </h1>
              <p className="text-sm text-[#574940] leading-relaxed">
                Возврат на страницу результата сам по себе не открывает книгу до
                получения подписанного серверного подтверждения от ЮKassa. Вы
                можете повторить оплату или подтвердить вебхук в локальном режиме.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <OrderRecoveryActions
                  orderId={order.id}
                  orderStatus={order.status}
                  demoSimulatorEnabled={isSimulatedPaymentAllowed()}
                />
                <Link
                  href={`/checkout/${book.id}`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#D8CFC4] bg-[#FAF7F2] px-5 py-2.5 text-sm font-medium text-[#2B1E1A]"
                >
                  Вернуться к оплате
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-[#7A6B60]">
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 font-medium text-[#231C18] hover:text-[#6E2638]"
            >
              <BookOpen className="h-4 w-4" />
              <span>Все мои книги и заказы в личном кабинете</span>
            </Link>
            <span>Заказ #{order.id}</span>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
