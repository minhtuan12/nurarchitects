import { createSingletonHandlers } from "@/lib/api";
import { homepageConfigSchema } from "@/lib/validation";
import { HomepageConfig } from "@/models";

export const runtime = "nodejs";

const handlers = createSingletonHandlers(HomepageConfig, homepageConfigSchema, "homepage");

export const GET = handlers.get;
export const PUT = handlers.upsert;
export const PATCH = handlers.upsert;
