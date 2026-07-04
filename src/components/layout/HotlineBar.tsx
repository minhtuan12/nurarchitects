"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export function HotlineBar({
	isTransparent,
	phone,
}: {
	isTransparent: boolean;
	phone?: string;
}) {
	return (
		<Box
			sx={{
				borderBottom: "1px solid rgba(255,255,255,0.08)",
				py: 1,
				backgroundColor: isTransparent
					? "transparent"
					: "var(--color-header-bg)",
				zIndex: 9999,
				position: "relative",
			}}
		>
			<Container maxWidth="xl" sx={{ px: "80px !important" }}>
				<Box
					display="flex"
					justifyContent="flex-end"
					alignItems="center"
					gap={1}
				>
					<Typography
						variant="body2"
						sx={{
							fontWeight: 600,
							color: isTransparent
								? "white"
								: "var(--color-header-text)",
							fontSize: 13,
							letterSpacing: "0.02em",
						}}
					>
						Hotline:{" "}
						<Typography
							component="a"
							href={`tel:${phone}`}
							variant="body2"
							sx={{
								color: isTransparent
									? "white"
									: "var(--color-header-text)",
								fontWeight: 600,
								fontSize: 13,
								textDecoration: "none",
							}}
						>
							{phone}
						</Typography>
					</Typography>
				</Box>
			</Container>
		</Box>
	);
}
