"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ConcreteBg from "@/assets/images/concrete-bg.jpg";
import { capitalize } from "@/helpers";
import { IconButton, Typography } from "@mui/material";
import FadeIn from "../FadeIn";
import { GridFadeIn } from "../base/Grid";
import { EBuildPlan, IProjectPopulated } from "@/types/project";
import { TypographyFadeIn } from "../base/Typography";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ({ projects }: { projects: IProjectPopulated[] }) {
	const hasProjects = projects?.length > 0;
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const updateScrollState = () => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 4);
		setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
	};

	useEffect(() => {
		updateScrollState();
		const el = scrollRef.current;
		if (!el) return;
		el.addEventListener("scroll", updateScrollState, { passive: true });
		window.addEventListener("resize", updateScrollState);
		return () => {
			el.removeEventListener("scroll", updateScrollState);
			window.removeEventListener("resize", updateScrollState);
		};
	}, [projects]);

	const scrollByAmount = (direction: "left" | "right") => {
		const el = scrollRef.current;
		if (!el) return;
		// Cuộn theo đúng chiều rộng của 1 item (lấy item đầu tiên làm chuẩn)
		const firstItem = el.querySelector<HTMLElement>("[data-project-item]");
		const amount = firstItem ? firstItem.offsetWidth + 20 : el.clientWidth * 0.8;
		el.scrollBy({
			left: direction === "left" ? -amount : amount,
			behavior: "smooth",
		});
	};

	return (
		<Box
			component="section"
			sx={{
				backgroundImage: `url(${ConcreteBg.src})`,
				backgroundSize: "cover",
				py: { xs: 6, md: 8 },
				px: { xs: 4, md: 4 },
			}}
		>
			<>
				{/* Section label */}
				<Container maxWidth="lg">
					<TypographyFadeIn
						sx={{
							color: "#5a6a8a",
							fontSize: 12,
							fontWeight: 600,
							letterSpacing: "0.05em",
							textTransform: "uppercase",
							lineHeight: "1.05",
							mb: 2,
						}}
						fadeInDirection="left"
					>
						Dự án
					</TypographyFadeIn>
					<TypographyFadeIn
						sx={{
							color: "#1c1c1c",
							fontSize: 23,
							fontWeight: 600,
							lineHeight: "1.5",
							mb: 5,
						}}
						fadeInDirection="left"
					>
						Dự án nổi bật tại Nurarchitects
					</TypographyFadeIn>
				</Container>

				{hasProjects ? (
					<>
						<Box sx={{ position: "relative" }}>
							{/* Nút trái */}
							<IconButton
								onClick={() => scrollByAmount("left")}
								disabled={!canScrollLeft}
								sx={{
									display: { xs: "flex", sm: "none" },
									position: "absolute",
									left: 4,
									top: "50%",
									transform: "translateY(-50%)",
									zIndex: 3,
									bgcolor: "rgba(255,255,255,0.9)",
									boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
									"&:hover": { bgcolor: "#fff" },
									"&.Mui-disabled": { opacity: 0, pointerEvents: "none" },
								}}
							>
								<ChevronLeft size={20} />
							</IconButton>

							{/* Nút phải */}
							<IconButton
								onClick={() => scrollByAmount("right")}
								disabled={!canScrollRight}
								sx={{
									display: { xs: "flex", sm: "none" },
									position: "absolute",
									right: 4,
									top: "50%",
									transform: "translateY(-50%)",
									zIndex: 3,
									bgcolor: "rgba(255,255,255,0.9)",
									boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
									"&:hover": { bgcolor: "#fff" },
									"&.Mui-disabled": { opacity: 0, pointerEvents: "none" },
								}}
							>
								<ChevronRight size={20} />
							</IconButton>

							{/* Carousel / Grid container */}
							<Box
								ref={scrollRef}
								sx={{
									display: { xs: "flex", sm: "grid" },
									gridTemplateColumns: {
										sm: "repeat(auto-fit, minmax(280px, 360px))",
									},
									gap: 2.5,
									overflowX: { xs: "auto", sm: "visible" },
									scrollSnapType: { xs: "x mandatory", sm: "none" },
									scrollbarWidth: "none",
									"&::-webkit-scrollbar": { display: "none" },
									px: { xs: 2, sm: 0 },
									justifyContent: { sm: "center" },
								}}
							>
								{[...projects, ...projects].map((p, index) => (
									<GridFadeIn
										key={`${String(p._id)}-${index}`}
										fadeInDirection="right"
										delay={0}
										data-project-item
										sx={{
											boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
											flex: { xs: "0 0 100%", sm: "auto" },
											minWidth: { xs: "100%", sm: "auto" },
											maxWidth: { sm: 360 },
											scrollSnapAlign: { xs: "start", sm: "none" },
										}}
									>
										<Link href={`/du-an/${p.slug}`}>
											<Box
												sx={{
													position: "relative",
													aspectRatio: "5/6",
													width: "100%",
													overflow: "hidden",
													cursor: "pointer",
													// Desktop: chỉ hiện khi hover
													"@media (hover: hover)": {
														"&:hover .project-overlay": { opacity: 1 },
														"&:hover .project-img": {
															transform: "scale(1.03)",
														},
														"&:hover .project-info": {
															opacity: 1,
															transform: "translateY(0)",
														},
														"&:hover .project-plus": {
															opacity: 1,
															transform: "translate(-50%, -50%) scale(1)",
														},
													},
												}}
											>
												{/* Ảnh */}
												<Box
													className="project-img"
													sx={{
														position: "absolute",
														inset: 0,
														transition: "transform 0.5s ease",
													}}
												>
													<Image
														src={p?.thumbnailId?.secureUrl || ""}
														alt={p?.name || ""}
														fill
														style={{ objectFit: "cover" }}
													/>
												</Box>

												{/* Overlay đen — mobile: luôn hiện, desktop: hover mới hiện */}
												<Box
													className="project-overlay"
													sx={{
														position: "absolute",
														inset: 0,
														background: "rgb(0 0 0 / 56%)",
														opacity: { xs: 1, sm: 0 },
														transition: "opacity 0.35s ease",
														zIndex: 1,
													}}
												/>

												{/* Dấu + ở giữa — chỉ desktop mới có (mobile ẩn hẳn) */}
												<Box
													className="project-plus"
													sx={{
														display: { xs: "none", sm: "block" },
														position: "absolute",
														top: "50%",
														left: "50%",
														transform: "translate(-50%, -50%) scale(0.7)",
														zIndex: 2,
														opacity: { xs: 1, sm: 0 },
														transition:
															"opacity 0.35s ease, transform 0.35s ease",
														color: "#fff",
														userSelect: "none",
														pointerEvents: "none",
													}}
												>
													<Plus size={120} className="stroke-[0.3px] opacity-30" />
												</Box>

												{/* Text info — mobile: luôn hiện, desktop: hover mới hiện */}
												<Box
													className="project-info"
													sx={{
														position: "absolute",
														bottom: { xs: 24, sm: 40 },
														zIndex: 2,
														color: "#fff",
														opacity: { xs: 1, sm: 0 },
														transform: { xs: "translateY(0)", sm: "translateY(8px)" },
														transition:
															"opacity 0.35s ease, transform 0.35s ease",
														width: "100%",
													}}
												>
													<Typography
														sx={{
															fontSize: { xs: 16, md: 22 },
															fontWeight: 700,
															lineHeight: 1.3,
															mb: 1.6,
															textAlign: "center",
															width: "100%",
														}}
													>
														{capitalize(p?.name || "")}
													</Typography>
													{p?.category && (
														<Typography
															sx={{
																color: "#ffffff8c",
																fontSize: 14,
																opacity: 0.85,
																textAlign: "center",
																width: "100%",
															}}
														>
															Mô hình: {EBuildPlan[p.category].label}
														</Typography>
													)}
												</Box>
											</Box>
										</Link>
									</GridFadeIn>
								))}
							</Box>
						</Box>

						{/* CTA button */}
						<FadeIn direction="up" delay={0.3}>
							<Box
								sx={{
									mt: 5,
									display: "flex",
									justifyContent: "center",
								}}
							>
								<Button
									component="a"
									href={"/du-an"}
									variant="contained"
									sx={{
										backgroundColor: "#c0392b",
										color: "#fff",
										borderRadius: 0,
										px: 6,
										py: 1.2,
										fontSize: 14,
										fontWeight: 600,
										letterSpacing: "0.5px",
										textTransform: "uppercase",
										boxShadow: "none",
										"&:hover": {
											backgroundColor: "#a93226",
											boxShadow: "none",
										},
									}}
								>
									Xem tất cả dự án
								</Button>
							</Box>
						</FadeIn>
					</>
				) : (
					<FadeIn direction="up" delay={0.3}>
						<Typography
							sx={{
								color: "#5a6a8a",
								fontSize: "0.72rem",
								fontWeight: 600,
								letterSpacing: "0.15em",
								textTransform: "uppercase",
								mb: 4,
							}}
						>
							Nurarchitects đang cập nhật Lĩnh vực hoạt động
						</Typography>
					</FadeIn>
				)}
			</>
		</Box>
	);
}
