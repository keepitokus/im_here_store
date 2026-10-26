import Link from "next/link";
import { isDemoMode } from "@/lib/env";
import { SiteNav } from "@/components/site-nav";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader({
  accountLabel = "Кабинет",
}: {
  accountLabel?: string;
} = {}) {
  const demo = isDemoMode();

  return (
    <>
      {demo && (
        <div
          role="status"
          className="border-b border-[#E2D4C0] bg-[#EFE7DA] px-4 py-1.5 text-center text-xs sm:text-[13px] text-[#3E4C5C]"
        >
          Демо-режим: доступны тестовые примеры книг и пробная оплата без реального списания.
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-[#DFD2C0] bg-[#F7F2E9]/95 backdrop-blur-md">
        <SiteNav accountLabel={accountLabel} />
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#DFD2C0] bg-[#EFE7DA] text-[#1F3042]">
      <div className="layout-container grid gap-10 py-14 sm:py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <Link href="/" className="inline-block" aria-label="Я здесь — на главную">
            <BrandLogo size="footer" />
          </Link>
          <p className="max-w-md text-base leading-relaxed text-[#2F3E4E]">
            Персональные цифровые книги из ваших фотографий, памятных дат и
            важных слов. Получатель открывает подарок по приватной ссылке или
            QR-коду на любом телефоне.
          </p>
          <p className="text-sm text-[#4E5D6C]">
            Формат продукта — цифровое интерактивное издание (печатный тираж не
            входит в заказ).
          </p>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7A6855]">
            Коллекция подарков
          </p>
          <ul className="space-y-2.5 text-base">
            <li>
              <Link href="/gifts/mother-thanks" className="hover:text-[#7A3E4A] transition-colors">
                «Мама, спасибо» — 5 990 ₽
              </Link>
            </li>
            <li>
              <Link href="/gifts/love-story" className="hover:text-[#7A3E4A] transition-colors">
                «Наша история» — 4 990 ₽
              </Link>
            </li>
            <li>
              <Link href="/gifts/your-day" className="hover:text-[#7A3E4A] transition-colors">
                «Твой день» — 5 990 ₽
              </Link>
            </li>
            <li>
              <Link href="/gifts/first-year" className="hover:text-[#7A3E4A] transition-colors">
                «Мой первый год» — 4 990 ₽
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7A6855]">
            Помощь и документы
          </p>
          <ul className="space-y-2.5 text-base">
            <li>
              <Link href="/support" className="hover:text-[#7A3E4A] transition-colors">
                Вопросы и поддержка
              </Link>
            </li>
            <li>
              <Link href="/legal/offer" className="hover:text-[#7A3E4A] transition-colors">
                Публичная оферта
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-[#7A3E4A] transition-colors">
                Политика конфиденциальности
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-[#7A3E4A] transition-colors">
                Пользовательское соглашение
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-sm text-[#4E5D6C] hover:text-[#1F3042] transition-colors">
                Служебный вход
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#DFD2C0] py-6 text-sm text-[#3E4C5C]">
        <div className="layout-container flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 «Я здесь». Все цены указаны в рублях РФ (RUB).</p>
          <p>
            Срок размещения — 12 месяцев. Для «Мой первый год» доступно ручное
            продление 990 ₽/год без автосписаний.
          </p>
        </div>
      </div>
    </footer>
  );
}
