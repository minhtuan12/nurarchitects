import { createCollectionHandlers } from "@/lib/api";
import { categorySchema } from "@/lib/validation";
import { NewsCategory } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(NewsCategory, categorySchema, { softDelete: true });

export const GET = handlers.get;
export const PATCH = handlers.update;
export const DELETE = handlers.remove;
