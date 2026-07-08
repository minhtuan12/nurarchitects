"use client";

import { ClipboardPen, ClipboardSignature } from "lucide-react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function StepItem() {
	return (
		<Box
			sx={{
				position: 'relative',
				width: '100%',
				maxWidth: 600,
				aspectRatio: '2 / 1', // Giữ đúng tỉ lệ ảnh chữ nhật nằm ngang
				backgroundColor: '#dedede', // Màu nền xám nhạt giả lập chất liệu canvas/giấy
				backgroundImage: 'radial-gradient(#ccc 1px, transparent 0)', // Tạo hiệu ứng hạt mịn (noise) nhẹ của nền
				backgroundSize: '4px 4px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				paddingLeft: '32%', // Đẩy khối chữ sang phải để nhường chỗ cho số 1 và đường chéo
				paddingRight: '5%',
				userSelect: 'none',
				overflow: 'hidden',
				boxSizing: 'border-box',
				fontFamily: '"Inter", "Roboto", "Helvetica", Arial, sans-serif',
			}}
		>
			{/* Số 1 lớn mờ nằm ở góc trái */}
			<Typography
				sx={{
					position: 'absolute',
					left: '12%',
					top: '-15px',
					fontSize: '16rem',
					fontWeight: 900,
					color: '#b0b3b8',
					lineHeight: 1,
					opacity: 0.8,
				}}
			>
				1
			</Typography>

			{/* Đường kẻ chéo phân cách */}
			<Box
				sx={{
					position: 'absolute',
					left: '5%',
					bottom: '10%',
					width: '55%',
					height: '2px',
					backgroundColor: '#b0b3b8',
					transform: 'rotate(-42deg)',
					transformOrigin: 'bottom left',
				}}
			/>

			{/* Nội dung chính bên phải */}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, zIndex: 1 }}>
				{/* Icon Clipboard từ Lucide */}
				<Box sx={{ color: '#111', display: 'flex', alignItems: 'center' }}>
					<ClipboardSignature size={48} strokeWidth={1.8} />
				</Box>

				{/* Tiêu đề lớn */}
				<Typography
					variant="h4"
					sx={{
						fontWeight: 700,
						color: '#111',
						fontSize: '2.1rem',
						letterSpacing: '0.5px',
					}}
				>
					Gửi thông tin đăng ký
				</Typography>

				{/* Đoạn mô tả chi tiết */}
				<Typography
					sx={{
						color: '#4a4a4a',
						fontSize: '1.25rem',
						fontWeight: 400,
						lineHeight: 1.5,
					}}
				>
					Gửi thông tin đăng ký qua website <br />
					hoặc email{' '}
					<Box
						component="a"
						href="mailto:contact@arteco.vn"
						sx={{
							color: '#111',
							textDecoration: 'underline',
							fontWeight: 600,
							cursor: 'pointer',
							'&:hover': {
								color: '#444',
							},
						}}
					>
						contact@arteco.vn
					</Box>
				</Typography>
			</Box>
		</Box>
	);
}
