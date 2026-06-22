import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getPublishedNews } from "@/lib/content";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ items: await getPublishedNews() });
  } catch (error) {
    return apiError(error);
  }
}
