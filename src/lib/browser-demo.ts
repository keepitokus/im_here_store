import type { BookContentJsonV1 } from "@/lib/book-schema";
import type { ProductSlug } from "@/lib/catalog";

export type FreeRole = "customer" | "admin";

export type FreeUser = {
  id: string;
  email: string;
  name: string;
  role: FreeRole;
};

export type FreePhoto = {
  id: string;
  dataUrl: string;
  caption: string;
  altText: string;
  isFavorite?: boolean;
};

export type FreeBook = {
  id: string;
  ownerEmail: string;
  productSlug: ProductSlug;
  title: string;
  content: BookContentJsonV1;
  photos: FreePhoto[];
  status: "draft" | "published";
  updatedAt: string;
};

const SESSION_KEY = "ya_zdes_free_session";
const BOOKS_KEY = "ya_zdes_free_books";
const OTP_KEY = "ya_zdes_free_otp";

const KNOWN: Record<string, { role: FreeRole; name: string; code: string }> = {
  "demo@ya-zdes.ru": {
    role: "customer",
    name: "Анна Морозова",
    code: "102030",
  },
  "admin@ya-zdes.ru": {
    role: "admin",
    name: "Администратор «Я здесь»",
    code: "102030",
  },
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readFreeSession(): FreeUser | null {
  return readJson<FreeUser | null>(SESSION_KEY, null);
}

export function writeFreeSession(user: FreeUser | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

export function requestFreeCode(email: string): string {
  const normalized = email.trim().toLowerCase();
  const known = KNOWN[normalized];
  const code = known?.code ?? String(Math.floor(100000 + Math.random() * 900000));
  sessionStorage.setItem(OTP_KEY, JSON.stringify({ email: normalized, code }));
  return code;
}

export function verifyFreeCode(email: string, code: string): FreeUser | null {
  const normalized = email.trim().toLowerCase();
  const raw = sessionStorage.getItem(OTP_KEY);
  if (!raw) return null;
  const pending = JSON.parse(raw) as { email: string; code: string };
  if (pending.email !== normalized || pending.code !== code.trim()) return null;
  const known = KNOWN[normalized];
  const user: FreeUser = {
    id: known?.role === "admin" ? "usr_demo_admin" : `usr_free_${normalized.replace(/[^a-z0-9]/g, "_")}`,
    email: normalized,
    name: known?.name ?? normalized,
    role: known?.role ?? "customer",
  };
  writeFreeSession(user);
  return user;
}

export function listFreeBooks(ownerEmail?: string): FreeBook[] {
  const books = readJson<FreeBook[]>(BOOKS_KEY, []);
  const filtered = ownerEmail
    ? books.filter((book) => book.ownerEmail === ownerEmail)
    : books;
  return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getFreeBook(id: string): FreeBook | null {
  return listFreeBooks().find((book) => book.id === id) ?? null;
}

export function saveFreeBook(book: FreeBook) {
  const books = readJson<FreeBook[]>(BOOKS_KEY, []);
  const next = books.filter((item) => item.id !== book.id);
  next.push({ ...book, updatedAt: new Date().toISOString() });
  localStorage.setItem(BOOKS_KEY, JSON.stringify(next));
}
