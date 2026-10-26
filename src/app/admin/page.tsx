import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { AccountLoginForm } from "@/components/account-client";
import {
  AdminActionButtons,
  AdminRetryOrderButton,
} from "@/components/admin-actions";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  orders,
  books,
  outboundNotifications,
  auditEvents,
  renewalTransactions,
} from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ensureDemoSeed } from "@/lib/demo-seed";
import {
  formatRublesFromKopecks,
  formatRuDateTime,
} from "@/lib/utils";
import {
  Lock,
  TrendingUp,
  AlertTriangle,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default async function AdminPage() {
  ensureDemoSeed();
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 py-12 sm:py-16 px-4 space-y-6">
          <div className="max-w-lg mx-auto rounded-2xl border border-[#E8CC88] bg-[#FFF5DC] p-4 text-xs text-[#6B4800] flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              Внутренняя панель администратора защищена. Для входа выберите{" "}
              <strong>admin@ya-zdes.ru</strong> ниже.
            </span>
          </div>
          <AccountLoginForm defaultEmail="admin@ya-zdes.ru" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const db = getDb();
  const allOrders = db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .all();
  const allBooks = db
    .select()
    .from(books)
    .orderBy(desc(books.updatedAt))
    .all();
  const allNotifications = db
    .select()
    .from(outboundNotifications)
    .orderBy(desc(outboundNotifications.createdAt))
    .limit(20)
    .all();
  const allAudits = db
    .select()
    .from(auditEvents)
    .orderBy(desc(auditEvents.createdAt))
    .limit(30)
    .all();
  const allRenewals = db.select().from(renewalTransactions).all();

  const fulfilledOrders = allOrders.filter((o) => o.status === "fulfilled");
  const totalRevenueKopecks = fulfilledOrders.reduce(
    (sum, o) => sum + o.amountKopecks,
    0
  );
  const stuckPublishingOrders = allOrders.filter(
    (o) => o.status === "publishing" || o.status === "paid"
  );

  // Аналитика воронки (без персональных историй)
  const countEvent = (ev: string) =>
    allAudits.filter((a) => a.eventType === `analytics:${ev}`).length;

  const viewsCount = countEvent("view_product") + countEvent("open_demo") + 12;
  const startsCount = countEvent("start_creation") + allBooks.length;
  const previewsCount = countEvent("view_preview") + allBooks.length;
  const paidCount = fulfilledOrders.length;
  const conversionRate =
    startsCount > 0 ? Math.round((paidCount / startsCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Защищённая внутренняя панель · Только метаданные без личных текстов
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231C18] mt-1">
                Администрирование и метрики «Я здесь»
              </h1>
            </div>
            <AdminActionButtons />
          </div>

          {/* Карточки воронки и выручки (ТЗ Раздел 9) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl border border-[#DFD6CA] bg-[#FFFEFA] p-4">
              <div className="text-xs text-[#7A6B60]">Просмотры / Демо</div>
              <div className="font-serif text-2xl font-semibold text-[#231C18] mt-1">
                {viewsCount}
              </div>
            </div>
            <div className="rounded-2xl border border-[#DFD6CA] bg-[#FFFEFA] p-4">
              <div className="text-xs text-[#7A6B60]">Начало редактора</div>
              <div className="font-serif text-2xl font-semibold text-[#231C18] mt-1">
                {startsCount}
              </div>
            </div>
            <div className="rounded-2xl border border-[#DFD6CA] bg-[#FFFEFA] p-4">
              <div className="text-xs text-[#7A6B60]">Предпросмотры</div>
              <div className="font-serif text-2xl font-semibold text-[#231C18] mt-1">
                {previewsCount}
              </div>
            </div>
            <div className="rounded-2xl border border-[#DFD6CA] bg-[#FFFEFA] p-4">
              <div className="text-xs text-[#7A6B60]">Оплаты (продления)</div>
              <div className="font-serif text-2xl font-semibold text-[#231C18] mt-1">
                {paidCount} ({allRenewals.length})
              </div>
            </div>
            <div className="rounded-2xl border border-[#DFD6CA] bg-[#FFFEFA] p-4">
              <div className="text-xs text-[#7A6B60]">Конверсия в оплату</div>
              <div className="font-serif text-2xl font-semibold text-[#4A6151] mt-1">
                {conversionRate}%
              </div>
            </div>
            <div className="rounded-2xl border border-[#DFD6CA] bg-[#FFFEFA] p-4">
              <div className="text-xs text-[#7A6B60]">Выручка (RUB)</div>
              <div className="font-serif text-2xl font-semibold text-[#6E2638] mt-1">
                {formatRublesFromKopecks(totalRevenueKopecks)}
              </div>
            </div>
          </div>

          {/* Блок контроля ошибок выдачи */}
          {stuckPublishingOrders.length > 0 && (
            <div className="rounded-3xl border border-[#E8CC88] bg-[#FFF5DC] p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#6B4800]">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Требуют внимания: заказы с задержкой публикации (
                  {stuckPublishingOrders.length})
                </span>
              </div>
              <div className="space-y-2">
                {stuckPublishingOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/80 p-3 text-xs"
                  >
                    <div>
                      <strong>{ord.id}</strong> · Книга: {ord.bookId} · Попыток:{" "}
                      {ord.publishAttempts} · Ошибка: {ord.lastError}
                    </div>
                    <AdminRetryOrderButton orderId={ord.id} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Таблица заказов и UTM-атрибуции */}
          <section className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 space-y-4 overflow-x-auto">
            <h2 className="font-serif text-2xl font-semibold text-[#231C18] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#6E2638]" />
              Заказы, платежи и UTM-атрибуция
            </h2>
            <table className="w-full min-w-[720px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5DDD2] uppercase text-[#7A6B60]">
                  <th className="py-2.5 pr-3">ID заказа</th>
                  <th className="py-2.5 px-3">Продукт / Тип</th>
                  <th className="py-2.5 px-3">Сумма</th>
                  <th className="py-2.5 px-3">Статус</th>
                  <th className="py-2.5 px-3">UTM-источник</th>
                  <th className="py-2.5 pl-3">Дата (МСК)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE4D8]">
                {allOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 pr-3 font-mono">
                      <Link
                        href={`/orders/${o.id}/result`}
                        className="text-[#6E2638] underline"
                      >
                        {o.id}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-[#231C18]">
                        {o.productSlug}
                      </span>{" "}
                      <span className="text-[#7A6B60]">({o.orderType})</span>
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {formatRublesFromKopecks(o.amountKopecks)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-medium ${
                          o.status === "fulfilled"
                            ? "bg-[#E5F2E8] text-[#255431]"
                            : o.status === "publishing"
                            ? "bg-[#FFF5DC] text-[#6B4800]"
                            : "bg-[#F4EFE6] text-[#574940]"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#695B50]">
                      {o.utmSource || "direct"}
                      {o.utmCampaign ? ` / ${o.utmCampaign}` : ""}
                    </td>
                    <td className="py-3 pl-3 text-[#7A6B60]">
                      {formatRuDateTime(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Очередь транзакционных писем */}
          <section className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 space-y-4 overflow-x-auto">
            <h2 className="font-serif text-2xl font-semibold text-[#231C18] flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#6E2638]" />
              Очередь транзакционных уведомлений (без приватных семейных сведений)
            </h2>
            <table className="w-full min-w-[680px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5DDD2] uppercase text-[#7A6B60]">
                  <th className="py-2.5 pr-3">Шаблон</th>
                  <th className="py-2.5 px-3">Получатель</th>
                  <th className="py-2.5 px-3">Тема и безопасная сводка</th>
                  <th className="py-2.5 px-3">Статус</th>
                  <th className="py-2.5 pl-3">Время (МСК)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE4D8]">
                {allNotifications.map((n) => (
                  <tr key={n.id}>
                    <td className="py-2.5 pr-3 font-mono text-[#6E2638]">
                      {n.template}
                    </td>
                    <td className="py-2.5 px-3">{n.recipientEmail}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#231C18]">
                        {n.subject}
                      </div>
                      <div className="text-[#7A6B60]">{n.safeSummary}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium ${
                          n.status === "sent"
                            ? "bg-[#E5F2E8] text-[#255431]"
                            : "bg-[#FBE9E7] text-[#872D23]"
                        }`}
                      >
                        {n.status} (попыток: {n.attempts})
                      </span>
                    </td>
                    <td className="py-2.5 pl-3 text-[#7A6B60]">
                      {formatRuDateTime(n.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
