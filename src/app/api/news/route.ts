import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getPublishedNews } from "@/lib/content";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search") ?? undefined;
    const category = searchParams.get("category") ?? undefined;

    const result = await getPublishedNews({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      category,
    });

    return NextResponse.json(result);
  } catch (error) {
    return apiError(error);
  }
}
