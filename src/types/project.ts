import { Types } from "mongoose";
import { VisibleStatus } from "./shared";
import { IMedia } from "./media";

export interface IProject {
	_id: Types.ObjectId | string;
	name: string;
	slug: string;
	shortDescription: string;
	description: string;
	thumbnailId?: Types.ObjectId;
	galleryMediaIds: Types.ObjectId[];
	address: string;
	area?: number;
	implementationYear?: number;
	category?: BuildPlan;
	status: VisibleStatus;
	isFeatured: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IProjectPopulated extends Omit<
	IProject,
	"thumbnailId" | "galleryMediaIds"
> {
	thumbnailId?: IMedia;
	galleryMediaIds: IMedia[];
}

export type BuildPlan = 'home' | 'businessHome' | 'villa' | 'office' | 'others';
export type BuildArea = 'under' | 'between' | 'above';

export const EBuildPlan = {
	home: { value: "home", label: "Nhà phố", color: 'magneta' },
	businessHome: { value: "businessHome", label: "Nhà phố kết hợp kinh doanh", color: 'volcano' },
	villa: { value: "villa", label: "Biệt thự - Villa", color: 'green' },
	office: { value: "office", label: "Văn phòng", color: 'blue' },
	others: { value: "others", label: "Khác", color: 'purple' },
};
