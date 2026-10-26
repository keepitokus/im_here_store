import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createOrderAndPayment } from "@/lib/commerce";
import { ensureDemoSeed } from "@/lib/demo-seed";

export async function POST(req: NextRequest) {
  try {
    ensureDemoSeed();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Пожалуйста, войдите по email перед оформлением заказа",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const bookId = String(body.bookId || "");
    const orderType =
      body.orderType === "renewal" ? "renewal" : "initial_purchase";
    const termsAccepted = Boolean(body.termsAccepted);
    const utmSource = body.utmSource ? String(body.utmSource) : null;
    const utmMedium = body.utmMedium ? String(body.utmMedium) : null;
    const utmCampaign = body.utmCampaign ? String(body.utmCampaign) : null;

    // Даже если клиент прислал clientClaimedPriceKopecks — сервер вычисляет цену сам из конфига
    const clientClaimedPriceKopecks =
      typeof body.priceKopecks === "number" ? body.priceKopecks : undefined;

    const result = createOrderAndPayment({
      userId: user.id,
      userEmail: user.email,
      bookId,
      orderType,
      termsAccepted,
      utmSource,
      utmMedium,
      utmCampaign,
      clientClaimedPriceKopecks,
    });

    return NextResponse.json({
      ok: true,
      order: result.order,
      payment: result.payment,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Ошибка создания заказа",
      },
      { status: 400 }
    );
  }
}
