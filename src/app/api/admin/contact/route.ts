import { createSingletonHandlers } from "@/lib/api";
import { contactConfigSchema } from "@/lib/validation";
import { ContactConfig } from "@/models";

export const runtime = "nodejs";

const handlers = createSingletonHandlers(ContactConfig, contactConfigSchema, "contact");

export const GET = handlers.get;
export const PUT = handlers.upsert;
export const PATCH = handlers.upsert;
