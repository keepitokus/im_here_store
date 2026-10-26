"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/catalog", label: "Подарки" },
  { href: "/#how", label: "Как это работает" },
  { href: "/demo/mother-thanks", label: "Примеры" },
  { href: "/#faq", label: "Вопросы" },
];

export function SiteNav({ accountLabel }: { accountLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <nav aria-label="Основная навигация" className="hidden lg:flex items-center gap-7 text-sm text-[#1F3042]">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-[#7A3E4A]">
            {link.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/account"
        className="hidden sm:inline-flex min-h-11 items-center px-3 text-sm text-[#1F3042] hover:text-[#7A3E4A]"
      >
        {accountLabel}
      </Link>
      <Link
        href="/catalog"
        className="inline-flex min-h-11 items-center rounded-full bg-[#1F3042] px-4 text-sm text-[#F7F2E9] hover:bg-[#162433]"
      >
        Создать книгу
      </Link>
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Меню</span>
      </button>
      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-b border-[#EAE0D2] bg-[#F7F2E9] px-5 py-4 lg:hidden"
        >
          <div className="flex flex-col">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="min-h-11 border-b border-[#EAE0D2]/80 py-3 text-base"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/account" className="min-h-11 py-3" onClick={() => setOpen(false)}>
              {accountLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
