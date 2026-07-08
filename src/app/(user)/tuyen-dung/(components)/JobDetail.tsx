'use client'

import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
	ClockCircleFilled,
	DollarCircleFilled,
	EnvironmentFilled,
	CalendarFilled,
} from "@ant-design/icons";
import { IJobPopulated } from "@/types/job";
import { WORKING_TYPE_LABELS } from "@/app/admin/jobs/positions/page";
import { formatDate } from "@/lib/utils";
import { MoveLeft } from "lucide-react";
import { RichContent } from "@/components/PageSections";
import { useState } from "react";
import ApplyJobDialog from "./ApplyJobDialog";

interface JobDetailSectionProps {
	job: IJobPopulated;
	relatedJobs: IJobPopulated[];
	basePath: string;
}

// Offset từ top viewport khi box "Ứng tuyển nhiều" bắt đầu dính lại.
// Chỉnh theo chiều cao header cố định thực tế của site (nếu có).
const STICKY_TOP_OFFSET = 96;

function isExpired(deadline?: string | Date) {
	if (!deadline) return true;
	return new Date(deadline).getTime() < Date.now();
}

function InfoRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<Stack
			direction={{ xs: "column", md: "row" }}
			alignItems={{ xs: 'unset', md: 'center' }}
			spacing={{ xs: 2, md: 4 }}
			sx={{
				py: 3,
				px: 4,
				border: "1px solid",
				borderColor: "rgba(0,0,0,.08)",
			}}
		>
			<Typography
				sx={{
					width: { xs: "auto", md: 220 },
					flexShrink: 0,
					fontWeight: 700,
					fontSize: 15,
					letterSpacing: 0.5,
					color: "#3d3d3d",
					textTransform: "uppercase",
					textAlign: { xs: 'center', md: 'unset' },
				}}
			>
				{label}
			</Typography>
			<RichContent className="text-[#3d3d3d] flex-1 text-[14px] leading-[1.9]" html={children as unknown as string} />
		</Stack>
	);
}

function RelatedJobCard({
	job,
	basePath,
}: {
	job: IJobPopulated;
	basePath: string;
}) {
	return (
		<Box
			component={Link}
			href={`${basePath}/${job.slug}`}
			sx={{
				display: "block",
				textDecoration: "none",
				color: "inherit",
				py: 2,
				borderBottom: "1px solid rgba(0,0,0,.08)",
				"&:last-of-type": { borderBottom: "none" },
			}}
		>
			<Typography
				sx={{
					fontWeight: 700,
					fontSize: 15,
					textTransform: "uppercase",
					color: "#474747",
					lineHeight: 1.4,
				}}
			>
				{job.title}
			</Typography>
			<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
				<ClockCircleFilled className="text-[#a7abb8] text-[13px]" />
				<Typography sx={{ color: "#545f80", fontSize: 13, fontWeight: 600, opacity: 0.7 }}>
					{WORKING_TYPE_LABELS[job.workingType as keyof typeof WORKING_TYPE_LABELS]}
				</Typography>
			</Stack>
			<Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 0.5 }}>
				<EnvironmentFilled className="text-[#a7abb8] text-[13px]" style={{ marginTop: 3 }} />
				<Typography sx={{ color: "#545f80", fontSize: 13, fontWeight: 600, opacity: 0.7 }}>
					{job.workingAddress}
				</Typography>
			</Stack>
		</Box>
	);
}

export default function JobDetailSection({
	job,
	relatedJobs,
	basePath,
}: JobDetailSectionProps) {
	const expired = isExpired(job.deadline);
	const [applyOpen, setApplyOpen] = useState(false);

	return (
		<Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
			{/* Cột trái: toàn bộ thông tin job */}
			<Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
				<Link
					href={basePath}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: 8,
						color: "#545f80",
						opacity: 0.7,
						textDecoration: "none",
						fontSize: 14,
						marginBottom: 16,
					}}
					className="hover:opacity-100"
				>
					<MoveLeft /> Quay lại danh sách tuyển dụng
				</Link>

				<Typography
					variant="h4"
					sx={{
						fontWeight: 800,
						textTransform: "uppercase",
						color: "#1c1c1c",
						fontSize: { xs: 24, md: 28 },
					}}
				>
					{job.title}
				</Typography>

				<Box
					sx={{
						mt: 3,
						pt: 5,
						borderTop: "1px solid rgba(0,0,0,.1)",
					}}
				>
					<Stack
						direction={{ xs: "column", md: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "flex-start", md: "center" }}
						spacing={2}
					>
						<Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 1.5, md: 4 }}>
							<Stack direction="row" spacing={1} alignItems="flex-start">
								<DollarCircleFilled className="text-[#a7abb8] mt-1" />
								<Typography sx={{ fontSize: 14, color: "#3d3d3d" }}>
									<b>Mức lương:</b> {job.salary}
								</Typography>
							</Stack>
							<Stack direction="row" spacing={1} alignItems="flex-start">
								<ClockCircleFilled className="text-[#a7abb8] mt-1" />
								<Typography sx={{ fontSize: 14, color: "#3d3d3d" }}>
									<b>Tính chất công việc:</b>{" "}
									{WORKING_TYPE_LABELS[job.workingType as keyof typeof WORKING_TYPE_LABELS]}
								</Typography>
							</Stack>
							{!!job.deadline && (
								<Stack direction="row" spacing={1} alignItems="flex-start">
									<CalendarFilled className="text-[#a7abb8] mt-1" />
									<Typography sx={{ fontSize: 14, color: "#3d3d3d" }}>
										<b>Hạn ứng tuyển:</b> {formatDate(String(job.deadline))}
									</Typography>
								</Stack>
							)}
						</Stack>

						<Button
							variant="outlined"
							color="error"
							disabled={expired}
							onClick={() => setApplyOpen(true)}
							sx={{ fontWeight: 700, flexShrink: 0, px: 4 }}
						>
							{expired ? "Hết hạn ứng tuyển" : "Ứng tuyển"}
						</Button>
					</Stack>
				</Box>

				<Box sx={{ mt: 5 }}>
					<InfoRow label="Mô tả công việc">{job.description}</InfoRow>
					<InfoRow label="Quyền lợi được hưởng">{job.benefits}</InfoRow>
					<InfoRow label="Yêu cầu năng lực">{job.requirements}</InfoRow>
					<InfoRow label="Thông tin liên hệ">{job.contacts}</InfoRow>
				</Box>
			</Box>

			{/* Cột phải: sticky khi cuộn, tự nhả ra khi chạm đáy cột trái */}
			{relatedJobs.length > 0 && (
				<Box
					sx={{
						width: { xs: "100%", md: 320 },
						flexShrink: 0,
						position: { xs: "static", md: "sticky" },
						top: STICKY_TOP_OFFSET,
						alignSelf: "flex-start",
						bgcolor: "#F3F3F3",
						p: 4,
					}}
				>
					<Typography
						sx={{
							fontWeight: 800,
							fontSize: 20,
							letterSpacing: 0.5,
							mb: 1,
							color: "#1c1c1c",
						}}
					>
						ỨNG TUYỂN NHIỀU
					</Typography>
					<Box sx={{ borderBottom: '1px solid rgba(0,0,0,.1)', mt: 2, mb: 2 }} />
					{relatedJobs.map((j) => (
						<RelatedJobCard key={String(j._id)} job={j} basePath={basePath} />
					))}
				</Box>
			)}

			<ApplyJobDialog
				open={applyOpen}
				onClose={() => setApplyOpen(false)}
				jobId={String(job._id)}
				jobTitle={job.title}
			/>
		</Stack>
	);
}
