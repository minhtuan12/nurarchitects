import { describe, expect, it } from "vitest";
import {
	buildActivityPayload,
	defaultActivityValues,
	toActivityFormValues,
	toSlug,
} from "./activity-form-utils";

describe("activity form utils", () => {
	it("builds an API payload from form values and media selections without order", () => {
		const payload = buildActivityPayload(
			{
				name: "Le ra mat du an",
				slug: "ignored",
				shortDescription: "Tom tat",
				description: "<p>Noi dung</p>",
				status: "published",
				seoTitle: "SEO title",
				seoSlug: "seo-title",
				seoDescription: "SEO description",
				seoOgImage: "https://cdn.example.com/og.jpg",
				seoCanonicalUrl: "https://nurarchitects.com/activity/seo-title",
				seoFocusKeywords: ["activity"],
			},
			"507f1f77bcf86cd799439011",
			["507f1f77bcf86cd799439012"],
		);

		expect(payload).toEqual({
			name: "Le ra mat du an",
			slug: "le-ra-mat-du-an",
			shortDescription: "Tom tat",
			description: "<p>Noi dung</p>",
			thumbnailId: "507f1f77bcf86cd799439011",
			galleryMediaIds: ["507f1f77bcf86cd799439012"],
			status: "published",
			seo: {
				title: "SEO title",
				slug: "seo-title",
				description: "SEO description",
				ogImage: "https://cdn.example.com/og.jpg",
				canonicalUrl: "https://nurarchitects.com/activity/seo-title",
				focusKeywords: ["activity"],
			},
		});
	});

	it("normalizes loaded activity data into form values", () => {
		expect(
			toActivityFormValues({
				name: "Hoat dong",
				slug: "hoat-dong",
				shortDescription: "Tom tat",
				status: "published",
			}, {
				title: "SEO Hoat dong",
				slug: "seo-hoat-dong",
				description: "SEO tom tat",
				ogImage: "https://cdn.example.com/activity-og.jpg",
				canonicalUrl: "https://nurarchitects.com/activity/seo-hoat-dong",
				focusKeywords: ["seo"],
			}),
		).toEqual({
			...defaultActivityValues,
			name: "Hoat dong",
			slug: "hoat-dong",
			shortDescription: "Tom tat",
			status: "published",
			seoTitle: "SEO Hoat dong",
			seoSlug: "seo-hoat-dong",
			seoDescription: "SEO tom tat",
			seoOgImage: "https://cdn.example.com/activity-og.jpg",
			seoCanonicalUrl: "https://nurarchitects.com/activity/seo-hoat-dong",
			seoFocusKeywords: ["seo"],
		});
	});

	it("creates vietnamese-safe slugs", () => {
		expect(toSlug("Hội thảo thiết kế 2026")).toBe(
			"hoi-thao-thiet-ke-2026",
		);
	});
});
