import type { IActivityPopulated } from "@/types/activity";
import { toSlug } from "@/helpers";

export interface ActivityFormValues {
	name: string;
	slug: string;
	shortDescription?: string;
	description?: string;
	order?: number | null;
	status: "draft" | "published";
	seoTitle: string;
	seoSlug: string;
	seoDescription?: string;
	seoOgImage?: string;
	seoCanonicalUrl?: string;
	seoFocusKeywords?: string[];
}

export type ActivityResponse = Omit<IActivityPopulated, "createdAt" | "updatedAt"> & {
	_id: string;
	createdAt?: string;
	updatedAt?: string;
};

export interface ActivityDetailResponse {
	item?: ActivityResponse;
	seo?: SeoResponse | null;
	error?: string;
}

export interface SeoResponse {
	title?: string;
	slug?: string;
	description?: string;
	ogImage?: string;
	canonicalUrl?: string;
	focusKeywords?: string[];
}

export const defaultActivityValues: ActivityFormValues = {
	name: "",
	slug: "",
	shortDescription: "",
	description: "",
	order: 0,
	status: "draft",
	seoTitle: "",
	seoSlug: "",
	seoDescription: "",
	seoOgImage: "",
	seoCanonicalUrl: "",
	seoFocusKeywords: [],
};

export function toActivityFormValues(
	activity: Partial<ActivityResponse>,
	seo?: SeoResponse | null,
): ActivityFormValues {
	return {
		...defaultActivityValues,
		name: activity.name ?? "",
		slug: activity.slug ?? "",
		shortDescription: activity.shortDescription ?? "",
		description: activity.description ?? "",
		order: activity.order ?? 0,
		status: activity.status === "published" ? "published" : "draft",
		seoTitle: seo?.title ?? activity.name ?? "",
		seoSlug: seo?.slug ?? activity.slug ?? "",
		seoDescription: seo?.description ?? activity.shortDescription ?? "",
		seoOgImage: seo?.ogImage ?? "",
		seoCanonicalUrl: seo?.canonicalUrl ?? "",
		seoFocusKeywords: seo?.focusKeywords ?? [],
	};
}

export function buildActivityPayload(
	values: ActivityFormValues,
	thumbnailId: string,
	galleryMediaIds: string[],
) {
	return {
		name: values.name,
		slug: toSlug(values.name),
		shortDescription: values.shortDescription ?? "",
		description: values.description ?? "",
		thumbnailId,
		galleryMediaIds,
		status: values.status,
		seo: {
			title: values.seoTitle,
			slug: values.seoSlug || toSlug(values.name),
			description: values.seoDescription ?? "",
			ogImage: values.seoOgImage ?? "",
			canonicalUrl: values.seoCanonicalUrl ?? "",
			focusKeywords: values.seoFocusKeywords ?? [],
		},
	};
}
