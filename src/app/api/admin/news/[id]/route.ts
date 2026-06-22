import { NextResponse, type NextRequest } from "next/server";
import { apiError, createCollectionHandlers, requireAdmin } from "@/lib/api";
import { connectDb } from "@/lib/db";
import {
  assertProjectSeoSlugAvailable,
  projectSeoInputSchema,
  upsertProjectSeoSetting,
} from "@/lib/seo-service";
import { newsSchema } from "@/lib/validation";
import { News, SeoSetting } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(News, newsSchema);

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDb();

    const { id } = await context.params;
    const item = await News.findById(id).lean();
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const seo = await SeoSetting.findOne({ entityId: item._id, entityType: "post" }).lean();

    return NextResponse.json({ item, seo });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDb();

    const { id } = await context.params;
    const body = await request.json();
    const parsed = newsSchema.partial().parse(body);
    const payload = Object.fromEntries(
      Object.entries(parsed).filter(([key]) =>
        Object.prototype.hasOwnProperty.call(body, key),
      ),
    );
    const seoInput = body.seo ? projectSeoInputSchema.parse(body.seo) : null;

    if (seoInput) {
      await assertProjectSeoSlugAvailable(seoInput.slug, id);
    }

    const item = await News.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const seo = seoInput ? await upsertProjectSeoSetting(item._id, seoInput) : null;

    return NextResponse.json({ item, seo });
  } catch (error) {
    return apiError(error);
  }
}
export const DELETE = handlers.remove;
