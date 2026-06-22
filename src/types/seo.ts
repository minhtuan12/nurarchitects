import { Types } from "mongoose";
import { SeoEntityType } from "./shared";

export interface ISeoSetting {
	_id: Types.ObjectId;
	entityId?: Types.ObjectId;
	entityType: SeoEntityType;
	title: string;
	slug: string;
	description: string;
	ogImage: string;
	canonicalUrl: string;
	focusKeywords: string[];
	createdAt: Date;
	updatedAt: Date;
}
