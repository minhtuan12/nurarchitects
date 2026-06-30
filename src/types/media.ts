import { ResourceType } from "cloudinary";
import { Types } from "mongoose";

export type MediaResourceType = "image" | "video" | "raw" | "auto";

export interface IMedia {
  _id: Types.ObjectId | string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  secureUrl?: string;
  publicId?: string;
  resourceType: ResourceType;
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  folder?: string;
  alt: string;
  caption: string;
  createdAt: Date;
  updatedAt: Date;
}
