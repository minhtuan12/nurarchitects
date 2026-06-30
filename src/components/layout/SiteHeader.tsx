"use client";

import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import { ChevronDown, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { AppImage } from "../AppImage";
import Button from "../Button";
import { HotlineBar } from "./HotlineBar";
import Logo from "@/assets/images/logo.png";
import ConcreteBg from "@/assets/images/concrete-bg.jpg";
import { Box, useMediaQuery } from "@mui/material";
import MobileMenu from "./MobileMenu";

export interface INavItem {
	label: string;
	href: string;
	children?: { label: string; href: string }[];
}

function NavItem({
	item,
	hasChildren,
	isActiveRoute,
	isTransparent,
}: {
	item: INavItem;
	hasChildren: boolean;
	isActiveRoute: boolean;
	isTransparent: boolean;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<Box
			sx={{ position: "relative" }}
			onMouseEnter={() => hasChildren && setHovered(true)}
			onMouseLeave={() => hasChildren && setHovered(false)}
		>
			<Button
				component={Link}
				href={item.href}
				color="inherit"
				sx={{
					px: 1.2,
					display: "flex",
					alignItems: "center",
					gap: 0.5,
					color: "inherit",
					fontWeight: isActiveRoute ? 600 : 400,
					"&:hover": {
						color: isTransparent ? "rgba(255,255,255,0.7)" : "black",
					},
				}}
			>
				{item.label}
				{hasChildren && (
					<ChevronDown
						size={14}
						style={{
							transform: hovered ? "rotate(180deg)" : "rotate(0deg)",
							transition: "transform 0.2s ease",
						}}
					/>
				)}
			</Button>

			{hasChildren && hovered && (
				<Box
					sx={{
						position: "absolute",
						top: "100%",
						left: 0,
						minWidth: 220,
						bgcolor: "#fff",
						boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
						py: 1,
						zIndex: 10,
						borderRadius: 0.5,
					}}
				>
					{item.children!.map((child) => (
						<Link key={child.href} href={child.href}>
							<Box
								sx={{
									px: 2.5,
									py: 1.2,
									color: "#333",
									fontSize: 14,
									"&:hover": {
										bgcolor: "#f5f5f5",
										color: "primary.main",
									},
								}}
							>
								{child.label}
							</Box>
						</Link>
					))}
				</Box>
			)}
		</Box>
	);
}

export function SiteHeader({ phone, nav }: { phone?: string; nav?: any }) {
	const pathname = usePathname();
	const isHomepage = pathname === "/";
	const isMobile = useMediaQuery("(max-width:900px)");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
			{!isMobile && <HotlineBar isTransparent={isTransparent} phone={phone} />}

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
					backgroundImage: isTransparent
						? "none"
						: `url(${ConcreteBg.src})`,
					backgroundSize: "cover",
					backgroundColor: isTransparent ? "transparent" : undefined,
					color: isTransparent ? "#fff" : "#626160",
					height: 80,
					transition:
						"background-image 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease, color 0.3s ease",
				}}
			>
				<Container
					maxWidth="xl"
					sx={{
						px: "30px !important",
						height: "100%",
						maxWidth: 1920,
						margin: "0 auto",
					}}
				>
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
							<AppImage
								src={Logo}
								alt="Logo"
								width={150}
								style={{ width: 150 }}
							/>
						</Link>

						{isMobile ? (
							<>
								<Grid
									display="flex"
									alignItems="center"
									justifyContent="center"
									gap={1}
								>
									<Search
										strokeWidth={2.5}
										size={20}
										style={{
											cursor: "pointer",
											color: "inherit",
										}}
										className="mr-2 hover:text-[black]"
									/>
									<Box sx={{ bgcolor: 'primary.main', p: 1.25, cursor: 'pointer' }}>
										<Menu size={22} color="white" onClick={() => setMobileMenuOpen(true)} />
									</Box>
								</Grid>
								<MobileMenu
									open={mobileMenuOpen}
									onClose={() => setMobileMenuOpen(false)}
									nav={nav}
								/>
							</>
						) : (
							<Grid
								display="flex"
								alignItems="center"
								justifyContent="center"
								gap={3}
							>
								<Stack
									direction="row"
									gap={{ md: 1, lg: 3 }}
									sx={{ display: { xs: "none", md: "flex" } }}
								>
									{nav.map((item: INavItem, index: number) => {
										const hasChildren = !!item.children?.length;
										const isActiveRoute = item?.href && pathname.includes(item.href) || item?.children?.some((i) => pathname.includes(i.href));
										return (
											<NavItem
												key={index}
												item={item}
												hasChildren={hasChildren}
												isActiveRoute={!!isActiveRoute}
												isTransparent={isTransparent}
											/>
										);
									})}
								</Stack>

								<Search
									size={18}
									style={{
										cursor: "pointer",
										color: "inherit",
									}}
									className="mr-2 hover:text-[black]"
								/>

								<Button
									component={Link}
									href="/lien-he"
									variant="outlined"
									sx={{
										width: 140,
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
						)}
					</Toolbar>
				</Container>
			</AppBar>
		</>
	);
}
