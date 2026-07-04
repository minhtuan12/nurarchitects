"use client";

import * as React from "react";
import { Box, Container, Grid, IconButton, Tooltip } from "@mui/material";
import Image from "next/image";
import { RichContent } from "@/components/PageSections";
import { IntroductionMember } from "@/types/introduction";
import { IMedia } from "@/types/media";
import { GridFadeIn } from "@/components/base/Grid";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DirectorSpotlightProps = {
	members: IntroductionMember[];
};

const ITEMS_PER_PAGE = 3;
const DRAG_THRESHOLD = 60; // px kéo tối thiểu để tính là 1 lần chuyển trang

export default function Members({ members }: DirectorSpotlightProps) {
	const firstMember = members[0];

	// ---- Dữ liệu đội ngũ: tính từ item thứ 2 trở đi ----
	const teamMembers = members.slice(1);
	const total = teamMembers.length;

	// ---- State điều khiển carousel ----
	const [dragX, setDragX] = React.useState(0);
	const trackRef = React.useRef<HTMLDivElement>(null);
	const dragState = React.useRef({
		isDragging: false,
		startX: 0,
	});
	const hasMountedRef = React.useRef(false);

	React.useEffect(() => {
		hasMountedRef.current = true;
	}, []);

	const pageCount = total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 0;

	// Điểm bắt đầu (index) của từng trang. Trang cuối luôn "ghim" về total - 3
	// để tự mượn các item ngay phía trước bù vào cho đủ 3, thay vì để trống hoặc lặp lộn xộn.
	const pageStarts = React.useMemo(() => {
		if (total === 0) return [0];
		return Array.from({ length: pageCount }, (_, page) => {
			const raw = page * ITEMS_PER_PAGE;
			const maxStart = Math.max(total - ITEMS_PER_PAGE, 0);
			return Math.min(raw, maxStart);
		});
	}, [pageCount, total]);

	const [activePage, setActivePage] = React.useState(0);
	const startIndex = pageStarts[activePage] ?? 0;

	// Lấy đúng 3 item hiển thị theo trang hiện tại
	const visibleItems = React.useMemo(() => {
		if (total === 0) return [];
		const count = Math.min(ITEMS_PER_PAGE, total);
		return Array.from({ length: count }, (_, i) => {
			const index = startIndex + i;
			return { item: teamMembers[index], index };
		});
	}, [teamMembers, startIndex, total]);

	const goToPage = React.useCallback(
		(page: number) => {
			if (pageCount === 0) return;
			setActivePage(((page % pageCount) + pageCount) % pageCount);
		},
		[pageCount],
	);

	const goNext = React.useCallback(() => {
		if (pageCount === 0) return;
		setActivePage((prev) => (prev + 1) % pageCount);
	}, [pageCount]);

	const goPrev = React.useCallback(() => {
		if (pageCount === 0) return;
		setActivePage((prev) => (prev - 1 + pageCount) % pageCount);
	}, [pageCount]);

	// ---- Kéo chuột để lướt (pointer events, hoạt động cả chuột lẫn cảm ứng) ----
	const handlePointerDown = (e: React.PointerEvent) => {
		dragState.current.isDragging = true;
		dragState.current.startX = e.clientX;
		trackRef.current?.setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: React.PointerEvent) => {
		if (!dragState.current.isDragging) return;
		setDragX(e.clientX - dragState.current.startX);
	};

	const endDrag = (e: React.PointerEvent) => {
		if (!dragState.current.isDragging) return;
		dragState.current.isDragging = false;
		trackRef.current?.releasePointerCapture(e.pointerId);

		if (dragX <= -DRAG_THRESHOLD) {
			goNext();
		} else if (dragX >= DRAG_THRESHOLD) {
			goPrev();
		}
		setDragX(0);
	};

	return (
		<>
			<Box
				component="section"
				sx={{
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Ảnh nền bên phải */}
				<Box
					sx={{
						position: "absolute",
						inset: 0,
						zIndex: 0,
					}}
				>
					{firstMember?.imageId && (
						<Image
							src={
								(firstMember?.imageId as IMedia)
									?.secureUrl as string
							}
							alt={firstMember?.name}
							fill
							priority
							style={{
								objectFit: "cover",
								objectPosition: "right center",
							}}
						/>
					)}
					{/* Gradient phủ tối bên trái để chữ dễ đọc */}
					<Box
						sx={{
							position: "absolute",
							inset: 0,
							background: {
								xs: "linear-gradient(180deg, rgba(10,16,33,0.92) 0%, rgba(10,16,33,0.88) 60%, rgba(10,16,33,0.7) 100%)",
								md: "linear-gradient(90deg, #162951 0%, #1d2d51 45%, transparent 100%)",
							},
						}}
					/>
				</Box>

				<Container
					maxWidth="lg"
					sx={{
						position: "relative",
						zIndex: 1,
						py: { xs: 8, md: 12 },
					}}
				>
					<GridFadeIn fadeInDirection="left" sx={{ maxWidth: "md" }}>
						<Box
							component="p"
							sx={{
								fontSize: 12,
								fontWeight: 700,
								letterSpacing: "0.05em",
								textTransform: "uppercase",
								color: "#9199b0",
								mb: 4,
							}}
						>
							{firstMember?.name}
						</Box>

						<RichContent
							className="text-justify"
							html={firstMember?.description || ""}
							sx={{
								"& p": { m: 0 },
								fontSize: { xs: 20, md: 23 },
								fontWeight: 300,
								lineHeight: 1.5,
								color: "#ffffff",
								mb: { xs: 5, md: 6 },
							}}
						/>
					</GridFadeIn>

					<Box sx={{ height: 40 }} />

					<GridFadeIn
						fadeInDirection="up"
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(3, minmax(0, 280px))",
							},
							gap: 2.5,
						}}
					>
						{firstMember?.experiences?.map((item, index) => (
							<Box
								key={index}
								sx={{
									border: "1px solid rgba(255, 255, 255, 0.12)",
									borderRadius: 1,
									px: 3,
									pb: 3.5,
									pt: 2.5,
									textAlign: "center",
									backdropFilter: "blur(2px)",
								}}
							>
								<Box
									component="h3"
									sx={{
										fontSize: 19,
										fontWeight: 700,
										color: "#ffffff",
										m: 0,
										mb: 1.5,
									}}
								>
									{item.name}
								</Box>
								<RichContent
									html={item.description || ""}
									className="text-[14px] text-[rgba(255,255,255,0.65)] m-0"
								/>
							</Box>
						))}
					</GridFadeIn>
				</Container>
			</Box>

			<Box
				sx={{
					borderTop: "1px solid #4d5a7a",
				}}
			>
				<Container
					maxWidth="lg"
					sx={{
						py: { xs: 8, md: 12 },
					}}
				>
					{total > 0 && (
						<>
							<Box
								component="p"
								sx={{
									fontSize: 12,
									fontWeight: 700,
									letterSpacing: "0.05em",
									textTransform: "uppercase",
									color: "#9199b0",
									mb: 4,
								}}
							>
								Đội ngũ nhân sự chủ chốt
							</Box>

							<Box sx={{ position: "relative" }} height={{ lg: 700 }}>
								{/* Track kéo/lướt */}
								<Box
									ref={trackRef}
									onPointerDown={handlePointerDown}
									onPointerMove={handlePointerMove}
									onPointerUp={endDrag}
									onPointerLeave={endDrag}
									onPointerCancel={endDrag}
									sx={{
										display: "grid",
										gridTemplateColumns: {
											xs: "1fr",
											sm: `repeat(${Math.min(ITEMS_PER_PAGE, total)}, 1fr)`,
										},
										gap: 3,
										cursor: dragState.current.isDragging
											? "grabbing"
											: "grab",
										userSelect: "none",
										touchAction: "pan-y",
										transform: `translateX(${dragX}px)`,
										transition: dragState.current.isDragging
											? "none"
											: "transform 0.35s ease",
									}}
								>
									{visibleItems.map(
										({ item, index }, position) => {
											const content = (
												<>
													<Box
														sx={{
															position: "relative",
															width: '100%',
															aspectRatio: "1 / 1",
															borderRadius: 1,
															height: 450,
															overflow: "hidden",
															mb: 2.5,
															bgcolor:
																"rgba(255,255,255,0.06)",
															boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
														}}
													>
														{item?.imageId && (
															<Image
																src={
																	(
																		item.imageId as IMedia
																	)
																		?.secureUrl as string
																}
																alt={item.name}
																fill
																draggable={false}
																style={{
																	objectFit: "cover",
																}}
															/>
														)}
													</Box>

													<Box
														component="h3"
														sx={{
															fontSize: 19,
															fontWeight: 700,
															color: "#ffffff",
															m: 0,
															mb: 1.5,
															height: 50,
														}}
													>
														{item?.name}
													</Box>

													<Tooltip title={<RichContent
														className="text-justify !text-[rgba(255,255,255,0.55)] [&_li]:-mb-2.5"
														html={item.description || ""}
													/>}>
														<RichContent
															className="text-justify text-[15px] !text-[rgba(255,255,255,0.55)] [&_li]:-mb-2.5 line-clamp-5"
															html={item.description || ""}
														/>
													</Tooltip>

													{/* {position === 1 && (
													<Box
														// component="a"
														// href={`/doi-ngu/${item?.slug ?? item?._id ?? ""}`}
														draggable={false}
														sx={{
															display: "inline-block",
															mt: 2,
															fontSize: 14,
															fontWeight: 600,
															color: "#ffffff",
															textDecoration: "none",
															borderBottom:
																"1px solid rgba(255,255,255,0.6)",
															pb: 0.5,
															"&:hover": {
																borderColor:
																	"#ffffff",
															},
														}}
													>
														Xem chi tiết
													</Box>
												)} */}
												</>
											);

											if (!hasMountedRef.current) {
												return (
													<GridFadeIn fadeInDirection="up" key={index}>
														{content}
													</GridFadeIn>
												);
											}

											return <Grid key={index}>{content}</Grid>;
										}
									)}
								</Box>

								{/* Nút mũi tên 2 bên */}
								{total > ITEMS_PER_PAGE && (
									<>
										<IconButton
											onClick={goPrev}
											aria-label="Xem nhân sự trước"
											sx={{
												display: {
													xs: "none",
													md: "inline-flex",
												},
												position: "absolute",
												top: "35%",
												left: -56,
												color: "#ffffff",
												bgcolor: "rgba(255,255,255,0.08)",
												"&:hover": {
													bgcolor:
														"rgba(255,255,255,0.18)",
												},
											}}
										>
											<ChevronLeft />
										</IconButton>
										<IconButton
											onClick={goNext}
											aria-label="Xem nhân sự tiếp theo"
											sx={{
												display: {
													xs: "none",
													md: "inline-flex",
												},
												position: "absolute",
												top: "35%",
												right: -56,
												color: "#ffffff",
												bgcolor: "rgba(255,255,255,0.08)",
												"&:hover": {
													bgcolor:
														"rgba(255,255,255,0.18)",
												},
											}}
										>
											<ChevronRight />
										</IconButton>
									</>
								)}
							</Box>

							{/* Chấm tròn điều hướng */}
							{pageCount > 1 && (
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
										gap: 1,
										mt: { xs: 4, md: 5 },
									}}
								>
									{Array.from({ length: pageCount }).map(
										(_, page) => (
											<Box
												key={page}
												component="button"
												onClick={() => goToPage(page)}
												aria-label={`Đến trang ${page + 1}`}
												sx={{
													width: 8,
													height: 8,
													p: 0,
													border: "none",
													borderRadius: "50%",
													cursor: "pointer",
													bgcolor:
														page === activePage
															? "#ffffff"
															: "rgba(255,255,255,0.3)",
													transition:
														"background-color 0.2s ease",
												}}
											/>
										),
									)}
								</Box>
							)}
						</>
					)}
				</Container>
			</Box>
		</>
	);
}
