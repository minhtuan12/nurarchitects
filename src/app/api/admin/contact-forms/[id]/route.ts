import { createCollectionHandlers } from "@/lib/api";
import { contactFormSchema } from "@/lib/validation";
import { ContactForm } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(ContactForm, contactFormSchema);

export const GET = handlers.get;
export const PATCH = handlers.update;
export const DELETE = handlers.remove;
