"use client";

import {
	Box,
	Stack,
	Typography,
} from "@mui/material";
import {
	ClipboardPen,
	MessageSquareMore,
	Handshake,
} from "lucide-react";

const steps = [
	{
		number: "1",
		icon: ClipboardPen,
		title: "Gửi thông tin đăng ký",
		description: (
			<>
				Gửi thông tin đăng ký qua website hoặc email{" "}
				<Box
					component="a"
					href="mailto:contact@arteco.vn"
					sx={{
						color: "inherit",
						fontWeight: 700,
						textDecoration: "underline",
					}}
				>
					contact@arteco.vn
				</Box>
			</>
		),
	},
	{
		number: "2",
		icon: MessageSquareMore,
		title: "Arteco phản hồi",
		description: "Arteco phản hồi trong vòng 3-5 ngày làm việc",
	},
	{
		number: "3",
		icon: Handshake,
		title: "Kết nối và hợp tác",
		description: "Kết nối và hợp tác vào thời điểm phù hợp",
	},
];

function NumberDecoration({
	number,
}: {
	number: string;
}) {
	return (
		<Box
			sx={{
				position: "absolute",
				left: 0,
				top: -18,
				width: 180,
				height: 170,
				pointerEvents: "none",
				overflow: "hidden",
			}}
		>
			<Typography
				sx={{
					fontSize: 150,
					fontWeight: 800,
					lineHeight: 0.9,
					color: "#d7d7dc",
					userSelect: "none",
				}}
			>
				{number}
			</Typography>

			{/* White mask */}
			<Box
				sx={{
					position: "absolute",
					left: 92,
					top: -80,
					width: 34,
					height: 330,
					bgcolor: "#fff",
					transform: "rotate(45deg)",
					zIndex: 2,
				}}
			/>

			{/* Diagonal line */}
			<Box
				sx={{
					position: "absolute",
					left: 108,
					top: -70,
					width: 1,
					height: 360,
					bgcolor: "#cfd1d5",
					transform: "rotate(45deg)",
					transformOrigin: "top",
					zIndex: 3,
				}}
			/>
		</Box>
	);
}

export default function ProcessSteps() {
	return (
		<Box py={10}>
			<Stack
				direction={{ xs: "column", md: "row" }}
				justifyContent="space-between"
				spacing={6}
			>
				{steps.map((step) => {
					const Icon = step.icon;

					return (
						<Box
							key={step.number}
							sx={{
								position: "relative",
								flex: 1,
								minHeight: 250,
								pl: 4,
							}}
						>
							<NumberDecoration number={step.number} />

							<Box
								sx={{
									position: "relative",
									zIndex: 10,
									pt: 6,
									ml: 6,
								}}
							>
								<Icon
									size={34}
									strokeWidth={1.8}
								/>

								<Typography
									sx={{
										mt: 2,
										fontWeight: 700,
										fontSize: 34,
									}}
								>
									{step.title}
								</Typography>

								<Typography
									sx={{
										mt: 1,
										color: "#666",
										lineHeight: 1.8,
										fontSize: 18,
									}}
								>
									{step.description}
								</Typography>
							</Box>
						</Box>
					);
				})}
			</Stack>
		</Box>
	);
}
