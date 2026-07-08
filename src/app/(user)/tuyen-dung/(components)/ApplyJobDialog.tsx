"use client";

import { useRef, useState } from "react";
import {
	Box,
	Button,
	Grid,
	IconButton,
	Modal,
	TextField,
	Typography,
} from "@mui/material";
import { Paperclip, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface ApplyJobDialogProps {
	open: boolean;
	onClose: () => void;
	jobId: string;
	jobTitle: string;
}

interface IJobApplicationForm {
	fullName: string;
	email: string;
	phone: string;
}

const initialValues: IJobApplicationForm = {
	fullName: "",
	email: "",
	phone: "",
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
	borderColor: "rgba(20, 20, 20, 0.3)",
	fontSize: 12,

	"& .MuiOutlinedInput-notchedOutline": {
		border: " 1px solid #1414144d !important",
	},
	"& .MuiOutlinedInput-root": {
		borderRadius: 0,
		height: 35,
		fontSize: 14,
		color: "#333",
	},
};

async function submitApplication(payload: {
	jobId: string;
	fullName: string;
	email: string;
	phone: string;
	file: File | null;
}) {
	const formData = new FormData();
	formData.append("jobId", payload.jobId);
	formData.append("fullName", payload.fullName);
	formData.append("email", payload.email);
	formData.append("phone", payload.phone);
	if (payload.file) {
		formData.append("file", payload.file);
	}

	const res = await fetch("/api/jobs", {
		method: "POST",
		body: formData,
	});
	if (!res.ok) {
		const data = await res.json().catch(() => null);
		throw new Error(data?.error || "Gửi hồ sơ ứng tuyển thất bại");
	}
	return res.json();
}

export default function ApplyJobDialog({
	open,
	onClose,
	jobId,
	jobTitle,
}: ApplyJobDialogProps) {
	const [values, setValues] = useState<IJobApplicationForm>(initialValues);
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const requiredFields: (keyof IJobApplicationForm)[] = [
		"fullName",
		"email",
		"phone",
	];

	const mutation = useMutation({
		mutationFn: async (form: IJobApplicationForm) => submitApplication({ jobId, ...form, file: resumeFile }),
		onSuccess: () => {
			setErrorMsg(null);
			setValues(initialValues);
			setResumeFile(null);
			toast.success(
				"Đã gửi hồ sơ ứng tuyển thành công, Nurarchitects sẽ liên hệ với bạn sớm.",
				{ duration: 5000 },
			);
			onClose();
		},
		onError: (err: Error) => {
			setErrorMsg(err.message || "Có lỗi xảy ra, vui lòng thử lại");
		},
	});

	const handleChange =
		(field: keyof IJobApplicationForm) =>
			(e: React.ChangeEvent<HTMLInputElement>) => {
				if (errorMsg) setErrorMsg(null);
				setValues((prev) => ({ ...prev, [field]: e.target.value }));
			};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file && file.type !== "application/pdf") {
			setErrorMsg("Chỉ chấp nhận file CV định dạng PDF");
			e.target.value = "";
			return;
		}
		setResumeFile(file);
	};

	const handleSubmit = () => {
		const missing = requiredFields.some((field) => (!values[field]?.trim() || !resumeFile));
		if (missing) {
			setErrorMsg("Vui lòng nhập đầy đủ Họ tên, Email, Số điện thoại, file CV");
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
					width: { xs: "92%", sm: 480, md: 560 },
					bgcolor: "background.default",
					py: { xs: 3, md: "50px" },
					px: { xs: 3, md: "30px" },
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
					Ứng tuyển vị trí
				</Typography>
				<Typography
					variant="h2"
					sx={{
						color: "#1c1c1c",
						fontSize: { xs: 18, md: 22 },
						fontWeight: 700,
						textAlign: "center",
						lineHeight: 1.5,
						mb: 4,
					}}
				>
					{jobTitle}
				</Typography>

				<Grid container spacing={2.5}>
					<Grid size={12}>
						<Typography sx={labelSx}>HỌ VÀ TÊN*</Typography>
						<TextField
							fullWidth
							size="small"
							placeholder="Nguyễn Văn A"
							value={values.fullName}
							onChange={handleChange("fullName")}
							sx={inputSx}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography sx={labelSx}>SỐ ĐIỆN THOẠI*</Typography>
						<TextField
							fullWidth
							size="small"
							value={values.phone}
							onChange={handleChange("phone")}
							sx={inputSx}
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }}>
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

					<Grid size={12}>
						<Typography sx={labelSx}>ĐÍNH KÈM CV*</Typography>
						<input
							ref={fileInputRef}
							type="file"
							accept=".pdf,application/pdf"
							hidden
							onChange={handleFileChange}
						/>
						<Button
							onClick={() => fileInputRef.current?.click()}
							startIcon={<Paperclip size={16} />}
							variant="outlined"
							size="small"
							sx={{
								borderRadius: 0,
								borderColor: "rgba(20,20,20,.3)",
								color: "#333",
								textTransform: "none",
								fontSize: 13,
							}}
						>
							{resumeFile ? resumeFile.name : "Chọn file CV (PDF)"}
						</Button>
					</Grid>
				</Grid>

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
							textTransform: "uppercase",
							"&:hover": {
								bgcolor: "#142250",
								boxShadow: "none",
							},
						}}
					>
						{mutation.isPending ? "Đang gửi..." : "Gửi hồ sơ ứng tuyển"}
					</Button>
				</Box>
			</Box>
		</Modal>
	);
}
