"use client";

import {
	Box,
	Container,
	Grid,
	List,
	ListItem,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import DiagonalNumber from "@/components/DiagonalNumber";
import { Handshake } from "lucide-react";
import Image from "next/image";
import SubLogo from "@/assets/images/sub-logo.png";
import PartnerRegisterCTA from "./PartnerRegisterCTA";
import Link from "next/link";
import { IMedia } from "@/types/media";
import DefaultImage from '@/assets/images/default-banner.webp';
import { GridFadeIn } from "@/components/base/Grid";

const infoList = [
	"Hồ sơ năng lực (nếu có).",
	"Catalogue sản phẩm, thiết bị, giải pháp.",
	"Bảng tổng hợp phân khúc sản phẩm, giải pháp kỹ thuật mà nhà thầu cung ứng (khuyến khích).",
	"Chính sách chiết khấu, hợp tác.",
	"Chế độ bảo hành, hậu mãi.",
];

export default function ProcessSteps({
	image,
	email,
	ctaContent,
	steps,
}: {
	image?: IMedia;
	email?: string;
	ctaContent?: string;
	steps: { order: number; name: string; description?: string }[];
}) {
	const theme = useTheme();
	const numberColor = theme.palette.grey[400];
	const lineColor = theme.palette.grey[400];
	const isMobile = useMediaQuery("(max-width:768px)");

	return (
		<Container maxWidth="lg" sx={{ py: 8, bgcolor: "background.default" }}>
			<GridFadeIn
				fadeInDirection="left"
				sx={{
					display: "flex",
					alignItems: "flex-start",
					gap: 1.5,
				}}
				position="relative"
			>
				{/* Icon — chỉ hiện khi active */}
				<div
					style={{
						position: "relative",
						width: "40px",
						height: "40px" /* Cập nhật height theo tỷ lệ gốc */,
					}}
				>
					<Image
						src={SubLogo.src}
						fill
						style={{ objectFit: "contain" }}
						alt="Nurarchitects Logo"
					/>
				</div>
				<Typography
					sx={{
						mt: 2,
						fontWeight: 700,
						fontSize: 25,
					}}
					color="primary.main"
				>
					Quy trình hợp tác
				</Typography>
			</GridFadeIn>

			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={{ xs: 6, md: 5 }}
				mt={isMobile ? 4 : 0}
			>
				{steps.map((step) => (
					<GridFadeIn fadeInDirection="left"
						key={String(step.order)}
						sx={{
							position: "relative",
							flex: 1,
							pt: isMobile ? 0 : 8, // chừa chỗ cho số lớn phía trên
							margin: {
								xs: isMobile ? "5px 0" : "0 auto !important",
								lg: "unset",
							},
						}}
					>
						{/* Số lớn + đường chéo -> nằm NỀN phía sau, không chiếm layout */}
						{!isMobile && (
							<Box
								sx={{
									position: "absolute",
									top: 0,
									left: 0,
									zIndex: 0,
									pointerEvents: "none",
								}}
							>
								<DiagonalNumber
									value={step.order + 1}
									size={isMobile ? 100 : 160}
									offset={0.25}
									numberColor={numberColor}
									lineColor={lineColor}
								/>
							</Box>
						)}

						{/* Nội dung text -> nằm ĐÈ lên trên, canh trái */}
						<Box
							sx={{
								position: "relative",
								zIndex: 1,
								left: isMobile ? 0 : 120,
								top: 0,
							}}
						>
							<Handshake
								size={isMobile ? 0 : 40}
								strokeWidth={1.5}
								className="ml-10"
							/>
							<Typography
								sx={{
									fontWeight: 700,
									fontSize: { xs: 18, lg: 24 },
									color: "text.primary",
								}}
							>
								{isMobile ? `${step.order + 1}. ` : ""}
								{step.name}
							</Typography>

							{step.description && (
								<Typography
									sx={{
										mt: 1,
										color: "#666",
										lineHeight: 1.5,
										fontSize: 14,
										maxWidth: isMobile ? "100%" : "70%",
									}}
								>
									{step.description}
								</Typography>
							)}
						</Box>
					</GridFadeIn>
				))}
			</Stack>

			<GridFadeIn fadeInDirection="up" sx={{ mt: 8 }}>
				<PartnerRegisterCTA
					ctaContent={
						ctaContent || "Cùng Nurarchitects hợp tác ngay!"
					}
				/>
			</GridFadeIn>

			<Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch" mt={14}>
				{/* Cột trái: text + bullet list */}
				<GridFadeIn fadeInDirection="left" size={{ xs: 12, md: 6 }}>
					<Box
						sx={{
							"& a": {
								color: "#D93025",
								fontWeight: 700,
								textDecoration: "underline",
							},
							"& strong": { fontWeight: 700 },
						}}
					>
						<Typography
							component="div"
							sx={{
								fontSize: { xs: 14, md: 16 },
								fontWeight: 700,
								lineHeight: 1.9,
								color: "text.primary",
							}}
						>
							Chúng tôi khuyến khích Quý đối tác liên hệ trực tiếp
							thông qua nền tảng website này. Tuy nhiên, nếu có
							nhiều thông tin cần được trao đổi chi tiết hơn, mời
							quý đối tác gửi email đến địa chỉ{" "}
							<Link
								href={`mailto:${email || "nurarchitectskh@gmail.com"}`}
								className="no-underline"
							>
								{email || "nurarchitectskh@gmail.com"}
							</Link>
							. Vui lòng đính kèm các thông tin cơ bản được liệt
							kê dưới đây:
						</Typography>
					</Box>

					<List
						sx={{
							mt: 2,
							listStyleType: "disc",
							pl: 3,
							"& .MuiListItem-root": {
								display: "list-item",
								padding: 0,
								mb: 1,
							},
						}}
					>
						{infoList.map((item, i) => (
							<ListItem key={i}>
								<Typography
									sx={{
										fontSize: { xs: 12, md: 14 },
										lineHeight: 1.7,
										color: "#3d3d3d",
									}}
								>
									{item}
								</Typography>
							</ListItem>
						))}
					</List>
				</GridFadeIn>

				{/* Cột phải: ảnh */}
				<GridFadeIn fadeInDirection="right" size={{ xs: 12, md: 6 }}>
					<Box
						sx={{
							position: "relative",
							width: "100%",
							height: "100%",
							minHeight: { xs: 260, md: 420 },
							borderRadius: 0.5,
							overflow: "hidden",
						}}
					>
						<Image
							src={image?.secureUrl || DefaultImage.src}
							alt={image?.alt || "Hợp tác với Nurarchitects"}
							fill
							style={{ objectFit: "cover" }}
						/>
					</Box>
				</GridFadeIn>
			</Grid>
		</Container>
	);
}
