import { Types } from "mongoose";
import { z } from "zod";
import { seoSettingSchema } from "@/lib/validation";
import { SeoSetting } from "@/models";

export const projectSeoInputSchema = seoSettingSchema
	.omit({ entityId: true, entityType: true })
	.partial({
		description: true,
		ogImage: true,
		canonicalUrl: true,
		focusKeywords: true,
	});

export type ProjectSeoInput = z.infer<typeof projectSeoInputSchema>;

export async function assertProjectSeoSlugAvailable(slug: string, projectId?: Types.ObjectId | string) {
	const entityId = projectId ? new Types.ObjectId(String(projectId)) : undefined;
	const existingForProject = entityId
		? await SeoSetting.findOne({ entityId, entityType: "post" }).lean()
		: null;
	const slugOwner = await SeoSetting.findOne({
		slug,
		...(existingForProject?._id ? { _id: { $ne: existingForProject._id } } : {}),
	}).lean();

	if (slugOwner) {
		throw new Error("SEO slug already exists");
	}
}

export async function upsertProjectSeoSetting(projectId: Types.ObjectId | string, input: ProjectSeoInput) {
	const entityId = new Types.ObjectId(String(projectId));
	const payload = projectSeoInputSchema.parse(input);
	await assertProjectSeoSlugAvailable(payload.slug, entityId);

	return SeoSetting.findOneAndUpdate(
		{ entityId, entityType: "post" },
		{
			entityId,
			entityType: "post",
			title: payload.title,
			slug: payload.slug,
			description: payload.description ?? "",
			ogImage: payload.ogImage ?? "",
			canonicalUrl: payload.canonicalUrl ?? "",
			focusKeywords: payload.focusKeywords ?? [],
		},
		{ new: true, upsert: true, runValidators: true },
	).lean();
}
