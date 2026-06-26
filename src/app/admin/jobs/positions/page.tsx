"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Modal, Space, Table, Tag, Typography } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { ColumnsType } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SquarePen, Trash } from "lucide-react";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import NoData from "@/components/NoData";
import { useMessage } from "@/contexts/AdminMessageContext";
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type { SortOrder, WorkingType } from "@/types/shared";
import { EWorkingType } from "@/lib/enums";

const { Text } = Typography;

// --- Enums (mirrors backend constants) ---
const jobStatuses = ["recruiting", "closed", "expired"] as const;
const workingTypes = [
	"part-time",
	"full-time",
	"remote",
	"collaborator",
] as const;

const STATUS_LABELS: Record<(typeof jobStatuses)[number], string> = {
	recruiting: "Đang tuyển",
	closed: "Đã đóng",
	expired: "Hết hạn",
};

const STATUS_COLORS: Record<(typeof jobStatuses)[number], string> = {
	recruiting: "green",
	closed: "default",
	expired: "red",
};

const WORKING_TYPE_LABELS: Record<(typeof workingTypes)[number], string> = {
	"part-time": "Bán thời gian",
	"full-time": "Toàn thời gian",
	remote: "Remote",
	collaborator: "Cộng tác viên",
};

interface DepartmentRef {
	_id: string;
	name: string;
}

interface JobRow {
	_id: string;
	title: string;
	slug: string;
	departmentId?: string | DepartmentRef;
	workingType: (typeof workingTypes)[number];
	status: (typeof jobStatuses)[number];
	deadline?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface JobResponse {
	items: JobRow[];
	page: number;
	limit: number;
	total: number;
}

interface DepartmentOption {
	_id: string;
	name: string;
}

interface JobFilters {
	status?: string;
	departmentId?: string;
	workingType?: WorkingType;
}

const formatDate = (value?: string) =>
	value
		? new Intl.DateTimeFormat("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}).format(new Date(value))
		: "-";

const departmentLabel = (department?: JobRow["departmentId"]) => {
	if (!department) return "-";
	if (typeof department === "object" && "name" in department)
		return department.name;
	return String(department);
};

export default function JobPositionsAdminPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const messageApi = useMessage();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: DEFAULT_PAGE_SIZE,
	});
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState<JobFilters>({});
	const [sortState, setSortState] = useState<{
		sortBy?: string;
		sortOrder?: SortOrder;
	}>({});

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch(searchInput.trim());
			setPagination((current) => ({ ...current, current: 1 }));
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [searchInput]);

	const currentPage = pagination.current;
	const pageSize = pagination.pageSize;

	const queryKey = useMemo(
		() => [
			"admin-jobs",
			currentPage,
			pageSize,
			search,
			filters,
			sortState,
		],
		[currentPage, pageSize, search, filters, sortState],
	);

	const { data, isFetching } = useQuery({
		queryKey,
		queryFn: async (): Promise<JobResponse> => {
			const params = new URLSearchParams({
				page: String(currentPage),
				limit: String(pageSize),
			});

			if (search) params.set("search", search);
			if (filters.status) params.set("status", filters.status);
			if (filters.workingType) params.set("workingType", filters.workingType);
			if (filters.departmentId)
				params.set("departmentId", filters.departmentId);
			if (sortState.sortBy && sortState.sortOrder) {
				params.set("sortBy", sortState.sortBy);
				params.set(
					"sortOrder",
					sortState.sortOrder === "ascend" ? "asc" : "desc",
				);
			}

			const response = await adminFetch(
				`/api/admin/jobs?${params.toString()}`,
				{ cache: "no-store" },
			);
			const payload = await response.json();
			if (!response.ok || payload.error) {
				throw new Error(payload.error ?? "Cannot load jobs");
			}
			return {
				items: payload.items ?? [],
				page: payload.page ?? currentPage,
				limit: payload.limit ?? pageSize,
				total: payload.total ?? 0,
			};
		},
	});

	const { data: departmentData } = useQuery({
		queryKey: ["admin-departments", "options"],
		queryFn: async (): Promise<{ items: DepartmentOption[] }> => {
			const response = await adminFetch(
				"/api/admin/departments?limit=100",
				{ cache: "no-store" },
			);
			const payload = await response.json();
			if (!response.ok || payload.error) {
				throw new Error(payload.error ?? "Cannot load departments");
			}
			return { items: payload.items ?? [] };
		},
	});

	const jobs = data?.items ?? [];
	const total = data?.total ?? 0;

	const confirmDelete = useCallback(
		(record: JobRow) => {
			Modal.confirm({
				title: "Xóa vị trí tuyển dụng?",
				content: `Bạn có chắc chắn muốn xóa "${record.title}"?`,
				okText: "Xóa",
				okButtonProps: {
					danger: true,
					loading: deletingId === record._id,
				},
				cancelText: "Hủy",
				onOk: async () => {
					setDeletingId(record._id);
					try {
						const response = await adminFetch(
							`/api/admin/jobs/${record._id}`,
							{ method: "DELETE" },
						);
						const data = await response.json();
						if (!response.ok || data.error) {
							throw new Error(data.error ?? "Cannot delete job");
						}
						messageApi.success("Đã xóa vị trí tuyển dụng");
						const nextPage =
							jobs.length === 1 && currentPage > 1
								? currentPage - 1
								: currentPage;
						if (nextPage !== currentPage) {
							setPagination((current) => ({
								...current,
								current: nextPage,
							}));
						} else {
							await queryClient.invalidateQueries({
								queryKey: ["admin-jobs"],
							});
						}
					} catch {
						messageApi.error("Không thể xóa vị trí này");
						throw new Error("Delete job failed");
					} finally {
						setDeletingId(null);
					}
				},
			});
		},
		[currentPage, deletingId, jobs.length, messageApi, queryClient],
	);

	const columns = useMemo<ColumnsType<JobRow>>(
		() => [
			{
				title: "Tiêu đề",
				dataIndex: "title",
				key: "title",
				width: 260,
				minWidth: 260,
				fixed: "left",
				render: (value: string, record) => (
					<div className="flex flex-col gap-1">
						<Text strong>{value}</Text>
						<Text type="secondary" className="text-xs">
							{record.slug}
						</Text>
					</div>
				),
			},
			{
				title: "Phòng ban",
				dataIndex: "departmentId",
				key: "departmentId",
				width: 160,
				minWidth: 160,
				align: "center",
				filterMultiple: false,
				filters: (departmentData?.items ?? []).map((department) => ({
					text: department.name,
					value: department._id,
				})),
				filteredValue: filters.departmentId
					? [filters.departmentId]
					: null,
				render: (value: JobRow["departmentId"]) =>
					departmentLabel(value),
			},
			{
				title: "Loại hình",
				dataIndex: "workingType",
				key: "workingType",
				width: 140,
				minWidth: 140,
				align: "center",
				filterMultiple: false,
				filters: workingTypes.map((type) => ({
					text: WORKING_TYPE_LABELS[type],
					value: type,
				})),
				filteredValue: filters.workingType ? [filters.workingType] : null,
				render: (value: JobRow["workingType"]) =>
					WORKING_TYPE_LABELS[value] ?? value,
			},
			{
				title: "Trạng thái",
				dataIndex: "status",
				key: "status",
				width: 120,
				minWidth: 120,
				align: "center",
				filterMultiple: false,
				filters: jobStatuses.map((status) => ({
					text: STATUS_LABELS[status],
					value: status,
				})),
				filteredValue: filters.status ? [filters.status] : null,
				render: (value: JobRow["status"]) => (
					<Tag color={STATUS_COLORS[value]} variant="outlined">
						{STATUS_LABELS[value] ?? value}
					</Tag>
				),
			},
			{
				title: "Hạn nộp",
				dataIndex: "deadline",
				key: "deadline",
				width: 130,
				minWidth: 130,
				align: "center",
				sorter: true,
				sortOrder:
					sortState.sortBy === "deadline"
						? sortState.sortOrder
						: undefined,
				render: (value?: string) => formatDate(value),
			},
			{
				title: "Thao tác",
				key: "actions",
				width: 100,
				minWidth: 100,
				fixed: "right",
				align: "center",
				render: (_, record) => (
					<Space className="gap-4">
						<SquarePen
							onClick={() => router.push(`/admin/jobs/${record._id}`)}
							className="cursor-pointer"
							color="#2b7fff"
							width={18}
						/>
						<Trash
							onClick={() => confirmDelete(record)}
							className="cursor-pointer"
							color="red"
							width={18}
						/>
					</Space>
				),
			},
		],
		[confirmDelete, departmentData?.items, filters, router, sortState],
	);

	const handleTableChange = (
		nextPagination: TablePaginationConfig,
		tableFilters: Record<string, FilterValue | null>,
		sorter: SorterResult<JobRow> | SorterResult<JobRow>[],
	) => {
		setPagination({
			current: nextPagination.current ?? 1,
			pageSize: nextPagination.pageSize ?? DEFAULT_PAGE_SIZE,
		});

		const statusValue = tableFilters.status?.[0];
		const departmentValue = tableFilters.departmentId?.[0];
		const workingTypeValue = tableFilters.workingType?.[0];
		setFilters({
			status:
				statusValue !== undefined ? String(statusValue) : undefined,
			workingType:
				workingTypeValue !== undefined
					? (String(workingTypeValue) as WorkingType)
					: undefined,
			departmentId:
				departmentValue !== undefined
					? String(departmentValue)
					: undefined,
		});

		const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
		if (activeSorter?.field === "deadline" && activeSorter.order) {
			setSortState({
				sortBy: "deadline",
				sortOrder: activeSorter.order,
			});
		} else {
			setSortState({});
		}
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-3 px-1">
				<Input
					placeholder="Tìm kiếm theo tiêu đề vị trí tuyển dụng"
					prefix={<SearchOutlined className="text-gray-400 mr-1" />}
					allowClear
					value={searchInput}
					onChange={(event) => setSearchInput(event.target.value)}
					className="h-10 max-w-xs [&_.ant-input]:h-full"
				/>
				<Button
					type="primary"
					size="large"
					icon={<PlusOutlined />}
					onClick={() => router.push("/admin/jobs/create")}
				>
					Thêm
				</Button>
			</div>
			<Block>
				<Table
					rowKey="_id"
					columns={columns}
					dataSource={jobs}
					loading={isFetching}
					pagination={{
						current: currentPage,
						pageSize,
						total,
						showSizeChanger: false,
						showTotal: (total) => `${total} vị trí tuyển dụng`,
					}}
					locale={{
						emptyText: (
							<NoData description="Chưa có vị trí tuyển dụng nào" />
						),
					}}
					onChange={handleTableChange}
					className="[&_.ant-pagination]:mb-0 [&_.ant-pagination]:mt-6"
				/>
			</Block>
		</div>
	);
}
