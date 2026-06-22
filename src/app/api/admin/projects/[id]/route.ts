import { NextResponse, type NextRequest } from "next/server";
import { apiError, createCollectionHandlers, requireAdmin } from "@/lib/api";
import { connectDb } from "@/lib/db";
import {
  assertProjectSeoSlugAvailable,
  projectSeoInputSchema,
  upsertProjectSeoSetting,
} from "@/lib/seo-service";
import { projectSchema } from "@/lib/validation";
import { Project, SeoSetting } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Project, projectSchema);

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    const item = await Project.findById(id).lean();
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
    const parsed = projectSchema.partial().parse(body);

    // chỉ giữ lại field thực sự có trong body gửi lên,
    // tránh Zod .default() điền giá trị mặc định vào field không gửi
    const projectPayload = Object.fromEntries(
      Object.entries(parsed).filter(([key]) =>
        Object.prototype.hasOwnProperty.call(body, key),
      ),
    );

    const seoInput = body.seo ? projectSeoInputSchema.parse(body.seo) : null;
    if (seoInput) {
      await assertProjectSeoSlugAvailable(seoInput.slug, id);
    }

    const item = await Project.findByIdAndUpdate(id, projectPayload, {
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
