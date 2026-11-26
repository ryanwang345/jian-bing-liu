import { NextResponse } from "next/server";
import {
  getAdminSessionStatus,
  LEGACY_ADMIN_COOKIE_NAME,
} from "@/lib/admin-auth";

export async function GET() {
  const status = await getAdminSessionStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Password login is disabled. Admin access is protected by Cloudflare Zero Trust Access.",
    },
    { status: 410 }
  );
}

export async function DELETE() {
  const response = NextResponse.json({
    ok: true,
    logoutUrl: "/cdn-cgi/access/logout",
  });
  response.cookies.set(LEGACY_ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
