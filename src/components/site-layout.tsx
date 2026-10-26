import Link from "next/link";
import { BookOpen, Sparkles, ShieldCheck, User, Lock } from "lucide-react";
import { isDemoMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { ensureDemoSeed } from "@/lib/demo-seed";

export async function SiteHeader() {
  ensureDemoSeed();
  const demo = isDemoMode();
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5DDD2] bg-[#FAF7F2]/95 backdrop-blur-md">
      {demo && (
        <div
          role="status"
          className="border-b border-[#E8CC88] bg-[#FFF5DC] px-4 py-1.5 text-center text-xs font-medium text-[#6B4800]"
        >
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>
              <strong>DEMO_MODE активен (локальная среда):</strong> используются
              демонстрационные данные и безопасный симулятор оплаты ЮKassa.
            </span>
          </span>
        </div>
      )}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E2638] rounded-lg"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B1E1A] text-[#FAF7F2] font-serif text-lg font-semibold transition-transform group-hover:scale-105">
            Я
          </span>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-semibold tracking-tight text-[#231C18] leading-none">
              Я здесь
            </span>
            <span className="text-[11px] text-[#7A6B60] hidden sm:inline">
              Истории, к которым возвращаются
            </span>
          </div>
        </Link>

        <nav
          aria-label="Основная навигация"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4A3E36]"
        >
          <Link
            href="/catalog"
            className="hover:text-[#6E2638] transition-colors py-1"
          >
            Каталог подарков
          </Link>
          <Link
            href="/demo/love-story"
            className="hover:text-[#6E2638] transition-colors py-1"
          >
            Живые образцы
          </Link>
          <Link
            href="/support"
            className="hover:text-[#6E2638] transition-colors py-1"
          >
            Вопросы и поддержка
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-[#7A6B60] hover:text-[#231C18] transition-colors py-1"
          >
            <Lock className="h-3 w-3" />
            Админ
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/account"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full border border-[#D8CFC4] bg-[#FFFEFA] px-3.5 py-2 text-xs sm:text-sm font-medium text-[#2B1E1A] hover:bg-[#F3EDE3] transition-colors"
          >
            <User className="h-4 w-4 text-[#6E2638]" />
            <span>{user ? "Мои книги" : "Кабинет"}</span>
          </Link>
          <Link
            href="/catalog"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-full bg-[#6E2638] px-4 py-2 text-xs sm:text-sm font-medium text-[#FAF4F4] hover:bg-[#581D2C] transition-colors shadow-sm"
          >
            <BookOpen className="h-4 w-4 hidden sm:inline" />
            <span>Создать книгу</span>
          </Link>
        </div>
      </div>

      {/* Мобильная строка быстрых ссылок для 320-390px */}
      <div className="flex md:hidden items-center justify-around border-t border-[#ECE5DA] bg-[#FBF9F5] px-2 py-2 text-xs font-medium text-[#574940]">
        <Link href="/catalog" className="px-2 py-1 hover:text-[#6E2638]">
          Каталог (4)
        </Link>
        <Link href="/demo/love-story" className="px-2 py-1 hover:text-[#6E2638]">
          Демо-книги
        </Link>
        <Link href="/support" className="px-2 py-1 hover:text-[#6E2638]">
          Помощь
        </Link>
        <Link
          href="/admin"
          className="px-2 py-1 text-[#7A6B60] hover:text-[#231C18]"
        >
          Админ
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#E5DDD2] bg-[#F4EFE6] text-[#4A3E36]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2B1E1A] text-[#FAF7F2] font-serif text-base font-semibold">
                Я
              </span>
              <span className="font-serif text-xl font-semibold text-[#231C18]">
                Я здесь
              </span>
            </div>
            <p className="text-sm text-[#695B50] leading-relaxed">
              Истории, к которым возвращаются. Персональные цифровые книги-подарки
              из ваших фотографий, дат и тёплых слов за 10–15 минут.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#574940]">
              <ShieldCheck className="h-4 w-4 text-[#4A6151]" />
              <span>Приватные ссылки · Без скрытых автосписаний</span>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-base font-semibold text-[#231C18] mb-3">
              Коллекция изданий
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gifts/love-story" className="hover:text-[#6E2638]">
                  «Наша история» — 4 990 ₽
                </Link>
              </li>
              <li>
                <Link href="/gifts/mother-thanks" className="hover:text-[#6E2638]">
                  «Мама, спасибо» — 5 990 ₽
                </Link>
              </li>
              <li>
                <Link href="/gifts/your-day" className="hover:text-[#6E2638]">
                  «Твой день» — 5 990 ₽
                </Link>
              </li>
              <li>
                <Link href="/gifts/first-year" className="hover:text-[#6E2638]">
                  «Мой первый год» — 4 990 ₽
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-base font-semibold text-[#231C18] mb-3">
              Живые образцы
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/demo/love-story" className="hover:text-[#6E2638]">
                  Демо «Наша история»
                </Link>
              </li>
              <li>
                <Link href="/demo/mother-thanks" className="hover:text-[#6E2638]">
                  Демо «Мама, спасибо»
                </Link>
              </li>
              <li>
                <Link href="/demo/your-day" className="hover:text-[#6E2638]">
                  Демо «Твой день»
                </Link>
              </li>
              <li>
                <Link href="/demo/first-year" className="hover:text-[#6E2638]">
                  Демо «Мой первый год»
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-base font-semibold text-[#231C18] mb-3">
              Документы и помощь
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/support" className="hover:text-[#6E2638]">
                  Поддержка и частые вопросы
                </Link>
              </li>
              <li>
                <Link href="/legal/offer" className="hover:text-[#6E2638]">
                  Публичная оферта
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-[#6E2638]">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-[#6E2638]">
                  Пользовательское соглашение
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#DFD6CA] pt-6 text-xs text-[#7A6B60]">
          <p>© 2026 «Я здесь». Все цены указаны в рублях РФ (RUB).</p>
          <p>
            Размещение каждой книги после покупки — 12 месяцев. Для «Мой первый
            год» доступно ручное продление 990 ₽/год.
          </p>
        </div>
      </div>
    </footer>
  );
}
