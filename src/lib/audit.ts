import crypto from "node:crypto";
import { getDb } from "./db";
import { auditEvents } from "./db/schema";

const FORBIDDEN_KEYS = new Set([
  "password",
  "token",
  "secret",
  "pin",
  "pinHash",
  "personalConfession",
  "finalLetterBody",
  "finalLetterToMom",
  "letterToBaby",
  "vividMemory",
  "howWeMet",
  "firstDate",
  "dataUrl",
  "cardNumber",
  "cvv",
]);

export function sanitizeAuditMetadata(
  input: Record<string, unknown>
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (FORBIDDEN_KEYS.has(k)) {
      clean[k] = "[REDACTED_PRIVATE]";
      continue;
    }
    if (typeof v === "string" && v.length > 180) {
      clean[k] = v.slice(0, 180) + "...[truncated]";
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

export function recordAuditEvent(params: {
  actorUserId?: string | null;
  eventType: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const db = getDb();
    const cleanMeta = sanitizeAuditMetadata(params.metadata || {});
    db.insert(auditEvents)
      .values({
        id: "aud_" + crypto.randomBytes(10).toString("hex"),
        actorUserId: params.actorUserId ?? null,
        eventType: params.eventType,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        metadataJson: JSON.stringify(cleanMeta),
        createdAt: new Date().toISOString(),
      })
      .run();
  } catch {
    // Non-blocking audit logging
  }
}
