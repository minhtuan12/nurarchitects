"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Button,
	Flex,
	Image,
	Input,
	Modal,
	Select,
	Space,
	Table,
	Tag,
	Typography,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SquarePen, Trash } from "lucide-react";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import NoData from "@/components/NoData";
import { useMessage } from "@/contexts/AdminMessageContext";
import type { SortOrder } from "@/types/shared";
import type { ActivityResponse } from "./(components)/activity-form-utils";
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS, STATUS_OPTIONS } from "@/lib/constants";
import { IActivityPopulated } from "@/types/activity";

const { Text } = Typography;

interface ActivitiesResponse {
	items: ActivityResponse[];
	page: number;
	limit: number;
	total: number;
}

interface ActivityFilters {
	status?: string;
}

export default function ActivitiesAdminPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const messageApi = useMessage();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: DEFAULT_PAGE_SIZE,
	});
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState<ActivityFilters>({});
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
			"admin-activities",
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
		queryFn: async (): Promise<ActivitiesResponse> => {
			const params = new URLSearchParams({
				page: String(currentPage),
				limit: String(pageSize),
			});

			if (search) params.set("search", search);
			if (filters.status) params.set("status", filters.status);
			if (sortState.sortBy && sortState.sortOrder) {
				params.set("sortBy", sortState.sortBy);
				params.set(
					"sortOrder",
					sortState.sortOrder === "ascend" ? "asc" : "desc",
				);
			}

			const response = await adminFetch(
				`/api/admin/activities?${params.toString()}`,
				{ cache: "no-store" },
			);
			const payload = await response.json();
			if (!response.ok || payload.error) {
				throw new Error(payload.error ?? "Cannot load activities");
			}
			return {
				items: payload.items ?? [],
				page: payload.page ?? currentPage,
				limit: payload.limit ?? pageSize,
				total: payload.total ?? 0,
			};
		},
	});

	const activities = data?.items ?? [];
	const total = data?.total ?? 0;
	const orderOptions = useMemo(
		() =>
			Array.from({ length: total }, (_, index) => ({
				label: index + 1,
				value: index + 1,
			})),
		[total],
	);

	const handleOrderChange = useCallback(
		async (record: ActivityResponse, order: number) => {
			if (record.order === order) return;

			setUpdatingOrderId(record._id);
			try {
				const response = await adminFetch(
					`/api/admin/activities/${record._id}`,
					{
						method: "PATCH",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ order }),
					},
				);
				const data = await response.json();
				if (!response.ok || data.error) {
					throw new Error(data.error ?? "Cannot update activity order");
				}
				await queryClient.invalidateQueries({
					queryKey: ["admin-activities"],
				});
				messageApi.success("Đã cập nhật thứ tự");
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: "Không thể cập nhật thứ tự";
				messageApi.error(message);
			} finally {
				setUpdatingOrderId(null);
			}
		},
		[messageApi, queryClient],
	);

	const confirmDelete = useCallback(
		(record: ActivityResponse) => {
			Modal.confirm({
				title: "Xóa lĩnh vực?",
				content: `Bạn có chắc chắn muốn xóa ${record.name}?`,
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
							`/api/admin/activities/${record._id}`,
							{ method: "DELETE" },
						);
						const data = await response.json();
						if (!response.ok || data.error) {
							throw new Error(
								data.error ?? "Cannot delete activity",
							);
						}
						messageApi.success("Đã xóa thành công");
						const nextPage =
							activities.length === 1 && currentPage > 1
								? currentPage - 1
								: currentPage;
						if (nextPage !== currentPage) {
							setPagination((current) => ({
								...current,
								current: nextPage,
							}));
						} else {
							await queryClient.invalidateQueries({
								queryKey: ["admin-activities"],
							});
						}
					} catch {
						messageApi.error("Không thể xóa lĩnh vực này");
						throw new Error("Delete activity failed");
					} finally {
						setDeletingId(null);
					}
				},
			});
		},
		[
			activities.length,
			currentPage,
			deletingId,
			messageApi,
			queryClient,
		],
	);

	const columns = useMemo<ColumnsType<ActivityResponse>>(
		() => [
			{
				title: "Thứ tự",
				dataIndex: "order",
				key: "order",
				width: 80,
				minWidth: 80,
				align: "center",
				sorter: true,
				sortOrder:
					sortState.sortBy === "order"
						? sortState.sortOrder
						: undefined,
				render: (value: number | undefined, record) => (
					<Select
						size="small"
						value={typeof value === "number" ? value : undefined}
						options={orderOptions}
						loading={updatingOrderId === record._id}
						disabled={Boolean(updatingOrderId)}
						className="w-[72px]"
						onClick={(event) => event.stopPropagation()}
						onChange={(nextOrder) =>
							handleOrderChange(record, nextOrder)
						}
					/>
				),
			},
			{
				title: "Tên lĩnh vực",
				dataIndex: "name",
				key: "name",
				width: 260,
				minWidth: 260,
				fixed: "left",
				render: (value: string, record: ActivityResponse) => (
					<Flex gap={10} align="center">
						<Image src={record.thumbnailId?.url} width={40} height={50} alt={record.name} preview={false} />
						<div className="flex flex-col gap-1">
							<Text strong>{value}</Text>
							<Text type="secondary" className="text-xs">
								{record.slug}
							</Text>
						</div>
					</Flex>
				),
			},
			{
				title: "Trạng thái",
				dataIndex: "status",
				key: "status",
				width: 130,
				minWidth: 130,
				align: "center",
				filterMultiple: false,
				filters: STATUS_OPTIONS.map((option) => ({
					text: option.label,
					value: option.value,
				})),
				filteredValue: filters.status ? [filters.status] : null,
				render: (value: string) => (
					<Tag
						color={value === "published" ? "green" : "default"}
						variant="outlined"
					>
						{value === "published" ? "Công khai" : "Nháp"}
					</Tag>
				),
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
							onClick={() =>
								router.push(`/admin/activities/${record._id}`)
							}
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
		[
			confirmDelete,
			filters.status,
			handleOrderChange,
			orderOptions,
			router,
			sortState,
			updatingOrderId,
		],
	);

	const handleTableChange = (
		nextPagination: TablePaginationConfig,
		tableFilters: Record<string, FilterValue | null>,
		sorter: SorterResult<ActivityResponse> | SorterResult<ActivityResponse>[],
	) => {
		setPagination({
			current: nextPagination.current ?? 1,
			pageSize: nextPagination.pageSize ?? DEFAULT_PAGE_SIZE,
		});

		const statusValue = tableFilters.status?.[0];
		setFilters({
			status: statusValue !== undefined ? String(statusValue) : undefined,
		});

		const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
		if (activeSorter?.field === "order" && activeSorter.order) {
			setSortState({
				sortBy: "order",
				sortOrder: activeSorter.order,
			});
		} else {
			setSortState({});
		}
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between px-1">
				<Input
					placeholder="Tìm kiếm theo tên lĩnh vực"
					prefix={<SearchOutlined className="text-gray-400 mr-1" />}
					allowClear
					value={searchInput}
					onChange={(event) => setSearchInput(event.target.value)}
					className="max-w-xs h-10 [&_.ant-input]:h-full"
				/>
				<Button
					type="primary"
					size="large"
					icon={<PlusOutlined />}
					onClick={() => router.push("/admin/activities/create")}
				>
					Thêm
				</Button>
			</div>
			<Block>
				<Table
					rowKey="_id"
					columns={columns}
					dataSource={activities}
					loading={isFetching}
					pagination={{
						current: currentPage,
						pageSize,
						total,
						showSizeChanger: false,
						showTotal: (total) => `${total} lĩnh vực`,
					}}
					locale={{
						emptyText: <NoData description="Chưa có lĩnh vực hoạt động nào" />,
					}}
					onChange={handleTableChange}
					className="[&_.ant-pagination]:mb-0 [&_.ant-pagination]:mt-6 [&_.ant-table-body]:min-h-[calc(100vh-330px)] [&_.ant-table-body]:max-h-[calc(100vh-330px)]"
				/>
			</Block>
		</div>
	);
}
