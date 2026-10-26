import { NextRequest, NextResponse } from "next/server";
import {
  processPaymentWebhook,
  verifyWebhookSignature,
} from "@/lib/commerce";
import { recordAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-yookassa-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    recordAuditEvent({
      eventType: "webhook_signature_rejected",
      entityType: "webhook",
      metadata: { hasSignature: Boolean(signature) },
    });
    return NextResponse.json(
      { ok: false, error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  try {
    const payload = JSON.parse(rawBody);
    const event = payload.event as
      | "payment.succeeded"
      | "payment.canceled"
      | "refund.succeeded";
    const obj = payload.object || {};
    const providerPaymentId = String(obj.id || payload.providerPaymentId || "");
    const orderId = String(
      obj.metadata?.orderId || payload.orderId || ""
    );
    const amountKopecks =
      typeof payload.amountKopecks === "number"
        ? payload.amountKopecks
        : Math.round(Number(obj.amount?.value || 0) * 100);
    const currency = String(
      obj.amount?.currency || payload.currency || "RUB"
    );

    const result = processPaymentWebhook({
      event,
      providerPaymentId,
      orderId,
      amountKopecks,
      currency,
    });

    return NextResponse.json({
      ok: true,
      idempotentSkip: result.idempotentSkip,
      orderStatus: result.order.status,
      bookStatus: result.book.status,
    });
  } catch (err) {
    recordAuditEvent({
      eventType: "webhook_processing_error",
      entityType: "webhook",
      metadata: {
        error: err instanceof Error ? err.message : "unknown_error",
      },
    });
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Webhook processing error",
      },
      { status: 400 }
    );
  }
}
