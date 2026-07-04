"use client";

import * as React from "react";
import { Box, Container, Typography } from "@mui/material";
import { RichContent } from "@/components/PageSections";
import { GridFadeIn } from "@/components/base/Grid";

type Milestone = {
	name: string;
	description: string;
};

type ColumnData = {
	label: string;
	milestones: Milestone[];
};

const labelSx = {
	fontSize: 12,
	fontWeight: 700,
	letterSpacing: "0.08em",
	color: "#5b6a8f",
	mb: 3,
	textTransform: "uppercase" as const,
};

const nameSx = {
	fontWeight: 700,
	fontSize: { xs: 22, md: 23 },
	lineHeight: 1.3,
	color: "#1c1c1c",
	mb: 1.5,
	maxWidth: { xs: "100%", lg: "80%" },
	minHeight: { xs: 'auto', lg: 65 },
};

export default function MissionAndVision({
	missions,
	visions,
	history,
	coreValues,
	achievements,
}: {
	missions: Milestone[];
	visions: Milestone[];
	history: Milestone[];
	coreValues: Milestone[];
	achievements: Milestone[];
}) {
	// Chỉ cần thêm/bớt phần tử ở đây, layout bên dưới sẽ tự wrap theo số lượng cột thực tế
	const columns: ColumnData[] = [
		{ label: "Tầm nhìn", milestones: visions },
		{ label: "Sứ mệnh", milestones: missions },
		{ label: "Lịch sử", milestones: history },
		{ label: "Giá trị cốt lõi", milestones: coreValues },
		{ label: "Thành tựu", milestones: achievements },
	].filter((column) => column.milestones?.length > 0);

	return (
		<Box
			component="section"
			sx={{
				position: "relative",
				py: { xs: 8, lg: 12 },
				px: { xs: 3, lg: 10 },
				borderTop: "3px solid #1a2340",
			}}
		>
			<Container
				maxWidth="lg"
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
					columnGap: { xs: 0, md: 10, lg: 20 },
					rowGap: { xs: 6, md: 8 },
					alignItems: "start",
				}}
			>
				{columns.map((column, colIndex) => (
					<GridFadeIn
						fadeInDirection={colIndex % 2 === 0 ? "left" : "right"}
						key={column.label}
					>
						<Typography sx={labelSx}>{column.label}</Typography>

						{column.milestones.map((milestone, index) => (
							<Box
								key={milestone.name}
								sx={{
									mb:
										index < column.milestones.length - 1
											? 5
											: 0,
								}}
							>
								<Typography sx={nameSx}>
									{milestone.name}
								</Typography>
								<RichContent
									className="text-[14px] text-[#3d3d3d] max-w-[480px] font-[400]"
									html={milestone.description}
								/>
							</Box>
						))}
					</GridFadeIn>
				))}
			</Container>
		</Box>
	);
}
