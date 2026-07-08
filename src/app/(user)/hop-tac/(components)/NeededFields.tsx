"use client";

import { useMemo, useState } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import type { IMedia } from "@/types/media";
import { Handshake } from "lucide-react";
import PartnerRegistrationDialog from "./PartnerRegistrationDialog";
import BgPattern from '@/assets/images/bg-pattern-1.jpg';
import Image from "next/image";
import { RichContent } from "@/components/PageSections";

interface BlueSectionField {
	name: string;
	description?: string;
	imageId?: IMedia;
}

interface BlueSectionProps {
	fields: BlueSectionField[];
	ctaContent?: string;
	introductionContent?: string;
}

// nhóm các phần tử theo hàng 3, hàng cuối thiếu sẽ tự co giãn nhờ flex:1
function chunk<T>(arr: T[], size: number): T[][] {
	const rows: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		rows.push(arr.slice(i, i + size));
	}
	return rows;
}

function FieldIcon({ field }: { field: BlueSectionField }) {
	if (field.imageId?.secureUrl) {
		return (
			<Box
				component="img"
				src={field.imageId.secureUrl}
				alt={field.name}
				sx={{ width: 48, height: 48, objectFit: "contain" }}
			/>
		);
	}
	// icon mặc định khi field không có imageId
	return <Handshake size={50} className="text-[rgba(255,255,255,0.55)]" strokeWidth={1} />;
}

export default function NeededFields({ introductionContent, fields, ctaContent }: BlueSectionProps) {
	const [openForm, setOpenForm] = useState(false);
	const rows = useMemo(() => chunk(fields, 3), [fields]);

	return (
		<Box
			sx={{
				position: "relative",
				bgcolor: "#0E1B3D",
				overflow: "hidden",
				py: { xs: 6, md: 12 },
			}}
		>
			<Image
				src={BgPattern.src}
				fill
				className="w-full h-full absolute"
				alt={"Định hướng hợp tác của NUR Architects"}
			/>

			{!!introductionContent &&
				<Container maxWidth="lg" sx={{ position: "relative" }}>
					<Typography
						variant="h6"
						sx={{
							color: "#9199b0",
							fontWeight: 700,
							fontSize: 12,
							lineHeight: 1.05,
							letterSpacing: '0.05em',
							textTransform: 'uppercase',
							mb: 3,
						}}
					>
						Giới thiệu & Định hướng hợp tác
					</Typography>
					<RichContent html={introductionContent} className="text-[23px]" />
					<Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.15)', my: 7 }} />
				</Container>
			}

			<Container maxWidth="lg" sx={{ position: "relative" }}>
				<Typography
					variant="h6"
					sx={{
						color: "#fff",
						fontWeight: 300,
						fontSize: 23,
						mb: 4,
						lineHeight: 1.4,
					}}
				>
					Chúng tôi tìm kiếm những đối tác có năng lực,<br />
					trách nhiệm và tinh
					thần hợp tác trong các lĩnh vực:
				</Typography>

				<Stack spacing={2} sx={{ mt: 6 }}>
					{rows.map((row, rowIndex) => (
						<Stack
							key={rowIndex}
							direction={{ xs: "column", md: "row" }}
							spacing={2.5}
						>
							{row.map((field, colIndex) => (
								<Box
									key={`${rowIndex}-${colIndex}`}
									sx={{
										flex: 1,
										border: "1px solid rgba(255,255,255,0.12)",
										p: 3,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										textAlign: "center",
										gap: 2,
										borderRadius: 0.2,
									}}
								>
									<FieldIcon field={field} />
									<Typography
										sx={{ color: "#fff", fontWeight: 400, fontSize: 18 }}
									>
										{field.name}
									</Typography>
								</Box>
							))}
						</Stack>
					))}
				</Stack>

				<Typography
					sx={{
						color: "#ffffff8c",
						fontStyle: "italic",
						textAlign: "center",
						mt: 4,
						mb: 3,
						maxWidth: 640,
						mx: "auto",
						fontWeight: 400,
						fontSize: 14,
					}}
				>
					Trước khi gửi hồ sơ, vui lòng tham khảo các tiêu chí và quy trình hợp
					tác dưới đây để đảm bảo sự phù hợp, hiệu quả trong quá trình làm
					việc.
				</Typography>

				<Box sx={{ textAlign: "center" }}>
					<Button
						variant="contained"
						onClick={() => setOpenForm(true)}
						sx={{
							bgcolor: "#C0392B",
							color: "#fff",
							fontWeight: 700,
							px: 4,
							py: 1.25,
							borderRadius: 0.2,
							textTransform: 'uppercase',
							"&:hover": { bgcolor: "#A93226" },
						}}
					>
						{ctaContent || 'Trở thành đối tác NUR Architects!'}
					</Button>
				</Box>
			</Container>

			<PartnerRegistrationDialog
				open={openForm}
				setOpen={setOpenForm}
				onClose={() => setOpenForm(false)}
			/>
		</Box>
	);
}
