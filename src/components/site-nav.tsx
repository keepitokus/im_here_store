"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

const LINKS = [
  { href: "/catalog", label: "Подарки" },
  { href: "/#how", label: "Как это работает" },
  { href: "/demo/mother-thanks", label: "Примеры книг" },
  { href: "/#pricing", label: "Стоимость" },
  { href: "/#faq", label: "Вопросы" },
];

export function SiteNav({ accountLabel }: { accountLabel: string }) {
  const [open, setOpen] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const drawerEl = drawerRef.current;
    const firstLink = drawerEl?.querySelector<HTMLElement>(focusableSelector);
    firstLink?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        toggleBtnRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && drawerEl) {
        const focusables = Array.from(
          drawerEl.querySelectorAll<HTMLElement>(focusableSelector)
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function closeDrawer() {
    setOpen(false);
    toggleBtnRef.current?.focus();
  }

  return (
    <div className="layout-container relative flex min-h-[68px] xl:grid xl:min-h-[80px] xl:grid-cols-[auto_1fr_auto] items-center justify-between gap-3 xl:gap-8 py-2.5">
      {/* Зона 1: Brand (слева) */}
      <div className="flex shrink-0 items-center">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-3 whitespace-nowrap rounded-lg pr-1 sm:pr-2"
        >
          <span className="font-script text-[28px] sm:text-[34px] leading-none text-[#1F3042]">
            Я здесь
          </span>
        </Link>
      </div>

      {/* Зона 2: Navigation (по центру между логотипом и кнопками на desktop >=1280px) */}
      <nav
        aria-label="Основная навигация"
        className="hidden xl:flex items-center justify-center gap-6"
      >
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center whitespace-nowrap px-2 text-[15px] font-medium text-[#1F3042] transition-colors hover:text-[#7A3E4A]"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Зона 3: Actions (справа, с комфортными интервалами между кнопками) */}
      <div className="flex shrink-0 items-center justify-end gap-2.5 sm:gap-3.5">
        <Link
          href="/account"
          className="hidden sm:inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border border-[#1F3042]/30 bg-[#FFFDF8] px-4 text-sm sm:text-[15px] font-medium text-[#1F3042] transition-colors hover:bg-[#EFE7DA]"
        >
          {accountLabel}
        </Link>

        <Link
          href="/catalog"
          className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-[#1F3042] px-3.5 sm:px-5 text-[13px] sm:text-[15px] font-medium text-[#F7F2E9] shadow-xs transition-colors hover:bg-[#162433]"
        >
          Создать книгу
        </Link>

        <button
          ref={toggleBtnRef}
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#1F3042]/30 bg-[#FFFDF8] text-[#1F3042] transition-colors hover:bg-[#EFE7DA] xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Доступное компактное меню (drawer) для <=1279px (iPad landscape, iPad portrait, iPhone) */}
      {open && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 top-[66px] z-40 bg-[#1F3042]/35 backdrop-blur-[2px] xl:hidden"
            onClick={closeDrawer}
          />
          <div
            id="mobile-nav-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Навигационное меню"
            className="absolute inset-x-0 top-full z-50 border-b border-[#D8CBB8] bg-[#FFFDF8] shadow-xl xl:hidden"
          >
            <div className="layout-container py-5 space-y-4">
              <div className="flex flex-col divide-y divide-[#EAE0D2]">
                {LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex min-h-12 items-center justify-between py-3 text-base font-medium text-[#1F3042] hover:text-[#7A3E4A]"
                    onClick={() => setOpen(false)}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-4 w-4 text-[#8A7563]" />
                  </Link>
                ))}
                <Link
                  href="/account"
                  className="flex min-h-12 items-center justify-between py-3 text-base font-medium text-[#7A3E4A]"
                  onClick={() => setOpen(false)}
                >
                  <span>{accountLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1F3042] px-6 text-base font-medium text-[#F7F2E9]"
                  onClick={() => setOpen(false)}
                >
                  <span>Выбрать подарок и создать книгу</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
