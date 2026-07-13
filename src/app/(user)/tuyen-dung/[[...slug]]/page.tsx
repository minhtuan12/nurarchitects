import { notFound, redirect } from "next/navigation";
import { Box, Container } from "@mui/material";
import {
  getJobBySlug,
  getRecruitingJobs,
  getSeoBySlug,
} from "@/lib/content";
import { buildMetadata, jobJsonLd } from "@/lib/seo";
import { buildQueryString } from "@/helpers";
import MediaRenderer from "@/components/MediaRenderer";
import { IMedia } from "@/types/media";
import BannerBreadcrumb from "@/components/layout/BannerBreadcrumb";
import JobSection from "../(components)/JobSection";
import JobDetailSection from "../(components)/JobDetail";
import { JsonLd } from "@/components/JsonLd";

export const runtime = "nodejs";

const PAGE_SIZE = 12;
const basePath = "/tuyen-dung";

type ParsedRoute =
  | { type: "list"; page: number }
  | { type: "detail"; slug: string }
  | null;

/**
 * Phân tích slug thành 1 trong 2 dạng:
 *  - Danh sách (list):  []  |  ["trang", "N"]
 *  - Chi tiết job (detail): [jobSlug]  (1 segment, không phải "trang")
 * Trả về null nếu không khớp -> 404.
 */
function parseRoute(slug: string[] = []): ParsedRoute {
  if (slug.length === 0) {
    return { type: "list", page: 1 };
  }

  if (slug[0] === "trang") {
    if (slug.length !== 2) return null;
    const page = Number(slug[1]);
    if (!Number.isInteger(page) || page < 1) return null;
    return { type: "list", page };
  }

  if (slug.length === 1) {
    return { type: "detail", slug: slug[0] };
  }

  return null;
}

// .../trang/1 luôn dư thừa (trùng nội dung với URL không có /trang/1) -> redirect canonical
function isRedundantPageOneUrl(slug: string[] = []) {
  return (
    slug.length === 2 && slug[0] === "trang" && slug[1] === "1"
  );
}

function toPlainText(html?: string, maxLen = 160) {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ search?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseRoute(slug);
  if (!parsed) return {};

  // SEO riêng cho từng job, không dùng chung getSeoBySlug
  if (parsed.type === "detail") {
    const job = await getJobBySlug(parsed.slug);
    if (!job) return {};

    return buildMetadata({
      title: job.title,
      slug: `${basePath.slice(1)}/${job.slug}`,
      description: toPlainText(job.description) || `Tuyển dụng: ${job.title}`,
      ogImage: (job.thumbnailId as IMedia | undefined)?.secureUrl,
    });
  }

  const seo = await getSeoBySlug("tuyen-dung", "page");
  return buildMetadata({
    title: seo?.title || "Tuyển dụng",
    slug: seo?.slug || "tuyen-dung",
    description:
      seo?.description ||
      "Các vị trí tuyển dụng mới nhất từ Nurarchitects.",
    canonicalUrl: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    focusKeywords: seo?.focusKeywords,
  });
}

export default async function ({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { search } = await searchParams;

  const parsed = parseRoute(slug);
  if (!parsed) notFound();

  const queryString = buildQueryString({ search });

  // /trang/1 luôn dư thừa -> điều hướng về URL gọn, không kèm /trang/1
  if (isRedundantPageOneUrl(slug)) {
    redirect(queryString ? `${basePath}?${queryString}` : basePath);
  }

  // ---- Trang chi tiết job ----
  if (parsed.type === "detail") {
    const job = await getJobBySlug(parsed.slug);
    if (!job) notFound();

    const { items: relatedRaw } = await getRecruitingJobs({ limit: 6 });
    const relatedJobs = relatedRaw
      .filter((j) => j.slug !== job.slug)
      .slice(0, 5);

    return (
      <Box sx={{ py: { xs: 4, md: 8 }, bgcolor: "white" }}>
        <JsonLd data={jobJsonLd(job)} />
        <Container maxWidth="lg">
          <JobDetailSection
            job={job}
            relatedJobs={relatedJobs}
            basePath={basePath}
          />
        </Container>
      </Box>
    );
  }

  // ---- Trang danh sách job ----
  const { page } = parsed;

  const { items, pageCount } = await getRecruitingJobs({
    page,
    limit: PAGE_SIZE,
    search,
  });

  if (page > pageCount) notFound();

  return (
    <>
      <Box sx={{ mt: { xs: "-78px", md: "-115px" } }}>
        <Box
          position="relative"
          sx={{ height: { xs: "400px", md: "600px" } }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "rgb(0 0 0 / 30%)",
              transition: "opacity 0.35s ease",
              zIndex: 10,
            }}
          />
          <MediaRenderer
            media={items?.[0]?.thumbnailId as IMedia}
            autoPlay
            controls={false}
            loop
            className="h-full"
            fill
            title="Nurarchitects tuyển dụng"
          />
          <BannerBreadcrumb
            breadcrumbString="Trang chủ / Tuyển dụng"
            pageTitle="Danh sách tuyển dụng"
          />
        </Box>
        <Box sx={{ py: { xs: 4, md: 8 }, bgcolor: "white" }}>
          <Container maxWidth="lg">
            <JobSection
              jobs={items}
              page={page}
              pageCount={pageCount}
              basePath={basePath}
              queryString={queryString}
            />
          </Container>
        </Box>
      </Box>
    </>
  );
}
