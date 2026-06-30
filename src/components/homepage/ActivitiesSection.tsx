"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { IActivityPopulated } from "@/types/activity";
import SubLogo from '@/assets/images/sub-logo.png';
import { ChevronDown, ChevronUp } from "lucide-react";
import ConcreteBg from '@/assets/images/concrete-bg.jpg';
import { capitalize } from "@/helpers";
import { Accordion, AccordionDetails, AccordionSummary, Grid } from "@mui/material";
import { RichContent } from "../PageSections";
import FadeIn from "../FadeIn";
import { GridFadeIn } from "../base/Grid";

interface ActivitiesSectionProps {
	label?: string;
	ctaText?: string;
	ctaHref?: string;
	activities: IActivityPopulated[];
}

export default function ActivitiesSection({
	label = "LĨNH VỰC HOẠT ĐỘNG",
	ctaText = "TÌM HIỂU THÊM",
	ctaHref = "/linh-vuc",
	activities,
}: ActivitiesSectionProps) {
	const displayedActivities = activities?.filter(a => a.thumbnailId?.secureUrl);
	const hasActivities = displayedActivities?.length > 0;
	const [activeId, setActiveId] = useState<string>(
		"",
	);

	return (
		<Box
			component="section"
			sx={{
				backgroundImage: `url(${ConcreteBg.src})`,
				backgroundSize: "cover",
				py: { xs: 6, md: 8 },
				px: { xs: 2, md: 6 },
			}}
		>
			<Container maxWidth="lg" sx={{ px: { xs: 0, md: 2 } }}>
				{hasActivities ? <>
					{/* Section label */}
					<Typography
						sx={{
							color: "#5a6a8a",
							fontSize: 12,
							fontWeight: 600,
							letterSpacing: "0.05em",
							textTransform: "uppercase",
							lineHeight: '1.05',
							mb: 4,
						}}
					>
						{label}
					</Typography>

					<Grid
						container
						sx={{
							gap: { xs: 5, lg: 15 },
						}}
					>
						{/* ── Left: Accordion ──────────────────────────────────────── */}
						<GridFadeIn size={{ xs: 12, lg: 4 }} fadeInDirection="left" delay={0}>
							<Stack spacing={0}>
								{displayedActivities.map((activity, index) => {
									const isActive = activity._id === activeId;
									return (
										<Box key={String(activity._id)} position={'relative'}>
											{/* Accordion item */}
											<Box
												onClick={() => setActiveId(!isActive ? String(activity._id) : '')}
												sx={{ cursor: "pointer", py: 2.5 }}
											>
												<Box
													sx={{
														display: "flex",
														alignItems: "flex-start",
														gap: 1.5,
													}}
												>
													{/* Icon — chỉ hiện khi active */}
													<Box top={10} left={-50} sx={{ opacity: { xs: 0, md: isActive ? 1 : 0 }, transition: "opacity 0.2s" }} position={'absolute'}>
														<div style={{ position: 'relative', width: '40px', height: '40px' /* Cập nhật height theo tỷ lệ gốc */ }}>
															<Image
																src={SubLogo.src}
																fill
																style={{ objectFit: 'contain' }}
																alt="Nurarchitects Logo"
															/>
														</div>
													</Box>

													{/* Title + arrow */}
													<Box sx={{
														flex: 1,
														'.MuiPaper-root': {
															background: 'transparent',
															boxShadow: 'none',
														},
														'.MuiButtonBase-root': {
															px: '0 !important',
														},
														'.MuiAccordionSummary-content': {
															my: '0 !important',
														},
														'.Mui-expanded': {
															my: '3.5px !important',
															minHeight: 'unset !important',
														},
													}}>
														<Accordion expanded={isActive}>
															<AccordionSummary
																expandIcon={<ChevronDown size={34} color={isActive ? "#1a2f5e" : "#999"} />}
																aria-controls={`${index}-panel1-content`}
																id={`${index}-panel1-header`}
															>
																<Typography component="span" sx={{
																	fontSize: { xs: 20, md: 25 },
																	fontWeight: 700,
																	color: isActive ? "#1a2f5e" : "#787878",
																	lineHeight: 1.4,
																	maxWidth: 285,
																	transition: "color 0.2s, font-weight 0.2s",
																}}>{capitalize(activity.name)}</Typography>
															</AccordionSummary>
															<AccordionDetails>
																<RichContent
																	className="!text-[#3d3d3d] !text-[14px]"
																	html={activity.description || activity.shortDescription}
																/>
															</AccordionDetails>
														</Accordion>
													</Box>
												</Box>
											</Box>

											{/* Divider giữa các item (trừ cái cuối) */}
											{
												index < displayedActivities.length - 1 && (
													<Divider sx={{ borderColor: "rgba(0,0,0,0.15)", my: { xs: 0, lg: 2 } }} />
												)
											}
										</Box>
									);
								})}
							</Stack>
						</GridFadeIn>

						{/* ── Right: Images ─────────────────────────────────────────── */}
						<GridFadeIn size={{ xs: 12, lg: 6 }}
							sx={{
								flex: 1,
								display: "flex",
								gap: 2,
								alignItems: "flex-start",
								justifyContent: 'center',
							}} fadeInDirection="right" delay={0}>
							{/* Ảnh 1 — cao hơn */}

							{displayedActivities.map(a => {
								return a?.thumbnailId?.secureUrl ?
									<Grid
										size={6}
										key={String(a._id)}
										sx={{
											position: "relative",
											width: { xs: 150, md: 300 },
											height: { xs: 200, md: 415 },
											cursor: "pointer",
										}}
									>
										<Image
											src={a?.thumbnailId?.secureUrl as string}
											alt={a?.name ?? ""}
											fill
											style={{
												objectFit: "cover",
												filter: "grayscale(100%)",
												transition: "filter 0.5s ease",
											}}
											className="hover:filter-[grayscale(0%)] absolute"
										/>
									</Grid>
									: <Box
										sx={{
											position: "absolute",
											inset: 0,
											backgroundColor: "#bbb",
										}}
									/>
							})}
						</GridFadeIn>
					</Grid>

					{/* CTA button */}
					<FadeIn direction="up" delay={0.3}>
						<Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
							<Button
								component="a"
								href={ctaHref}
								variant="contained"
								sx={{
									backgroundColor: "#c0392b",
									color: "#fff",
									borderRadius: 0,
									width: 210,
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
								{ctaText}
							</Button>
						</Box>
					</FadeIn>
				</> :
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
				}
			</Container>
		</Box >
	);
}
