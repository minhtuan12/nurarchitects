import { createCollectionHandlers } from "@/lib/api";
import { jobSchema } from "@/lib/validation";
import { Job } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Job, jobSchema, {
  searchFields: ["title", "slug", "workingAddress"],
});

export const GET = handlers.list;
export const POST = handlers.create;
