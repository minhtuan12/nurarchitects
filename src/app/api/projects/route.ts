import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getPublishedProjects } from "@/lib/content";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ items: await getPublishedProjects() });
  } catch (error) {
    return apiError(error);
  }
}
