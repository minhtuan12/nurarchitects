import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getIntroduction } from "@/lib/content";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ item: await getIntroduction() });
  } catch (error) {
    return apiError(error);
  }
}
