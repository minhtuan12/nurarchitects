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
import { GridFadeIn } from "@/components/base/Grid";

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
	const res = await fetch("/api/cooperation", {
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

export default function ContactForm() {
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
		<Box
			sx={{
				maxWidth: 1200,
				bgcolor: 'white',
				opacity: 40,
				py: { xs: 3, md: '50px' },
				px: { xs: 3, md: '30px' },
				margin: '0 auto',
			}}
		>
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
	);
}
