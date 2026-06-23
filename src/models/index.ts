import mongoose, { Schema, type Model } from "mongoose";
import {
  applicationStatuses,
  buildAreas,
  buildPlans,
  contactFormStatuses,
  jobStatuses,
  seoEntityTypes,
  visibleStatuses,
  workingTypes,
} from "@/lib/enums";
import { EBuildPlan } from "@/types/project";

const objectId = Schema.Types.ObjectId;

const introductionContentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const activityBlockSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const cooperationStepSchema = new Schema(
  {
    order: { type: Number, required: true, default: 0 },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const socialSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

function model<T>(name: string, schema: Schema<T>) {
  return (mongoose.models[name] as Model<T> | undefined) ?? mongoose.model<T>(name, schema);
}

const MediaSchema = new Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    secureUrl: { type: String },
    publicId: { type: String, index: true },
    resourceType: { type: String, enum: ["image", "video", "raw", "auto"], default: "image" },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    folder: { type: String },
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
  },
  { timestamps: true },
);

const HomepageConfigSchema = new Schema(
  {
    _type: { type: String, required: true, default: "homepage", immutable: true, unique: true },
    bannerMediaId: { type: objectId, ref: "Media" },
    introductionContent: { type: String, default: "" },
    introductionTitle: { type: String, default: "" },
    featuredProjectIds: [{ type: objectId, ref: "Project" }],
    featuredInteriorProductIds: [{ type: objectId }],
    activities: [{ type: objectId, ref: "Activity" }],
    contactCtaContent: { type: String, default: "" },
    mediaIds: [{ type: objectId, ref: "Media" }],
  },
  { timestamps: true },
);

const IntroductionConfigSchema = new Schema(
  {
    _type: { type: String, required: true, default: "introduction", immutable: true, unique: true },
    content: { type: String, default: "" },
    history: { type: [introductionContentSchema], default: [] },
    vision: { type: [introductionContentSchema], default: [] },
    mission: { type: [introductionContentSchema], default: [] },
    coreValues: { type: [introductionContentSchema], default: [] },
    achievements: { type: [introductionContentSchema], default: [] },
    imageIds: [{ type: objectId, ref: "Media" }],
  },
  { timestamps: true },
);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    thumbnailId: { type: objectId, ref: "Media" },
    galleryMediaIds: [{ type: objectId, ref: "Media" }],
    address: { type: String, default: "" },
    area: { type: Number },
    implementationYear: { type: Number },
    category: { enum: Object.values(EBuildPlan).map(p => p.value) },
    status: { type: String, enum: visibleStatuses, default: "draft", index: true },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

const ActivitySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    thumbnailId: { type: objectId, ref: "Media" },
    galleryMediaIds: [{ type: objectId, ref: "Media" }],
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: visibleStatuses, default: "draft", index: true },
  },
  { timestamps: true },
);

const NewsSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    thumbnailId: { type: objectId, ref: "Media" },
    categoryId: { type: objectId, ref: "NewsCategory" },
    relatedNewsIds: [{ type: objectId, ref: "News" }],
    status: { type: String, enum: visibleStatuses, default: "draft", index: true },
  },
  { timestamps: true },
);

const ContactFormSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    planningToBuild: { type: String, default: "" },
    buildPlan: { type: String, enum: buildPlans, required: true },
    area: { type: String, enum: buildAreas, required: true },
    floors: { type: Number },
    address: { type: String, default: "" },
    specialRequirement: { type: String, default: "" },
    status: { type: String, enum: contactFormStatuses, default: "new", index: true },
  },
  { timestamps: true },
);

const LocationSchema = new Schema(
  {
    name: { type: String, required: true, default: "" }, // Tên địa điểm, ví dụ: "Văn phòng Hà Nội"
    address: { type: String, default: "" }, // Địa chỉ dạng text hiển thị
    lat: { type: Number, required: true }, // Vĩ độ
    lng: { type: Number, required: true }, // Kinh độ
  },
  { _id: true }, // mỗi địa điểm có _id riêng để sửa/xoá trên UI
);

const ContactConfigSchema = new Schema(
  {
    _type: { type: String, required: true, default: "contact", immutable: true, unique: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    locations: { type: [LocationSchema], default: [] },
    facebookUrl: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    tiktokUrl: { type: String, default: "" },
    otherSocials: { type: [socialSchema], default: [] },
    bannerId: { type: objectId, ref: "Media" },
  },
  { timestamps: true },
);

const CooperationConfigSchema = new Schema(
  {
    _type: { type: String, required: true, default: "cooperation", immutable: true, unique: true },
    introduction: { type: String, default: "" },
    steps: { type: [cooperationStepSchema], default: [] },
    imageIds: [{ type: objectId, ref: "Media" }],
    firstCtaBtn: { type: String, default: "" },
    secondCtaBtn: { type: String, default: "" },
    thirdCtaBtn: { type: String, default: "" },
  },
  { timestamps: true },
);

const DepartmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const JobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    departmentId: { type: objectId, ref: "Department" },
    description: { type: String, default: "" },
    requirements: { type: String, default: "" },
    benefits: { type: String, default: "" },
    workingTime: { type: String, default: "" },
    workingType: { type: String, enum: workingTypes, required: true },
    workingAddress: { type: String, default: "" },
    contacts: { type: String, default: "" },
    salary: { type: String, default: "" },
    deadline: { type: Date },
    status: { type: String, enum: jobStatuses, default: "recruiting", index: true },
  },
  { timestamps: true },
);

const ApplicationSchema = new Schema(
  {
    jobId: { type: objectId, ref: "Job", required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    resumeId: { type: objectId, ref: "Media" },
    status: { type: String, enum: applicationStatuses, default: "new", index: true },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true },
);

const SeoSettingSchema = new Schema(
  {
    entityId: { type: objectId },
    entityType: { type: String, enum: seoEntityTypes, required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    canonicalUrl: { type: String, default: "" },
    focusKeywords: [{ type: String }],
  },
  { timestamps: true },
);

const AdminUserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const Media = model("Media", MediaSchema);
export const HomepageConfig = model("HomepageConfig", HomepageConfigSchema);
export const IntroductionConfig = model("IntroductionConfig", IntroductionConfigSchema);
export const Project = model("Project", ProjectSchema);
export const Activity = model("Activity", ActivitySchema);
export const NewsCategory = model("NewsCategory", CategorySchema.clone());
export const News = model("News", NewsSchema);
export const ContactForm = model("ContactForm", ContactFormSchema);
export const ContactConfig = model("ContactConfig", ContactConfigSchema);
export const CooperationConfig = model("CooperationConfig", CooperationConfigSchema);
export const Department = model("Department", DepartmentSchema);
export const Job = model("Job", JobSchema);
export const Application = model("Application", ApplicationSchema);
export const SeoSetting = model("SeoSetting", SeoSettingSchema);
export const AdminUser = model("AdminUser", AdminUserSchema);

export const registry = {
  media: Media,
  homepage: HomepageConfig,
  introduction: IntroductionConfig,
  projects: Project,
  activities: Activity,
  newsCategories: NewsCategory,
  news: News,
  contactForms: ContactForm,
  contact: ContactConfig,
  cooperation: CooperationConfig,
  departments: Department,
  jobs: Job,
  applications: Application,
  seoSettings: SeoSetting,
  adminUsers: AdminUser,
};
