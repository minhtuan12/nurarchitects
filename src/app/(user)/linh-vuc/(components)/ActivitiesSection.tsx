import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";
import type { IActivityPopulated } from "@/types/activity"; // adjust to your actual path
import { capitalize } from "@/helpers";
import { RichContent } from "@/components/PageSections";
import { GridFadeIn } from "@/components/base/Grid";

interface ActivitiesSectionProps {
	activities: IActivityPopulated[];
}

export default function ActivitiesSection({ activities }: ActivitiesSectionProps) {
	return (
		<Box
			sx={{
				position: "relative",
				pt: { xs: 8, md: 12 },
				pb: 2,
				backgroundColor: "background.default",
			}}
		>
			<Container
				maxWidth="lg"
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
					gridAutoRows: "auto",
					columnGap: { md: 8, lg: 16 },
					rowGap: { xs: 8, md: 12 },
				}}
			>
				{activities.map((activity, index) => {
					const thumb = activity.thumbnailId;

					return (
						<GridFadeIn
							fadeInDirection={index % 2 === 0 ? 'left' : 'right'}
							key={String(activity._id)}
							sx={{
								display: { xs: 'flex', md: "grid" },
								flexDirection: { xs: 'column', md: 'unset' },
								// Inherit the 3 row-tracks (name / description / image) from
								// the Container above — each track's height is driven by
								// whichever item in that row needs the most space, so name,
								// description, and image all line up across both columns
								// no matter how long the content is.
								gridTemplateRows: "subgrid",
								gridRow: "span 3",
								gap: 0,
							}}
						>
							<Typography
								variant="h3"
								sx={{
									gridRow: 1, // pinned to the "name" track regardless of siblings
									fontWeight: 600,
									fontSize: { xs: "1.5rem", md: 30 },
									lineHeight: 1.2,
									color: "#1c1c1c",
									mb: 3,
									whiteSpace: "pre-line", // preserves the two-line title as authored
								}}
							>
								{capitalize(activity.name)}
							</Typography>

							<Box sx={{ gridRow: 2 }}>
								{/* pinned to the "description" track regardless of siblings */}
								<RichContent html={activity.description} className="text-[14px] text-[#3d3d3d]" />
							</Box>

							{thumb?.secureUrl && (
								<Box
									sx={{
										gridRow: 3, // pinned to the "image" track — never slides up
										position: "relative",
										width: "100%",
										aspectRatio: "4 / 3.5",
										overflow: "hidden",
										borderRadius: "2px",
										alignSelf: "start", // keeps the image at its natural aspect ratio instead of stretching
									}}
								>
									<Image
										src={thumb.secureUrl}
										alt={thumb.alt || activity.name}
										fill
										sizes="(max-width: 768px) 100vw, 50vw"
										style={{
											objectFit: "cover",
											transition: "filter 0.5s ease",
										}}
										className="lg:!filter-[grayscale(100%)] hover:filter-[grayscale(0%)] absolute"
									/>
								</Box>
							)}
						</GridFadeIn>
					);
				})}
			</Container>
		</Box>
	);
}
