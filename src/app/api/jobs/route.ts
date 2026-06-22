import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api";
import { getRecruitingJobs } from "@/lib/content";
import { connectDb } from "@/lib/db";
import { applicationSchema } from "@/lib/validation";
import { Application } from "@/models";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ items: await getRecruitingJobs() });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const payload = applicationSchema.omit({ status: true, adminNote: true }).parse(await request.json());
    const item = await Application.create({ ...payload, status: "new" });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
