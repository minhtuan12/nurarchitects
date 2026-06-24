import { Types } from "mongoose";
import { IMedia } from "./media";

export interface CooperationStep {
	order: number;
	name: string;
	description: string;
}

export interface CooperationNeededFields {
	name: string;
	imageId: string;
}

export interface ICooperationConfig {
	_id: Types.ObjectId;
	_type: "cooperation";
	introduction: string;
	steps: CooperationStep[];
	neededFields: ICooperationNeededFieldsPopulated[];
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

export interface ICooperationNeededFieldsPopulated extends Omit<
	CooperationNeededFields,
	"imageId"
> {
	imageId: IMedia;
}
