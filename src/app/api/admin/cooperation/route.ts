import { createSingletonHandlers } from "@/lib/api";
import { cooperationConfigSchema } from "@/lib/validation";
import { CooperationConfig } from "@/models";

export const runtime = "nodejs";

const handlers = createSingletonHandlers(CooperationConfig, cooperationConfigSchema, "cooperation", [
	{
		path: "bannerId",
	},
	{
		path: "imageIds",
	},
	{
		path: "neededFields.imageId",
	},
]);

export const GET = handlers.get;
export const PUT = handlers.upsert;
export const PATCH = handlers.upsert;
