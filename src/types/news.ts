import { Types } from "mongoose";
import { INewsCategory, VisibleStatus } from "./shared";
import { IMedia } from "./media";

export interface INews {
	_id: Types.ObjectId;
	title: string;
	slug: string;
	shortDescription: string;
	description: string;
	thumbnailId?: Types.ObjectId;
	categoryId?: Types.ObjectId;
	relatedNewsIds: Types.ObjectId[];
	status: VisibleStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface INewsPopulated extends Omit<
	INews,
	"thumbnailId" | "categoryId" | "relatedNewsIds"
> {
	thumbnailId?: IMedia;
	categoryId?: INewsCategory;
	relatedNewsIds: INews[];
}
