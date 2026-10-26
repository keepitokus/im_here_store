"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Trash2, Lock } from "lucide-react";

export function AccountLoginForm({
  defaultEmail = "demo@ya-zdes.ru",
}: {
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Ошибка запроса кода");
      } else {
        setStep("code");
        if (data.demoCode) {
          setDemoCode(data.demoCode);
          setCode(data.demoCode);
        }
      }
    } catch {
      setError("Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Неверный код");
      } else {
        router.refresh();
      }
    } catch {
      setError("Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-9 shadow-sm space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#6E2638]">
          <Lock className="h-3.5 w-3.5" />
          <span>Вход без пароля по одноразовому коду</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[#231C18]">
          Личный кабинет «Я здесь»
        </h1>
        <p className="text-sm text-[#574940]">
          Для быстрого входа в демонстрационный аккаунт с готовыми книгами
          используйте <code>demo@ya-zdes.ru</code> (или{" "}
          <code>admin@ya-zdes.ru</code> для панели администратора).
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => {
            setEmail("demo@ya-zdes.ru");
            setStep("email");
          }}
          className="rounded-full bg-[#EFE9DE] px-3 py-1 font-medium text-[#231C18] hover:bg-[#E2D9CC]"
        >
          Подставить demo@ya-zdes.ru
        </button>
        <button
          type="button"
          onClick={() => {
            setEmail("admin@ya-zdes.ru");
            setStep("email");
          }}
          className="rounded-full bg-[#EFE9DE] px-3 py-1 font-medium text-[#231C18] hover:bg-[#E2D9CC]"
        >
          Подставить admin@ya-zdes.ru
        </button>
      </div>

      {step === "email" ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-[#231C18]"
            >
              Ваш Email
            </label>
            <Input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <Button type="submit" variant="rose" className="w-full" disabled={loading}>
            {loading ? "Отправляем код..." : "Получить одноразовый код"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          {demoCode && (
            <div className="rounded-2xl border border-[#E8CC88] bg-[#FFF5DC] p-3.5 text-xs text-[#6B4800]">
              Одноразовый код (DEMO_MODE):{" "}
              <strong className="font-mono text-sm">{demoCode}</strong>
            </div>
          )}
          <div className="space-y-1.5">
            <label
              htmlFor="login-code"
              className="block text-sm font-medium text-[#231C18]"
            >
              6-значный код подтверждения для {email}
            </label>
            <Input
              id="login-code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Button
              type="submit"
              variant="rose"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Входим..." : "Войти в кабинет"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("email")}
            >
              Назад
            </Button>
          </div>
        </form>
      )}

      {error && <p className="text-xs font-medium text-[#9E2A2B]">{error}</p>}
    </div>
  );
}

export function AccountSessionControls() {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  async function handleDeleteAccount() {
    setLoading(true);
    await fetch("/api/account", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="h-3.5 w-3.5" />
        <span>Выйти</span>
      </Button>

      {!confirmDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirmDelete(true)}
          className="text-[#9E2A2B] hover:text-[#7F2021]"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Удалить аккаунт и медиа</span>
        </Button>
      ) : (
        <div className="flex items-center gap-2 rounded-full border border-[#EABAB4] bg-[#FBE9E7] px-3 py-1 text-xs">
          <span className="text-[#872D23] font-medium">
            Удалить все книги и фото безвозвратно?
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={handleDeleteAccount}
            className="rounded-full bg-[#9E2A2B] px-2.5 py-1 text-white font-semibold"
          >
            Да, удалить
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="px-2 py-1 text-[#574940]"
          >
            Отмена
          </button>
        </div>
      )}
    </div>
  );
}
