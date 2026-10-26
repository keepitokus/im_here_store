export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "false") return false;
  if (process.env.DEMO_MODE === "true") return true;
  // Если ключи ЮKassa не заданы в dev/test среде, включаем DEMO_MODE явно
  return !process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY;
}

export function isSimulatedPaymentAllowed(): boolean {
  // ТЗ Раздел 7: В DEMO_MODE нельзя симулированным платежом опубликовать книгу на боевом домене
  if (!isDemoMode()) return false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:43123";
  const isLocalHost =
    appUrl.includes("localhost") ||
    appUrl.includes("127.0.0.1") ||
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_LOCAL_DEMO_SIMULATOR === "true";
  return isLocalHost;
}

export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:43123";
}
