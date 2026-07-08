import { Types } from "mongoose";
import { IMedia } from "./media";
import { MediaUploadFile } from "@/components/admin/media/media-upload-file";

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

// ─── NeededField list ─────────────────────────────────────────────────────────

export interface NeededFieldItemState {
	name: string;
	description?: string;
	imageId?: string;
	imageFile?: MediaUploadFile;
}

export interface NeededFieldListProps {
	fields: NeededFieldItemState[];
	onChange: (fields: NeededFieldItemState[]) => void;
	disabled?: boolean;
}

export interface CooperationStep {
	order: number;
	name: string;
	description: string;
}

export interface ICooperationForm {
	companyName: string;
	contactName: string;
	position: string;
	phone: string;
	email: string;
	mainService: string;
	otherService: string;
	capacityProfileUrl: string;
	catalogueUrl: string;
	productSegmentUrl: string;
	policyUrl: string;
}

export const ECooperationService = {
	demolition: { value: "demolition", label: "Phá dỡ, cọc, cừ" },
	concrete: { value: "concrete", label: "Bê tông thương phẩm" },
	roughConstructionLabor: { value: "roughConstructionLabor", label: "Nhân công xây thô" },
	roughConstructionMaterial: { value: "roughConstructionMaterial", label: "Vật tư phần thô" },
	termiteMoistureElectricProtection: {
		value: "termiteMoistureElectricProtection",
		label: "Chống nồm, mối, tủ điện",
	},
	waterproofing: { value: "waterproofing", label: "Chống thấm" },
	plasterPaint: { value: "plasterPaint", label: "Thạch cao, sơn, bả" },
	woodFlooring: { value: "woodFlooring", label: "Sàn gỗ" },
	tileStone: { value: "tileStone", label: "Gạch, đá" },
	aluminumGlass: { value: "aluminumGlass", label: "Nhôm kính" },
	door: { value: "door", label: "Cửa" },
	stair: { value: "stair", label: "Cầu thang" },
	airConditioner: { value: "airConditioner", label: "Điều hoà" },
	steelInox: { value: "steelInox", label: "Sắt, Inox" },
	interior: { value: "interior", label: "Nội thất" },
	sanitaryKitchenEquipment: {
		value: "sanitaryKitchenEquipment",
		label: "Thiết bị vệ sinh, bếp",
	},
	other: { value: "other", label: "Khác (Ghi rõ sản phẩm/dịch vụ)" },
} as const;

export type CooperationService =
	(typeof ECooperationService)[keyof typeof ECooperationService]["value"];

export const ECooperationFormStatus = {
	new: { value: "new", label: "Mới", color: "blue" },
	contacted: { value: "contacted", label: "Đã liên hệ", color: "gold" },
	in_review: { value: "in_review", label: "Đang xem xét", color: "purple" },
	approved: { value: "approved", label: "Đã duyệt", color: "green" },
	rejected: { value: "rejected", label: "Từ chối", color: "red" },
} as const;

export type CooperationFormStatus =
	(typeof ECooperationFormStatus)[keyof typeof ECooperationFormStatus]["value"];
