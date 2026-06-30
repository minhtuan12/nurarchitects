import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FacebookIcon from "../icons/Facebook";
import TiktokIcon from "../icons/Tiktok";
import YoutubeIcon from "../icons/Youtube";
import InstagramIcon from "../icons/Instagram";
import { MapPin, PhoneIcon, SendIcon } from "lucide-react";
import ConcreteBg from "@/assets/images/concrete-bg.jpg";
import Logo from "@/assets/images/logo.png";
import { AppImage } from "../AppImage";
import { fetchApi } from "@/helpers";
import { IContactConfig } from "@/types/contact";

const NAV_LINKS = [
	{ label: "Trang chủ", href: "/" },
	{ label: "Về chúng tôi", href: "/ve-chung-toi" },
	{ label: "Lĩnh vực", href: "/linh-vuc" },
	{ label: "Dự án", href: "/du-an" },
	{ label: "Tin tức", href: "/tin-tuc" },
	{ label: "Hợp tác", href: "/hop-tac" },
	{ label: "Tuyển dụng", href: "/tuyen-dung" },
	{ label: "Liên hệ", href: "/lien-he" },
];

export const SOCIAL_LINKS = [
	{
		icon: <FacebookIcon width={14} color="white" />,
		href: "#",
		label: "Facebook",
	},
	{
		icon: <TiktokIcon width={14} color="white" />,
		href: "#",
		label: "TikTok",
	},
	{
		icon: <YoutubeIcon width={14} color="white" fill="white" />,
		href: "#",
		label: "YouTube",
	},
	{
		icon: <InstagramIcon width={14} color="white" fill="white" />,
		href: "#",
		label: "Instagram",
	},
];

// Texture nền đá xám — dùng CSS noise filter để gần giống ảnh
const FOOTER_BG = "#cdc9c0";

export default async function SiteFooter() {
	const [contactRes] = await Promise.all([
		fetchApi<IContactConfig>("/api/contact"),
	]);
	const contact = contactRes?.item;

	return (
		<Box
			component="footer"
			sx={{
				backgroundColor: FOOTER_BG,
				backgroundImage: `url(${ConcreteBg.src})`,
				backgroundSize: "cover",
				borderTop: "1px solid rgba(0,0,0,0.15)",
				pt: 0,
			}}
		>
			<Box
				sx={{
					maxWidth: 1120,
					margin: "0 auto",
				}}
			>
				{/* ── Logo section ─────────────────────────────────────────────────── */}
				<Box
					sx={{
						pt: 10,
						pb: 5,
						textAlign: "center",
						display: "flex",
						justifyContent: "center",
					}}
				>
					<AppImage src={Logo} alt="Logo" style={{ width: 300 }} />
				</Box>

				<Divider sx={{ borderColor: "rgba(0,0,0,0.15)" }} />

				{/* ── Nav links ────────────────────────────────────────────────────── */}
				<Container maxWidth="lg">
					<Stack
						direction="row"
						flexWrap="wrap"
						justifyContent="center"
						gap={{ xs: 2, md: 0 }}
						sx={{ py: 3.5 }}
					>
						{NAV_LINKS.map((link, index) => (
							<Box
								key={link.href}
								sx={{ display: "flex", alignItems: "center" }}
							>
								<Link
									href={link.href}
									underline="none"
									sx={{
										color: "#474747",
										fontSize: 14,
										fontWeight: 400,
										px: { xs: 1, md: 2 },
										transition: "color 0.2s",
										"&:hover": { color: "#555" },
									}}
								>
									{link.label}
								</Link>
							</Box>
						))}
					</Stack>
				</Container>

				<Divider sx={{ borderColor: "rgba(0,0,0,0.15)" }} />

				{/* ── Company name + socials ───────────────────────────────────────── */}
				<Container maxWidth="md">
					<Box sx={{ py: 4, textAlign: "center" }}>
						<Typography
							sx={{
								fontSize: { xs: "1.25rem", md: "1.5rem" },
								fontWeight: 700,
								color: "#1a1a1a",
								lineHeight: 1.5,
								mb: 2.5,
							}}
						>
							Công ty TNHH Kiến trúc và Nội thất
							<br />
							Hoàng Nam Group
						</Typography>

						{/* Social icons */}
						<Stack direction="row" justifyContent="center" gap={2}>
							{SOCIAL_LINKS.map((social) => (
								<IconButton
									key={social.label}
									component="a"
									href={social.href}
									aria-label={social.label}
									size="small"
									sx={{
										width: 30,
										height: 30,
										backgroundColor: "#63666f",
										color: "#fff",
										borderRadius: "50%",
										transition: "background-color 0.2s",
										"&:hover": {
											backgroundColor: "#111",
										},
									}}
								>
									{social.icon}
								</IconButton>
							))}
						</Stack>
					</Box>
				</Container>

				<Divider sx={{ borderColor: "rgba(0,0,0,0.15)" }} />

				{/* ── Contact bar ──────────────────────────────────────────────────── */}
				<Container maxWidth="lg" disableGutters>
					<Grid
						container
						sx={{
							borderBottom: "1px solid rgba(0,0,0,0.15)",
						}}
					>
						{/* Phone */}
						<Grid
							size={{ xs: 12, md: 3 }}
							sx={{
								borderRight: {
									md: "1px solid rgba(0,0,0,0.15)",
								},
								borderBottom: {
									xs: "1px solid rgba(0,0,0,0.15)",
									md: "none",
								},
							}}
						>
							<Stack
								alignItems="center"
								justifyContent="center"
								gap={1.5}
								sx={{ py: 4, px: 3 }}
							>
								<PhoneIcon size={20} color="#3d3d3d" />
								<Typography
									sx={{
										fontSize: 14,
										color: "#3d3d3d",
										fontWeight: 400,
										mt: 3.5,
									}}
								>
									{contact?.phone || "Đang cập nhật"}
								</Typography>
							</Stack>
						</Grid>

						{/* Address */}
						<Grid
							size={{ xs: 12, md: 6 }}
							sx={{
								borderRight: {
									md: "1px solid rgba(0,0,0,0.15)",
								},
								borderBottom: {
									xs: "1px solid rgba(0,0,0,0.15)",
									md: "none",
								},
							}}
						>
							<Stack
								alignItems="center"
								justifyContent="center"
								gap={1.5}
								sx={{ py: 4, px: 3 }}
							>
								<MapPin size={26} color="#3d3d3d" />
								{contact?.locations?.length === 0 ? (
									"Đang cập nhật"
								) : (
									<Box sx={{ textAlign: "center" }} mt={3}>
										{contact?.locations.map((l, index) => (
											<Typography
												key={index}
												sx={{
													fontSize: 14,
													color: "#3d3d3d",
													lineHeight: 1.7,
												}}
											>
												{l.address}
											</Typography>
										))}
									</Box>
								)}
							</Stack>
						</Grid>

						{/* Email */}
						<Grid size={{ xs: 12, md: 3 }}>
							<Stack
								alignItems="center"
								justifyContent="center"
								gap={1.5}
								sx={{ py: 4, px: 3 }}
							>
								{/* Send/Paper plane icon — xoay 15° giống ảnh */}
								<SendIcon size={20} color="#3d3d3d" />
								<Typography
									sx={{
										fontSize: 14,
										color: "#3d3d3d",
										fontWeight: 400,
										mt: 3.5,
									}}
								>
									{contact?.email ||
										"Đang cập nhật"}
								</Typography>
							</Stack>
						</Grid>
					</Grid>
				</Container>

				{/* ── Copyright bar ────────────────────────────────────────────────── */}
				<Container maxWidth="lg">
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="center"
						sx={{ py: 3.75 }}
					>
						<Typography sx={{ fontSize: 14, color: "#3a3a3a" }}>
							Copyright © 2026{" "}
							<Box component="strong" sx={{ fontWeight: 700 }}>
								Nurarchitects Vietnam
							</Box>
							. All right reserved.
						</Typography>
					</Stack>
				</Container>
			</Box>
		</Box>
	);
}
