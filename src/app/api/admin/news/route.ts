import { NextResponse, type NextRequest } from "next/server";
import { apiError, requireAdmin } from "@/lib/api";
import { connectDb } from "@/lib/db";
import {
  assertProjectSeoSlugAvailable,
  projectSeoInputSchema,
  upsertProjectSeoSetting,
} from "@/lib/seo-service";
import { newsSchema } from "@/lib/validation";
import { News } from "@/models";

export const runtime = "nodejs";

const sortFields = new Set(["createdAt", "title"]);

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDb();

    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = ["title", "slug", "shortDescription"].map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }
    if (status) query.status = status;
    if (categoryId) query.categoryId = categoryId;

    const sort: Record<string, 1 | -1> =
      sortBy && sortFields.has(sortBy)
        ? { [sortBy]: sortOrder === "asc" ? 1 : -1 }
        : { createdAt: -1 };

    const [items, total] = await Promise.all([
      News.find(query)
        .populate("thumbnailId")
        .populate("categoryId")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      News.countDocuments(query),
    ]);

    return NextResponse.json({ items, page, limit, total });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDb();

    const body = await request.json();
    const payload = newsSchema.parse(body);
    const seoPayload = projectSeoInputSchema.parse(
      body.seo ?? {
        title: payload.title,
        slug: payload.slug,
        description: payload.shortDescription,
        ogImage: "",
        canonicalUrl: "",
        focusKeywords: [],
      },
    );

    await assertProjectSeoSlugAvailable(seoPayload.slug);
    const item = await News.create(payload);
    const seo = await upsertProjectSeoSetting(item._id, seoPayload);

    return NextResponse.json({ item, seo }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
