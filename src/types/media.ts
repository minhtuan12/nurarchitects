import { ResourceType } from "cloudinary";
import { Types } from "mongoose";

export type MediaResourceType = "image" | "video" | "raw" | "auto";

export interface MediaLike {
  _id?: string;
  url?: string;
  secureUrl?: string;
  publicId?: string;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  resourceType?: MediaResourceType;
}

export interface IMedia {
  _id: Types.ObjectId;
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
