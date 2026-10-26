"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRODUCTS_CATALOG } from "@/lib/catalog";
import {
  listFreeBooks,
  readFreeSession,
  requestFreeCode,
  verifyFreeCode,
  writeFreeSession,
  type FreeUser,
} from "@/lib/browser-demo";
import { Lock, LogOut } from "lucide-react";

function FreeLogin({
  defaultEmail,
  title,
  onSuccess,
}: {
  defaultEmail: string;
  title: string;
  onSuccess: (user: FreeUser) => void;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-lg mx-auto rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-9 shadow-sm space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
          <Lock className="h-3.5 w-3.5" />
          <span>Бесплатный вход по коду</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[#231C18]">{title}</h1>
        <p className="text-sm text-[#574940]">
          Читатель: <code>demo@ya-zdes.ru</code>. Администратор:{" "}
          <code>admin@ya-zdes.ru</code>. Код для обоих адресов — <strong>102030</strong>.
          Другой email тоже подойдёт: код появится на экране.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          className="rounded-full bg-[#EFE9DE] px-3 py-1 font-medium"
          onClick={() => {
            setEmail("demo@ya-zdes.ru");
            setStep("email");
          }}
        >
          Подставить demo@ya-zdes.ru
        </button>
        <button
          type="button"
          className="rounded-full bg-[#EFE9DE] px-3 py-1 font-medium"
          onClick={() => {
            setEmail("admin@ya-zdes.ru");
            setStep("email");
          }}
        >
          Подставить admin@ya-zdes.ru
        </button>
      </div>
      {error && <p className="text-sm text-[#9E2A2B]">{error}</p>}
      {step === "email" ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const next = requestFreeCode(email);
            setDemoCode(next);
            setCode(next);
            setStep("code");
            setError(null);
          }}
        >
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <Button type="submit">Получить код</Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const user = verifyFreeCode(email, code);
            if (!user) {
              setError("Неверный код. Запросите его ещё раз.");
              return;
            }
            onSuccess(user);
          }}
        >
          {demoCode && (
            <p className="rounded-2xl bg-[#EFE9DE] px-4 py-3 text-sm">
              Код: <strong className="font-mono">{demoCode}</strong>
            </p>
          )}
          <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" required />
          <Button type="submit">Войти</Button>
        </form>
      )}
    </div>
  );
}

export function FreeAccountApp() {
  const [user, setUser] = useState<FreeUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readFreeSession());
    setReady(true);
  }, []);

  if (!ready) return null;

  const books = user && user.role === "customer" ? listFreeBooks(user.email) : listFreeBooks();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader accountLabel={user ? user.name : "Кабинет"} />
      <main className="layout-container flex-1 py-12 space-y-8">
        {!user ? (
          <FreeLogin defaultEmail="demo@ya-zdes.ru" title="Личный кабинет «Я здесь»" onSuccess={setUser} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#7A6855]">Бесплатная версия</p>
                <h1 className="font-serif text-4xl text-[#1F3042]">{user.name}</h1>
                <p className="text-sm text-[#574940]">{user.email}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  writeFreeSession(null);
                  setUser(null);
                }}
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
            {user.role === "admin" && (
              <Link href="/admin" className="inline-flex min-h-11 items-center rounded-full bg-[#1F3042] px-5 text-sm text-[#F7F2E9]">
                Открыть панель администратора
              </Link>
            )}
            <div className="grid gap-4">
              {books.length === 0 && (
                <p className="text-[#574940]">Пока нет сохранённых книг. Создайте первую в каталоге — оплата не нужна.</p>
              )}
              {books.map((book) => (
                <article key={book.id} className="rounded-3xl border border-[#DFD2C0] bg-[#FFFDF8] p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl text-[#1F3042]">{book.title}</h2>
                    <p className="text-sm text-[#574940]">
                      {PRODUCTS_CATALOG[book.productSlug].title} · {book.status === "published" ? "Сохранена" : "Черновик"}
                    </p>
                  </div>
                  <Link
                    href={`/create/${book.productSlug}?bookId=${book.id}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-[#1F3042] px-4 text-sm"
                  >
                    Продолжить
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export function FreeAdminApp() {
  const [user, setUser] = useState<FreeUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readFreeSession());
    setReady(true);
  }, []);

  if (!ready) return null;
  const books = listFreeBooks();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="layout-container flex-1 py-12 space-y-8">
        {user?.role !== "admin" ? (
          <>
            <p className="mx-auto max-w-lg rounded-2xl border border-[#E8CC88] bg-[#FFF5DC] p-4 text-sm text-[#6B4800]">
              Панель администратора. Войдите как <strong>admin@ya-zdes.ru</strong>, код <strong>102030</strong>.
            </p>
            <FreeLogin
              defaultEmail="admin@ya-zdes.ru"
              title="Вход администратора"
              onSuccess={setUser}
            />
          </>
        ) : (
          <div className="space-y-6">
            <h1 className="font-serif text-4xl text-[#1F3042]">Панель администратора</h1>
            <p className="text-[#574940]">
              Бесплатная витрина хранит книги в этом браузере. Оплаты нет: публикации считаются сохранёнными читателями.
            </p>
            <p className="text-sm font-medium text-[#1F3042]">Книг в браузере: {books.length}</p>
            <div className="grid gap-3">
              {books.map((book) => (
                <div key={book.id} className="rounded-2xl border border-[#DFD2C0] bg-[#FFFDF8] px-4 py-3 text-sm">
                  <strong>{book.title}</strong>
                  <span className="text-[#574940]"> · {book.ownerEmail} · {book.status}</span>
                </div>
              ))}
              {books.length === 0 && <p className="text-[#574940]">Читатели ещё не сохранили книги в этом браузере.</p>}
            </div>
            <Link href="/account" className="text-sm underline">
              Вернуться в кабинет
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
