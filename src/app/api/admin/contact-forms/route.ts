import { createCollectionHandlers } from "@/lib/api";
import { contactFormSchema } from "@/lib/validation";
import { ContactForm } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(ContactForm, contactFormSchema, {
  searchFields: ["fullName", "phone", "address"],
  filterFields: ["status", "buildPlan", "area"],
  sortFields: ["createdAt"],
});

export const GET = handlers.list;
export const POST = handlers.create;
