import { createCollectionHandlers } from "@/lib/api";
import { seoSettingSchema } from "@/lib/validation";
import { SeoSetting } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(SeoSetting, seoSettingSchema, {
  searchFields: ["title", "slug", "description"],
});

export const GET = handlers.list;
export const POST = handlers.create;
