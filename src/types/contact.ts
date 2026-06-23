import { Types } from "mongoose";
import { ContactFormStatus, Social } from "./shared";
import { BuildArea, BuildPlan } from "./project";
import { IMedia } from "./media";

export interface IContactForm {
	_id: Types.ObjectId;
	fullName: string;
	phone: string;
	planningToBuild: string;
	buildPlan: BuildPlan;
	area: BuildArea;
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
	bannerId: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

export interface IContactConfigPopulated extends Omit<
	IContactConfig,
	"bannerId"
> {
	bannerId?: IMedia;
}

export const EArea = {
	under: { value: 'under', label: 'Dưới 70m²', color: 'green' },
	between: { value: 'between', label: '70-100m²', color: 'blue' },
	above: { value: 'above', label: 'Trên 100m²', color: 'purple' },
}

export const EContactFormStatus = {
	new: { value: 'new', label: 'Mới', color: "blue" },
	contacted: { value: 'contacted', label: 'Đã liên hệ', color: "orange" },
	processed: { value: 'processed', label: 'Đã xử lý', color: "green" },
}
