import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  retryOrderPublication,
  evaluateEntitlementsAndWarnings,
} from "@/lib/commerce";
import { retryFailedNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const adminHeader = req.headers.get("x-admin-token");
    const validToken =
      adminHeader &&
      adminHeader ===
        (process.env.ADMIN_TOKEN || "ya-zdes-admin-local-token-2026");

    if (user?.role !== "admin" && !validToken) {
      return NextResponse.json(
        { ok: false, error: "Доступ только для администратора" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const action = String(body.action || "");

    if (action === "retry_publish" && body.orderId) {
      const res = retryOrderPublication(String(body.orderId));
      return NextResponse.json({ ok: true, result: res });
    }

    if (action === "retry_notification" && body.notificationId) {
      const res = retryFailedNotification(String(body.notificationId));
      return NextResponse.json({ ok: true, notification: res });
    }

    if (action === "evaluate_entitlements") {
      const res = evaluateEntitlementsAndWarnings();
      return NextResponse.json({ ok: true, result: res });
    }

    return NextResponse.json(
      { ok: false, error: "Неизвестное действие" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Ошибка админ-операции",
      },
      { status: 400 }
    );
  }
}
