"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/images/logo.png"; // thay path logo thật
import { ChevronDown, X } from "lucide-react";
import { GridFadeIn } from "../base/Grid";
import { usePathname } from "next/navigation";
import { Grid } from "@mui/material";
import { INavItem } from "./SiteHeader";
import { IContactConfig } from "@/types/contact";
import FacebookIcon from "../icons/Facebook";
import TiktokIcon from "../icons/Tiktok";
import YoutubeIcon from "../icons/Youtube";
import InstagramIcon from "../icons/Instagram";

export const SOCIAL_LINKS = [
	{
		icon: <FacebookIcon width={14} color="currentColor" />,
		href: "#",
		label: "Facebook",
		key: 'facebookUrl'
	},
	{
		icon: <TiktokIcon width={14} color="currentColor" />,
		href: "#",
		label: "TikTok",
		key: 'tikTokUrl'
	},
	{
		icon: <YoutubeIcon width={14} color="currentColor" fill="currentColor" />,
		href: "#",
		label: "YouTube",
		key: 'youTubeUrl'
	},
	{
		icon: <InstagramIcon width={14} color="currentColor" fill="currentColor" />,
		href: "#",
		label: "Instagram",
		key: 'instagramUrl'
	},
];

export default function MobileMenu({
	open,
	onClose,
	nav,
	contact,
}: {
	open: boolean;
	onClose: () => void;
	nav: INavItem[];
	contact: IContactConfig;
}) {
	const pathname = usePathname();
	const [expandedItem, setExpandedItem] = useState<string | null>(null);

	const toggleExpand = (label: string) => {
		setExpandedItem((prev) => (prev === label ? null : label));
	};

	return (
		<Drawer
			anchor="top"
			open={open}
			onClose={onClose}
			slotProps={{
				paper: {
					sx: {
						width: "100%",
						height: '100vh',
						bgcolor: 'background.default',
					},
				}
			}}
		>
			<GridFadeIn sx={{ height: "100%", display: "flex", flexDirection: "column" }} fadeInDirection="down">
				{/* Header: logo + close button */}
				<Box
					sx={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
						px: 3,
						pt: 6,
						pb: 2,
					}}
				>
					<Box sx={{ position: "relative", width: 240, height: 85 }}>
						<Image
							src={Logo.src}
							alt="Artéco"
							fill
							style={{ objectFit: "contain", objectPosition: "left" }}
						/>
					</Box>

					<IconButton onClick={onClose} sx={{ color: "#1c1c1c" }} className="-mt-10 -mr-4">
						<X size={26} />
					</IconButton>
				</Box>

				{/* Social icons */}
				<Grid gap={1.5} sx={{ px: 3, mb: 3, mt: 1.5 }} maxWidth={300} size={12} container>
					{SOCIAL_LINKS.map((social) => (
						<Grid key={social.label} size={2}>
							<IconButton
								component="a"
								href={contact?.[social.key as keyof typeof contact] as string || '#'}
								aria-label={social.label}
								size="small"
								sx={{
									width: 40,
									height: 40,
									backgroundColor: "#63666f",
									color: "#fff",
									borderRadius: "50%",
									transition: "background-color 0.2s",
									"&:hover": {
										backgroundColor: "#111",
									},
									'& svg': {
										width: 18,
										height: 18
									}
								}}
							>
								{social.icon}
							</IconButton>
						</Grid>
					))}
				</Grid>

				<Divider sx={{ borderColor: "rgba(0,0,0,0.1)", my: 2 }} />

				{/* Menu items */}
				< Stack sx={{ flex: 1, overflowY: "auto", py: 1 }}>
					{nav.map((item) => {
						const hasChildren = !!item.children?.length;
						const isExpanded = expandedItem === item.label;
						const isActiveRoute = item?.href && pathname.includes(item.href) || item.children?.some(i => pathname.includes(i.href));

						return (
							<Box key={item.label} sx={{
								bgcolor: (hasChildren && isExpanded) ? 'rgb(0 0 0 / 10%)' : 'unset',
							}}>
								<Box
									onClick={
										hasChildren
											? () => toggleExpand(item.label)
											: undefined
									}
									component={!hasChildren ? Link : "div"}
									href={!hasChildren ? item.href : undefined}
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										py: 1.5,
										px: 3,
										cursor: "pointer",
										textDecoration: "none",
										'&:hover': {
											bgcolor: 'rgb(0 0 0 / 10%)',
											color: 'black',
										}
									}}
								>
									<Typography
										sx={{
											fontSize: 21,
											fontWeight: isActiveRoute ? 700 : 400,
											color: !isActiveRoute ? (hasChildren && isExpanded ? "#1c1c1c" : '#666666d9') : '#1c1c1c',
										}}
									>
										{item.label}
									</Typography>

									{hasChildren && (
										<ChevronDown
											size={24}
											color="#666666d9"
											style={{
												transform: isExpanded
													? "rotate(180deg)"
													: "rotate(0deg)",
												transition: "transform 0.25s ease",
											}}
										/>
									)}
								</Box>

								{hasChildren && (
									<Collapse in={isExpanded} timeout="auto" unmountOnExit>
										<Stack sx={{ pb: 1.5, pl: 6, pt: 0.5 }}>
											{item.children!.map((child) => (
												<Link
													key={child.href}
													href={child.href}
													style={{ textDecoration: "none" }}
												>
													<Typography
														sx={{
															fontSize: 15,
															color: "#666666",
															py: 1,
															'&:hover': {
																color: 'black',
															}
														}}
													>
														{child.label}
													</Typography>
												</Link>
											))}
										</Stack>
									</Collapse>
								)}
							</Box>
						);
					})}
				</Stack>
			</GridFadeIn>
		</Drawer>
	);
}
