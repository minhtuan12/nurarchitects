import { Types } from "mongoose";

export interface IAdmin {
	_id: Types.ObjectId;
	_type: "admin";
	username: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
}
