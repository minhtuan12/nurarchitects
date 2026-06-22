import { Types } from "mongoose";
import { CooperationStep } from "./shared";
import { IMedia } from "./media";

export interface ICooperationConfig {
	_id: Types.ObjectId;
	_type: "cooperation";
	introduction: string;
	steps: CooperationStep[];
	imageIds: Types.ObjectId[];
	firstCtaBtn: string;
	secondCtaBtn: string;
	thirdCtaBtn: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ICooperationConfigPopulated extends Omit<
	ICooperationConfig,
	"imageIds"
> {
	imageIds: IMedia[];
}
