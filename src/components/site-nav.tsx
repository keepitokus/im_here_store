"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/catalog", label: "Подарки" },
  { href: "/#how", label: "Как это работает" },
  { href: "/demo/mother-thanks", label: "Примеры книг" },
  { href: "/#pricing", label: "Стоимость" },
  { href: "/#faq", label: "Вопросы" },
];

export function SiteNav({ accountLabel }: { accountLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <nav
        aria-label="Основная навигация"
        className="hidden lg:flex items-center gap-6 xl:gap-8 text-[15px] font-medium text-[#1F3042]"
      >
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="py-2 transition-colors hover:text-[#7A3E4A]"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link
        href="/account"
        className="hidden md:inline-flex min-h-11 items-center rounded-full border border-[#D4C5B3] bg-[#FFFDF8] px-4 text-sm font-medium text-[#1F3042] hover:bg-[#EFE7DA] transition-colors"
      >
        {accountLabel}
      </Link>

      <Link
        href="/catalog"
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1F3042] px-5 text-sm sm:text-[15px] font-medium text-[#F7F2E9] hover:bg-[#162433] transition-colors shadow-xs"
      >
        Создать книгу
      </Link>

      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D4C5B3] bg-[#FFFDF8] text-[#1F3042] lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Открыть меню</span>
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full z-50 border-b border-[#DFD2C0] bg-[#FFFDF8] px-5 py-5 shadow-lg lg:hidden"
        >
          <div className="layout-container flex flex-col divide-y divide-[#EAE0D2]">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-12 items-center py-3 text-base font-medium text-[#1F3042] hover:text-[#7A3E4A]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              className="flex min-h-12 items-center py-3 text-base font-medium text-[#7A3E4A]"
              onClick={() => setOpen(false)}
            >
              {accountLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
