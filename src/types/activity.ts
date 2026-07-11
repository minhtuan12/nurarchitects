import { Types } from "mongoose";
import { VisibleStatus } from "./shared";
import { IMedia } from "./media";

export interface IActivity {
	_id: Types.ObjectId | string;
	name: string;
	slug: string;
	shortDescription: string;
	description: string;
	thumbnailId?: Types.ObjectId;
	galleryMediaIds: Types.ObjectId[];
	order: number;
	status: VisibleStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface IActivityPopulated extends Omit<
	IActivity,
	"thumbnailId" | "galleryMediaIds"
> {
	thumbnailId?: IMedia;
	galleryMediaIds: IMedia[];
}

export interface IActivityAdvantage {
	name: String;
	thumbnailId: String;
	description?: String;
}

export interface IActivityAdvantagePopulated extends Omit<IActivityAdvantage, 'thumbnailId'> {
	thumbnailId?: IMedia | null | string;
}

export interface IActivityProcess {
	order: Number;
	name: String;
	details?: String[];
}

export interface IActivityConfig {
	bannerId?: String;
	advantages?: IActivityAdvantage[];
	process?: IActivityProcess[];
}

export interface IActivityConfigPopulated extends Omit<
	IActivityConfig,
	"bannerId" | 'advantages'
> {
	bannerId?: IMedia;
	advantages?: IActivityAdvantagePopulated[];
}
