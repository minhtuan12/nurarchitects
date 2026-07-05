"use client";

import Link from "next/link";
import { Box, Grid, Pagination, PaginationItem, Stack, Typography } from "@mui/material";
import MediaRenderer from "@/components/MediaRenderer";
import type { IMedia } from "@/types/media";
import { ClockCircleFilled } from "@ant-design/icons";
import { formatDate } from "@/lib/utils";
import { INewsPopulated } from "@/types/news";
import { withQueryString } from "@/helpers";

interface NewsSectionProps {
	news: INewsPopulated[];
	page: number;
	pageCount: number;
	basePath?: string;
	queryString?: string;
}

const clampStyle = (lines: number) => ({
	display: "-webkit-box",
	WebkitLineClamp: lines,
	WebkitBoxOrient: "vertical" as const,
	overflow: "hidden",
});

function PostDate({ date }: { date: string }) {
	return (
		<Stack
			direction="row"
			spacing={0.75}
			alignItems="center"
			sx={{ color: "text.secondary" }}
		>
			<ClockCircleFilled className="text-[#5e657b] text-[16px]" />
			<Typography
				sx={{
					color: "#5e657b",
					fontSize: 12,
				}}
			>
				{formatDate(date)}
			</Typography>
		</Stack>
	);
}

function buildPageHref(basePath: string, targetPage: number, queryString?: string) {
	const path = targetPage <= 1 ? basePath : `${basePath}/trang/${targetPage}`;
	return withQueryString(path, queryString);
}

export default function NewsSection({
	news,
	page,
	pageCount,
	basePath = "/tin-tuc",
	queryString,
}: NewsSectionProps) {
	const [featured, ...rest] = news;

	if (!featured) return null;

	return (
		<Box>
			{/* Bài viết nổi bật */}
			<Box
				component={Link}
				href={withQueryString(`${basePath}/${featured.slug}`, queryString)}
				sx={{
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					textDecoration: "none",
					color: "inherit",
					mb: { xs: 4, md: 2.5 },
					height: { xs: 'auto', md: 320 },
				}}
			>
				<Box
					sx={{
						position: "relative",
						width: { xs: "100%", md: "48%" },
						aspectRatio: { xs: "16 / 10", md: "auto" },
						flexShrink: 0,
					}}
				>
					<MediaRenderer
						media={featured.thumbnailId as IMedia}
						controls={false}
						className="h-full"
						fill
						title={featured.title}
					/>
				</Box>
				<Box
					sx={{
						flex: 1,
						bgcolor: "#EBEBEB",
						px: { xs: 3, md: 6 },
						py: { xs: 3, md: 4 },
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						gap: 1.5,
					}}
				>
					<PostDate date={String(featured.createdAt)} />
					<Typography
						variant="h5"
						fontWeight={700}
						fontSize={20}
						sx={{ ...clampStyle(2), lineHeight: 1.35 }}
					>
						{featured.title}
					</Typography>
					{
						!!featured.shortDescription &&
						<Box sx={{ borderTop: "1px solid", borderColor: "#00000024", pt: 2, mt: 2 }}>
							<Typography
								variant="body2"
								color="#3d3d3d"
								sx={clampStyle(2)}
							>
								{featured.shortDescription}
							</Typography>
						</Box>
					}
				</Box>
			</Box>

			{/* Lưới bài viết */}
			<Grid container spacing={2.5}>
				{rest.map((post) => (
					<Grid size={{ xs: 12, sm: 6, md: 3 }} key={String(post._id)} mb={{ xs: 0, md: 3 }}>
						<Box
							component={Link}
							href={withQueryString(`${basePath}/${post.slug}`, queryString)}
							sx={{
								display: "block",
								textDecoration: "none",
								color: "inherit",
							}}
						>
							<Box
								sx={{
									position: "relative",
									width: "100%",
									aspectRatio: "3/2",
									maxHeight: { xs: 'unset', md: 150 },
									overflow: "hidden",
									bgcolor: "#F0F0F0",
								}}
							>
								<MediaRenderer
									media={post.thumbnailId as IMedia}
									controls={false}
									className="h-full"
									fill
									title={post.title}
								/>
							</Box>
							<Box sx={{ mt: 1.5 }}>
								<PostDate date={String(post.createdAt)} />
								<Typography
									variant="body1"
									fontWeight={600}
									sx={{
										...clampStyle(2),
										mt: 1,
										lineHeight: 1.4,
										transition: "color 0.15s ease",
										"&:hover": { color: "primary.main" },
										fontSize: 15,
									}}
								>
									{post.title}
								</Typography>
							</Box>
						</Box>
					</Grid>
				))}
			</Grid>

			{/* Phân trang */}
			{pageCount > 1 && (
				<Stack alignItems="center" sx={{ mt: { xs: 4, md: 6 } }}>
					<Pagination
						page={page}
						count={pageCount}
						shape="rounded"
						siblingCount={1}
						boundaryCount={1}
						renderItem={(item) => {
							const isNavigable =
								item.type === "page" ||
								item.type === "previous" ||
								item.type === "next" ||
								item.type === "first" ||
								item.type === "last";

							if (!isNavigable || !item.page) {
								return <PaginationItem {...item} />;
							}

							return (
								<PaginationItem
									{...item}
									component={Link}
									href={buildPageHref(basePath, item.page, queryString)}
								/>
							);
						}}
						sx={{
							"& .MuiPaginationItem-root": {
								borderRadius: 0.5,
								borderColor: "#D5D5D5",
							},
							"& .MuiPaginationItem-root.Mui-selected": {
								bgcolor: "error.main",
								color: "#fff",
								borderColor: "error.main",
								"&:hover": { bgcolor: "error.dark" },
							},
						}}
					/>
				</Stack>
			)}
		</Box>
	);
}
