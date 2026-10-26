import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifyOtpOrMagicLink } from "@/lib/auth";
import { ensureDemoSeed } from "@/lib/demo-seed";

export async function POST(req: NextRequest) {
  try {
    ensureDemoSeed();
    const body = await req.json();
    const email = String(body.email || "").trim();
    const code = body.code ? String(body.code).trim() : undefined;
    const magicToken = body.magicToken
      ? String(body.magicToken).trim()
      : undefined;
    const name = body.name ? String(body.name).trim() : undefined;

    const { user, sessionToken } = verifyOtpOrMagicLink({
      email,
      code,
      magicToken,
      name,
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Ошибка проверки кода",
      },
      { status: 401 }
    );
  }
}
