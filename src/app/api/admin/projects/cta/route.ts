import { createSingletonHandlers } from "@/lib/api";
import { projectCtaSchema } from "@/lib/validation";
import { ProjectCta } from "@/models";

export const runtime = "nodejs";
const handlers = createSingletonHandlers(
	ProjectCta,
	projectCtaSchema,
	"project-cta",
	{ path: "backgroundImageId", strictPopulate: false },
);

export const GET = handlers.get;
export const PUT = handlers.upsert;
export const PATCH = handlers.upsert;
