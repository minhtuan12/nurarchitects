import { Types } from "mongoose";
import { IMedia } from "./media";

export interface IntroductionContent {
	name: string;
	description: string;
}

export interface IIntroductionConfig {
	_id: Types.ObjectId;
	_type: "introduction";
	content: string;
	history: IntroductionContent[];
	vision: IntroductionContent[];
	mission: IntroductionContent[];
	coreValues: IntroductionContent[];
	achievements: IntroductionContent[];
	imageIds: Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

export interface IIntroductionConfigPopulated extends Omit<
	IIntroductionConfig,
	"imageIds"
> {
	imageIds: IMedia[];
}
