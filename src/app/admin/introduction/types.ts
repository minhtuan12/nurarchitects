import { MediaUploadFile } from "@/components/admin/media/media-upload-file";

export interface ContentItem {
  name: string;
  description: string;
}

export interface Experience {
  name: string;
  description: string;
}

export interface MemberItem {
  imageId?: string;
  imageFile?: MediaUploadFile;
  name: string;
  description: string;
  experiences: Experience[];
}
