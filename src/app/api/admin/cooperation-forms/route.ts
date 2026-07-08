import { createCollectionHandlers } from "@/lib/api";
import { cooperationFormSchema } from "@/lib/validation";
import { CooperationForm } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(CooperationForm, cooperationFormSchema, {
  searchFields: ["companyName", "contactName", "phone", "email"],
  filterFields: ["status", "mainService"],
  sortFields: ["createdAt"],
});

export const GET = handlers.list;
export const POST = handlers.create;
