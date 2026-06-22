import type { UploadFile } from "antd";

export interface AdminMediaItem {
  _id: string;
  filename?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  secureUrl?: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  folder?: string;
  alt?: string;
  caption?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MediaUploadFile = UploadFile & {
  mediaId?: string;
};

export function mediaToUploadFile(media: AdminMediaItem): MediaUploadFile {
  return {
    uid: media._id,
    name: media.originalName ?? media.filename ?? media._id,
    status: "done",
    url: media.secureUrl ?? media.url,
    mediaId: media._id,
  };
}

export function mediaToOgImageUrl(media: AdminMediaItem) {
  return media.secureUrl ?? media.url ?? "";
}
