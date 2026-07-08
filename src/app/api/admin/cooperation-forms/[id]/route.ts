import { createCollectionHandlers } from "@/lib/api";
import { cooperationFormSchema } from "@/lib/validation";
import { CooperationForm } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(CooperationForm, cooperationFormSchema);

export const GET = handlers.get;
export const PATCH = handlers.update;
export const DELETE = handlers.remove;
