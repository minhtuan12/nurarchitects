"use client";

import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { MessageCircle, Phone } from "lucide-react";

export function FlyingContact({ phone }: { phone: string }) {
	return (
		<Box
			sx={{
				position: "fixed",
				bottom: 28,
				left: 28,
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "flex-start",
				gap: 1.5,
				zIndex: 1300,
			}}
		>
			{/* Messenger */}
			<Box
				component="a"
				href="/dang-ky-tu-van-ho-tro-tu-nurarchitects"
				rel="noopener noreferrer"
				sx={{
					paddingLeft: 1,
					paddingRight: 2,
					width: "auto",
					height: 40,
					borderRadius: "999px",
					background:
						"linear-gradient(135deg, #0099FF 0%, #A033FF 60%, #FF5C87 100%)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: 1,
					color: "#fff",
					boxShadow: "0 4px 16px rgba(0,153,255,0.45)",
					transition: "transform 0.2s ease, box-shadow 0.2s ease",
					"&:hover": {
						transform: "scale(1.1)",
						boxShadow: "0 6px 24px rgba(0,153,255,0.6)",
					},
				}}
			>
				<svg
					fill="#ffffff"
					viewBox="0 0 256 256"
					id="Flat"
					xmlns="http://www.w3.org/2000/svg"
					stroke="#ffffff"
					width={24}
				>
					<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
					<g
						id="SVGRepo_tracerCarrier"
						strokeLinecap="round"
						strokeLinejoin="round"
					></g>
					<g id="SVGRepo_iconCarrier">
						{" "}
						<path d="M128,24A104.02809,104.02809,0,0,0,36.811,178.041l-8.54737,29.915a16.00023,16.00023,0,0,0,19.77979,19.78027l29.916-8.54639A104.00746,104.00746,0,1,0,128,24Zm53.65674,93.65674-32,32a7.99945,7.99945,0,0,1-11.31348,0L112,123.3135,85.65674,149.65676a7.99984,7.99984,0,1,1-11.31348-11.31348l32-32a8,8,0,0,1,11.31348,0L144,132.68654l26.34326-26.34326a7.99984,7.99984,0,0,1,11.31348,11.31348Z"></path>{" "}
					</g>
				</svg>
				<Typography fontSize={12} fontWeight={600} ml={1}>ĐĂNG KÝ TƯ VẤN</Typography>
			</Box>

			{/* Phone with pulse */}
			<Box
				component="a"
				href={`tel:${phone}`}
				sx={{
					position: "relative",
				}}
			>
				{/* Pulse rings */}
				<Box
					sx={{
						position: "absolute",
						inset: 0,
						borderRadius: "50%",
						backgroundColor: "#C0392B",
						opacity: 0,
						animation: "pulse-ring 2s ease-out infinite",
						"@keyframes pulse-ring": {
							"0%": { transform: "scale(1)", opacity: 0.6 },
							"100%": { transform: "scale(2)", opacity: 0 },
						},
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						inset: 0,
						borderRadius: "50%",
						backgroundColor: "#C0392B",
						opacity: 0,
						animation: "pulse-ring 2s ease-out 0.6s infinite",
						"@keyframes pulse-ring": {
							"0%": { transform: "scale(1)", opacity: 0.5 },
							"100%": { transform: "scale(2)", opacity: 0 },
						},
					}}
				/>

				{/* Button */}
				<Box
					sx={{
						position: "relative",
						zIndex: 1,
						width: 40,
						height: 40,
						borderRadius: "50%",
						backgroundColor: "#C0392B",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#fff",
						boxShadow: "0 4px 16px rgba(192,57,43,0.5)",
						transition: "transform 0.2s ease, box-shadow 0.2s ease",
						"&:hover": {
							transform: "scale(1.1)",
							boxShadow: "0 6px 24px rgba(192,57,43,0.65)",
							animationPlayState: "paused",
						},
					}}
				>
					<Phone size={22} fill="white" strokeWidth={0} />
				</Box>
				<Box
					sx={{
						py: "5px",
						height: 33,
						borderRadius: "99px",
						textAlign: "center",
						background: "#ba3434",
						padding: "5px 0 5px 0",
						width: 'auto',
						px: 2,
						position: "absolute",
						color: "#fff",
						fontWeight: 700,
						fontSize: 14,
						zIndex: 999,
						top: 2,
						left: "50px",
						transition: "all .2s ease-in-out 0s",
						"&:before": {
							content: "''",
							position: "absolute",
							left: "-5px",
							top: "7px",
							width: 0,
							height: 0,
							borderBottom: "10px solid transparent",
							borderTop: "10px solid transparent",
							borderRight: "10px solid #ba3434",
						},
					}}
				>
					{phone}
				</Box>
			</Box>
		</Box>
	);
}
