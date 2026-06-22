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
