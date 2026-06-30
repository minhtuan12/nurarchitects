'use client'

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Grid as MuiGrid, GridProps } from "@mui/material";

const GridComponent = React.forwardRef<HTMLDivElement, GridProps>((props, ref) => (
	<MuiGrid {...props} ref={ref} />
));

const Grid = motion.create(GridComponent);

export default Grid;

interface FadeInProps extends GridProps {
	children: React.ReactNode;
	fadeInDirection?: "left" | "right" | "up" | "down";
	delay?: number;
	duration?: number;
	distance?: number;
	once?: boolean;
	className?: string;
	style?: React.CSSProperties;
}

const directionMap = {
	left: { x: -60, y: 0 },
	right: { x: 60, y: 0 },
	up: { x: 0, y: 40 },
	down: { x: 0, y: -40 },
};

export function GridFadeIn({
	children,
	fadeInDirection = "up",
	delay = 0,
	duration = 0.7,
	distance,
	once = true,
	className,
	style,
	...props
}: FadeInProps) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once, amount: 0.2 });

	const initial = directionMap[fadeInDirection];

	const from = {
		x: distance
			? fadeInDirection === "left" ? -distance : fadeInDirection === "right" ? distance : 0
			: initial.x,
		y: distance
			? fadeInDirection === "up" ? distance : fadeInDirection === "down" ? -distance : 0
			: initial.y,
	};

	return (
		// MuiGrid chỉ lo layout (size, spacing...)
		// sx của caller được pass vào đây
		<Grid ref={ref}
			initial={{ opacity: 0, ...from }}
			animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...from }}
			transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
			className={className}
			style={{
				willChange: "transform, opacity",
				...style,
			}}
			onClick={props.onClick}
			sx={props.sx}
			size={props.size}
		>
			{children}
		</Grid>
	);
}
