"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  PRODUCTS_CATALOG,
  PRODUCT_SLUGS,
  ProductSlug,
} from "@/lib/catalog";
import { editorCopy, insertExample } from "@/lib/editor-copy";
import {
  getFreeBook,
  requestFreeCode,
  saveFreeBook,
  verifyFreeCode,
  type FreePhoto,
} from "@/lib/browser-demo";
import { DEMO_SAMPLE_BOOKS } from "@/lib/demo-books";
import {
  BookContentJsonV1,
  createDefaultBookContent,
} from "@/lib/book-schema";
import { formatRublesFromKopecks } from "@/lib/utils";
import type { BookReaderPhoto } from "@/components/book-reader";

const BookReaderView = dynamic(
  () => import("@/components/book-reader").then((mod) => mod.BookReaderView),
  {
    loading: () => (
      <div className="p-10 text-center text-sm text-[#4E5D6C]">
        Подготавливаем интерактивный предпросмотр книги...
      </div>
    ),
  }
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Eye,
  Heart,
  Loader2,
  Lock,
  Plus,
  Save,
  Sparkles,
  Trash2,
  AlertCircle,
} from "lucide-react";

export interface EditorWizardProps {
  initialSlug: ProductSlug;
  initialUser: { id: string; email: string; name?: string | null } | null;
  existingBook?: {
    id: string;
    content: BookContentJsonV1;
    photos: BookReaderPhoto[];
    editToken?: string | null;
  } | null;
}

export function EditorWizard({
  initialSlug,
  initialUser,
  existingBook,
  freeMode = false,
}: EditorWizardProps & { freeMode?: boolean }) {
  const router = useRouter();

  const [user, setUser] = useState(initialUser);
  const [authEmail, setAuthEmail] = useState("demo@ya-zdes.ru");
  const [authCode, setAuthCode] = useState("");
  const [issuedDemoCode, setIssuedDemoCode] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<"email" | "code">("email");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [step, setStep] = useState<number>(existingBook ? 2 : 1);
  const [selectedSlug, setSelectedSlug] = useState<ProductSlug>(initialSlug);
  const product = PRODUCTS_CATALOG[selectedSlug];
  const copy = editorCopy(selectedSlug);

  const [bookId, setBookId] = useState<string | null>(() => {
    if (existingBook?.id) return existingBook.id;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`ya_zdes_draft_${initialSlug}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.bookId) return parsed.bookId as string;
        }
      } catch {
        // ignore
      }
    }
    return null;
  });
  const [editToken, setEditToken] = useState<string | null>(() => {
    if (existingBook?.editToken) return existingBook.editToken;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`ya_zdes_draft_${initialSlug}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.editToken) return parsed.editToken as string;
        }
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [content, setContent] = useState<BookContentJsonV1>(() => {
    if (existingBook?.content) return existingBook.content;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`ya_zdes_draft_${initialSlug}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.content?.productSlug === initialSlug) {
            return parsed.content as BookContentJsonV1;
          }
        }
      } catch {
        // ignore
      }
    }
    return createDefaultBookContent(initialSlug);
  });
  const [photos, setPhotos] = useState<BookReaderPhoto[]>(
    existingBook?.photos || []
  );
  const [rawPin, setRawPin] = useState<string>("");

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoCaptionDraft, setPhotoCaptionDraft] = useState("");

  // Локальное сохранение при каждом изменении
  useEffect(() => {
    const key = `ya_zdes_draft_${selectedSlug}`;
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ bookId, editToken, content })
      );
    } catch {
      // ignore
    }
  }, [bookId, editToken, content, selectedSlug]);

  const ensureServerBookCreated = useCallback(async (): Promise<{
    id: string;
    token: string | null;
  } | null> => {
    if (bookId) return { id: bookId, token: editToken };
    if (freeMode) {
      const id = `free_${Date.now().toString(36)}`;
      setBookId(id);
      setEditToken("free");
      setSaveState("saved");
      saveFreeBook({
        id,
        ownerEmail: user?.email || "guest@ya-zdes.ru",
        productSlug: selectedSlug,
        title: content.coverTitle,
        content,
        photos: photos as FreePhoto[],
        status: "draft",
        updatedAt: new Date().toISOString(),
      });
      return { id, token: "free" };
    }
    if (!user) return null;

    setSaveState("saving");
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productSlug: selectedSlug,
        initialTitle: content.coverTitle,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setSaveState("error");
      setErrorMessage(data.error || "Не удалось создать черновик");
      return null;
    }
    setBookId(data.book.id);
    setEditToken(data.editToken);
    setSaveState("saved");
    return { id: data.book.id, token: data.editToken };
  }, [bookId, editToken, user, selectedSlug, content, photos, freeMode]);

  const syncToServer = useCallback(
    async (completedEditorStep = false) => {
      if (!user && !editToken) return false;
      try {
        setSaveState("saving");
        setErrorMessage(null);
        let currentId = bookId;
        let currentToken = editToken;

        if (!currentId) {
          const created = await ensureServerBookCreated();
          if (!created) return false;
          currentId = created.id;
          currentToken = created.token;
        }

        if (freeMode && currentId) {
          const existing = getFreeBook(currentId);
          saveFreeBook({
            id: currentId,
            ownerEmail: user?.email || existing?.ownerEmail || "guest@ya-zdes.ru",
            productSlug: selectedSlug,
            title: content.coverTitle,
            content,
            photos: photos as FreePhoto[],
            status: completedEditorStep ? "published" : existing?.status || "draft",
            updatedAt: new Date().toISOString(),
          });
          setSaveState("saved");
          return true;
        }

        const res = await fetch(`/api/books/${currentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            editToken: currentToken,
            content,
            rawPin: rawPin !== "" ? rawPin : undefined,
            completedEditorStep,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setSaveState("error");
          setErrorMessage(data.error || "Ошибка сохранения");
          return false;
        }
        setSaveState("saved");
        return true;
      } catch {
        setSaveState("error");
        setErrorMessage("Сетевая ошибка сохранения. Черновик сохранён в браузере.");
        return false;
      }
    },
    [user, editToken, bookId, ensureServerBookCreated, content, photos, rawPin, freeMode, selectedSlug]
  );

  // Debounce автосохранение на сервер (ТЗ Раздел 5)
  useEffect(() => {
    if (!bookId) return;
    const timer = setTimeout(() => {
      void syncToServer(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [content, bookId, syncToServer]);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    if (freeMode) {
      const next = requestFreeCode(authEmail);
      setIssuedDemoCode(next);
      setAuthCode(next);
      setAuthStep("code");
      setAuthLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || "Ошибка отправки кода");
      } else {
        setAuthStep("code");
        if (data.demoCode) {
          setIssuedDemoCode(data.demoCode);
          setAuthCode(data.demoCode);
        }
      }
    } catch {
      setAuthError("Ошибка сети при запросе кода");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    if (freeMode) {
      const nextUser = verifyFreeCode(authEmail, authCode);
      if (!nextUser) setAuthError("Неверный код");
      else setUser({ id: nextUser.id, email: nextUser.email, name: nextUser.name });
      setAuthLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, code: authCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || "Неверный код");
      } else {
        setUser(data.user);
      }
    } catch {
      setAuthError("Ошибка сети при проверке кода");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(
        "Размер файла превышает 15 МБ. Пожалуйста, выберите фотографию меньшего размера."
      );
      e.target.value = "";
      return;
    }

    setUploadingPhoto(true);
    if (freeMode) {
      try {
        const created = await ensureServerBookCreated();
        if (!created) return;
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("read"));
          reader.readAsDataURL(file);
        });
        const media: FreePhoto = {
          id: `photo_${Date.now().toString(36)}`,
          dataUrl,
          caption: photoCaptionDraft.trim() || file.name.replace(/\.[^.]+$/, ""),
          altText: photoCaptionDraft.trim() || "Фотография для книги",
          isFavorite: photos.length === 0,
        };
        setPhotos((prev) => [...prev, media]);
        if (!content.favoriteMediaId) {
          setContent((prev) => ({ ...prev, favoriteMediaId: media.id }));
        }
        setPhotoCaptionDraft("");
      } catch {
        setErrorMessage("Не удалось прочитать фотографию");
      } finally {
        setUploadingPhoto(false);
        e.target.value = "";
      }
      return;
    }
    try {
      const created = await ensureServerBookCreated();
      if (!created) {
        setUploadingPhoto(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "caption",
        photoCaptionDraft.trim() || file.name.replace(/\.[^.]+$/, "")
      );
      formData.append(
        "altText",
        photoCaptionDraft.trim() || "Семейная фотография"
      );
      formData.append("isFavorite", photos.length === 0 ? "true" : "false");
      if (created.token) {
        formData.append("editToken", created.token);
      }

      const res = await fetch(`/api/books/${created.id}/media`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || "Не удалось загрузить фотографию");
      } else {
        setPhotos((prev) => [...prev, data.media]);
        if (!content.favoriteMediaId) {
          setContent((prev) => ({ ...prev, favoriteMediaId: data.media.id }));
        }
        setPhotoCaptionDraft("");
      }
    } catch {
      setErrorMessage("Ошибка сети при загрузке фотографии");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  async function handleDeletePhoto(mediaId: string) {
    if (!bookId) return;
    if (freeMode) {
      setPhotos((prev) => prev.filter((photo) => photo.id !== mediaId));
      return;
    }
    const res = await fetch(
      `/api/books/${bookId}/media?mediaId=${encodeURIComponent(mediaId)}${
        editToken ? `&editToken=${encodeURIComponent(editToken)}` : ""
      }`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== mediaId));
    }
  }

  function updateAnswer(fieldId: string, val: string) {
    setContent((prev) => {
      const nextAnswers = { ...prev.answers, [fieldId]: val };
      // Автоматически обновляем заголовок обложки из ключевого поля имени
      let nextCoverTitle = prev.coverTitle;
      if (
        (fieldId === "partnerNames" ||
          fieldId === "motherName" ||
          fieldId === "celebrantName" ||
          fieldId === "babyName") &&
        val.trim()
      ) {
        nextCoverTitle = val.trim();
      }
      return {
        ...prev,
        coverTitle: nextCoverTitle,
        answers: nextAnswers,
      };
    });
  }

  const basicsFields = product.fields.filter((f) => f.step === "basics");
  const questionFields = product.fields.filter((f) => f.step === "questions");

  return (
    <div className="layout-container py-8 sm:py-12 space-y-8">
      {/* Блок входа, если пользователь ещё не авторизован и нет editToken */}
      {step >= 3 && !user && !editToken && (
        <div className="rounded-3xl border border-[#DFD2C5] bg-[#FFFEFA] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E2638]">
              <Lock className="h-3.5 w-3.5" />
              Защита вашего черновика и фотографий
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C18]">
              Сохраните книгу на свой email — пароль не нужен
            </h2>
            <p className="text-sm text-[#574940]">
              Черновик привязывается только к вашему аккаунту. В локальном режиме{" "}
              <code>DEMO_MODE</code> одноразовый код появится прямо на экране.
            </p>
          </div>

          {authStep === "email" ? (
            <form
              onSubmit={handleRequestOtp}
              className="flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <Input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Ваш email (например, demo@ya-zdes.ru)"
                aria-label="Email для входа"
              />
              <Button type="submit" variant="rose" disabled={authLoading}>
                {authLoading ? "Отправка..." : "Получить код входа"}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-3 max-w-xl"
            >
              {issuedDemoCode && (
                <div className="rounded-xl border border-[#E8CC88] bg-[#FFF5DC] px-4 py-2.5 text-xs text-[#6B4800]">
                  Код для быстрого входа в DEMO_MODE:{" "}
                  <strong className="font-mono text-sm">{issuedDemoCode}</strong>{" "}
                  (уже подставлен в поле ниже)
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  required
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="6-значный код из письма"
                  aria-label="Одноразовый код"
                />
                <Button type="submit" variant="rose" disabled={authLoading}>
                  {authLoading ? "Проверка..." : "Подтвердить и продолжить"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAuthStep("email")}
                >
                  Изменить email
                </Button>
              </div>
            </form>
          )}

          {authError && (
            <p className="text-xs font-medium text-[#9E2A2B]">{authError}</p>
          )}
        </div>
      )}

      {/* Верхняя панель прогресса 7 шагов и статуса сохранения */}
      <div className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-[#7A6B60]">
              Редактор издания · Шаг {step} из 7
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-semibold text-[#231C18]">
              {product.title} — {copy.steps[step - 1]?.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              aria-live="polite"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F4EFE6] px-3.5 py-1.5 text-xs font-medium text-[#4A3E36]"
            >
              {saveState === "saving" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6E2638]" />
                  <span>Сохраняем...</span>
                </>
              ) : saveState === "error" ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-[#9E2A2B]" />
                  <span>Сохранено локально</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#4A6151]" />
                  <span>Сохранено</span>
                </>
              )}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void syncToServer(false)}
            >
              <Save className="h-3.5 w-3.5" />
              <span>Сохранить</span>
            </Button>
          </div>
        </div>

        {/* Индикатор 7 шагов */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {copy.steps.map((s, index) => {
            const num = index + 1;
            const active = num === step;
            const done = num < step;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setStep(num)}
                className={`flex flex-col items-start rounded-xl p-2 text-left transition-colors ${
                  active
                    ? "bg-[#2B1E1A] text-[#FAF7F2]"
                    : done
                    ? "bg-[#EFE9DE] text-[#231C18]"
                    : "bg-[#FAF7F2] text-[#8C7E73] hover:bg-[#F3EDE3]"
                }`}
              >
                <span className="text-[13px] font-semibold uppercase">
                  Шаг {num}
                </span>
                <span className="text-xs font-medium truncate w-full hidden sm:inline">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-[#EABAB4] bg-[#FBE9E7] px-4 py-3 text-sm text-[#872D23] flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ШАГ 1: Выбор подарка */}
      {step === 1 && (
        <section className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-semibold text-[#231C18]">
              1. {copy.steps[0].title}
            </h2>
            <p className="text-sm text-[#574940]">{copy.steps[0].lead}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRODUCT_SLUGS.map((slug) => {
              const item = PRODUCTS_CATALOG[slug];
              const sample = DEMO_SAMPLE_BOOKS[slug];
              const isSelected = slug === selectedSlug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(slug);
                    if (!existingBook && content.productSlug !== slug) {
                      setContent(createDefaultBookContent(slug));
                    }
                  }}
                  className={`flex flex-col justify-between overflow-hidden rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-[#6E2638] bg-[#FAF4F4]/60 ring-2 ring-[#6E2638]"
                      : "border-[#E2D9CC] bg-[#FAF7F2] hover:border-[#C7B8A6]"
                  }`}
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={sample.coverImage}
                      alt={sample.coverImageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, 420px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xl font-semibold text-[#231C18]">
                        {item.title}
                      </span>
                      <span className="font-serif text-lg font-semibold text-[#6E2638]">
                        {formatRublesFromKopecks(item.initialPriceKopecks)}
                      </span>
                    </div>
                    <p className="text-xs text-[#574940] leading-relaxed">
                      {item.subtitle}
                    </p>
                    <div className="pt-2 border-t border-[#E5DDD2] text-[13px] text-[#7A6B60]">
                      Палитра: {item.paletteSummary}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ШАГ 2: Имена и повод */}
      {step === 2 && (
        <section className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-semibold text-[#231C18]">
              2. {copy.steps[1].title}
            </h2>
            <p className="text-sm text-[#574940]">{copy.steps[1].lead}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {basicsFields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label
                  htmlFor={`field-${field.id}`}
                  className="block text-sm font-medium text-[#231C18]"
                >
                  {field.label}{" "}
                  {!field.required && (
                    <span className="text-xs font-normal text-[#7A6B60]">
                      (необязательно)
                    </span>
                  )}
                </label>
                <p className="text-xs text-[#7A6B60]">{field.helperText}</p>
                <Input
                  id={`field-${field.id}`}
                  value={content.answers[field.id] || ""}
                  onChange={(e) => updateAnswer(field.id, e.target.value)}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          <div className="border-t border-[#ECE4D8] pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label
                htmlFor="cover-title"
                className="block text-sm font-medium text-[#231C18]"
              >
                {copy.coverTitle.label}
              </label>
              <p className="text-xs text-[#7A6B60]">{copy.coverTitle.hint}</p>
              <Input
                id="cover-title"
                value={content.coverTitle}
                onChange={(e) =>
                  setContent((p) => ({ ...p, coverTitle: e.target.value }))
                }
                placeholder={copy.coverTitle.placeholder}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="cover-dedication"
                  className="block text-sm font-medium text-[#231C18]"
                >
                  {copy.dedication.label}{" "}
                  <span className="text-xs font-normal text-[#7A6B60]">(необязательно)</span>
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-[#6E2638] hover:underline disabled:opacity-40"
                  disabled={Boolean(content.dedication.trim())}
                  onClick={() =>
                    setContent((p) => ({
                      ...p,
                      dedication: insertExample(p.dedication, copy.dedication.example),
                    }))
                  }
                >
                  Подставить пример
                </button>
              </div>
              <p className="text-xs text-[#7A6B60]">{copy.dedication.hint}</p>
              <Input
                id="cover-dedication"
                value={content.dedication}
                onChange={(e) =>
                  setContent((p) => ({ ...p, dedication: e.target.value }))
                }
                placeholder={copy.dedication.placeholder}
              />
            </div>
          </div>
        </section>
      )}

      {/* ШАГ 3: Фотографии */}
      {step === 3 && (
        <section className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-semibold text-[#231C18]">
                3. {copy.photos.title} (до 30 снимков)
              </h2>
              <p className="text-sm text-[#574940]">{copy.photos.lead}</p>
            </div>
            <span className="rounded-full bg-[#EFE9DE] px-3.5 py-1 text-xs font-semibold text-[#231C18]">
              Загружено: {photos.length} / 30
            </span>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-[#D4C5B4] bg-[#FAF7F2] p-6 space-y-4">
            <div className="max-w-md space-y-2">
              <label
                htmlFor="photo-caption-input"
                className="block text-xs font-medium text-[#574940]"
              >
                Подпись к загружаемой фотографии (по желанию)
              </label>
              <p className="text-xs text-[#7A6B60]">{copy.photos.caption.hint}</p>
              <Input
                id="photo-caption-input"
                value={photoCaptionDraft}
                onChange={(e) => setPhotoCaptionDraft(e.target.value)}
                placeholder={copy.photos.caption.placeholder}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-[#2B1E1A] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] hover:bg-[#3F2D27] transition-colors">
                <CloudUpload className="h-4 w-4" />
                <span>
                  {uploadingPhoto
                    ? "Оптимизация и загрузка..."
                    : "Выбрать фото (JPEG / PNG / WebP)"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUploadFile}
                  disabled={uploadingPhoto || photos.length >= 30}
                  className="sr-only"
                />
              </label>
              <span className="text-xs text-[#7A6B60]">
                Можно пропустить этот шаг и добавить снимки позже.
              </span>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((ph) => {
                const isFav = content.favoriteMediaId === ph.id || ph.isFavorite;
                return (
                  <div
                    key={ph.id}
                    className="overflow-hidden rounded-2xl border border-[#E2D9CC] bg-[#FAF7F2] flex flex-col justify-between"
                  >
                    {ph.dataUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ph.dataUrl}
                        alt={ph.altText}
                        className="h-44 w-full object-cover"
                      />
                    )}
                    <div className="p-3.5 space-y-2">
                      <p className="text-xs text-[#231C18] line-clamp-2">
                        {ph.caption || ph.altText}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setContent((p) => ({ ...p, favoriteMediaId: ph.id }))
                          }
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium ${
                            isFav
                              ? "bg-[#6E2638] text-white"
                              : "bg-[#EFE9DE] text-[#4A3E36]"
                          }`}
                        >
                          <Heart className="h-3 w-3" />
                          <span>{isFav ? "На обложке" : "Сделать главной"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDeletePhoto(ph.id)}
                          className="p-1.5 text-[#8C7E73] hover:text-[#9E2A2B]"
                          aria-label="Удалить фото"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ШАГ 4: Короткие вопросы по теме + таймлайн */}
      {step === 4 && (
        <section className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-8 space-y-8">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-semibold text-[#231C18]">
              4. {copy.steps[3].title}
            </h2>
            <p className="text-sm text-[#574940]">{copy.questionsLead}</p>
          </div>

          <div className="space-y-5">
            {questionFields.map((field) => (
              <div
                key={field.id}
                className="rounded-2xl border border-[#EAE2D6] bg-[#FAF7F2] p-4 sm:p-5 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor={`q-${field.id}`}
                    className="font-serif text-lg font-semibold text-[#231C18]"
                  >
                    {field.label}
                  </label>
                  <button
                    type="button"
                    disabled={Boolean((content.answers[field.id] || "").trim())}
                    onClick={() =>
                      updateAnswer(field.id, insertExample(content.answers[field.id] || "", field.example))
                    }
                    className="text-xs font-medium text-[#6E2638] hover:underline disabled:opacity-40"
                  >
                    Подставить пример
                  </button>
                </div>

                <p className="text-xs text-[#7A6B60]">{field.helperText}</p>
                {field.type === "long" ? (
                  <Textarea
                    id={`q-${field.id}`}
                    value={content.answers[field.id] || ""}
                    onChange={(e) => updateAnswer(field.id, e.target.value)}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <Input
                    id={`q-${field.id}`}
                    value={content.answers[field.id] || ""}
                    onChange={(e) => updateAnswer(field.id, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Таймлайн событий (сортируется по датам, допускает свободный текст) */}
          <div className="border-t border-[#ECE4D8] pt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#231C18]">
                  {copy.timeline.title}
                </h3>
                <p className="text-xs text-[#7A6B60]">{copy.timeline.hint}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setContent((prev) => ({
                    ...prev,
                    timeline: [
                      ...prev.timeline,
                      {
                        id: `tl_${Date.now()}`,
                        eventDate: null,
                        dateLabel: "Памятный день",
                        title: "Новое событие",
                        description: "",
                      },
                    ],
                  }))
                }
              >
                <Plus className="h-4 w-4" />
                <span>Добавить событие</span>
              </Button>
            </div>

            <div className="space-y-3">
              {content.timeline.map((ev, idx) => (
                <div
                  key={ev.id}
                  className="rounded-2xl border border-[#E5DDD2] bg-[#FAF7F2] p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-start"
                >
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[13px] font-medium text-[#7A6B60]">
                      Точная дата (по желанию)
                    </label>
                    <Input
                      type="date"
                      value={ev.eventDate || ""}
                      onChange={(e) => {
                        const val = e.target.value || null;
                        setContent((p) => {
                          const next = [...p.timeline];
                          next[idx] = {
                            ...next[idx],
                            eventDate: val,
                            dateLabel: val || next[idx].dateLabel,
                          };
                          return { ...p, timeline: next };
                        });
                      }}
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[13px] font-medium text-[#7A6B60]">
                      Подпись даты (или свободный текст)
                    </label>
                    <Input
                      value={ev.dateLabel}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((p) => {
                          const next = [...p.timeline];
                          next[idx] = { ...next[idx], dateLabel: val };
                          return { ...p, timeline: next };
                        });
                      }}
                      placeholder={copy.timeline.datePlaceholder}
                    />
                  </div>
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[13px] font-medium text-[#7A6B60]">
                      Заголовок и короткая деталь
                    </label>
                    <Input
                      value={ev.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((p) => {
                          const next = [...p.timeline];
                          next[idx] = { ...next[idx], title: val };
                          return { ...p, timeline: next };
                        });
                      }}
                      placeholder={copy.timeline.titlePlaceholder}
                    />
                    <Input
                      value={ev.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((p) => {
                          const next = [...p.timeline];
                          next[idx] = { ...next[idx], description: val };
                          return { ...p, timeline: next };
                        });
                      }}
                      placeholder={copy.timeline.descriptionPlaceholder}
                      className="mt-1.5"
                    />
                    <label className="mt-2 block text-[13px] font-medium text-[#7A6B60]">
                      Фотография события
                    </label>
                    <select
                      value={ev.mediaAssetId || ""}
                      onChange={(e) => {
                        const val = e.target.value || null;
                        setContent((p) => {
                          const next = [...p.timeline];
                          next[idx] = { ...next[idx], mediaAssetId: val };
                          return { ...p, timeline: next };
                        });
                      }}
                      className="flex min-h-11 w-full rounded-xl border border-[#D8CFC4] bg-[#FFFEFA] px-3 text-sm text-[#231C18]"
                    >
                      <option value="">Без фотографии — только текст</option>
                      {photos.map((photo) => (
                        <option key={photo.id} value={photo.id}>
                          {photo.caption || photo.altText}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-1 flex justify-end pt-5">
                    {content.timeline.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setContent((p) => ({
                            ...p,
                            timeline: p.timeline.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-2 text-[#8C7E73] hover:text-[#9E2A2B]"
                        aria-label="Удалить событие"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ШАГ 5: Оформление и приватность (PIN) */}
      {step === 5 && (
        <section className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-8 space-y-8">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-semibold text-[#231C18]">
              5. {copy.steps[4].title}
            </h2>
            <p className="text-sm text-[#574940]">{copy.steps[4].lead}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.themes.map((th) => {
              const active = content.themeId === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() =>
                    setContent((prev) => ({ ...prev, themeId: th.id }))
                  }
                  className={`flex items-center justify-between rounded-2xl border p-5 text-left transition-all ${
                    active
                      ? "border-[#6E2638] ring-2 ring-[#6E2638] bg-[#FAF4F4]/40"
                      : "border-[#E2D9CC] bg-[#FAF7F2]"
                  }`}
                >
                  <div>
                    <div className="font-serif text-lg font-semibold text-[#231C18]">
                      {th.name}
                    </div>
                    <div className="text-xs text-[#7A6B60] mt-0.5">
                      Фирменная тема {product.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {th.swatchHex.map((hex, i) => (
                      <span
                        key={i}
                        className="h-6 w-6 rounded-full border border-black/15"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#E5DDD2] bg-[#FAF7F2] p-5 space-y-3">
            <div className="flex items-center gap-2 font-serif text-lg font-semibold text-[#231C18]">
              <Lock className="h-4 w-4 text-[#6E2638]" />
              <span>Опциональный PIN-код для открытия книги</span>
            </div>
            <p className="text-xs text-[#574940] leading-relaxed">
              Все опубликованные книги по умолчанию закрыты от поисковых систем (
              <code>noindex</code>). Однако сама по себе директива{" "}
              <code>noindex</code> не ограничивает доступ людям, которым переслали
              прямую ссылку. Если вы хотите, чтобы книгу открыл только человек,
              знающий секретный код, укажите 4–8 цифр ниже.
            </p>
            <div className="max-w-xs">
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d{4,8}"
                value={rawPin}
                onChange={(e) =>
                  setRawPin(e.target.value.replace(/\D+/g, "").slice(0, 8))
                }
                placeholder="Без PIN-кода (или введите 4–8 цифр)"
                aria-label="PIN-код книги"
              />
            </div>
          </div>
        </section>
      )}

      {/* ШАГ 6: Встроенный предпросмотр (с водяным знаком) */}
      {step === 6 && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-[#E8CC88] bg-[#FFF5DC] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-[#6B4800]">
              <strong>Шаг 6 · {copy.steps[5].title}:</strong> {copy.preview.banner}
            </div>
            {bookId && (
              <Link
                href={`/preview/${bookId}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#2B1E1A] px-4 py-1.5 text-xs font-medium text-[#FAF7F2]"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Открыть на отдельной странице</span>
              </Link>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#DFD6CA]">
            <BookReaderView
              content={content}
              photos={photos}
              watermarkText="Я ЗДЕСЬ · ПРЕДПРОСМОТР ДО ОПЛАТЫ"
            />
          </div>
        </section>
      )}

      {/* ШАГ 7: Переход к оформлению и оплате */}
      {step === 7 && (
        <section className="rounded-3xl border border-[#DFD6CA] bg-[#FFFEFA] p-6 sm:p-10 text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EFE9DE]">
            <Sparkles className="h-6 w-6 text-[#6E2638]" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-3xl font-semibold text-[#231C18]">
              Ваша книга «{content.coverTitle}» готова к публикации
            </h2>
            <p className="text-sm text-[#574940] leading-relaxed">
              {copy.publishLead} Стоимость издания {product.title} составляет{" "}
              <strong>{formatRublesFromKopecks(product.initialPriceKopecks)}</strong>{" "}
              (включая 12 месяцев приватного размещения, секретную ссылку, QR-код и
              возможность скачивания архива).
            </p>
            {freeMode && (
              <p className="text-sm text-[#574940]">
                В этой бесплатной версии оплата не нужна: книга останется в кабинете этого браузера.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="rose"
              size="lg"
              onClick={async () => {
                if (freeMode) {
                  const ok = await syncToServer(true);
                  if (ok) router.push("/account");
                  return;
                }
                const ok = await syncToServer(true);
                if (ok && bookId) {
                  router.push(`/checkout/${bookId}`);
                } else {
                  const created = await ensureServerBookCreated();
                  if (created) {
                    await syncToServer(true);
                    router.push(`/checkout/${created.id}`);
                  }
                }
              }}
            >
              <span>
                {freeMode
                  ? "Сохранить книгу бесплатно"
                  : `Перейти к оплате (${formatRublesFromKopecks(product.initialPriceKopecks)})`}
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {bookId && !freeMode && (
              <Link
                href={`/preview/${bookId}`}
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-[#D8CFC4] bg-[#FFFEFA] px-6 py-3 text-sm font-medium text-[#2B1E1A]"
              >
                <Eye className="h-4 w-4" />
                <span>Полноэкранный предпросмотр</span>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Нижняя навигация мастера: Назад / Продолжить */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Назад</span>
        </Button>

        {step < 7 && (
          <Button
            type="button"
            variant="rose"
            onClick={async () => {
              if (user) {
                await syncToServer(step === 6);
              }
              setStep((s) => Math.min(7, s + 1));
            }}
          >
            <span>Продолжить</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
