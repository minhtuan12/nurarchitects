import { buildMetadata } from "@/lib/seo";
import DefaultImage from "@/assets/images/default-banner.webp";
import { Box, Divider, Typography } from "@mui/material";
import MediaRenderer from "@/components/MediaRenderer";
import ContactForm from "./(components)/ContactForm";
import { GridFadeIn } from "@/components/base/Grid";
import { MapPin, Phone, Send } from "lucide-react";
import Link from "next/link";
import { getContact } from "@/lib/content";
import { IContactConfigPopulated } from "@/types/contact";

export async function generateMetadata() {
	return buildMetadata({
		title: "BÁO GIÁ, TƯ VẤN XÂY NHÀ TRỌN GÓI",
		slug: "dang-ky-tu-van-ho-tro-tu-nurarchitects",
		description:
			"Đăng ký, tư vấn hỗ trợ xây nhà trọn gói từ NUR Architects.",
		ogImage: DefaultImage.src,
		focusKeywords: [
			"đăng ký",
			"tư vấn",
			"xây nhà",
			"trọn gói",
			"báo giá",
			"hỗ trợ",
		],
	});
}

export default async function () {
	const data: IContactConfigPopulated = await getContact();
	const locations = data?.locations ?? [];

	return (
		<Box bgcolor="white">
			<Box sx={{ mt: { xs: "-78px", md: "-115px" } }}>
				<Box
					position="relative"
					sx={{ height: { xs: "50vh", md: "70vh" } }}
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
						media={null}
						autoPlay
						controls={false}
						loop
						className="h-full"
						fill
						title="Đăng ký, tư vấn hỗ trợ xây nhà trọn gói từ NUR Architects"
						priority
					/>
				</Box>
			</Box>
			<Typography
				bgcolor={"primary.main"}
				color="white"
				variant="h6"
				fontSize={25}
				fontWeight={600}
				textAlign="center"
				py={2}
			>
				BÁO GIÁ, TƯ VẤN XÂY NHÀ TRỌN GÓI – NUR ARCHITECTS
			</Typography>
			<ContactForm />
			<Box
				sx={{
					maxWidth: 1200,
					mx: "auto",
					px: { xs: 2, md: 3 },
					pb: { xs: 4, md: 15 },
					bgcolor: "white",
				}}
			>
				{/* Phone */}
				<GridFadeIn
					fadeInDirection="left"
					sx={{
						py: { xs: 2, md: 4 },
						display: "flex",
						direction: "row",
						gap: 1,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Phone size={20} className="text-[#434343]" />
					<Link
						href={`tel:${data?.phone?.replace(/[^0-9+]/g, "")}`}
						className="text-[#474747] text-[14px] font-[400] opacity-90 hover:opacity-100"
					>
						{data?.phone}
					</Link>
				</GridFadeIn>

				<Divider />

				{/* Email */}
				<GridFadeIn
					fadeInDirection="right"
					sx={{
						py: { xs: 2, md: 4 },
						display: "flex",
						direction: "row",
						gap: 1,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Send size={20} className="text-[#434343]" />
					<Link
						href={`mailto:${data?.email}`}
						className="text-[#474747] text-[14px] font-[400] opacity-90 hover:opacity-100"
					>
						{data?.email}
					</Link>
				</GridFadeIn>

				<Divider />

				{/* Locations */}
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
					}}
				>
					{locations.map((location, index) => {
						const isLast = index === locations.length - 1;
						const markerLabel = location.name || location.address;
						// Cú pháp q=lat,lng(Label) buộc Google parse 2 số đầu là toạ độ
						// tuyệt đối (không chạy qua Local Search nên không bị snap sang
						// POI gần đó), đồng thời Label trong ngoặc hiển thị cạnh marker.
						const mapQuery = `${location.lat},${location.lng}(${markerLabel})`;
						const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
							mapQuery,
						)}&z=16&output=embed`;
						const googleMapsUrl =
							location.link ||
							`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

						return (
							<GridFadeIn
								fadeInDirection="up"
								key={`${location.name}-${index}`}
								sx={{
									flex: 1,
									minWidth: 0,
									py: { xs: 3, md: 5 },
									borderBottom: {
										xs: isLast
											? "none"
											: "1px solid #ececec",
										md: "none",
									},
									borderRight: {
										xs: "none",
										md: isLast
											? "none"
											: "1px solid #ececec",
									},
								}}
							>
								<Link
									className="flex gap-2 items-start mb-3"
									href={googleMapsUrl}
									target="_blank"
									rel="noopener noreferrer"
									style={{ textDecoration: "none" }}
								>
									<MapPin
										size={20}
										className="text-[#434343]"
									/>
									<Typography
										sx={{
											fontSize: { xs: 14, md: 15 },
											fontWeight: 600,
											color: "text.primary",
											lineHeight: 1.5,
										}}
									>
										{location.name
											? `${location.name}, `
											: ""}
										{location.address}
									</Typography>
								</Link>

								<Box
									sx={{
										position: "relative",
										width: "100%",
										height: { xs: 380, md: 415 },
										overflow: "hidden",
									}}
								>
									<Box
										component="iframe"
										src={mapSrc}
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
										title={`Bản đồ - ${location.name || location.address}`}
										sx={{
											position: "absolute",
											inset: 0,
											width: "100%",
											height: "100%",
											border: 0,
										}}
									/>
								</Box>
							</GridFadeIn>
						);
					})}
				</Box>

				<Divider />
			</Box>
		</Box>
	);
}
