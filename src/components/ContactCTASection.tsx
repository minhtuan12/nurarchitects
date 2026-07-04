"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { X } from "lucide-react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { BuildArea, BuildPlan, EBuildPlan } from "@/types/project";
import { EArea, IContactForm } from "@/types/contact";
import { toast } from "sonner";
import ConcreteBg from "@/assets/images/concrete-bg.jpg";
import BgPattern from "@/assets/images/bg-pattern.jpg";
import { GridFadeIn } from "./base/Grid";

const initialValues: IContactForm = {
	fullName: "",
	phone: "",
	planningToBuild: "",
	buildPlan: EBuildPlan.home.value as BuildPlan,
	area: EArea.under.value as BuildArea,
	floors: 4,
	address: "",
	specialRequirement: "",
};

const labelSx = {
	fontSize: 12,
	fontWeight: 700,
	letterSpacing: "0.05em",
	textTransform: "uppercase" as const,
	color: "#444",
	mb: 1,
};

const inputSx = {
	bgcolor: "transparent",
	borderColor: 'rgba(20, 20, 20, 0.3)',
	fontSize: 12,

	'& .MuiOutlinedInput-notchedOutline': {
		border: ' 1px solid #1414144d !important',
	},
	"& .MuiOutlinedInput-root": {
		borderRadius: 0,
		height: 35,
		fontSize: 14,
		color: '#333',
	},
	"& .MuiInputBase-multiline": {
		height: 120,
		pt: 0,
	}
};

async function submitContactForm(payload: IContactForm) {
	const res = await fetch("/api/contact", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			...payload,
			floors: payload.floors ? Number(payload.floors) : undefined,
		}),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => null);
		throw new Error(data?.error || "Gửi thông tin thất bại");
	}
	return res.json();
}

export default function ContactCTASection() {
	const [open, setOpen] = useState(false);
	const [values, setValues] = useState<IContactForm>(initialValues);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: submitContactForm,
		onSuccess: () => {
			setErrorMsg(null);
			setValues(initialValues);
			toast.success(
				"Đã gửi thông tin thành công, Nurarchitects sẽ liên hệ với bạn sớm.",
				{ duration: 5000 },
			);
			setOpen(false);
		},
		onError: (err: Error) => {
			setErrorMsg(err.message || "Có lỗi xảy ra, vui lòng thử lại");
		},
	});

	const handleChange =
		(field: keyof IContactForm) =>
			(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				if (errorMsg && (field === 'fullName' || field === 'phone')) { setErrorMsg(null) }
				setValues((prev) => ({ ...prev, [field]: e.target.value }));
			};

	const handleSubmit = () => {
		if (!values.fullName.trim() || !values.phone.trim()) {
			setErrorMsg("Vui lòng nhập đầy đủ Họ và tên, Số điện thoại");
			return;
		}
		mutation.mutate(values);
	};

	return (
		<>
			{/* ===== CTA Banner ===== */}
			<Box
				component="section"
				sx={{
					py: { xs: 4, md: 4 },
					px: { xs: 0, md: 4 },
				}}
			>
				<Container maxWidth="lg" sx={{ px: { xs: 0, md: 2 } }}>
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", md: "row" },
							bgcolor: "primary.main",
							position: "relative",
							overflow: "hidden",
							height: 350,
						}}
					>
						<Image
							src={BgPattern.src}
							fill
							className="absolute w-full h-full"
							alt={'Liên hệ tư vấn với Nurarchitects'}
						/>
						{/* Left: text content */}
						<GridFadeIn
							fadeInDirection="left"
							sx={{
								flex: 1,
								pl: { xs: 4, md: 10 },
								position: "relative",
								zIndex: 1,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
							}}
						>
							<Typography
								sx={{
									color: "#9199b0",
									fontSize: '0.85em',
									fontWeight: 600,
									letterSpacing: "0.05em",
									textTransform: "uppercase",
									mb: 0.75,
								}}
							>
								Liên hệ ngay với chúng tôi
							</Typography>
							<Typography
								sx={{
									color: "#fff",
									fontSize: { xs: 22, md: '1.6em' },
									fontWeight: 700,
									lineHeight: 1.5,
									mb: 3.625,
								}}
							>
								Liên hệ với Nurarchitects
								<br />
								để nhận tư vấn miễn phí
							</Typography>
							<Button
								onClick={() => setOpen(true)}
								variant="outlined"
								sx={{
									color: "#8fa8c8",
									borderColor: "#8fa8c8",
									borderRadius: 0,
									py: 1.25,
									width: 215,
									fontSize: 14,
									letterSpacing: "0.12em",
									textTransform: "uppercase",
									"&:hover": {
										backgroundColor: "white",
										color: "#666",
									},
								}}
							>
								Đặt lịch ngay
							</Button>
						</GridFadeIn>

						{/* Right: image */}
						{/* <Box
							sx={{
								flex: 1,
								position: "relative",
								minHeight: { xs: 260, md: "auto" },
							}}
						>
							<Image
								src={ConsultImage}
								alt="Tư vấn Nurarchitects"
								fill
								style={{ objectFit: "cover" }}
							/>
						</Box> */}
					</Box>
				</Container >
			</Box >

			{/* ===== Modal Form ===== */}
			< Modal open={open} onClose={() => setOpen(false)
			}>
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: { xs: "92%", sm: 640, md: 800 },
						backgroundImage: `url(${ConcreteBg.src})`,
						backgroundSize: "contain",
						opacity: 40,
						py: { xs: 3, md: '50px' },
						px: { xs: 3, md: '30px' },
					}}
				>
					<IconButton
						onClick={() => setOpen(false)}
						sx={{ position: "absolute", top: 16, right: 16 }}
					>
						<X size={20} />
					</IconButton>

					<Typography
						sx={{
							color: "#586280",
							fontSize: '0.85em',
							fontWeight: 700,
							letterSpacing: "0.05em",
							textTransform: "uppercase",
							textAlign: "center",
							mb: 0.75,
						}}
					>
						Thông tin liên hệ
					</Typography>
					<Typography
						variant="h2"
						sx={{
							color: "#1c1c1c",
							fontSize: { xs: 20, md: 28 },
							fontWeight: 700,
							textAlign: "center",
							lineHeight: 1.5,
							mb: 4,
						}}
					>
						Liên hệ Nurarchitects
						<br />
						để đặt lịch tư vấn miễn phí
					</Typography>

					<Grid container spacing={2.5}>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography sx={labelSx}>Họ và tên</Typography>
							<TextField
								fullWidth
								size="small"
								value={values.fullName}
								onChange={handleChange("fullName")}
								sx={inputSx}
								focused
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography sx={labelSx}>Số điện thoại</Typography>
							<TextField
								fullWidth
								size="small"
								value={values.phone}
								onChange={handleChange("phone")}
								sx={inputSx}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography sx={labelSx}>
								Dự định xây dựng
							</Typography>
							<TextField
								select
								fullWidth
								size="small"
								value={values.buildPlan}
								onChange={handleChange("buildPlan")}
								sx={inputSx}
							>
								{Object.entries(EBuildPlan).map(
									([key, item]) => (
										<MenuItem key={key} value={item.value}>
											{item.label}
										</MenuItem>
									),
								)}
							</TextField>
						</Grid>

						<Grid size={{ xs: 12, md: 4 }}>
							<Typography sx={labelSx}>
								Diện tích xây dựng
							</Typography>
							<TextField
								select
								fullWidth
								size="small"
								value={values.area}
								onChange={handleChange("area")}
								sx={inputSx}
							>
								{Object.entries(EArea).map(([key, item]) => (
									<MenuItem key={key} value={item.value}>
										{item.label}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography sx={labelSx}>
								Số tầng xây dựng
							</Typography>
							<TextField
								fullWidth
								size="small"
								type="number"
								value={values.floors}
								onChange={handleChange("floors")}
								sx={inputSx}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography sx={labelSx}>
								Địa điểm xây dựng
							</Typography>
							<TextField
								fullWidth
								size="small"
								value={values.address}
								onChange={handleChange("address")}
								sx={inputSx}
							/>
						</Grid>

						<Grid size={{ xs: 12 }}>
							<Typography sx={labelSx}>
								Yêu cầu đặc biệt tới Nurarchitects
							</Typography>
							<TextField
								fullWidth
								multiline
								minRows={4}
								value={values.specialRequirement}
								onChange={handleChange("specialRequirement")}
								sx={inputSx}
							/>
						</Grid>
					</Grid>

					{errorMsg && (
						<Typography
							sx={{ color: "#c0392b", fontSize: 13, mt: 2 }}
						>
							{errorMsg}
						</Typography>
					)}

					<Box
						sx={{
							display: "flex",
							justifyContent: "flex-end",
							mt: 3,
						}}
					>
						<Button
							onClick={handleSubmit}
							disabled={mutation.isPending}
							variant="contained"
							sx={{
								bgcolor: "#1a2a5e",
								color: "#fff",
								borderRadius: 0,
								px: 3.5,
								py: 1.3,
								fontSize: 13,
								fontWeight: 600,
								letterSpacing: "0.08em",
								boxShadow: "none",
								textTransform: 'uppercase',
								"&:hover": {
									bgcolor: "#142250",
									boxShadow: "none",
								},
							}}
						>
							{mutation.isPending
								? "Đang gửi..."
								: "Gửi thông tin tư vấn"}
						</Button>
					</Box>
				</Box>
			</Modal >
		</>
	);
}
