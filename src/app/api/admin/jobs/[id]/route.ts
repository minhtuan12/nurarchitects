import { createCollectionHandlers } from "@/lib/api";
import { jobSchema } from "@/lib/validation";
import { Job } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Job, jobSchema);

export const GET = handlers.get;
export const PATCH = handlers.update;
export const DELETE = handlers.remove;
