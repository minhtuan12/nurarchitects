import { createCollectionHandlers } from "@/lib/api";
import { applicationSchema } from "@/lib/validation";
import { Application } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Application, applicationSchema);

export const GET = handlers.get;
export const PATCH = handlers.update;
export const DELETE = handlers.remove;
