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
  | "renewal_succeeded"
  | "preview"
  | "checkout_start"
  | "payment_success";

const EVENT_ALIASES: Partial<Record<AnalyticsEventName, AnalyticsEventName>> = {
  view_preview: "preview",
  begin_checkout: "checkout_start",
  payment_succeeded: "payment_success",
};

export function trackServerEvent(params: {
  event: AnalyticsEventName;
  userId?: string | null;
  entityId?: string | null;
  productSlug?: string | null;
  utmSource?: string | null;
  amountKopecks?: number | null;
}) {
  // ТЗ Раздел 9: Без персональных историй в аналитике.
  const names = [params.event, EVENT_ALIASES[params.event]].filter(
    (name): name is AnalyticsEventName => Boolean(name)
  );
  for (const name of names) {
    recordAuditEvent({
      actorUserId: params.userId ?? null,
      eventType: `analytics:${name}`,
      entityType: "funnel",
      entityId: params.entityId ?? params.productSlug ?? null,
      metadata: {
        event: name,
        productSlug: params.productSlug ?? undefined,
        utmSource: params.utmSource ?? undefined,
        amountKopecks: params.amountKopecks ?? undefined,
      },
    });
  }
}
