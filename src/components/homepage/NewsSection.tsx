'use client'

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { GridFadeIn } from "../base/Grid";
import FadeIn from "../FadeIn";
import { INewsPopulated } from "@/types/news";
import { ClockCircleFilled } from '@ant-design/icons';

function formatDate(date: string | Date) {
	const d = new Date(date);
	return d.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

export default function NewsSection({ news }: { news: INewsPopulated[] }) {
	const hasNews = news?.length > 0;
	if (!hasNews) return null;

	const [featured, ...rest] = news;
	const gridItems = rest.slice(0, 4);

	return (
		<Box
			component="section"
			sx={{
				bgcolor: "primary.main",
				py: { xs: 6, md: 8 },
				px: { xs: 0, md: 4 },
			}}
		>
			<Container maxWidth="lg">
				{/* Section label */}
				<Typography
					sx={{
						color: "rgba(255,255,255,0.55)",
						fontSize: 12,
						fontWeight: 600,
						letterSpacing: "0.12em",
						textTransform: "uppercase",
						mb: 4,
					}}
				>
					Tin tức - Sự kiện
				</Typography>

				<Grid container spacing={4}>
					{/* ===== Featured news (trái) ===== */}
					<GridFadeIn size={{ xs: 12, lg: 6 }} fadeInDirection="left">
						<Link
							href={`/tin-tuc/${featured.slug}`}
							style={{ textDecoration: "none" }}
						>
							<Box
								sx={{
									position: "relative",
									height: { xs: 180, sm: 280, md: 460 },
									overflow: "hidden",
									cursor: "pointer",
									"&:hover .news-img": {
										transform: "scale(1.04)",
									},
								}}
							>
								<Box
									className="news-img"
									sx={{
										position: "absolute",
										inset: 0,
										transition: "transform 0.5s ease",
									}}
								>
									<Image
										src={featured.thumbnailId?.secureUrl || featured.thumbnailId?.url || ""}
										alt={featured.title}
										fill
										style={{ objectFit: "cover" }}
									/>
								</Box>
							</Box>

							<Box sx={{ mt: 2 }}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 0.8,
										mb: 1,
									}}
								>
									<ClockCircleFilled className="text-[rgba(255,255,255,0.5)] text-[14px]" />
									<Typography
										sx={{
											color: "rgba(255,255,255,0.5)",
											fontSize: 13,
										}}
									>
										{formatDate(featured.createdAt)}
									</Typography>
								</Box>
								<Typography
									sx={{
										color: "#fff",
										fontSize: { xs: 17, md: 16 },
										fontWeight: 700,
										lineHeight: 1.4,
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
									}}
								>
									{featured.title}
								</Typography>
							</Box>
						</Link>
					</GridFadeIn>

					{/* ===== Grid 2x2 (phải) ===== */}
					<GridFadeIn size={{ xs: 12, lg: 6 }} fadeInDirection="right">
						<Grid container spacing={2.5}>
							{gridItems.map((item) => (
								<Grid key={String(item._id)} size={{ xs: 12, sm: 6 }} flexDirection={{ xs: 'row' }}>
									<Link
										href={`/tin-tuc/${item.slug}`}
										style={{ textDecoration: "none" }}
									>
										<Grid display="flex" flexDirection={{ xs: 'row' }} container spacing={{ xs: 1, sm: 0 }}>
											<Grid
												size={{ xs: 4, sm: 12 }}
												sx={{
													position: "relative",
													aspectRatio: "3/2",
													overflow: "hidden",
													cursor: "pointer",
													"&:hover .news-img-sm": {
														transform: "scale(1.04)",
													},
												}}
											>
												<Box
													className="news-img-sm"
													sx={{
														position: "absolute",
														inset: 0,
														transition:
															"transform 0.5s ease",
													}}
												>
													<Image
														src={
															item.thumbnailId
																?.secureUrl || item.thumbnailId?.url || ""
														}
														alt={item.title}
														fill
														style={{
															objectFit: "cover",
														}}
													/>
												</Box>
											</Grid>

											<Grid sx={{ mt: { xs: 0, sm: 1.5 } }} size={{ xs: 8, sm: 12 }}>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 0.8,
														mb: 0.8,
													}}
												>
													<ClockCircleFilled className="text-[rgba(255,255,255,0.5)] text-[14px]" />
													<Typography
														sx={{
															color: "rgba(255,255,255,0.5)",
															fontSize: 12,
														}}
													>
														{formatDate(
															item.createdAt,
														)}
													</Typography>
												</Box>
												<Typography
													sx={{
														color: "#fff",
														fontSize: { xs: 14, md: 14 },
														fontWeight: 700,
														lineHeight: 1.45,
														display: "-webkit-box",
														WebkitLineClamp: 2,
														WebkitBoxOrient:
															"vertical",
														overflow: "hidden",
													}}
												>
													{item.title}
												</Typography>
											</Grid>
										</Grid>
									</Link>
								</Grid>
							))}
						</Grid>
					</GridFadeIn>
				</Grid>

				{/* CTA button */}
				<FadeIn direction="up" delay={0.3}>
					<Box
						sx={{
							mt: { xs: 5, md: 6 },
							display: "flex",
							justifyContent: "center",
						}}
					>
						<Button
							component={Link}
							href="/tin-tuc"
							variant="contained"
							sx={{
								bgcolor: "#c0392b",
								color: "#fff",
								borderRadius: 0,
								px: 6,
								py: 1.2,
								fontSize: 13,
								fontWeight: 600,
								letterSpacing: "0.08em",
								boxShadow: "none",
								textTransform: 'uppercase',
								"&:hover": {
									bgcolor: "#a93226",
									boxShadow: "none",
								},
							}}
						>
							Tìm hiểu thêm
						</Button>
					</Box>
				</FadeIn>
			</Container>
		</Box>
	);
}
