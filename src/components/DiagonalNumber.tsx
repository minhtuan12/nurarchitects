"use client";

import { Box } from "@mui/material";

interface DiagonalNumberProps {
	value: number | string;
	size?: number; // px, the badge is always a square of this size
	background?: string;
	numberColor?: string;
	lineColor?: string;
	/**
	 * 0 = classic corner-to-corner diagonal (half the number visible).
	 * Increase toward 1 to push the cut line further down-right, revealing
	 * more of the number. Keep below 1.
	 */
	offset?: number;
	sx?: any;
}

export default function DiagonalNumber({
	value,
	size = 200,
	background = "transparent",
	numberColor = "rgba(255,255,255,0.14)",
	lineColor = "rgba(255,255,255,0.35)",
	offset = 0.2,
	sx = {},
}: DiagonalNumberProps) {
	const f = offset; // shorthand
	const cutPercent = f * 100;
	const midPercent = ((1 + f) / 2) * 100;
	const lineLengthPercent = (1 - f) * 125.42; // remaining diagonal length, sqrt(2) * (1 - f) * 100%

	return (
		<Box
			sx={{
				position: "relative",
				width: size,
				height: size,
				overflow: "hidden",
				backgroundColor: background,
				...sx,
			}}
		>
			{/* the digit, clipped so only the area above/left of the diagonal shows */}
			<Box
				sx={{
					position: "absolute",
					inset: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: size * 0.85,
					fontWeight: 800,
					lineHeight: 1,
					color: numberColor,
					// pentagon: full top edge, full left edge, and a diagonal cut
					// from a point on the right edge down to a point on the bottom
					// edge — pushing that cut further toward the corner (higher
					// `offset`) keeps more of the digit visible
					clipPath: `polygon(0 0, 100% 0, 100% ${cutPercent}%, ${cutPercent}% 100%, 0 100%)`,
					userSelect: "none",
				}}
			>
				{value}
			</Box>

			{/* the diagonal line, drawn exactly along that same cut */}
			<Box
				sx={{
					position: "absolute",
					top: `${midPercent}%`,
					left: `${midPercent}%`,
					width: `${lineLengthPercent}%`,
					height: "1.5px",
					backgroundColor: lineColor,
					transform: "translate(-50%, -50%) rotate(-45deg)",
					transformOrigin: "center",
					boxShadow: 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px'
				}}
			/>
		</Box>
	);
}
