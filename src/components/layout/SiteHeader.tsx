"use client";

import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { AppImage } from "../AppImage";
import Button from "../Button";
import { HotlineBar } from "./HotlineBar";
import Logo from "@/assets/images/logo.png";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "../homepage/SearchOverlay";
import { IContactConfig } from "@/types/contact";

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
						opacity: 0.8,
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
										color: "black",
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

export function SiteHeader({ phone, nav, contact }: { phone?: string; nav?: any; contact: IContactConfig }) {
	const pathname = usePathname();
	const isHomepage = pathname === "/";
	const isMobile = useMediaQuery("(max-width:900px)");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const theme = useTheme();
	const [scrolled, setScrolled] = useState(false);

	function isRouteActive(pathname: string, href: string): boolean {
		if (href === "/") return pathname === "/";
		return pathname === href || pathname.startsWith(`${href}/`);
	}

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		// Set initial state in case page loads mid-scroll
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Đóng search khi chuyển trang
	useEffect(() => {
		setSearchOpen(false);
	}, [pathname]);

	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("s")?.trim() || undefined;
	const isTransparent = isHomepage && !searchQuery && !scrolled;

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
					backgroundImage: "none",
					backgroundColor: isTransparent
						? "transparent"
						: "var(--color-header-bg)",
					color: isTransparent ? "#fff" : "var(--color-header-text)",
					height: 80,
					transition:
						"background-image 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease, color 0.3s ease",
				}}
			>
				<Container
					maxWidth="xl"
					sx={{
						px: isMobile ? '15px' : "30px !important",
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
								style={{ width: isMobile ? 120 : 150 }}
							/>
						</Link>

						<Grid className="block min-[900px]:hidden">
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
									onClick={() => setSearchOpen(true)}
								/>
								<Box sx={{ bgcolor: 'black', p: 1.25, cursor: 'pointer' }}>
									<Menu size={22} color="white" onClick={() => setMobileMenuOpen(true)} />
								</Box>
							</Grid>
							<MobileMenu
								open={mobileMenuOpen}
								onClose={() => setMobileMenuOpen(false)}
								nav={nav}
								contact={contact}
							/>
						</Grid>
						<Grid
							display="flex"
							alignItems="center"
							justifyContent="center"
							gap={3}
							className="hidden min-[900px]:flex"
						>
							<Stack
								direction="row"
								gap={{ md: 1, lg: 3 }}
								sx={{ display: { xs: "none", md: "flex" } }}
							>
								{nav.map((item: INavItem, index: number) => {
									const hasChildren = !!item.children?.length;
									const isActiveRoute =
										isRouteActive(pathname, item.href) ||
										item.children?.some((child) => isRouteActive(pathname, child.href));
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
								onClick={() => setSearchOpen(true)}
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
									'&:hover': {
										bgcolor: 'primary.main',
										color: theme.palette.getContrastText(theme.palette.primary.main)
									},
								}}
								fillHovered
							>
								LIÊN HỆ
							</Button>
						</Grid>
					</Toolbar>
				</Container>
			</AppBar>

			<SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
		</>
	);
}
