import { createCollectionHandlers } from "@/lib/api";
import { newsSchema } from "@/lib/validation";
import { News } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(News, newsSchema);

export const GET = handlers.get;
export const PATCH = handlers.update;
export const DELETE = handlers.remove;
