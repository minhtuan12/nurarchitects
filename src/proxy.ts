import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE, bearerToken, verifyAdminToken } from "@/lib/auth-token";

// ─── Admin auth ───────────────────────────────────────────────────────────

async function handleAdminApi(request: NextRequest) {
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

// ─── Preview theme (cookie cho iframe xem trước trong admin settings) ─────

const PREVIEW_KEYS = [
  "primaryColor",
  "backgroundColor",
  "textColor",
  "headerBackgroundColor",
  "footerBackgroundColor",
  "footerTextColor",
] as const;

const PREVIEW_COOKIE_NAME = "preview-theme";

function handlePreviewTheme(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const isPreview = searchParams.get("preview") === "1";
  const res = NextResponse.next();

  if (isPreview) {
    const payload: Record<string, string> = {};
    for (const key of PREVIEW_KEYS) {
      const v = searchParams.get(key);
      if (v !== null) payload[key] = v;
    }

    res.cookies.set(PREVIEW_COOKIE_NAME, JSON.stringify(payload), {
      path: "/",
      sameSite: "lax",
      // Không set maxAge => cookie session, tự mất khi đóng tab.
      // Có thể thêm maxAge: 60 * 10 nếu muốn tự hết hạn sau 10 phút.
    });
  }

  return res;
}

// ─── Entry point ───────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    return handleAdminApi(request);
  }

  return handlePreviewTheme(request);
}

export const config = {
  matcher: [
    "/api/admin/((?!auth/login).*)",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
