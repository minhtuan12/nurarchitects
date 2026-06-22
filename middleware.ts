import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE, bearerToken, verifyAdminToken } from "@/lib/auth-token";

export async function middleware(request: NextRequest) {
  const token = bearerToken(
    request.headers.get("authorization") ||
      request.headers.get("x-admin-token") ||
      request.cookies.get(ADMIN_AUTH_COOKIE)?.value ||
      "",
  );
  const payload = token ? await verifyAdminToken(token) : null;

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headers = new Headers(request.headers);
  headers.set("x-admin-id", payload.sub);
  headers.set("x-admin-username", payload.username);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/api/admin/((?!auth/login).*)"],
};
