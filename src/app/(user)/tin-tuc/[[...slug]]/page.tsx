import { notFound, redirect } from "next/navigation";
import { Box, Container } from "@mui/material";
import {
	getPublishedNews,
	getNewsCategoryBySlug,
	getSeoBySlug,
	getNewsBySlug,
} from "@/lib/content";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import NewsSection from "../(components)/NewsSection";
import { buildQueryString } from "@/helpers";
import MediaRenderer from "@/components/MediaRenderer";
import { IMedia } from "@/types/media";
import BannerBreadcrumb from "@/components/layout/BannerBreadcrumb";
import NewsDetail from "../(components)/NewsDetail";
import { JsonLd } from "@/components/JsonLd";

export const runtime = "nodejs";

const PAGE_SIZE = 12;

// ---- Kiểu dữ liệu sau khi parse slug ----
type ParsedNewsRoute =
	| { type: "list"; category?: string; page: number }
	| { type: "detail"; newsSlug: string };

/**
 * Phân tích slug thành route tương ứng cho 5 dạng URL:
 *  []                              -> { type: "list", page: 1 }
 *  ["trang", "2"]                  -> { type: "list", page: 2 }
 *  ["noi-that"]                    -> { type: "list", category: "noi-that", page: 1 }
 *  ["noi-that", "trang", "2"]      -> { type: "list", category: "noi-that", page: 2 }
 *  ["chi-tiet", "bai-viet-abc"]    -> { type: "detail", newsSlug: "bai-viet-abc" }
 * Trả về null nếu slug không khớp bất kỳ dạng nào -> 404.
 *
 * Lưu ý: "trang" và "chi-tiet" là từ khoá dành riêng, KHÔNG được đặt
 * slug category trùng 2 từ này khi tạo category ở admin.
 */
function parseNewsSlug(slug: string[] = []): ParsedNewsRoute | null {
	if (slug.length === 0) {
		return { type: "list", page: 1 };
	}

	// /tin-tuc/chi-tiet/[newsSlug]
	if (slug[0] === "chi-tiet") {
		if (slug.length !== 2 || !slug[1]) return null;
		return { type: "detail", newsSlug: slug[1] };
	}

	if (slug[0] === "trang") {
		if (slug.length !== 2) return null;
		const page = Number(slug[1]);
		if (!Number.isInteger(page) || page < 1) return null;
		return { type: "list", page };
	}

	const category = slug[0];

	if (slug.length === 1) {
		return { type: "list", category, page: 1 };
	}

	if (slug.length === 3 && slug[1] === "trang") {
		const page = Number(slug[2]);
		if (!Number.isInteger(page) || page < 1) return null;
		return { type: "list", category, page };
	}

	return null;
}

// .../trang/1 luôn dư thừa (trùng nội dung với URL không có /trang/1) -> redirect canonical
function isRedundantPageOneUrl(slug: string[] = []) {
	return (
		slug.length >= 2 &&
		slug[slug.length - 2] === "trang" &&
		slug[slug.length - 1] === "1"
	);
}

interface PageProps {
	params: Promise<{ slug?: string[] }>;
	searchParams: Promise<{ search?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	const parsed = parseNewsSlug(slug);
	if (!parsed) return {};

	if (parsed.type === "detail") {
		const news = await getNewsBySlug(parsed.newsSlug);
		if (!news) return {};
		return buildMetadata({
			title: news.seo?.title || news.title,
			slug: `tin-tuc/chi-tiet/${news.slug}`,
			description: news.seo?.description || news.shortDescription,
			canonicalUrl: news.seo?.canonicalUrl,
			ogImage: news.seo?.ogImage || news.thumbnailId?.secureUrl,
			focusKeywords: news.seo?.focusKeywords,
			type: 'article',
		});
	}

	if (parsed.category) {
		const categoryInfo = await getNewsCategoryBySlug(parsed.category);
		if (!categoryInfo) return {};
		return buildMetadata({
			title: categoryInfo.seo?.title || categoryInfo.name,
			slug: `tin-tuc/${parsed.category}`,
		});
	}

	const seo = await getSeoBySlug("tin-tuc", "page");
	return buildMetadata({
		title: seo?.title || "Tin tức",
		slug: seo?.slug || "tin-tuc",
		description:
			seo?.description ||
			"Tin tức, hoạt động và cập nhật mới nhất từ Nurarchitects.",
		canonicalUrl: seo?.canonicalUrl,
		ogImage: seo?.ogImage,
		focusKeywords: seo?.focusKeywords,
	});
}

export default async function NewsPage({ params, searchParams }: PageProps) {
	const { slug } = await params;
	const { search } = await searchParams;

	const parsed = parseNewsSlug(slug);
	if (!parsed) notFound();

	// ---- Nhánh: trang chi tiết bài viết ----
	if (parsed.type === "detail") {
		const news = await getNewsBySlug(parsed.newsSlug);
		if (!news) notFound();
		return <>
			<JsonLd data={articleJsonLd(news)} />
			<NewsDetail news={news} />
		</>
	}

	// ---- Nhánh: trang danh sách (giữ nguyên logic cũ) ----
	const { category, page } = parsed;
	const basePath = category ? `/tin-tuc/${category}` : "/tin-tuc";
	const queryString = buildQueryString({ search });

	// /trang/1 luôn dư thừa -> điều hướng về URL gọn, không kèm /trang/1
	if (isRedundantPageOneUrl(slug)) {
		redirect(queryString ? `${basePath}?${queryString}` : basePath);
	}

	// category không tồn tại trong hệ thống -> 404
	if (category) {
		const categoryInfo = await getNewsCategoryBySlug(category);
		if (!categoryInfo) notFound();
	}

	const { items, pageCount } = await getPublishedNews({
		page,
		limit: PAGE_SIZE,
		search,
		category,
	});

	if (page > pageCount) notFound();

	return (
		<>
			<Box sx={{ mt: { xs: "-78px", md: "-115px" } }}>
				<Box
					position="relative"
					sx={{ height: { xs: "400px", md: "630px" } }}
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
						title="Các dự án tiêu biểu của Nurarchitects"
					/>
					<BannerBreadcrumb
						breadcrumbString="Trang chủ / Tin tức"
						pageTitle="Tin tức"
					/>
				</Box>
				<Box sx={{ py: { xs: 4, md: 8 }, bgcolor: 'white' }}>
					<Container maxWidth="lg">
						<NewsSection
							news={items}
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
