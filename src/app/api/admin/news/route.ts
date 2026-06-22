import { createCollectionHandlers } from "@/lib/api";
import { newsSchema } from "@/lib/validation";
import { News } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(News, newsSchema, {
  searchFields: ["title", "slug", "shortDescription"],
});

export const GET = handlers.list;
export const POST = handlers.create;
