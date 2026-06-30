"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
	children: React.ReactNode;
	direction?: "left" | "right" | "up" | "down";
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

export default function FadeIn({
	children,
	direction = "up",
	delay = 0,
	duration = 0.7,
	distance,
	once = true,
	className,
	style,
}: FadeInProps) {
	const ref = useRef(null);
	const inView = useInView(ref, { once, amount: 0.2 });

	const initial = directionMap[direction];

	// override distance nếu truyền vào
	const from = {
		x: distance ? (direction === "left" ? -distance : direction === "right" ? distance : 0) : initial.x,
		y: distance ? (direction === "up" ? distance : direction === "down" ? -distance : 0) : initial.y,
	};

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, ...from }}
			animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...from }}
			transition={{
				duration,
				delay,
				ease: [0.25, 0.1, 0.25, 1], // cubic-bezier mượt
			}}
			className={className}
			style={{ willChange: "transform, opacity", ...style }}
		>
			{children}
		</motion.div>
	);
}
