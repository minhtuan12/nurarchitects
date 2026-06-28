"use client";

import Box from "@mui/material/Box";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function GoToTopBtn() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 300);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

	return (
		<Box
			onClick={scrollToTop}
			sx={{
				position: "fixed",
				bottom: 48,
				right: 28,
				width: 38,
				height: 38,
				borderRadius: "8px",
				backgroundColor: "transparent",
				border: "2px solid #3d3d3d",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: "#fff",
				cursor: "pointer",
				zIndex: 1300,
				boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
				opacity: visible ? 1 : 0,
				transform: visible ? "translateY(0)" : "translateY(12px)",
				pointerEvents: visible ? "auto" : "none",
				transition: "opacity 0.3s ease, transform 0.3s ease",
				"&:hover": {
					border: 'none',
					'&> svg': {
						stroke: 'white',
					},
					backgroundColor: "rgba(29,28,24,0.95)",
					transform: "translateY(-2px)",
				},
			}}
		>
			<ChevronUp size={15} strokeWidth={2.5} color="#3d3d3d"/>
		</Box>
	);
}
