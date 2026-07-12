"use client";

import { Box, Grid, Typography } from "@mui/material";
import { Clock } from "lucide-react";
import Link from "@/components/Link";
import { AppImage } from "@/components/AppImage";
import { INewsPopulated } from "@/types/news";
import { IMedia } from "@/types/media";
import Image from "next/image";

function formatDate(date?: string | Date) {
	if (!date) return "";
	const d = new Date(date);
	const dd = String(d.getDate()).padStart(2, "0");
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const yyyy = d.getFullYear();
	return `${dd}/${mm}/${yyyy}`;
}

export default function NewsResultsGrid({ news }: { news: INewsPopulated[] }) {
	return (
		<Grid container spacing={{ xs: 3, md: 3 }}>
			{news.map((item) => (
				<Grid size={{ xs: 12, sm: 6, md: 3 }} key={String(item._id)}>
					<Link href={`/tin-tuc/chi-tiet/${item.slug}`}>
						<Box>
							{/* Thumbnail */}
							<Box
								sx={{
									position: "relative",
									width: "100%",
									aspectRatio: "4 / 2.5",
									borderRadius: 0.5,
									overflow: "hidden",
									mb: 2,
								}}
							>
								{item.thumbnailId && (
									<Image
										src={item.thumbnailId.secureUrl as string}
										alt={item.title as string}
										fill
										style={{ objectFit: "cover" }}
									/>
								)}
							</Box>

							{/* Ngày đăng */}
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 0.75,
									mb: 1,
									color: "#8a8a8a",
								}}
							>
								<Clock size={18} fill="#8a8a8a" color="white"/>
								<Typography sx={{ fontSize: 13, color: "#8a8a8a" }}>
									{formatDate(item.createdAt as any)}
								</Typography>
							</Box>

							{/* Tiêu đề */}
							<Typography
								sx={{
									fontWeight: 700,
									fontSize: 16,
									lineHeight: 1.4,
									color: "#1a1a1a",
									mb: 1,
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
									"&:hover": { color: "primary.main" },
									transition: "color .2s ease",
								}}
							>
								{item.title as string}
							</Typography>

							{/* Mô tả ngắn */}
							{item.shortDescription && (
								<Typography
									sx={{
										fontSize: 14,
										lineHeight: 1.7,
										color: "#666",
										display: "-webkit-box",
										WebkitLineClamp: 3,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
									}}
								>
									{item.shortDescription as string}
								</Typography>
							)}
						</Box>
					</Link>
				</Grid>
			))}
		</Grid>
	);
}
