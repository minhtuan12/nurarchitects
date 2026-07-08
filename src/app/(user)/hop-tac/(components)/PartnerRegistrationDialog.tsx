"use client";

import { useState } from "react";
import {
	Box,
	Button,
	Grid,
	IconButton,
	MenuItem,
	Modal,
	TextField,
	Typography,
} from "@mui/material";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ECooperationService, ICooperationForm } from "@/types/cooperation";

interface PartnerRegistrationDialogProps {
	open: boolean;
	setOpen: any;
	onClose: () => void;
}

const initialValues: ICooperationForm = {
	companyName: "",
	contactName: "",
	position: "",
	phone: "",
	email: "",
	mainService: "",
	otherService: "",
	capacityProfileUrl: "",
	catalogueUrl: "",
	productSegmentUrl: "",
	policyUrl: "",
};

const labelSx = {
	fontSize: 12,
	fontWeight: 700,
	letterSpacing: 0.4,
	color: "#141414b3",
	mb: 0.75,
	display: "block",
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

async function submitCooperationForm(payload: ICooperationForm) {
	const res = await fetch("/api/cooperation", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => null);
		throw new Error(data?.error || "Gửi thông tin thất bại");
	}
	return res.json();
}

export default function PartnerRegistrationDialog({
	open,
	setOpen,
	onClose,
}: PartnerRegistrationDialogProps) {
	const [values, setValues] = useState<ICooperationForm>(initialValues);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const requiredFields: (keyof ICooperationForm)[] = [
		"companyName",
		"contactName",
		"position",
		"phone",
		"email",
	];

	const mutation = useMutation({
		mutationFn: submitCooperationForm,
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
		(field: keyof ICooperationForm) =>
			(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				if (errorMsg && requiredFields.includes(field)) {
					setErrorMsg(null);
				}
				setValues((prev) => ({ ...prev, [field]: e.target.value }));
			};

	const handleSubmit = () => {
		const missing = requiredFields.some((field) => !values[field]?.trim());
		if (missing) {
			setErrorMsg(
				"Vui lòng nhập đầy đủ Tên đơn vị, Tên đại diện, Chức vụ, Số điện thoại, Email",
			);
			return;
		}
		mutation.mutate(values);
	};

	const handleClose = () => {
		setErrorMsg(null);
		onClose();
	};

	return (
		<Modal open={open} onClose={handleClose}>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: { xs: "92%", sm: 640, md: 800 },
					bgcolor: 'background.default',
					opacity: 40,
					py: { xs: 3, md: '50px' },
					px: { xs: 3, md: '30px' },
				}}
			>
				<IconButton
					onClick={handleClose}
					sx={{ position: "absolute", top: 16, right: 16 }}
				>
					<X size={20} />
				</IconButton>

				<Typography
					sx={{
						color: "#586280",
						fontSize: 12,
						fontWeight: 700,
						letterSpacing: "0.05em",
						textTransform: "uppercase",
						textAlign: "center",
						mb: 0.75,
					}}
				>
					Thông tin đăng ký
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
					Trở thành đối tác của Nurarchitects
				</Typography>

				<Grid container spacing={2.5}>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography sx={labelSx}>TÊN ĐƠN VỊ*</Typography>
						<TextField
							fullWidth
							size="small"
							placeholder="Công ty TNHH..."
							value={values.companyName}
							onChange={handleChange("companyName")}
							sx={inputSx}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography sx={labelSx}>TÊN ĐẠI DIỆN LIÊN HỆ*</Typography>
						<TextField
							fullWidth
							size="small"
							placeholder="Nguyễn Văn A"
							value={values.contactName}
							onChange={handleChange("contactName")}
							sx={inputSx}
						/>
					</Grid>

					<Grid size={{ xs: 12, md: 4 }}>
						<Typography sx={labelSx}>CHỨC VỤ*</Typography>
						<TextField
							fullWidth
							size="small"
							placeholder="Trưởng phòng kinh doanh"
							value={values.position}
							onChange={handleChange("position")}
							sx={inputSx}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Typography sx={labelSx}>SỐ ĐIỆN THOẠI*</Typography>
						<TextField
							fullWidth
							size="small"
							value={values.phone}
							onChange={handleChange("phone")}
							sx={inputSx}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<Typography sx={labelSx}>EMAIL*</Typography>
						<TextField
							fullWidth
							size="small"
							type="email"
							value={values.email}
							onChange={handleChange("email")}
							sx={inputSx}
						/>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }}>
						<Typography sx={labelSx}>SẢN PHẨM/DỊCH VỤ CHÍNH</Typography>
						<TextField
							select
							fullWidth
							size="small"
							value={values.mainService}
							onChange={handleChange("mainService")}
							sx={inputSx}
						>
							<MenuItem value="">
								<em>Chọn sản phẩm/dịch vụ</em>
							</MenuItem>
							{Object.entries(ECooperationService).map(([key, item]) => (
								<MenuItem key={key} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</TextField>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography sx={labelSx}>
							SẢN PHẨM/DỊCH VỤ KHÁC (BỎ QUA NẾU ĐÃ CHỌN)
						</Typography>
						<TextField
							fullWidth
							size="small"
							value={values.otherService}
							onChange={handleChange("otherService")}
							sx={inputSx}
						/>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }}>
						<Typography sx={labelSx}>HỒ SƠ NĂNG LỰC (NẾU CÓ)</Typography>
						<TextField
							fullWidth
							size="small"
							placeholder="https://drive.google.com/file/..."
							value={values.capacityProfileUrl}
							onChange={handleChange("capacityProfileUrl")}
							sx={inputSx}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography sx={labelSx}>
							CATALOGUE SẢN PHẨM, THIẾT BỊ, GIẢI PHÁP
						</Typography>
						<TextField
							fullWidth
							size="small"
							placeholder="https://drive.google.com/file/..."
							value={values.catalogueUrl}
							onChange={handleChange("catalogueUrl")}
							sx={inputSx}
						/>
					</Grid>

					<Grid size={12}>
						<Typography sx={labelSx}>
							BẢNG TỔNG HỢP PHÂN KHÚC SẢN PHẨM, GIẢI PHÁP KỸ THUẬT (KHUYẾN
							KHÍCH)
						</Typography>
						<TextField
							fullWidth
							size="small"
							placeholder="https://drive.google.com/file/..."
							value={values.productSegmentUrl}
							onChange={handleChange("productSegmentUrl")}
							sx={inputSx}
						/>
					</Grid>

					<Grid size={12}>
						<Typography sx={labelSx}>
							CHÍNH SÁCH CHIẾT KHẤU, HỢP TÁC, CHẾ ĐỘ BẢO HÀNH, HẬU MÃI (NẾU CÓ)
						</Typography>
						<TextField
							fullWidth
							size="small"
							placeholder="https://drive.google.com/file/..."
							value={values.policyUrl}
							onChange={handleChange("policyUrl")}
							sx={inputSx}
						/>
					</Grid>
				</Grid>

				<Typography
					sx={{
						color: "error.main",
						fontSize: 13,
						mt: 2,
						textAlign: { xs: "center", sm: "right" },
						fontStyle: 'italic',
					}}
				>
					Vui lòng mở quyền truy cập các file thông tin gửi kèm!
				</Typography>

				{errorMsg && (
					<Typography sx={{ color: "#c0392b", fontSize: 13, mt: 2 }}>
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
						{mutation.isPending ? "Đang gửi..." : "Gửi thông tin"}
					</Button>
				</Box>
			</Box>
		</Modal>
	);
}
