"use client";

import { GridFadeIn } from "@/components/base/Grid";
import DiagonalNumber from "@/components/DiagonalNumber";
import { IActivityProcess } from "@/types/activity";
import { Box, Typography } from "@mui/material";
import {
	Users,
	CalendarClock,
	FileCheck2,
	Building2,
	PenTool,
	FileText,
	ShoppingCart,
	Blocks,
	Home,
	type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

interface Step {
	number: number;
	icon: LucideIcon;
	title: string;
	bullets: string[];
}

const MAX_PER_ROW = 5;

export default function ProcessSection({ process }: { process: IActivityProcess[] }) {
	const rows = useMemo(() => {
		const chunks: typeof process[] = [];
		for (let i = 0; i < process.length; i += MAX_PER_ROW) {
			chunks.push(process.slice(i, i + MAX_PER_ROW));
		}
		return chunks;
	}, [process]);

	const columns = Math.min(process.length, MAX_PER_ROW);

	// chỉ cần nhân đôi khi có từ 2 hàng trở lên (mới có nguy cơ lệch nửa cột)
	const needsHalfStep = rows.length > 1;
	const subColumns = needsHalfStep ? columns * 2 : columns;
	const unit = needsHalfStep ? 2 : 1;

	return (
		<Box
			component="section"
			sx={{
				backgroundColor: "primary.main",
				py: { xs: 8, md: 10 },
				pt: { xs: 8, md: 6 },
				px: { xs: 3, md: 10 },
			}}
		>
			<Typography
				sx={{
					textAlign: "center",
					color: "rgba(255,255,255,0.45)",
					fontSize: 12,
					fontWeight: 700,
					letterSpacing: "0.14em",
					mb: { xs: 6, md: 6 },
				}}
			>
				QUY TRÌNH LÀM VIỆC
			</Typography>

			<Box
				sx={{
					maxWidth: 1440,
					mx: "auto",
					display: "grid",
					gridTemplateColumns: { xs: "1fr", sm: 'repeat(2, 1fr)', lg: `repeat(${subColumns}, 1fr)` },
					columnGap: { md: 3, lg: 3 },
					rowGap: { xs: 8, md: 4 },
				}}
			>
				{rows.map((row, rowIndex) =>
					row.map((step, colIndex) => {
						const i = rowIndex * MAX_PER_ROW + colIndex;
						// Số sub-column trống ở 2 bên để canh giữa hàng này
						const offset = (subColumns - row.length * unit) / 2;
						const start = offset + colIndex * unit + 1;

						return (
							<GridFadeIn
								fadeInDirection="left"
								key={i}
								sx={{
									position: "relative",
									gridColumn: { xs: 'span 1', md: `${start} / span ${unit}` },
									gridRow: { md: rowIndex + 1 },
									margin: { xs: '0 auto', md: 'unset' },
								}}
							>
								<Box
									sx={{
										position: "absolute",
										top: -8,
										left: -8,
										zIndex: 0,
										pointerEvents: "none",
									}}
								>
									<DiagonalNumber
										value={Number(step.order) + 1}
										size={110}
										offset={0.3}
										numberColor="rgba(255,255,255,0.16)"
										lineColor="rgba(255,255,255,0.3)"
									/>
								</Box>

								<Box sx={{ position: "relative", zIndex: 1, pl: "110px", pt: 3, minHeight: 56, maxWidth: { xs: 'unset', sm: '80%' } }}>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
										<Typography
											sx={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}
										>
											{step.name}
										</Typography>
									</Box>
								</Box>

								<Box sx={{ position: "relative", zIndex: 1, pl: { xs: 0, sm: "68px" }, pt: { xs: 4, sm: 'unset' } }}>
									{step.details?.map((bullet, bi) => (
										<Typography
											key={bi}
											sx={{ color: "rgba(255,255,255,0.65)", fontSize: 13.5, lineHeight: 1.7 }}
										>
											- {bullet}
										</Typography>
									))}
								</Box>
							</GridFadeIn>
						);
					})
				)}
			</Box>
		</Box>
	);
}
