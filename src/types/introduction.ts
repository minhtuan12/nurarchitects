import { Types } from "mongoose";
import { IMedia } from "./media";

export interface IntroductionContent {
	name: string;
	description: string;
}

export interface IntroductionMemberExperience {
	name: string;
	description: string;
}

export interface IntroductionMember {
	imageId?: string;
	name: string;
	description: string;
	experiences: IntroductionMemberExperience[];
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
	members: IntroductionMember[];
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
