import { createCollectionHandlers } from "@/lib/api";
import { departmentSchema } from "@/lib/validation";
import { Department } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Department, departmentSchema, {
  searchFields: ["name"],
});

export const GET = handlers.list;
export const POST = handlers.create;
