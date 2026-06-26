import { connectDb } from "@/lib/db";
import { serialize } from "@/lib/serialize";
import {
  ContactConfig,
  CooperationConfig,
  HomepageConfig,
  IntroductionConfig,
  Job,
  News,
  Project,
  SeoSetting,
} from "@/models";

function hasDb() {
  return Boolean(process.env.MONGODB_URI);
}

async function tryConnectDb() {
  if (!hasDb()) return false;
  try {
    await connectDb();
    return true;
  } catch (error) {
    console.warn("Content database unavailable", error);
    return false;
  }
}

export async function getHomepage() {
  if (!(await tryConnectDb())) return null;
  return serialize(await HomepageConfig.findOne({ _type: "homepage" }).populate("bannerMediaId mediaIds featuredProjectIds").lean());
}

export async function getIntroduction() {
  if (!(await tryConnectDb())) return null;
  return serialize(await IntroductionConfig.findOne({ _type: "introduction" }).populate("imageIds").lean());
}

export async function getContact() {
  if (!(await tryConnectDb())) return null;
  return serialize(await ContactConfig.findOne({ _type: "contact" }).lean());
}

export async function getCooperation() {
  if (!(await tryConnectDb())) return null;
  return serialize(await CooperationConfig.findOne({ _type: "cooperation" }).populate("imageIds").lean());
}

export async function getPublishedProjects(limit = 24) {
  if (!(await tryConnectDb())) return [];
  return serialize(await Project.find({ status: "published" }).sort({ createdAt: -1 }).limit(limit).populate("thumbnailId").lean());
}

export async function getProjectBySlug(slug: string) {
  if (!(await tryConnectDb())) return null;
  return serialize(await Project.findOne({ slug, status: "published" }).populate("thumbnailId galleryMediaIds").lean());
}

export async function getPublishedNews(limit = 24) {
  if (!(await tryConnectDb())) return [];
  return serialize(await News.find({ status: "published" }).sort({ createdAt: -1 }).limit(limit).populate("thumbnailId").lean());
}

export async function getNewsBySlug(slug: string) {
  if (!(await tryConnectDb())) return null;
  return serialize(await News.findOne({ slug, status: "published" }).populate("thumbnailId relatedNewsIds").lean());
}

export async function getRecruitingJobs(limit = 24) {
  if (!(await tryConnectDb())) return [];
  return serialize(await Job.find({ status: "recruiting" }).sort({ createdAt: -1 }).limit(limit).populate("departmentId").lean());
}

export async function getJobBySlug(slug: string) {
  if (!(await tryConnectDb())) return null;
  return serialize(await Job.findOne({ slug, status: "recruiting" }).populate("departmentId").lean());
}

type SeoEntityType = "post" | "page";

export async function getSeoBySlug(slug: string, entityType: SeoEntityType = "page") {
  if (!(await tryConnectDb())) return null;
  return serialize(await SeoSetting.findOne({ slug, entityType }).lean());
}
