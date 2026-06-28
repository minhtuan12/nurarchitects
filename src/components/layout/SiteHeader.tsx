"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { AppImage } from "../AppImage";
import Button from "../Button";
import { HotlineBar } from "./HotlineBar";
import Logo from "@/assets/images/logo.png";
import ConcreteBg from "@/assets/images/concrete-bg.jpg";

const nav = [
	["Trang chủ", "/"],
	["Về chúng tôi", "/gioi-thieu"],
	["Lĩnh vực", "/linh-vuc"],
	["Dự án", "/du-an"],
	["Tin tức", "/tin-tuc"],
	["Hợp tác", "/hop-tac"],
	["Tuyển dụng", "/tuyen-dung"],
] as const;

export function SiteHeader({ phone }: { phone?: string }) {
	const pathname = usePathname();
	const isHomepage = pathname === "/";

	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		// Set initial state in case page loads mid-scroll
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// On homepage: transparent until scrolled. On other pages: always has background.
	const isTransparent = isHomepage && !scrolled;

	return (
		<>
			{/* Hotline bar: normal flow, scrolls away naturally */}
			{/* Only show on homepage when not scrolled, always show on other pages */}
			<HotlineBar isTransparent={isTransparent} phone={phone} />

			<AppBar
				position="sticky"
				color="transparent"
				elevation={0}
				sx={{
					top: 0,
					backdropFilter: isTransparent ? "none" : "blur(18px)",
					borderBlock: isTransparent
						? "1px solid rgba(65, 65, 65, 0.08)"
						: "1px solid rgba(29,28,24,.1)",
					backgroundImage: isTransparent ? "none" : `url(${ConcreteBg.src})`,
					backgroundSize: 'cover',
					backgroundColor: isTransparent ? "transparent" : undefined,
					color: isTransparent ? "#fff" : "#626160",
					height: 80,
					transition: "background-image 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease, color 0.3s ease",
				}}
			>
				<Container maxWidth="xl" sx={{ px: "30px !important", height: "100%" }}>
					<Toolbar
						disableGutters
						sx={{
							gap: 3,
							height: "100%",
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<Link href="/">
							<AppImage src={Logo} alt="Logo" width={150} style={{ width: 150 }} />
						</Link>

						<Grid display="flex" alignItems="center" justifyContent="center" gap={3}>
							<Stack direction="row" gap={{ md: 1, lg: 3 }} sx={{ display: { xs: "none", md: "flex" } }}>
								{nav.map(([label, href]) => (
									<Button
										key={href}
										component={Link}
										href={href}
										color="inherit"
										sx={{
											px: 1.2,
											color: "inherit",
											"&:hover": { color: isTransparent ? "rgba(255,255,255,0.7)" : "black" },
										}}
									>
										{label}
									</Button>
								))}
							</Stack>

							<Search
								size={18}
								style={{ cursor: "pointer", color: "inherit" }}
								className="mr-2 hover:text-[black]"
							/>

							<Button
								component={Link}
								href="/lien-he"
								variant="outlined"
								sx={{
									px: 5.8,
									py: 1,
									borderRadius: 1.2,
									fontSize: 12.5,
									color: "inherit",
									borderColor: "currentColor",
								}}
								fillHovered
							>
								LIÊN HỆ
							</Button>
						</Grid>
					</Toolbar>
				</Container>
			</AppBar>
		</>
	);
}
