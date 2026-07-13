import { Box, Typography } from "@mui/material";
import type { IMedia } from "@/types/media"; // đổi path theo project của bạn

export interface IActivityAdvantage {
	name: string;
	thumbnailId: string;
	description?: string;
}

export interface IActivityAdvantagePopulated
	extends Omit<IActivityAdvantage, "thumbnailId"> {
	thumbnailId?: IMedia | null | string;
}

interface Props {
	advantages: IActivityAdvantagePopulated[];
}

const MAX_PER_ROW = 3;
const EYEBROW = "ƯU ĐIỂM VƯỢT TRỘI";

const getMediaUrl = (media?: IMedia | string | null) => {
	if (!media) return "";
	if (typeof media === "string") return media;
	return (media as any).secureUrl || (media as any).url || "";
};

const chunk = <T,>(arr: T[], size: number) => {
	const result: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		result.push(arr.slice(i, i + size));
	}
	return result;
};

export default function AdvantagesSection({ advantages }: Props) {
	const rows = chunk(advantages, MAX_PER_ROW);

	return (
		<Box sx={{ width: "100%" }}>
			{rows.map((row, rowIndex) => (
				<Box
					key={rowIndex}
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						justifyContent: "center",
						gap: { xs: 2, md: 'unset' },
					}}
				>
					{row.map((advantage, i) => {
						const imgUrl = getMediaUrl(advantage.thumbnailId);
						const hasDescription = !!advantage.description;

						return (
							<Box
								key={i}
								sx={{
									position: "relative",
									display: 'block',
									overflow: "hidden",
									width: { xs: "100%", md: `${100 / MAX_PER_ROW}%` },
									aspectRatio: { xs: "4 / 5", md: "4 / 5" },
									cursor: "default",
									isolation: "isolate",
									// mobile: coi như luôn hover -> áp dụng thẳng style active
									// desktop: giữ nguyên hành vi hover như cũ
									"&:hover .advan-overlay": {
										background: { md: "rgba(24, 42, 83, 0.85)" },
									},
									"&:hover .advan-header": hasDescription
										? { transform: { md: "translateY(80px)" } }
										: undefined,
									"&:hover .advan-desc": {
										opacity: { md: 1 },
										transform: { md: "translateY(0)" },
										visibility: { md: "visible" },
									},
								}}
							>
								{/* Background image */}
								<Box
									sx={{
										position: "absolute",
										inset: 0,
										backgroundImage: imgUrl ? `url(${imgUrl})` : "none",
										backgroundColor: "grey.900",
										backgroundSize: "cover",
										backgroundPosition: "center",
										transition: "transform .6s ease",
									}}
								/>

								{/* Overlay tối - mobile luôn đậm, desktop đậm hơn khi hover */}
								<Box
									className="advan-overlay"
									sx={{
										position: "absolute",
										inset: 0,
										background: {
											xs: "rgba(35, 53, 93, 0.85)",
											md: "linear-gradient(180deg, rgba(3, 10, 35, 0.15) 0%, rgba(3, 9, 31, 0.7) 100%)",
										},
										transition: "background .5s ease",
									}}
								/>

								<Box
									sx={{
										position: "absolute",
										left: 0,
										right: 0,
										top: "8%",
										px: 2,
										textAlign: "center",
										zIndex: 1,
									}}
								>
									{/* Khối eyebrow + title - mobile luôn ở vị trí "đã dịch xuống" */}
									<Box
										className="advan-header"
										sx={{
											transform: {
												xs: hasDescription ? "translateY(80px)" : "translateY(0)",
												md: "translateY(0)",
											},
											transition: "transform .8s cubic-bezier(0.22, 1, 0.36, 1)",
										}}
									>
										<Typography
											sx={{
												color: "rgba(255,255,255,0.55)",
												fontWeight: 700,
												fontSize: 12,
												letterSpacing: "0.12em",
												mb: 1,
											}}
										>
											{EYEBROW}
										</Typography>
										<Typography
											sx={{
												color: "#fff",
												fontWeight: 700,
												fontSize: { xs: 22, md: 26 },
												lineHeight: 1.3,
											}}
										>
											{advantage.name}
										</Typography>
									</Box>

									{/* Description - mobile luôn hiện sẵn, desktop fade in khi hover */}
									{hasDescription && (
										<Typography
											className="advan-desc lg:line-clamp-none line-clamp-3 sm:line-clamp-5"
											sx={{
												// display: { xs: 'none', lg: 'unset' },
												mt: { xs: "calc(100% - 150px)", md: 'calc(100% - 200px)', lg: "calc(100% - 250px)" },
												mx: "auto",
												maxWidth: 360,
												color: "rgba(255,255,255,0.8)",
												fontSize: 14,
												lineHeight: 1.8,
												opacity: { xs: 1, md: 0 },
												visibility: { xs: "visible", md: "hidden" },
												transform: { xs: "translateY(0)", md: "translateY(180px)" },
												transition:
													"opacity .8s ease, transform .8s cubic-bezier(0.22, 1, 0.36, 1), visibility .8s",
											}}
										>
											{advantage.description}
										</Typography>
									)}
								</Box>
							</Box>
						);
					})}
				</Box>
			))}
		</Box>
	);
}
