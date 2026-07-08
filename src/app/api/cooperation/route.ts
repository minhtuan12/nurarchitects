import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getCooperation } from "@/lib/content";
import { connectDb } from "@/lib/db";
import { CooperationForm } from "@/models";
import { cooperationFormSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ item: await getCooperation() });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const payload = cooperationFormSchema.omit({ status: true }).parse(await request.json());
    const item = await CooperationForm.create({ ...payload, status: "new" });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
