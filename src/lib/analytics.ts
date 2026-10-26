import { recordAuditEvent } from "./audit";

export type AnalyticsEventName =
  | "view_product"
  | "open_demo"
  | "start_creation"
  | "upload_photos"
  | "complete_editor"
  | "view_preview"
  | "begin_checkout"
  | "payment_succeeded"
  | "publication_ready"
  | "renewal_started"
  | "renewal_succeeded";

export function trackServerEvent(params: {
  event: AnalyticsEventName;
  userId?: string | null;
  entityId?: string | null;
  productSlug?: string | null;
  utmSource?: string | null;
  amountKopecks?: number | null;
}) {
  // ТЗ Раздел 9: Без персональных историй в аналитике.
  recordAuditEvent({
    actorUserId: params.userId ?? null,
    eventType: `analytics:${params.event}`,
    entityType: "funnel",
    entityId: params.entityId ?? params.productSlug ?? null,
    metadata: {
      event: params.event,
      productSlug: params.productSlug ?? undefined,
      utmSource: params.utmSource ?? undefined,
      amountKopecks: params.amountKopecks ?? undefined,
    },
  });
}
