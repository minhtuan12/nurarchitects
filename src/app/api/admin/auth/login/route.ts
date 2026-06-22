import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { ADMIN_AUTH_COOKIE, signAdminToken } from "@/lib/auth-token";
import { connectDb } from "@/lib/db";
import { AdminUser } from "@/models";

export const runtime = "nodejs";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const payload = loginSchema.parse(await request.json());
    const admin = await AdminUser.findOne({ username: payload.username.toLowerCase() }).lean();
    if (!admin || !(await bcrypt.compare(payload.password, admin.passwordHash))) {
      return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" }, { status: 401 });
    }

    const token = await signAdminToken({ sub: String(admin._id), username: admin.username });
    const response = NextResponse.json({ admin: { id: String(admin._id), username: admin.username } });
    response.cookies.set(ADMIN_AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
