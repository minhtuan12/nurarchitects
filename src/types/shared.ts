import { Types } from "mongoose";
import { IMedia } from "./media";

export type VisibleStatus = "draft" | "published" | "hidden";
export type ContactFormStatus = "new" | "contacted" | "processed";
export type JobStatus = "recruiting" | "closed";
export type ApplicationStatus = "new" | "reviewing" | "accepted" | "rejected";
export type SeoEntityType = string; // replace with actual seoEntityTypes values
export type WorkingType = "full-time" | "part-time" | "remote" | "hybrid";
export type ResourceType = "image" | "video" | "raw" | "auto";
export type SortOrder = "ascend" | "descend" | undefined;

export interface ICategory {
	_id: Types.ObjectId;
	name: string;
	slug: string;
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export type IProjectCategory = ICategory;
export type INewsCategory = ICategory;

export interface Social {
	name: string;
	url: string;
}

export type SiteSettings = {
	primaryColor: string;
	// secondaryColor: string;
	backgroundColor: string;
	textColor: string;
	headerBackgroundColor: string;
	footerBackgroundColor: string;
	footerTextColor: string;
};

export const defaultSiteSettings: SiteSettings = {
	primaryColor: "#1a2340",
	// secondaryColor: "#c9a86a",
	backgroundColor: "#ffffff",
	textColor: "#1c1c1c",
	headerBackgroundColor: "",
	footerBackgroundColor: "#0e1a33",
	footerTextColor: "#ffffff",
};
