import { z } from "zod";
import {
  applicationStatuses,
  buildPlans,
  contactFormStatuses,
  jobStatuses,
  seoEntityTypes,
  visibleStatuses,
  workingTypes,
} from "@/lib/enums";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const objectIdSchema = z.string().regex(objectIdPattern, "Invalid ObjectId");
export const slugSchema = z.string().min(1).max(160).regex(slugPattern, "Invalid slug");
export const htmlSchema = z.string().max(200_000).default("");
export const optionalObjectIdSchema = objectIdSchema.optional().nullable();

export const introductionContentSchema = z.object({
  name: z.string().min(1).max(160),
  description: htmlSchema,
});

export const introductionMemberSchema = z.object({
  imageId: objectIdSchema.optional(),
  name: z.string().min(1).max(160),
  description: htmlSchema,
  experiences: z.array(introductionContentSchema).default([]),
});

export const activityBlockSchema = z.object({
  name: z.string().min(1).max(160),
  description: htmlSchema,
});

export const cooperationStepSchema = z.object({
  order: z.coerce.number().int().min(0),
  name: z.string().min(1).max(160),
  description: htmlSchema,
});

export const socialSchema = z.object({
  name: z.string().min(1).max(80),
  url: z.string().url(),
});

export const mediaCreateSchema = z.object({
  filename: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.coerce.number().int().nonnegative(),
  url: z.string().url(),
  secureUrl: z.string().url().optional(),
  publicId: z.string().min(1).optional(),
  resourceType: z.enum(["image", "video", "raw", "auto"]).default("image"),
  format: z.string().optional(),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
  duration: z.coerce.number().nonnegative().optional(),
  folder: z.string().optional(),
  alt: z.string().max(180).optional(),
  caption: z.string().max(500).optional(),
});

export const homepageConfigSchema = z.object({
  bannerMediaId: optionalObjectIdSchema,
  introduction: htmlSchema,
  featuredProjectIds: z.array(objectIdSchema).default([]),
  featuredInteriorProductIds: z.array(objectIdSchema).default([]),
  activities: z.array(activityBlockSchema).default([]),
  contactCtaContent: htmlSchema,
  mediaIds: z.array(objectIdSchema).default([]),
});

export const introductionConfigSchema = z.object({
  content: htmlSchema,
  history: z.array(introductionContentSchema).default([]),
  vision: z.array(introductionContentSchema).default([]),
  mission: z.array(introductionContentSchema).default([]),
  coreValues: z.array(introductionContentSchema).default([]),
  achievements: z.array(introductionContentSchema).default([]),
  members: z.array(introductionMemberSchema).default([]),
  imageIds: z.array(objectIdSchema).default([]),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(160),
  slug: slugSchema,
  isDeleted: z.boolean().default(false),
});

export const projectSchema = z.object({
  name: z.string().min(1).max(180),
  slug: slugSchema,
  shortDescription: z.string().max(500).default(""),
  description: htmlSchema,
  thumbnailId: optionalObjectIdSchema,
  galleryMediaIds: z.array(objectIdSchema).default([]),
  address: z.string().max(250).default(""),
  area: z.coerce.number().nonnegative().optional(),
  implementationYear: z.coerce.number().int().min(1900).max(2200).optional(),
  category: z.enum(buildPlans).default("home"),
  status: z.enum(visibleStatuses).default("draft"),
  isFeatured: z.boolean().default(false),
});

const activityShape = {
  name: z.string().min(1).max(180),
  slug: slugSchema,
  shortDescription: z.string().max(500),
  description: htmlSchema,
  thumbnailId: optionalObjectIdSchema,
  galleryMediaIds: z.array(objectIdSchema),
  order: z.coerce.number().int().min(0),
  status: z.enum(visibleStatuses),
};

// Dùng khi tạo mới — có default cho field optional
export const activitySchema = z.object({
  ...activityShape,
  shortDescription: activityShape.shortDescription.default(""),
  galleryMediaIds: activityShape.galleryMediaIds.default([]),
  order: activityShape.order.default(0),
  status: activityShape.status.default("draft"),
});

// Dùng khi update (PATCH) — không default, giữ nguyên field nào không gửi
export const activityUpdateSchema = z.object(activityShape).partial();

export const newsSchema = z.object({
  title: z.string().min(1).max(220),
  slug: slugSchema,
  shortDescription: z.string().max(500).default(""),
  description: htmlSchema,
  thumbnailId: optionalObjectIdSchema,
  categoryId: optionalObjectIdSchema,
  relatedNewsIds: z.array(objectIdSchema).default([]),
  status: z.enum(visibleStatuses).default("draft"),
});

export const contactFormSchema = z.object({
  fullName: z.string().min(1).max(120),
  phone: z.string().min(7).max(32),
  planningToBuild: z.string().max(200).default(""),
  buildPlan: z.enum(buildPlans),
  area: z.string().max(80).default(""),
  floors: z.coerce.number().int().min(0).optional(),
  address: z.string().max(250).default(""),
  specialRequirement: z.string().max(2000).default(""),
  status: z.enum(contactFormStatuses).default("new"),
});

export const locationSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Tên địa điểm là bắt buộc").max(200),
  address: z.string().max(2000).default(""),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
 
export const contactConfigSchema = z.object({
  phone: z.string().max(60).default(""),
  email: z.email().or(z.literal("")).default(""),
  locations: z.array(locationSchema).default([]),
  facebookUrl: z.url().or(z.literal("")).default(""),
  instagramUrl: z.url().or(z.literal("")).default(""),
  youtubeUrl: z.url().or(z.literal("")).default(""),
  tiktokUrl: z.url().or(z.literal("")).default(""),
  otherSocials: z.array(socialSchema).default([]),
});

export const cooperationConfigSchema = z.object({
  introduction: htmlSchema,
  steps: z.array(cooperationStepSchema).default([]),
  imageIds: z.array(objectIdSchema).default([]),
  firstCtaBtn: z.string().max(120).default(""),
  secondCtaBtn: z.string().max(120).default(""),
  thirdCtaBtn: z.string().max(120).default(""),
});

export const departmentSchema = z.object({
  name: z.string().min(1).max(160),
});

export const jobSchema = z.object({
  title: z.string().min(1).max(180),
  slug: slugSchema,
  departmentId: optionalObjectIdSchema,
  description: htmlSchema,
  requirements: htmlSchema,
  benefits: htmlSchema,
  workingTime: z.string().max(160).default(""),
  workingType: z.enum(workingTypes),
  workingAddress: z.string().max(250).default(""),
  contacts: htmlSchema,
  salary: z.string().max(120).default(""),
  deadline: z.coerce.date().optional(),
  status: z.enum(jobStatuses).default("recruiting"),
});

export const applicationSchema = z.object({
  jobId: objectIdSchema,
  fullName: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(32),
  resumeId: optionalObjectIdSchema,
  status: z.enum(applicationStatuses).default("new"),
  adminNote: z.string().max(2000).default(""),
});

export const seoSettingSchema = z.object({
  entityId: optionalObjectIdSchema,
  entityType: z.enum(seoEntityTypes),
  title: z.string().min(1).max(180),
  slug: slugSchema,
  description: z.string().max(320).default(""),
  ogImage: z.string().url().or(z.literal("")).default(""),
  canonicalUrl: z.string().url().or(z.literal("")).default(""),
  focusKeywords: z.array(z.string().min(1).max(80)).default([]),
});

export const partial = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => schema.partial();
