"use client";

import * as React from "react";
import { Box, Container, IconButton, useTheme } from "@mui/material";
import Image from "next/image";
import { RichContent } from "@/components/PageSections";
import { IntroductionMember } from "@/types/introduction";
import { IMedia } from "@/types/media";
import { GridFadeIn } from "@/components/base/Grid";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DirectorSpotlightProps = {
	members: IntroductionMember[];
};

// ---- Item cuộn: chỉ mount Image + RichContent thật khi gần vào viewport ----
// Giữ nguyên khung (Box) luôn render để không đổi layout/kích thước -> không gây CLS,
// nhưng trì hoãn phần "nặng" (decode ảnh, sanitize HTML) cho tới khi cần.
function MemberCard({
	item,
	shouldLoadEager,
}: {
	item: IntroductionMember;
	shouldLoadEager: boolean;
}) {
	const cardRef = React.useRef<HTMLDivElement>(null);
	const [isNearViewport, setIsNearViewport] = React.useState(shouldLoadEager);

	React.useEffect(() => {
		if (isNearViewport) return;
		const el = cardRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setIsNearViewport(true);
					observer.disconnect();
				}
			},
			// rootMargin rộng theo chiều ngang vì đây là carousel cuộn ngang
			{ root: null, rootMargin: "0px 600px 0px 600px" }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [isNearViewport]);

	return (
		<Box ref={cardRef} data-member-item>
			<Box
				sx={{
					position: "relative",
					width: "100%",
					borderRadius: 0.5,
					height: 450,
					overflow: "hidden",
					mb: 2.5,
					bgcolor: "rgba(255,255,255,0.06)",
					boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
				}}
			>
				{isNearViewport && item?.imageId && (
					<Image
						src={(item.imageId as IMedia)?.secureUrl as string}
						alt={item.name}
						fill
						draggable={false}
						loading={shouldLoadEager ? undefined : "lazy"}
						sizes="(max-width: 600px) 82vw, 33vw"
						style={{ objectFit: "cover" }}
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

			{/* Bỏ Tooltip: nội dung trùng lặp với phần line-clamp bên dưới,
			    mỗi Tooltip gắn thêm listener mouse/touch/focus cho từng item ->
			    cộng dồn TBT khi có nhiều nhân sự. */}
			{isNearViewport && (
				<RichContent
					className="text-justify text-[15px] !text-[rgba(255,255,255,0.55)] [&_li]:-mb-2.5 line-clamp-5"
					html={item.description || ""}
				/>
			)}
		</Box>
	);
}

export default function Members({ members }: DirectorSpotlightProps) {
	const theme = useTheme();
	const primaryColor = theme.palette.primary.main;

	const firstMember = members[0];

	// ---- Dữ liệu đội ngũ: tính từ item thứ 2 trở đi ----
	const teamMembers = members.slice(1);
	const total = teamMembers.length;

	// ---- Carousel: dùng overflow-x scroll tự nhiên, tất cả item luôn render sẵn ----
	// (đơn giản hơn nhiều so với việc tự tính "trang" + slice item hiển thị,
	// và tránh unmount/remount ảnh mỗi lần chuyển trang gây layout shift)
	const GAP_PX = 24; // tương ứng gap: 3 (theme spacing mặc định 8px)
	const itemsPerViewDesktop = Math.min(3, total) || 1;

	const scrollRef = React.useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = React.useState(false);
	const [canScrollRight, setCanScrollRight] = React.useState(false);
	// isDragging cần là state (không chỉ ref) để trigger re-render tắt/bật
	// scroll-snap — đây là chỗ mấu chốt để thấy item di chuyển mượt khi kéo.
	const [isDragging, setIsDragging] = React.useState(false);

	const dragState = React.useRef({
		startX: 0,
		startScrollLeft: 0,
	});

	const updateScrollState = React.useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 4);
		setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
	}, []);

	React.useEffect(() => {
		updateScrollState();
		const el = scrollRef.current;
		if (!el) return;
		el.addEventListener("scroll", updateScrollState, { passive: true });
		window.addEventListener("resize", updateScrollState);
		return () => {
			el.removeEventListener("scroll", updateScrollState);
			window.removeEventListener("resize", updateScrollState);
		};
	}, [updateScrollState, total]);

	// Cuộn đúng bằng độ rộng khung nhìn (= đúng 3 item + khoảng cách đã canh khít
	// bằng flex-basis calc() bên dưới) -> luôn sang trọn bộ item tiếp theo,
	// không bị cắt dở như khi cuộn theo độ rộng 1 item.
	const scrollByAmount = (direction: "left" | "right") => {
		const el = scrollRef.current;
		if (!el) return;
		const amount = el.clientWidth;
		el.scrollBy({
			left: direction === "left" ? -amount : amount,
			behavior: "smooth",
		});
	};

	// ---- Kéo chuột để lướt (overflow-x scroll không hỗ trợ kéo chuột mặc định) ----
	const handlePointerDown = (e: React.PointerEvent) => {
		const el = scrollRef.current;
		if (!el) return;
		dragState.current = {
			startX: e.clientX,
			startScrollLeft: el.scrollLeft,
		};
		setIsDragging(true);
		el.setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: React.PointerEvent) => {
		const el = scrollRef.current;
		if (!el || !isDragging) return;
		const delta = e.clientX - dragState.current.startX;
		// Set trực tiếp scrollLeft mỗi lần move -> item di chuyển theo tay ngay lập tức.
		// (Trước đó scroll-snap: mandatory làm trình duyệt "níu" scrollLeft về vị trí
		// snap trong lúc đang kéo, khiến chỉ thấy nhảy khựng ở cuối thay vì trượt mượt —
		// nên phải tắt snap trong lúc isDragging, xem sx bên dưới.)
		el.scrollLeft = dragState.current.startScrollLeft - delta;
	};

	const endDrag = (e: React.PointerEvent) => {
		const el = scrollRef.current;
		if (!el) return;
		setIsDragging(false);
		el.releasePointerCapture(e.pointerId);
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
							src={(firstMember?.imageId as IMedia)?.secureUrl as string}
							alt={firstMember?.name}
							fill
							priority
							style={{ objectFit: "cover", objectPosition: "right center" }}
						/>
					)}
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

				<Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 8, md: 12 } }}>
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
							gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 280px))" },
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
									sx={{ fontSize: 19, fontWeight: 700, color: "#ffffff", m: 0, mb: 1.5 }}
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

			<Box sx={{ borderTop: "1px solid #4d5a7a", bgcolor: primaryColor }}>
				<Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
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

							<GridFadeIn sx={{ position: "relative" }}>
								<Box
									ref={scrollRef}
									onPointerDown={handlePointerDown}
									onPointerMove={handlePointerMove}
									onPointerUp={endDrag}
									onPointerLeave={endDrag}
									onPointerCancel={endDrag}
									sx={{
										width: "100%",
										display: "flex",
										gap: `${GAP_PX}px`,
										overflowX: "auto",
										scrollSnapType: isDragging ? "none" : "x mandatory",
										scrollbarWidth: "none",
										"&::-webkit-scrollbar": { display: "none" },
										cursor: isDragging ? "grabbing" : "grab",
										userSelect: "none",
										touchAction: "pan-y",
									}}
								>
									{teamMembers.map((item, index) => (
										<Box
											key={String((item as any)?._id ?? index)}
											sx={{
												flex: {
													xs: "0 0 100%",
													sm: `0 0 calc((100% - ${GAP_PX * (2 - 1)}px) / ${2})`,
													md: `0 0 calc((100% - ${GAP_PX * (itemsPerViewDesktop - 1)}px) / ${itemsPerViewDesktop})`,
												},
												scrollSnapAlign: "start",
											}}
										>
											{/* Chỉ 3 item đầu (đúng số lượng vừa khít viewport desktop)
											    tải eager; các item sau chỉ mount khi cuộn gần tới. */}
											<MemberCard
												item={item}
												shouldLoadEager={index < itemsPerViewDesktop}
											/>
										</Box>
									))}
								</Box>

								{total > itemsPerViewDesktop && (
									<>
										<IconButton
											onClick={() => scrollByAmount("left")}
											disabled={!canScrollLeft}
											aria-label="Xem nhân sự trước"
											sx={{
												position: "absolute",
												top: "35%",
												left: { xs: 0, lg: -56 },
												color: { xs: "black", lg: "#ffffff" },
												bgcolor: { xs: "white", lg: "rgba(255,255,255,0.08)" },
												"&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
												"&.Mui-disabled": { opacity: 0.25 },
											}}
										>
											<ChevronLeft />
										</IconButton>
										<IconButton
											onClick={() => scrollByAmount("right")}
											disabled={!canScrollRight}
											aria-label="Xem nhân sự tiếp theo"
											sx={{
												position: "absolute",
												top: "35%",
												right: { xs: 0, lg: -56 },
												color: { xs: "black", lg: "#ffffff" },
												bgcolor: { xs: "white", lg: "rgba(255,255,255,0.08)" },
												"&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
												"&.Mui-disabled": { opacity: 0.25 },
											}}
										>
											<ChevronRight />
										</IconButton>
									</>
								)}
							</GridFadeIn>
						</>
					)}
				</Container>
			</Box>
		</>
	);
}
