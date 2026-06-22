import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { AdminUser } from "@/models";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth-token";

export const runtime = "nodejs";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    await connectDb();

    const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
    const tokenPayload = token ? await verifyAdminToken(token) : null;
    if (!tokenPayload?.sub) {
      return NextResponse.json({ error: "Lỗi xác thực" }, { status: 401 });
    }

    const payload = changePasswordSchema.parse(await request.json());
    const admin = await AdminUser.findById(tokenPayload.sub);
    if (!admin || !(await bcrypt.compare(payload.currentPassword, admin.passwordHash))) {
      return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 });
    }

    admin.passwordHash = await bcrypt.hash(payload.newPassword, 12);
    await admin.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
