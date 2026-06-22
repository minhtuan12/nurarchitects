import { createCollectionHandlers } from "@/lib/api";
import { applicationSchema } from "@/lib/validation";
import { Application } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Application, applicationSchema, {
  searchFields: ["fullName", "email", "phone"],
});

export const GET = handlers.list;
export const POST = handlers.create;
