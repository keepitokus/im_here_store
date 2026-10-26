import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role", { enum: ["customer", "admin"] })
    .notNull()
    .default("customer"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

export const authCodes = sqliteTable("auth_codes", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: text("expires_at").notNull(),
  consumedAt: text("consumed_at"),
  ipAddress: text("ip_address"),
  createdAt: text("created_at").notNull(),
});

export const products = sqliteTable("products", {
  slug: text("slug").primaryKey(),
  sku: text("sku").notNull().unique(),
  title: text("title").notNull(),
  initialPriceKopecks: integer("initial_price_kopecks").notNull(),
  renewalPriceKopecks: integer("renewal_price_kopecks"),
  hostingDays: integer("hosting_days").notNull().default(365),
  gracePeriodDays: integer("grace_period_days").notNull().default(90),
  allowsRenewalInMvp: integer("allows_renewal_in_mvp", { mode: "boolean" })
    .notNull()
    .default(false),
  updatedAt: text("updated_at").notNull(),
});

export type BookStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "publishing"
  | "published"
  | "expired"
  | "deleted";

export const books = sqliteTable(
  "books",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),
    productSlug: text("product_slug")
      .notNull()
      .references(() => products.slug),
    title: text("title").notNull(),
    publicSlug: text("public_slug").unique(),
    editTokenHash: text("edit_token_hash").notNull(),
    theme: text("theme").notNull(),
    contentJson: text("content_json").notNull(), // JSON string with schemaVersion
    status: text("status", {
      enum: [
        "draft",
        "pending_payment",
        "paid",
        "publishing",
        "published",
        "expired",
        "deleted",
      ],
    })
      .notNull()
      .default("draft"),
    publishedAt: text("published_at"),
    expiresAt: text("expires_at"),
    graceUntil: text("grace_until"),
    pinHash: text("pin_hash"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("books_public_slug_idx").on(table.publicSlug)]
);

export const chapters = sqliteTable("chapters", {
  id: text("id").primaryKey(),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  title: text("title").notNull(),
  body: text("body").notNull(),
  promptKey: text("prompt_key"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const timelineEvents = sqliteTable("timeline_events", {
  id: text("id").primaryKey(),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  eventDate: text("event_date"), // ISO date or null for free-text dates
  dateLabel: text("date_label").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  mediaAssetId: text("media_asset_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  storageKey: text("storage_key").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  caption: text("caption"),
  altText: text("alt_text").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isFavorite: integer("is_favorite", { mode: "boolean" })
    .notNull()
    .default(false),
  dataUrl: text("data_url"), // Optimized local/S3 fallback preview
  createdAt: text("created_at").notNull(),
});

export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "publishing"
  | "fulfilled"
  | "payment_failed"
  | "refunded"
  | "cancelled";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id),
  productSlug: text("product_slug").notNull(),
  orderType: text("order_type", { enum: ["initial_purchase", "renewal"] })
    .notNull()
    .default("initial_purchase"),
  amountKopecks: integer("amount_kopecks").notNull(),
  currency: text("currency").notNull().default("RUB"),
  status: text("status", {
    enum: [
      "draft",
      "pending_payment",
      "paid",
      "publishing",
      "fulfilled",
      "payment_failed",
      "refunded",
      "cancelled",
    ],
  })
    .notNull()
    .default("draft"),
  customerEmail: text("customer_email").notNull(),
  termsAcceptedAt: text("terms_accepted_at").notNull(),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  publishAttempts: integer("publish_attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  provider: text("provider").notNull().default("yookassa"),
  providerPaymentId: text("provider_payment_id").notNull().unique(),
  amountKopecks: integer("amount_kopecks").notNull(),
  currency: text("currency").notNull().default("RUB"),
  status: text("status", {
    enum: ["pending", "waiting_for_capture", "succeeded", "canceled", "refunded"],
  })
    .notNull()
    .default("pending"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  confirmationUrl: text("confirmation_url").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  rawWebhookMeta: text("raw_webhook_meta"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const subscriptionsOrEntitlements = sqliteTable(
  "subscriptions_or_entitlements",
  {
    id: text("id").primaryKey(),
    bookId: text("book_id")
      .notNull()
      .unique()
      .references(() => books.id, { onDelete: "cascade" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),
    productSlug: text("product_slug").notNull(),
    status: text("status", {
      enum: ["active", "grace_period", "expired", "revoked"],
    })
      .notNull()
      .default("active"),
    startsAt: text("starts_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    graceUntil: text("grace_until").notNull(),
    autoRenewAllowed: integer("auto_renew_allowed", { mode: "boolean" })
      .notNull()
      .default(false), // Запрещено в MVP (всегда false)
    warn30SentAt: text("warn_30_sent_at"),
    warn7SentAt: text("warn_7_sent_at"),
    warn1SentAt: text("warn_1_sent_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  }
);

export const renewalTransactions = sqliteTable("renewal_transactions", {
  id: text("id").primaryKey(),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  paymentId: text("payment_id")
    .notNull()
    .unique()
    .references(() => payments.id),
  previousExpiresAt: text("previous_expires_at").notNull(),
  newExpiresAt: text("new_expires_at").notNull(),
  newGraceUntil: text("new_grace_until").notNull(),
  amountKopecks: integer("amount_kopecks").notNull(),
  createdAt: text("created_at").notNull(),
});

export const outboundNotifications = sqliteTable("outbound_notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  bookId: text("book_id").references(() => books.id),
  orderId: text("order_id").references(() => orders.id),
  recipientEmail: text("recipient_email").notNull(),
  template: text("template", {
    enum: [
      "auth_code",
      "book_created",
      "payment_received",
      "publication_ready",
      "publication_failed",
      "expiry_warning_30d",
      "expiry_warning_7d",
      "expiry_warning_1d",
      "renewal_confirmed",
    ],
  }).notNull(),
  subject: text("subject").notNull(),
  safeSummary: text("safe_summary").notNull(), // Без приватных семейных историй
  status: text("status", { enum: ["queued", "sent", "failed"] })
    .notNull()
    .default("queued"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  sentAt: text("sent_at"),
  createdAt: text("created_at").notNull(),
});

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  actorUserId: text("actor_user_id"),
  eventType: text("event_type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadataJson: text("metadata_json").notNull(), // Sanitized: no personal stories, photos, tokens, or card data
  createdAt: text("created_at").notNull(),
});
