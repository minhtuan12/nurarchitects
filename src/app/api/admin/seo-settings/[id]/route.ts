import { createCollectionHandlers } from "@/lib/api";
import { seoSettingSchema } from "@/lib/validation";
import { SeoSetting } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(SeoSetting, seoSettingSchema);

export const GET = handlers.get;
export const PATCH = handlers.update;
export const DELETE = handlers.remove;
