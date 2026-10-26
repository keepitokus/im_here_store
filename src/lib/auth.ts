import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { users, authCodes } from "./db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { recordAuditEvent } from "./audit";
import { enqueueNotification } from "./notifications";

export const SESSION_COOKIE_NAME = "ya_zdes_session";

const rateLimitBucket = new Map<string, { count: number; resetAt: number }>();

export function checkAuthRateLimit(key: string, maxPerWindow = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitBucket.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimitBucket.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxPerWindow) {
    return false;
  }
  entry.count += 1;
  return true;
}

function getSecret(): string {
  return process.env.SESSION_SECRET || "ya-zdes-local-dev-session-secret-change-in-prod-2026";
}

export function hashSecretValue(raw: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(raw.trim())
    .digest("hex");
}

export function signSessionToken(payload: {
  userId: string;
  email: string;
  role: "customer" | "admin";
  exp: number;
}): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): {
  userId: string;
  email: string;
  role: "customer" | "admin";
  exp: number;
} | null {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expectedSig = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(token);
    if (!session) return null;
    const db = getDb();
    const user = db
      .select()
      .from(users)
      .where(and(eq(users.id, session.userId), isNull(users.deletedAt)))
      .get();
    return user || null;
  } catch {
    return null;
  }
}

export function issueOtpAndMagicLink(emailInput: string, ipAddress?: string) {
  const email = emailInput.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Укажите корректный email адрес");
  }
  if (!checkAuthRateLimit(`otp:${email}`, 6, 60_000)) {
    throw new Error("Слишком много запросов кода. Подождите минуту и попробуйте снова.");
  }

  const db = getDb();
  const code = String(crypto.randomInt(100000, 999999));
  const magicToken = crypto.randomBytes(24).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

  db.insert(authCodes)
    .values({
      id: "ac_" + crypto.randomBytes(10).toString("hex"),
      email,
      codeHash: hashSecretValue(code),
      tokenHash: hashSecretValue(magicToken),
      expiresAt,
      ipAddress: ipAddress || null,
      createdAt: now.toISOString(),
    })
    .run();

  enqueueNotification({
    recipientEmail: email,
    template: "auth_code",
    subject: `Код входа в «Я здесь»: ${code}`,
    safeSummary: `Одноразовый код входа (действителен 15 минут).`,
  });

  recordAuditEvent({
    eventType: "auth_otp_issued",
    entityType: "user_email",
    entityId: email,
    metadata: { ipAddress: ipAddress || "local" },
  });

  return {
    email,
    code,
    magicToken,
    expiresAt,
  };
}

export function verifyOtpOrMagicLink(params: {
  email: string;
  code?: string;
  magicToken?: string;
  name?: string;
}) {
  const email = params.email.trim().toLowerCase();
  const db = getDb();
  const nowIso = new Date().toISOString();

  const records = db
    .select()
    .from(authCodes)
    .where(
      and(
        eq(authCodes.email, email),
        isNull(authCodes.consumedAt),
        gt(authCodes.expiresAt, nowIso)
      )
    )
    .all();

  const codeHash = params.code ? hashSecretValue(params.code) : null;
  const tokenHash = params.magicToken ? hashSecretValue(params.magicToken) : null;

  const matched = records.find(
    (r) =>
      (codeHash && r.codeHash === codeHash) ||
      (tokenHash && r.tokenHash === tokenHash)
  );

  if (!matched) {
    throw new Error("Неверный или просроченный код входа");
  }

  db.update(authCodes)
    .set({ consumedAt: nowIso })
    .where(eq(authCodes.id, matched.id))
    .run();

  let user = db.select().from(users).where(eq(users.email, email)).get();

  if (!user) {
    const newId = "usr_" + crypto.randomBytes(10).toString("hex");
    const isAdmin = email === "admin@ya-zdes.ru";
    db.insert(users)
      .values({
        id: newId,
        email,
        name: params.name?.trim() || email.split("@")[0],
        role: isAdmin ? "admin" : "customer",
        createdAt: nowIso,
        updatedAt: nowIso,
      })
      .run();
    user = db.select().from(users).where(eq(users.id, newId)).get()!;
  } else if (user.deletedAt) {
    // Reactivate if user logs back in
    db.update(users)
      .set({ deletedAt: null, updatedAt: nowIso })
      .where(eq(users.id, user.id))
      .run();
    user = db.select().from(users).where(eq(users.id, user.id)).get()!;
  }

  const sessionToken = signSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role as "customer" | "admin",
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });

  recordAuditEvent({
    actorUserId: user.id,
    eventType: "auth_login_succeeded",
    entityType: "user",
    entityId: user.id,
    metadata: { role: user.role },
  });

  return { user, sessionToken };
}
