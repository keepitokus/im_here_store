import { NextRequest, NextResponse } from "next/server";
import { issueOtpAndMagicLink } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { ensureDemoSeed } from "@/lib/demo-seed";

export async function POST(req: NextRequest) {
  try {
    ensureDemoSeed();
    const body = await req.json();
    const email = String(body.email || "").trim();
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const issued = issueOtpAndMagicLink(email, ip);

    return NextResponse.json({
      ok: true,
      email: issued.email,
      expiresAt: issued.expiresAt,
      // В локальном DEMO_MODE явно возвращаем код для мгновенного тестирования без внешнего SMTP
      demoCode: isDemoMode() ? issued.code : undefined,
      demoMagicToken: isDemoMode() ? issued.magicToken : undefined,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Ошибка отправки кода",
      },
      { status: 400 }
    );
  }
}
