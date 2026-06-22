import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getProjectBySlug } from "@/lib/content";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const item = await getProjectBySlug(slug);
    return item ? NextResponse.json({ item }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}
