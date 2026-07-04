import { createSingletonHandlers } from "@/lib/api";
import { settingsConfigSchema } from "@/lib/validation";
import { SettingsConfig } from "@/models";

export const runtime = "nodejs";

const handlers = createSingletonHandlers(SettingsConfig, settingsConfigSchema, "settings");

export const GET = handlers.get;
export const PUT = handlers.upsert;
export const PATCH = handlers.upsert;
