'use client'

import { capitalize } from "@/helpers";
import { EBuildPlan, IProjectPopulated } from "@/types/project";
import { Box, Typography } from "@mui/material";
import { Plus } from "lucide-react";
import Image from "next/image";

export default function ProjectCard({ p }: { p: IProjectPopulated }) {
	return <Box
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
				src={p?.thumbnailId?.secureUrl || p?.thumbnailId?.url || ""}
				alt={p?.name || ""}
				fill
				sizes="(max-width: 600px) 100vw, 360px"
				style={{ objectFit: "cover" }}
			/>
		</Box>

		{/* Overlay đen — mobile: luôn hiện, desktop: hover mới hiện */}
		<Box
			className="project-overlay"
			sx={{
				position: "absolute",
				inset: 0,
				background: "rgb(0 0 0 / 75%)",
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
}
