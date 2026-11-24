import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminCookieOptions,
  getAdminSessionStatus,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function GET() {
  const status = await getAdminSessionStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password === "string") {
      password = body.password;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const check = await verifyAdminPassword(password);
  if (!check.configured) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD secret is not configured. Run `wrangler secret put ADMIN_PASSWORD`.",
      },
      { status: 503 }
    );
  }
  if (!check.ok) {
    return NextResponse.json(
      { error: "密码不正确 / Incorrect password" },
      { status: 401 }
    );
  }

  const token = await createAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Could not initialize admin session" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    ...getAdminCookieOptions(),
    maxAge: 0,
  });
  return response;
}
