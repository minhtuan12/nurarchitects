import { Types } from "mongoose";
import { ApplicationStatus, JobStatus, WorkingType } from "./shared";
import { IMedia } from "./media";

export interface IDepartment {
	_id: Types.ObjectId;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IJob {
	_id: Types.ObjectId;
	title: string;
	slug: string;
	departmentId?: Types.ObjectId;
	description: string;
	requirements: string;
	benefits: string;
	workingTime: string;
	workingType: WorkingType;
	workingAddress: string;
	contacts: string;
	salary: string;
	deadline?: Date;
	status: JobStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface IApplication {
	_id: Types.ObjectId;
	jobId: Types.ObjectId;
	fullName: string;
	email: string;
	phone: string;
	resumeId?: Types.ObjectId;
	status: ApplicationStatus;
	adminNote: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IApplicationPopulated extends Omit<
	IApplication,
	"jobId" | "resumeId"
> {
	jobId: IJob;
	resumeId?: IMedia;
}
