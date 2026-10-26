import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { PRODUCTS_CATALOG, PRODUCT_SLUGS } from "../catalog";

let sqliteInstance: Database.Database | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getSqlitePath(): string {
  if (process.env.SQLITE_PATH) {
    return process.env.SQLITE_PATH;
  }
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "ya-zdes.db");
}

function runMigrations(sqlite: Database.Database) {
  sqlite.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS auth_codes (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      consumed_at TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      slug TEXT PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      initial_price_kopecks INTEGER NOT NULL,
      renewal_price_kopecks INTEGER,
      hosting_days INTEGER NOT NULL DEFAULT 365,
      grace_period_days INTEGER NOT NULL DEFAULT 90,
      allows_renewal_in_mvp INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id),
      product_slug TEXT NOT NULL REFERENCES products(slug),
      title TEXT NOT NULL,
      public_slug TEXT UNIQUE,
      edit_token_hash TEXT NOT NULL,
      theme TEXT NOT NULL,
      content_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TEXT,
      expires_at TEXT,
      grace_until TEXT,
      pin_hash TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS books_public_slug_idx ON books(public_slug);

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      prompt_key TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      event_date TEXT,
      date_label TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      media_asset_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      owner_id TEXT NOT NULL REFERENCES users(id),
      storage_key TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      caption TEXT,
      alt_text TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      data_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      book_id TEXT NOT NULL REFERENCES books(id),
      product_slug TEXT NOT NULL,
      order_type TEXT NOT NULL DEFAULT 'initial_purchase',
      amount_kopecks INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'RUB',
      status TEXT NOT NULL DEFAULT 'draft',
      customer_email TEXT NOT NULL,
      terms_accepted_at TEXT NOT NULL,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      publish_attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      provider TEXT NOT NULL DEFAULT 'yookassa',
      provider_payment_id TEXT NOT NULL UNIQUE,
      amount_kopecks INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'RUB',
      status TEXT NOT NULL DEFAULT 'pending',
      is_demo INTEGER NOT NULL DEFAULT 0,
      confirmation_url TEXT NOT NULL,
      idempotency_key TEXT NOT NULL UNIQUE,
      raw_webhook_meta TEXT,
      paid_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions_or_entitlements (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL UNIQUE REFERENCES books(id) ON DELETE CASCADE,
      owner_id TEXT NOT NULL REFERENCES users(id),
      product_slug TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      starts_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      grace_until TEXT NOT NULL,
      auto_renew_allowed INTEGER NOT NULL DEFAULT 0,
      warn_30_sent_at TEXT,
      warn_7_sent_at TEXT,
      warn_1_sent_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS renewal_transactions (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id),
      order_id TEXT NOT NULL REFERENCES orders(id),
      payment_id TEXT NOT NULL UNIQUE REFERENCES payments(id),
      previous_expires_at TEXT NOT NULL,
      new_expires_at TEXT NOT NULL,
      new_grace_until TEXT NOT NULL,
      amount_kopecks INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outbound_notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      book_id TEXT REFERENCES books(id),
      order_id TEXT REFERENCES orders(id),
      recipient_email TEXT NOT NULL,
      template TEXT NOT NULL,
      subject TEXT NOT NULL,
      safe_summary TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      sent_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      event_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      metadata_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Upsert canonical products with immutable prices from server catalog
  const upsertProduct = sqlite.prepare(`
    INSERT INTO products (
      slug, sku, title, initial_price_kopecks, renewal_price_kopecks,
      hosting_days, grace_period_days, allows_renewal_in_mvp, updated_at
    ) VALUES (
      @slug, @sku, @title, @initialPriceKopecks, @renewalPriceKopecks,
      @hostingDays, @gracePeriodDays, @allowsRenewalInMvp, @updatedAt
    )
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      initial_price_kopecks = excluded.initial_price_kopecks,
      renewal_price_kopecks = excluded.renewal_price_kopecks,
      hosting_days = excluded.hosting_days,
      grace_period_days = excluded.grace_period_days,
      allows_renewal_in_mvp = excluded.allows_renewal_in_mvp,
      updated_at = excluded.updated_at;
  `);

  const now = new Date().toISOString();
  for (const slug of PRODUCT_SLUGS) {
    const item = PRODUCTS_CATALOG[slug];
    upsertProduct.run({
      slug: item.slug,
      sku: item.sku,
      title: item.title,
      initialPriceKopecks: item.initialPriceKopecks,
      renewalPriceKopecks: item.renewalPriceKopecks,
      hostingDays: item.hostingDays,
      gracePeriodDays: item.gracePeriodDays,
      allowsRenewalInMvp: item.allowsRenewalInMvp ? 1 : 0,
      updatedAt: now,
    });
  }
}

export function getDb() {
  if (dbInstance) return dbInstance;
  const dbPath = getSqlitePath();
  const dir = path.dirname(dbPath);
  if (dbPath !== ":memory:" && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  sqliteInstance = new Database(dbPath);
  runMigrations(sqliteInstance);
  dbInstance = drizzle(sqliteInstance, { schema });
  return dbInstance;
}

export function getRawSqlite(): Database.Database {
  if (!sqliteInstance) {
    getDb();
  }
  return sqliteInstance!;
}

export function resetDbForTesting() {
  if (sqliteInstance) {
    try {
      sqliteInstance.close();
    } catch {
      // ignore
    }
  }
  sqliteInstance = null;
  dbInstance = null;
}
