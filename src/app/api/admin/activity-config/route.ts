import { createSingletonHandlers } from "@/lib/api";
import { activityConfigSchema, cooperationConfigSchema } from "@/lib/validation";
import { ActivityConfig, CooperationConfig } from "@/models";

export const runtime = "nodejs";

const handlers = createSingletonHandlers(ActivityConfig, activityConfigSchema, "activity", [
	{
		path: "bannerId",
	},
]);

export const GET = handlers.get;
export const PUT = handlers.upsert;
export const PATCH = handlers.upsert;
