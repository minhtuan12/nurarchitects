"use client";

import { adminFetch } from "@/components/admin/AdminShell";
import {
  mediaToUploadFile,
  type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import type { ContentItem, MemberItem } from "./types";

export const INTRODUCTION_SEO_SLUG = "gioi-thieu";

export interface IntroductionMemberRecord {
  imageId?: string;
  name: string;
  description: string;
  experiences: ContentItem[];
}

export interface IntroductionSnapshot {
  content: string;
  history: ContentItem[];
  vision: ContentItem[];
  mission: ContentItem[];
  coreValues: ContentItem[];
  achievements: ContentItem[];
  imageIds: string[];
  members: IntroductionMemberRecord[];
}

export interface IntroductionPayload {
  content: string;
  history: ContentItem[];
  vision: ContentItem[];
  mission: ContentItem[];
  coreValues: ContentItem[];
  achievements: ContentItem[];
  imageIds: string[];
  members: IntroductionMemberRecord[];
}

export const idToString = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value)
    return String((value as { _id?: unknown })._id);
  return String(value);
};

export const normalizeContentItems = (items: unknown): ContentItem[] => {
  if (!Array.isArray(items)) return [];
  return items.map((item: any) => ({
    name: item?.name ?? "",
    description: item?.description ?? "",
  }));
};

export const normalizeMemberRecords = (items: unknown): IntroductionMemberRecord[] => {
  if (!Array.isArray(items)) return [];
  return items.map((item: any) => ({
    imageId: item?.imageId,
    name: item?.name ?? "",
    description: item?.description ?? "",
    experiences: normalizeContentItems(item?.experiences),
  }));
};

export const normalizeIntroductionSnapshot = (data: any): IntroductionSnapshot => ({
  content: data?.content ?? "",
  history: normalizeContentItems(data?.history),
  vision: normalizeContentItems(data?.vision),
  mission: normalizeContentItems(data?.mission),
  coreValues: normalizeContentItems(data?.coreValues),
  achievements: normalizeContentItems(data?.achievements),
  imageIds: data?.imageIds,
  members: normalizeMemberRecords(data?.members),
});

export async function loadIntroductionSnapshot(): Promise<IntroductionSnapshot> {
  const res = await adminFetch("/api/admin/introduction", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error ?? "Không thể tải dữ liệu giới thiệu");
  return normalizeIntroductionSnapshot(data?.item ?? data);
}

export async function mediaIdToUploadFile(mediaId: string): Promise<MediaUploadFile> {
  try {
    const res = await adminFetch(`/api/admin/media/${mediaId}`, { cache: "no-store" });
    const data = await res.json();
    const item = data.item;
    return item
      ? mediaToUploadFile({ ...item, _id: mediaId })
      : { uid: mediaId, name: mediaId, status: "done", mediaId };
  } catch {
    return { uid: mediaId, name: mediaId, status: "done", mediaId };
  }
}

export async function uploadMediaFile(file: MediaUploadFile): Promise<string> {
  if (file.mediaId) return file.mediaId;
  if (!file.originFileObj) throw new Error("Missing upload file");

  const formData = new FormData();
  formData.append("file", file.originFileObj);
  formData.append("resourceType", "image");

  const res = await adminFetch("/api/admin/media", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok || data.error || !data.item?._id) {
    throw new Error(data.error ?? "Cannot upload");
  }

  return String(data.item._id);
}

export async function serializeGalleryFiles(files: MediaUploadFile[]): Promise<string[]> {
  return Promise.all(files.map(uploadMediaFile));
}

export async function serializeMemberItems(members: MemberItem[]): Promise<IntroductionMemberRecord[]> {
  return Promise.all(
    members.map(async (member) => {
      const imageId = member.imageFile
        ? await uploadMediaFile(member.imageFile)
        : (typeof member.imageId === 'string' ? member.imageId?.trim() : (member.imageId as any)._id) || undefined;

      return {
        ...(imageId ? { imageId } : {}),
        name: member.name,
        description: member.description,
        experiences: member.experiences.map((experience) => ({
          name: experience.name,
          description: experience.description,
        })),
      };
    }),
  );
}

export function buildIntroductionPayload(
  base: IntroductionSnapshot,
  patch: Partial<IntroductionPayload>,
): IntroductionPayload {
  return {
    content: patch.content ?? base.content,
    history: patch.history ?? base.history,
    vision: patch.vision ?? base.vision,
    mission: patch.mission ?? base.mission,
    coreValues: patch.coreValues ?? base.coreValues,
    achievements: patch.achievements ?? base.achievements,
    imageIds: patch.imageIds ?? base.imageIds,
    members: patch.members ?? base.members,
  };
}

export async function saveIntroductionPayload(
  base: IntroductionSnapshot,
  patch: Partial<IntroductionPayload>,
) {
  const res = await adminFetch("/api/admin/introduction", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(buildIntroductionPayload(base, patch)),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error ?? "Không thể cập nhật dữ liệu giới thiệu");
  }

  return data;
}

export const createEmptyIntroductionSnapshot = (): IntroductionSnapshot => ({
  content: "",
  history: [],
  vision: [],
  mission: [],
  coreValues: [],
  achievements: [],
  imageIds: [],
  members: [],
});
