import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isSimulatedPaymentAllowed } from "@/lib/env";
import { processPaymentWebhook } from "@/lib/commerce";
import { getDb } from "@/lib/db";
import { orders, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    if (!isSimulatedPaymentAllowed()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Платёжный симулятор DEMO_MODE отключён на боевом домене",
        },
        { status: 403 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Требуется авторизация" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const orderId = String(body.orderId || "");
    const outcome =
      body.outcome === "payment.canceled"
        ? "payment.canceled"
        : body.outcome === "refund.succeeded"
        ? "refund.succeeded"
        : "payment.succeeded";
    const simulatePublishFailureOnce = Boolean(body.simulatePublishFailureOnce);

    const db = getDb();
    const order = db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Заказ не найден" },
        { status: 404 }
      );
    }

    const payment = db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .get();

    if (!payment) {
      return NextResponse.json(
        { ok: false, error: "Платёж для заказа не найден" },
        { status: 404 }
      );
    }

    const result = processPaymentWebhook({
      event: outcome,
      providerPaymentId: payment.providerPaymentId,
      orderId: order.id,
      amountKopecks: order.amountKopecks,
      currency: order.currency,
      isSimulatedDemo: true,
      simulatePublishFailureOnce,
    });

    return NextResponse.json({
      ok: true,
      idempotentSkip: result.idempotentSkip,
      publishDelayed: result.publishDelayed,
      order: result.order,
      book: result.book,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Ошибка симулятора оплаты",
      },
      { status: 400 }
    );
  }
}
