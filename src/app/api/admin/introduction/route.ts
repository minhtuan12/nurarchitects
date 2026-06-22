import { createSingletonHandlers } from "@/lib/api";
import { introductionConfigSchema } from "@/lib/validation";
import { IntroductionConfig } from "@/models";

export const runtime = "nodejs";

const handlers = createSingletonHandlers(IntroductionConfig, introductionConfigSchema, "introduction");

export const GET = handlers.get;
export const PUT = handlers.upsert;
export const PATCH = handlers.upsert;
