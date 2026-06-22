import { NextResponse, type NextRequest } from "next/server";
import { apiError, createCollectionHandlers, requireAdmin } from "@/lib/api";
import { getNextActivityOrder } from "@/lib/activity-order";
import { connectDb } from "@/lib/db";
import {
  assertProjectSeoSlugAvailable,
  projectSeoInputSchema,
  upsertProjectSeoSetting,
} from "@/lib/seo-service";
import { activitySchema } from "@/lib/validation";
import { Activity } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Activity, activitySchema, {
  searchFields: ["name", "slug", "shortDescription"],
  filterFields: ["status"],
  sortFields: ["order", "createdAt"],
  defaultSort: { order: 1, createdAt: -1 },
});

export const GET = handlers.list;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDb();

    const body = await request.json();
    const payload = activitySchema.omit({ order: true }).parse(body);
    const seoPayload = projectSeoInputSchema.parse(
      body.seo ?? {
        title: payload.name,
        slug: payload.slug,
        description: payload.shortDescription,
        ogImage: "",
        canonicalUrl: "",
        focusKeywords: [],
      },
    );

    await assertProjectSeoSlugAvailable(seoPayload.slug);
    const lastActivity = await Activity.findOne()
      .sort({ order: -1 })
      .select("order")
      .lean<{ order?: number }>();
    const item = await Activity.create({
      ...payload,
      order: getNextActivityOrder(lastActivity?.order),
    });
    const seo = await upsertProjectSeoSetting(item._id, seoPayload);

    return NextResponse.json({ item, seo }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
