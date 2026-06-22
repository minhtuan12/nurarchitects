import { NextResponse, type NextRequest } from "next/server";
import { apiError, createCollectionHandlers, requireAdmin } from "@/lib/api";
import { connectDb } from "@/lib/db";
import {
  assertProjectSeoSlugAvailable,
  projectSeoInputSchema,
  upsertProjectSeoSetting,
} from "@/lib/seo-service";
import { projectSchema } from "@/lib/validation";
import { Project } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Project, projectSchema, {
  searchFields: ["name", "slug", "shortDescription", "address"],
  filterFields: ["status", "category", "isFeatured", "implementationYear"],
  sortFields: ["area", "implementationYear", "createdAt", "name"],
});

export const GET = handlers.list;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDb();

    const body = await request.json();
    const projectPayload = projectSchema.parse(body);
    const seoPayload = projectSeoInputSchema.parse(
      body.seo ?? {
        title: projectPayload.name,
        slug: projectPayload.slug,
        description: projectPayload.shortDescription,
        ogImage: "",
        canonicalUrl: "",
        focusKeywords: [],
      },
    );

    await assertProjectSeoSlugAvailable(seoPayload.slug);
    const item = await Project.create(projectPayload);
    const seo = await upsertProjectSeoSetting(item._id, seoPayload);

    return NextResponse.json({ item, seo }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
