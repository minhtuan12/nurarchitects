import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth-token";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  const payload = token ? await verifyAdminToken(token) : null;

  if (!payload?.sub) {
    return NextResponse.json({ error: "Lỗi xác thực" }, { status: 401 });
  }

  return NextResponse.json({
    admin: {
      id: payload.sub,
      username: payload.username,
    },
  });
}
