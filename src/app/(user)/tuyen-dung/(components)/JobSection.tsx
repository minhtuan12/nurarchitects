"use client";

import Link from "next/link";
import { Box, Pagination, PaginationItem, Stack, Typography } from "@mui/material";
import MediaRenderer from "@/components/MediaRenderer";
import type { IMedia } from "@/types/media";
import { ClockCircleFilled, EnvironmentFilled } from "@ant-design/icons";
import { withQueryString } from "@/helpers";
import { IDepartment, IJobPopulated } from "@/types/job";
import { WORKING_TYPE_LABELS } from "@/app/admin/jobs/positions/page";
import { formatDate } from "@/lib/utils";

interface JobSectionProps {
	jobs: IJobPopulated[];
	page: number;
	pageCount: number;
	basePath?: string;
	queryString?: string;
}

const clampStyle = (lines: number) => ({
	display: "-webkit-box",
	WebkitLineClamp: lines,
	WebkitBoxOrient: "vertical" as const,
	overflow: "hidden",
});

function isExpired(deadline?: string | Date) {
	if (!deadline) return true;
	return new Date(deadline).getTime() < Date.now();
}

function JobMeta({ workType, location }: { workType: string; location: string }) {
	return (
		<Stack direction={{ xs: 'column', md: "row" }} spacing={{ xs: 1, md: 4 }} alignItems={{ xs: 'flex-start', md: "center" }} sx={{ mt: 2 }}>
			<Stack direction="row" spacing={1} alignItems="center">
				<ClockCircleFilled color="#a7abb8" className="text-[#a7abb8] text-[16px] opacity-[70]" />
				<Typography sx={{ color: "#545f80", fontSize: 14, opacity: 0.7, fontWeight: 600 }}>{WORKING_TYPE_LABELS[workType as keyof typeof WORKING_TYPE_LABELS]}</Typography>
			</Stack>
			<Stack direction="row" spacing={1} alignItems="center">
				<EnvironmentFilled color="#a7abb8" className="text-[#a7abb8] text-[16px] opacity-[70]" />
				<Typography sx={{ color: "#545f80", fontSize: 14, opacity: 0.7, fontWeight: 600 }}>{location}</Typography>
			</Stack>
		</Stack>
	);
}

// Giữ nguyên logic build href phân trang từ NewsSection
function buildPageHref(basePath: string, targetPage: number, queryString?: string) {
	const path = targetPage <= 1 ? basePath : `${basePath}/trang/${targetPage}`;
	return withQueryString(path, queryString);
}

export default function JobSection({
	jobs,
	page,
	pageCount,
	basePath = "/tuyen-dung",
	queryString,
}: JobSectionProps) {
	if (!jobs?.length) return null;

	return (
		<Box>
			{/* Danh sách tin tuyển dụng */}
			<Stack spacing={2}>
				{jobs.map((job) => {
					const expired = isExpired(job.deadline);

					return (
						<Box
							key={String(job._id)}
							sx={{
								display: "flex",
								flexDirection: { xs: "column", md: "row" },
								textDecoration: "none",
								color: "inherit",
								gap: { xs: 2, md: 3 },
								pb: 3,
							}}
						>
							<Box
								sx={{
									position: "relative",
									width: { xs: "100%", md: 250 },
									aspectRatio: "3/2",
									flexShrink: 0,
									overflow: "hidden",
									bgcolor: "#F0F0F0",
								}}
							>
								<MediaRenderer
									media={job.thumbnailId as IMedia}
									controls={false}
									className="h-full"
									fill
									title={job.title}
								/>
							</Box>

							<Box sx={{ flex: 1, minWidth: 0 }} display='flex' flexDirection='column' justifyContent='center'>
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="flex-start"
									spacing={2}
								>
									<Link href={withQueryString(`${basePath}/${job.slug}`, queryString)}>
										<Typography
											variant="h6"
											fontWeight={700}
											sx={{
												...clampStyle(2),
												textTransform: "uppercase",
												lineHeight: 1.3,
												color: '#474747',
												fontSize: 23,
												maxWidth: { xs: 'unset', md: '70%' }
											}}
										>
											{job.title}
										</Typography>
									</Link>
									<Typography
										sx={{
											flexShrink: 0,
											fontSize: 14,
											fontWeight: 600,
											color: expired ? "error.main" : "success.main",
										}}
									>
										{expired ? "Hết hạn" : "Đang tuyển"}
									</Typography>
								</Stack>

								<JobMeta workType={job.workingType} location={job.workingAddress} />

								{/* <Box sx={{ borderTop: '1px solid rgba(0,0,0,.1)', my: 2 }} /> */}

								<Box sx={{ borderTop: "1px solid", borderColor: "rgba(0,0,0,.1)", mt: 1.5, pt: 1.5 }}>
									<Typography variant="body2" color="#3d3d3d" sx={clampStyle(2)} fontSize={14}>
										<b>Phòng ban:</b> {(job.departmentId as IDepartment)?.name}
									</Typography>
									{!!job.deadline && <Typography variant="body2" color="#3d3d3d" sx={clampStyle(2)} fontSize={14}>
										<b>Hạn nộp hồ sơ:</b> {formatDate(String(job.deadline))}
									</Typography>
									}
								</Box>
							</Box>
						</Box>
					);
				})}
			</Stack>

			{/* Phân trang - giữ nguyên logic/style từ NewsSection */}
			{pageCount > 1 && (
				<Stack alignItems="center" sx={{ mt: { xs: 4, md: 6 } }}>
					<Pagination
						page={page}
						count={pageCount}
						shape="rounded"
						siblingCount={1}
						boundaryCount={1}
						renderItem={(item) => {
							const isNavigable =
								item.type === "page" ||
								item.type === "previous" ||
								item.type === "next" ||
								item.type === "first" ||
								item.type === "last";

							if (!isNavigable || !item.page) {
								return <PaginationItem {...item} />;
							}

							return (
								<PaginationItem
									{...item}
									component={Link}
									href={buildPageHref(basePath, item.page, queryString)}
								/>
							);
						}}
						sx={{
							"& .MuiPaginationItem-root": {
								borderRadius: 0.5,
								borderColor: "#D5D5D5",
							},
							"& .MuiPaginationItem-root.Mui-selected": {
								bgcolor: "error.main",
								color: "#fff",
								borderColor: "error.main",
								"&:hover": { bgcolor: "error.dark" },
							},
						}}
					/>
				</Stack>
			)}
		</Box>
	);
}
