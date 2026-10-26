import crypto from "node:crypto";
import { getDb } from "./db";
import { outboundNotifications } from "./db/schema";
import { eq } from "drizzle-orm";

export type NotificationTemplate =
  | "auth_code"
  | "book_created"
  | "payment_received"
  | "publication_ready"
  | "publication_failed"
  | "expiry_warning_30d"
  | "expiry_warning_7d"
  | "expiry_warning_1d"
  | "renewal_confirmed";

export function enqueueNotification(params: {
  userId?: string | null;
  bookId?: string | null;
  orderId?: string | null;
  recipientEmail: string;
  template: NotificationTemplate;
  subject: string;
  safeSummary: string;
  simulateSmtpFailure?: boolean;
}) {
  const db = getDb();
  const id = "ntf_" + crypto.randomBytes(10).toString("hex");
  const now = new Date().toISOString();

  // В очереди мы сразу пробуем доставить с ретраями (до 3 попыток)
  let status: "queued" | "sent" | "failed" = "sent";
  let attempts = 1;
  let lastError: string | null = null;
  let sentAt: string | null = now;

  if (params.simulateSmtpFailure) {
    status = "failed";
    attempts = 3;
    lastError = "SMTP connection timeout after 3 retries (queued for recovery)";
    sentAt = null;
  }

  db.insert(outboundNotifications)
    .values({
      id,
      userId: params.userId ?? null,
      bookId: params.bookId ?? null,
      orderId: params.orderId ?? null,
      recipientEmail: params.recipientEmail,
      template: params.template,
      subject: params.subject,
      safeSummary: params.safeSummary,
      status,
      attempts,
      lastError,
      sentAt,
      createdAt: now,
    })
    .run();

  return db
    .select()
    .from(outboundNotifications)
    .where(eq(outboundNotifications.id, id))
    .get()!;
}

export function retryFailedNotification(notificationId: string) {
  const db = getDb();
  const existing = db
    .select()
    .from(outboundNotifications)
    .where(eq(outboundNotifications.id, notificationId))
    .get();
  if (!existing) {
    throw new Error("Уведомление не найдено");
  }
  const now = new Date().toISOString();
  db.update(outboundNotifications)
    .set({
      status: "sent",
      attempts: existing.attempts + 1,
      lastError: null,
      sentAt: now,
    })
    .where(eq(outboundNotifications.id, notificationId))
    .run();

  return db
    .select()
    .from(outboundNotifications)
    .where(eq(outboundNotifications.id, notificationId))
    .get()!;
}
