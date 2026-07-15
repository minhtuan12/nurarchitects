import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { GridFadeIn } from "./base/Grid";
import { RichContent } from "./PageSections";
import BgPattern from "@/assets/images/bg-pattern.jpg";

interface BlueSectionProps {
	bgImage?: string;
	title?: string;
	content?: string;
	hasCta?: boolean;
	ctaContent?: string;
	rightImage?: string;
	leftSpacing?: number;
}

export default function BlueSection({
	bgImage,
	title,
	content,
	ctaContent,
	rightImage,
	hasCta = false,
	leftSpacing = 3
}: BlueSectionProps) {
	return (
		<Box sx={{ py: 10, position: "relative" }}>
			<Image
				src={bgImage || BgPattern.src}
				fill
				sizes="100vw"
				priority
				fetchPriority="high"
				className="w-full h-full absolute"
				alt=""
				aria-hidden="true"
			/>
			<Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
				<Grid
					container
					spacing={{ xs: 5, md: 0 }}
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						alignItems: { md: "center" },
						height: { xs: "auto", md: 400 },
					}}
				>
					{/* ── Left: Text ─────────────────────────────────────────────── */}
					<GridFadeIn
						size={{ xs: 12, md: 6 }}
						fadeInDirection="left"
						sx={{
							flex: { md: "0 0 50%" },
							maxWidth: { md: "50%" },
							pr: { md: 8 },
							py: { md: 6 },
						}}
					>
						<Stack spacing={leftSpacing}>
							{/* Label */}
							<Typography
								sx={{
									color: "#9199b0",
									fontSize: "0.72rem",
									fontWeight: 600,
									letterSpacing: "0.15em",
									textTransform: "uppercase",
								}}
							>
								{title || "Nurchitects chúng tôi là ai?"}
							</Typography>

							{/* Description */}
							<RichContent
								className="max-w-[520px] text-white"
								html={content}
							/>

							{/* CTA button — outline style */}
							{hasCta && (
								<Box>
									<Button
										variant="outlined"
										component="a"
										href="/gioi-thieu"
										sx={{
											color: "#8fa8c8",
											borderColor: "#8fa8c8",
											borderRadius: 0,
											px: 6,
											py: 1.25,
											fontSize: { xs: 10, md: 14 },
											fontWeight: 700,
											letterSpacing: "0.12em",
											textTransform: "uppercase",
											"&:hover": {
												backgroundColor: "white",
												color: "black",
											},
										}}
									>
										{ctaContent || "Tìm hiểu thêm"}
									</Button>
								</Box>
							)}
						</Stack>
					</GridFadeIn>

					{/* ── Right: Image ────────────────────────────────────────────── */}
					{!!rightImage && (
						<GridFadeIn
							fadeInDirection="right"
							size={{ xs: 12, md: 6 }}
							sx={{
								mt: { xs: 0, md: -8 },
								mb: { xs: 0, md: -4 },
								position: "relative",
							}}
						>
							<Box
								sx={{
									position: "relative",
									width: "100%",
									// tỉ lệ khung ảnh ~4:3
									paddingTop: { xs: "50%", md: "70%" },
									borderRadius: "4px",
									overflow: "hidden",
									boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
								}}
							>
								<Image
									src={rightImage}
									alt={
										title || "Nurchitects chúng tôi là ai?"
									}
									fill
									sizes="(max-width: 900px) 100vw, 50vw"
									style={{ objectFit: "cover" }}
								/>
							</Box>
						</GridFadeIn>
					)}
				</Grid>
			</Container>
		</Box>
	);
}
