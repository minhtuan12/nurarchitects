import { Types } from "mongoose";
import { ContactFormStatus, Social } from "./shared";
import { BuildPlan } from "./project";

export interface IContactForm {
	_id: Types.ObjectId;
	fullName: string;
	phone: string;
	planningToBuild: string;
	buildPlan: BuildPlan;
	area: string;
	floors?: number;
	address: string;
	specialRequirement: string;
	status: ContactFormStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface IContactConfig {
	_id: Types.ObjectId;
	_type: "contact";
	phone: string;
	email: string;
	addresses: string;
	facebookUrl: string;
	instagramUrl: string;
	youtubeUrl: string;
	tiktokUrl: string;
	otherSocials: Social[];
	createdAt: Date;
	updatedAt: Date;
}
