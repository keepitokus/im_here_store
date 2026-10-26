"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductCatalogItem } from "@/lib/catalog";
import { formatRublesFromKopecks } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Clock,
  CreditCard,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export interface CheckoutClientProps {
  bookId: string;
  bookTitle: string;
  product: ProductCatalogItem;
  orderType: "initial_purchase" | "renewal";
  serverAmountKopecks: number;
  currentExpiresAt?: string | null;
  demoSimulatorEnabled: boolean;
}

export function CheckoutClient({
  bookId,
  bookTitle,
  product,
  orderType,
  serverAmountKopecks,
  currentExpiresAt,
  demoSimulatorEnabled,
}: CheckoutClientProps) {
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(
    demoOutcome: "payment.succeeded" | "payment.canceled" = "payment.succeeded",
    simulatePublishFailureOnce = false
  ) {
    if (!termsAccepted) {
      setError("Пожалуйста, подтвердите согласие с публичной офертой и правилами размещения.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          orderType,
          termsAccepted,
          utmSource: "direct_checkout",
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.ok) {
        setError(orderData.error || "Не удалось создать заказ");
        setLoading(false);
        return;
      }

      const createdOrderId = orderData.order.id as string;

      if (demoSimulatorEnabled) {
        // В локальном DEMO_MODE проводим платёж через серверный симулятор вебхука ЮKassa
        const simRes = await fetch("/api/payments/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: createdOrderId,
            outcome: demoOutcome,
            simulatePublishFailureOnce,
          }),
        });
        const simData = await simRes.json();
        if (!simRes.ok || !simData.ok) {
          setError(simData.error || "Ошибка симулятора платежа");
          setLoading(false);
          return;
        }
      }

      router.push(`/orders/${createdOrderId}/result`);
    } catch {
      setError("Сетевая ошибка при оформлении заказа. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
              {orderType === "renewal"
                ? "Ручное продление размещения · Без автосписаний"
                : "Оформление заказа · Шаг 7 из 7"}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#231C18]">
              {orderType === "renewal"
                ? `Продление книги «${bookTitle}» на 1 год`
                : `Публикация книги «${bookTitle}»`}
            </h1>
            <p className="text-sm text-[#574940]">
              Издание: <strong>{product.title}</strong> ({product.paletteSummary})
            </p>
          </div>

          <div className="rounded-2xl border border-[#EAE2D6] bg-[#FAF7F2] p-5 space-y-3 text-sm text-[#3F342D]">
            <div className="font-serif text-lg font-semibold text-[#231C18]">
              Что входит в заказ:
            </div>
            {orderType === "initial_purchase" ? (
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#4A6151] shrink-0 mt-0.5" />
                  <span>
                    Мгновенная публикация по уникальной приватной ссылке (
                    <code>noindex</code>) и готовый QR-код для печати или отправки
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#4A6151] shrink-0 mt-0.5" />
                  <span>
                    <strong>12 месяцев (365 дней)</strong> размещения с момента
                    подтверждения оплаты
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#4A6151] shrink-0 mt-0.5" />
                  <span>
                    Полный экспорт/скачивание архива ваших материалов в личном
                    кабинете в любой момент
                  </span>
                </li>
                {product.allowsRenewalInMvp ? (
                  <li className="flex items-start gap-2">
                    <RefreshCw className="h-4 w-4 text-[#4A6151] shrink-0 mt-0.5" />
                    <span>
                      По окончании первого года вы сможете вручную продлить
                      размещение книги «Мой первый год» за <strong>990 ₽/год</strong>{" "}
                      (льготное хранение данных — 90 дней, без автосписаний).
                    </span>
                  </li>
                ) : (
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-[#6E2638] shrink-0 mt-0.5" />
                    <span>
                      Покупка продления на второй год для этого издания в MVP не
                      предусмотрена; дальнейшие условия хранения будут предложены
                      отдельно до окончания срока.
                    </span>
                  </li>
                )}
              </ul>
            ) : (
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <RefreshCw className="h-4 w-4 text-[#4A6151] shrink-0 mt-0.5" />
                  <span>
                    Ручное продление размещения альбома «Мой первый год» на{" "}
                    <strong>365 дней за 990 ₽</strong> (разовый платёж без
                    автопродления).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#4A6151] shrink-0 mt-0.5" />
                  <span>
                    Если текущий срок ещё активен, 365 дней прибавляются к текущей
                    дате окончания ({currentExpiresAt?.slice(0, 10) || "активной дате"}
                    ); если истёк — к дате успешного платежа.
                  </span>
                </li>
              </ul>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-[#4A3E36]">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#C7B8A6] text-[#6E2638] focus:ring-[#6E2638]"
            />
            <span>
              Я принимаю условия{" "}
              <Link href="/legal/offer" className="underline hover:text-[#6E2638]">
                Публичной оферты
              </Link>
              ,{" "}
              <Link href="/legal/privacy" className="underline hover:text-[#6E2638]">
                Политики конфиденциальности
              </Link>{" "}
              и ознакомлен(а) со сроком размещения книги (12 месяцев, без
              автоматических списаний).
            </span>
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-[#EABAB4] bg-[#FBE9E7] px-4 py-3 text-xs sm:text-sm text-[#872D23] flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Правая колонка: Итого к оплате и платёжный блок */}
      <div className="lg:col-span-5 space-y-5">
        <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-baseline justify-between border-b border-[#ECE4D8] pb-4">
            <div>
              <div className="text-xs text-[#7A6B60]">Итого к оплате (серверная цена)</div>
              <div className="font-serif text-3xl sm:text-4xl font-semibold text-[#231C18] mt-0.5">
                {formatRublesFromKopecks(serverAmountKopecks)}
              </div>
            </div>
            <span className="rounded-full bg-[#EFE9DE] px-3 py-1 text-xs font-medium text-[#231C18]">
              Разовый платёж · RUB
            </span>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="rose"
              size="lg"
              className="w-full"
              disabled={loading}
              onClick={() => void handleCheckout("payment.succeeded", false)}
            >
              <CreditCard className="h-4 w-4" />
              <span>
                {loading
                  ? "Обработка платежа..."
                  : `Оплатить ${formatRublesFromKopecks(serverAmountKopecks)} через ЮKassa`}
              </span>
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#7A6B60]">
              <ShieldCheck className="h-4 w-4 text-[#4A6151]" />
              <span>Безопасная серверная проверка суммы и вебхука</span>
            </div>
          </div>

          {demoSimulatorEnabled && (
            <div className="rounded-2xl border border-[#E8CC88] bg-[#FFF5DC] p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6B4800]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Локальный платёжный симулятор DEMO_MODE</span>
              </div>
              <p className="text-[11px] text-[#6B4800]/90 leading-relaxed">
                Кнопка оплаты выше сразу проведёт тестовый платёж. Вы также можете
                протестировать нештатные сценарии (отказ оплаты или задержку
                фоновой публикации):
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleCheckout("payment.succeeded", true)}
                  className="rounded-xl border border-[#D4B97B] bg-[#FFFEFA] px-3 py-2 text-xs font-medium text-[#5A3D00] hover:bg-[#FAF1D6] text-left"
                >
                  Тест: Оплата прошла, но сбой фоновой публикации («Готовим книгу»)
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleCheckout("payment.canceled", false)}
                  className="rounded-xl border border-[#D4B97B] bg-[#FFFEFA] px-3 py-2 text-xs font-medium text-[#872D23] hover:bg-[#FBE9E7] text-left"
                >
                  Тест: Платёж отменён / ошибка списания (payment_failed)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
