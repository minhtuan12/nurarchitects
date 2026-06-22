import { createCollectionHandlers } from "@/lib/api";
import { mediaCreateSchema } from "@/lib/validation";
import { Media } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Media, mediaCreateSchema);

export const GET = handlers.get;
export const PATCH = handlers.update;
export const DELETE = handlers.remove;
