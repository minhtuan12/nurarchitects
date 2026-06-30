import { Types } from "mongoose";
import { IMedia } from "./media";
import { IProject } from "./project";
import { IActivityPopulated } from "./activity";

export interface IHomepageConfig {
	_id: Types.ObjectId;
	_type: "homepage";
	bannerId?: Types.ObjectId;
	introductionContent: string;
	introductionTitle: string;
	featuredProjectIds: Types.ObjectId[];
	featuredInteriorProductIds: Types.ObjectId[];
	activities: IActivityPopulated[] | string[];
	contactCtaContent: string;
	mediaIds: Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

export interface IHomepageConfigPopulated extends Omit<
	IHomepageConfig,
	"bannerId" | "featuredProjectIds" | "mediaIds"
> {
	bannerId?: IMedia;
	featuredProjectIds: IProject[];
	mediaIds: IMedia[];
}
