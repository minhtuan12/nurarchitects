import { createCollectionHandlers } from "@/lib/api";
import { categorySchema } from "@/lib/validation";
import { NewsCategory } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(NewsCategory, categorySchema, {
  searchFields: ["name", "slug"],
  softDelete: true,
});

export const GET = handlers.list;
export const POST = handlers.create;
