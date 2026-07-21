import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "next/link";

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
			className="block max-[900px]:hidden"
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
						<Link
							href={`tel:${phone}`}
							className={`${isTransparent ? 'white' : 'black'} font-[600] text-[13px] no-underline`}
						>
							{phone}
						</Link>
					</Typography>
				</Box>
			</Container>
		</Box>
	);
}
