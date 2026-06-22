import { Types } from "mongoose";
import { IMedia } from "./media";
import { IProject } from "./project";

export interface ActivityBlock {
	name: string;
	description: string;
}

export interface IHomepageConfig {
	_id: Types.ObjectId;
	_type: "homepage";
	bannerMediaId?: Types.ObjectId;
	introductionContent: string;
	introductionTitle: string;
	featuredProjectIds: Types.ObjectId[];
	featuredInteriorProductIds: Types.ObjectId[];
	activities: ActivityBlock[];
	contactCtaContent: string;
	mediaIds: Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

export interface IHomepageConfigPopulated extends Omit<
	IHomepageConfig,
	"bannerMediaId" | "featuredProjectIds" | "mediaIds"
> {
	bannerMediaId?: IMedia;
	featuredProjectIds: IProject[];
	mediaIds: IMedia[];
}
