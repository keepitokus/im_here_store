import Link from "next/link";
import { isDemoMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { ensureDemoSeed } from "@/lib/demo-seed";
import { SiteNav } from "@/components/site-nav";

export async function SiteHeader() {
  ensureDemoSeed();
  const demo = isDemoMode();
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[#EAE0D2]/80 bg-[#F7F2E9]/95 backdrop-blur-md">
      {demo && (
        <div role="status" className="bg-[#1F3042] px-4 py-1.5 text-center text-[11px] tracking-wide text-[#F7F2E9]">
          Локальный показ: тестовые книги и безопасная пробная оплата. Боевые платежи не списываются.
        </div>
      )}
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="min-w-0">
          <span className="font-script text-3xl leading-none text-[#1F3042]">Я здесь</span>
          <span className="mt-0.5 hidden text-[10px] uppercase tracking-[0.22em] text-[#8A7563] sm:block">
            Истории, к которым возвращаются
          </span>
        </Link>
        <SiteNav accountLabel={user ? "Мои книги" : "Войти"} />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#EAE0D2] bg-[#EFE7DA] text-[#1F3042]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-script text-4xl">Я здесь</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#3E4C5C]">
            Цифровые книги из ваших фотографий и слов. Получатель открывает подарок по ссылке — печатный тираж не входит в заказ.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#8A7563]">Подарки</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/gifts/mother-thanks">Мама, спасибо · 5 990 ₽</Link></li>
            <li><Link href="/gifts/love-story">Наша история · 4 990 ₽</Link></li>
            <li><Link href="/gifts/your-day">Твой день · 5 990 ₽</Link></li>
            <li><Link href="/gifts/first-year">Мой первый год · 4 990 ₽</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#8A7563]">Документы</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/support">Поддержка</Link></li>
            <li><Link href="/legal/offer">Публичная оферта</Link></li>
            <li><Link href="/legal/privacy">Конфиденциальность</Link></li>
            <li><Link href="/legal/terms">Условия</Link></li>
            <li><Link href="/admin">Служебный вход</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#E0D4C4] px-4 py-5 text-xs text-[#5C6B7A] sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:justify-between">
          <p>© 2026 «Я здесь». Цены в рублях.</p>
          <p>Книга доступна 12 месяцев после оплаты. Продление есть только у «Мой первый год» — 990 ₽ за следующий год, вручную.</p>
        </div>
      </div>
    </footer>
  );
}
