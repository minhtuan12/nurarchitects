import { Readable } from "node:stream";
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";
import { buildCloudinaryUrl } from "@/lib/cloudinary-url";

export type UploadResourceType = "image" | "video" | "raw" | "auto";

export interface UploadableFile {
  arrayBuffer(): Promise<ArrayBuffer>;
  type?: string;
  name?: string;
  size?: number;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  resourceType?: UploadResourceType;
}

export function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary environment variables");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

async function fileToBuffer(file: UploadableFile) {
  return Buffer.from(await file.arrayBuffer());
}

function uploadStream(buffer: Buffer, options: UploadApiOptions) {
  const client = configureCloudinary();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = client.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Cloudinary upload failed"));
        return;
      }
      resolve(result);
    });

    Readable.from(buffer).pipe(stream);
  });
}

export function getUploadResourceType(file: Pick<UploadableFile, "type" | "size">, explicit?: UploadResourceType) {
  if (explicit) {
    return explicit;
  }
  if (file.type?.startsWith("video/")) {
    return "video";
  }
  if (file.type?.startsWith("image/")) {
    return "image";
  }
  return "raw";
}

export function shouldUseChunkedUpload(file: Pick<UploadableFile, "size" | "type">) {
  return getUploadResourceType(file) === "video" && (file.size ?? 0) >= 50 * 1024 * 1024;
}

export async function uploadImage(file: UploadableFile, options: UploadOptions = {}) {
  return uploadStream(await fileToBuffer(file), {
    folder: options.folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER,
    public_id: options.publicId,
    tags: options.tags,
    resource_type: "image",
    overwrite: false,
  });
}

export async function uploadVideo(file: UploadableFile, options: UploadOptions = {}) {
  return uploadStream(await fileToBuffer(file), {
    folder: options.folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER,
    public_id: options.publicId,
    tags: options.tags,
    resource_type: "video",
    overwrite: false,
  });
}

export async function uploadLargeVideo(file: UploadableFile, options: UploadOptions = {}) {
  const client = configureCloudinary();
  const buffer = await fileToBuffer(file);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = client.uploader.upload_chunked_stream(
      {
        folder: options.folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER,
        public_id: options.publicId,
        tags: options.tags,
        resource_type: "video",
        chunk_size: 6_000_000,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary chunked upload failed"));
          return;
        }
        if (result.done !== false) {
          resolve(result);
        }
      },
    );

    Readable.from(buffer).pipe(stream);
  });
}

export async function uploadAnyMedia(file: UploadableFile, options: UploadOptions = {}) {
  const resourceType = getUploadResourceType(file, options.resourceType);

  if (resourceType === "image") {
    return uploadImage(file, options);
  }

  if (resourceType === "video") {
    return shouldUseChunkedUpload(file) ? uploadLargeVideo(file, options) : uploadVideo(file, options);
  }

  return uploadStream(await fileToBuffer(file), {
    folder: options.folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER,
    public_id: options.publicId,
    tags: options.tags,
    resource_type: resourceType,
    overwrite: false,
  });
}

export async function deleteAsset(publicId: string, resourceType: UploadResourceType = "image") {
  const client = configureCloudinary();
  return client.uploader.destroy(publicId, { resource_type: resourceType });
}

export { buildCloudinaryUrl };
