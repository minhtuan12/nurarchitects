"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import { EBuildPlan, IProjectPopulated } from "@/types/project";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";

// ---- Cấu hình ----
const ITEMS_PER_PAGE = 6;
const ALL_FILTER_VALUE = "all";

interface ProjectsSectionProps {
	projects: IProjectPopulated[];
}

const filterOptions = [
	{ value: ALL_FILTER_VALUE, label: "Tất cả" },
	...Object.values(EBuildPlan).map((item) => ({
		value: item.value,
		label: item.label,
	})),
];

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
	const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER_VALUE);
	const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
	const [isPending, startTransition] = useTransition();

	const filteredProjects = useMemo(() => {
		if (activeFilter === ALL_FILTER_VALUE) return projects;
		return projects.filter((project) => project.category === activeFilter);
	}, [projects, activeFilter]);

	const visibleProjects = useMemo(
		() => filteredProjects.slice(0, visibleCount),
		[filteredProjects, visibleCount]
	);

	const hasMore = visibleCount < filteredProjects.length;

	const handleFilterChange = useCallback(
		(value: string) => {
			if (value === activeFilter) return;
			startTransition(() => {
				setActiveFilter(value);
				setVisibleCount(ITEMS_PER_PAGE); // reset phân trang mỗi khi đổi filter
			});
		},
		[activeFilter]
	);

	const handleLoadMore = useCallback(() => {
		startTransition(() => {
			setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
		});
	}, []);

	return (
		<Box component="section" sx={{ px: 3 }}>
			{/* ---- Filter tabs ---- */}
			<Container maxWidth="lg">
				<Stack
					direction="row"
					spacing={2.5}
					flexWrap="wrap"
					useFlexGap
					justifyContent="flex-start"
					sx={{ mb: { xs: 3, md: 5 }, rowGap: 1.5 }}
					role="tablist"
					aria-label="Bộ lọc loại công trình"
				>
					{filterOptions.map((option) => {
						const isActive = option.value === activeFilter;
						return (
							<Button
								key={option.value}
								role="tab"
								aria-selected={isActive}
								onClick={() => handleFilterChange(option.value)}
								disableElevation
								sx={{
									borderRadius: "4px",
									textTransform: "none",
									fontWeight: 600,
									fontSize: 15,
									px: 2.5,
									py: 1,
									minWidth: "auto",
									whiteSpace: "nowrap",
									border: "1px solid",
									borderColor: isActive ? "primary.dark" : "divider",
									bgcolor: isActive ? "primary.dark" : "transparent",
									color: isActive ? "common.white" : "text.primary",
									"&:hover": {
										bgcolor: isActive ? "primary.dark" : "action.hover",
										borderColor: "primary.dark",
									},
								}}
							>
								{option.label}
							</Button>
						);
					})}
				</Stack>
			</Container>

			{/* ---- Danh sách project ---- */}
			<Grid container spacing={2.5}>
				{visibleProjects.map((project) => (
					<Grid size={{ xs: 12, sm: 6, md: 4 }} key={String(project._id)}>
						<Link href={`/du-an/${project.slug}`}>
							<ProjectCard p={project} />
						</Link>
					</Grid>
				))}
			</Grid>

			{filteredProjects.length === 0 && (
				<Typography
					align="center"
					color="text.secondary"
					sx={{ py: { xs: 4, md: 6 } }}
				>
					Chưa có công trình nào thuộc danh mục này.
				</Typography>
			)}

			{/* ---- Nút Xem thêm ---- */}
			{hasMore && (
				<Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 4, md: 6 } }}>
					<Button
						onClick={handleLoadMore}
						disabled={isPending}
						variant="outlined"
						sx={{
							borderRadius: "4px",
							borderColor: "error.main",
							color: "error.main",
							px: 4,
							py: 1,
							fontWeight: 600,
							letterSpacing: 1,
							textTransform: "uppercase",
							"&:hover": {
								borderColor: "error.main",
								bgcolor: "error.main",
								color: 'white',
							},
						}}
					>
						{isPending ? "Đang tải..." : "Xem thêm"}
					</Button>
				</Box>
			)}
		</Box>
	);
}
