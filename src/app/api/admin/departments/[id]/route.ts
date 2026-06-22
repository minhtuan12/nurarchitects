import { createCollectionHandlers } from "@/lib/api";
import { departmentSchema } from "@/lib/validation";
import { Department } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Department, departmentSchema);

export const GET = handlers.get;
export const PATCH = handlers.update;
export const DELETE = handlers.remove;
