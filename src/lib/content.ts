import { connectDb } from "@/lib/db";
import { serialize } from "@/lib/serialize";
import {
  ContactConfig,
  CooperationConfig,
  HomepageConfig,
  IntroductionConfig,
  Job,
  News,
  NewsCategory,
  Project,
  SeoSetting,
  SettingsConfig,
} from "@/models";
import { INewsPopulated } from "@/types/news";
import { defaultSiteSettings, SiteSettings } from "@/types/shared";
import { unstable_cache } from "next/cache";

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

  return serialize(
    await HomepageConfig.findOne({ _type: "homepage" })
      .populate("bannerId")
      .populate("mediaIds")
      .populate([
        {
          path: "featuredProjectIds",
          populate: [
            { path: "thumbnailId", model: "Media" },
            { path: "galleryMediaIds", model: "Media" },
          ],
        },
        {
          path: "activities",
          populate: [
            { path: "thumbnailId", model: "Media" },
            { path: "galleryMediaIds", model: "Media" },
          ],
        },
      ])
      .lean(),
  );
}

export async function getIntroduction() {
  if (!(await tryConnectDb())) return null;
  return serialize(
    await IntroductionConfig.findOne({ _type: "introduction" })
      .populate("bannerId")
      .populate("imageIds")
      .populate([
        { path: "members.imageId", model: "Media" },
      ])
      .lean(),
  );
}

export async function getContact() {
  if (!(await tryConnectDb())) return null;
  return serialize(await ContactConfig.findOne({ _type: "contact" }).lean());
}

export async function getCooperation() {
  if (!(await tryConnectDb())) return null;
  return serialize(await CooperationConfig.findOne({ _type: "cooperation" }).populate("imageIds bannerId neededFields.imageId").lean());
}

export async function getPublishedProjects(limit = 24) {
  if (!(await tryConnectDb())) return [];
  return serialize(await Project.find({ status: "published" }).sort({ createdAt: -1 }).limit(limit).populate("thumbnailId").lean());
}

export async function getProjectBySlug(slug: string) {
  if (!(await tryConnectDb())) return null;
  return serialize(await Project.findOne({ slug, status: "published" }).populate("thumbnailId galleryMediaIds").lean());
}

export async function getNewsCategories() {
  if (!(await tryConnectDb())) return [];
  return serialize(await NewsCategory.find().sort({ createdAt: -1 }).lean());
}

export async function getNewsBySlug(slug: string) {
  if (!(await tryConnectDb())) return null;
  return serialize(await News.findOne({ slug, status: "published" }).populate("thumbnailId relatedNewsIds").lean());
}

export async function getNewsCategoryBySlug(slug: string) {
  if (!(await tryConnectDb())) return null;
  return serialize(await NewsCategory.findOne({ slug }).lean());
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

async function fetchSettingsFromDB(): Promise<SiteSettings | null> {
  if (!(await tryConnectDb())) return null;
  const doc = await SettingsConfig.findOne({ _type: "settings" }).lean<Partial<SiteSettings>>();

  if (!doc) return defaultSiteSettings;

  return {
    primaryColor: doc.primaryColor || defaultSiteSettings.primaryColor,
    // secondaryColor: doc.secondaryColor || defaultSiteSettings.secondaryColor,
    backgroundColor: doc.backgroundColor || defaultSiteSettings.backgroundColor,
    textColor: doc.textColor || defaultSiteSettings.textColor,
    headerBackgroundColor: doc.headerBackgroundColor ?? defaultSiteSettings.headerBackgroundColor,
    footerBackgroundColor: doc.footerBackgroundColor || defaultSiteSettings.footerBackgroundColor,
    footerTextColor: doc.footerTextColor || defaultSiteSettings.footerTextColor,
  };
}

export interface GetPublishedNewsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface PaginatedNews {
  items: INewsPopulated[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getPublishedNews(
  params: GetPublishedNewsParams = {},
): Promise<PaginatedNews> {
  const { page, limit, search, category } = params;

  if (!(await tryConnectDb())) {
    return { items: [], total: 0, page: 1, limit: limit ?? 0, pageCount: 1 };
  }

  const filter: any = { status: "published" };
  if (category) {
    const cat = await getNewsCategoryBySlug(category);
    if (cat?._id) filter.categoryId = String(cat._id);
  }
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: regex }, { excerpt: regex }];
  }

  // Không truyền page/limit/search/category -> lấy toàn bộ, sắp xếp mới nhất
  const hasParams = Boolean(page) || Boolean(limit) || Boolean(search) || Boolean(category);
  if (!hasParams) {
    const items = await News.find(filter)
      .sort({ createdAt: -1 })
      .populate("thumbnailId")
      .lean();
    return {
      items: serialize(items),
      total: items.length,
      page: 1,
      limit: items.length,
      pageCount: 1,
    };
  }

  const pageSize = limit && limit > 0 ? limit : 12;
  const currentPage = page && page > 0 ? page : 1;

  const [items, total] = await Promise.all([
    News.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .populate("thumbnailId")
      .lean(),
    News.countDocuments(filter),
  ]);

  return {
    items: serialize(items),
    total,
    page: currentPage,
    limit: pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Cache theo tag "settings" — mỗi request trong RootLayout sẽ dùng lại kết quả
 * này thay vì query DB mỗi lần render. Khi admin lưu Settings mới, route API
 * sẽ gọi revalidateTag("settings") để cache này tự làm mới ở lần request kế tiếp.
 */
export const getSiteSettings = unstable_cache(
  fetchSettingsFromDB,
  ["site-settings"],
  { tags: ["settings"] },
);
