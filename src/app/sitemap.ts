import type { MetadataRoute } from "next";
import { getPublishedNews, getPublishedProjects, getRecruitingJobs } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, news, jobs] = await Promise.all([
    getPublishedProjects(100),
    getPublishedNews(100),
    getRecruitingJobs(100),
  ]);

  return [
    "", "gioi-thieu", "du-an", "tin-tuc", "hop-tac", "tuyen-dung", "lien-he",
  ].map((path) => ({ url: siteUrl(`/${path}`) }))
    .concat(projects.map((item) => ({ url: siteUrl(`/du-an/${item.slug}`), lastModified: item.updatedAt })))
    .concat(news.map((item) => ({ url: siteUrl(`/tin-tuc/${item.slug}`), lastModified: item.updatedAt })))
    .concat(jobs.map((item) => ({ url: siteUrl(`/tuyen-dung/${item.slug}`), lastModified: item.updatedAt })));
}
