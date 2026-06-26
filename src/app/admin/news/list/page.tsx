"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Button,
	Image,
	Input,
	Modal,
	Space,
	Table,
	Tag,
	Typography,
} from "antd";
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
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS, STATUS_OPTIONS } from "@/lib/constants";
import type { INewsPopulated } from "@/types/news";
import type { SortOrder } from "@/types/shared";

const { Text } = Typography;

type NewsRow = Omit<INewsPopulated, "createdAt" | "updatedAt"> & {
	_id: string;
	createdAt?: string;
	updatedAt?: string;
};

interface NewsResponse {
	items: NewsRow[];
	page: number;
	limit: number;
	total: number;
}

interface CategoryRow {
	_id: string;
	name: string;
}

interface NewsFilters {
	status?: string;
	categoryId?: string;
}

const formatDate = (value?: string) =>
	value
		? new Intl.DateTimeFormat("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}).format(new Date(value))
		: "-";

const categoryLabel = (category?: NewsRow["categoryId"]) => {
	if (!category) return "-";
	if (typeof category === "object" && "name" in category) return category.name;
	return String(category);
};

export default function NewsAdminPage() {
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
	const [filters, setFilters] = useState<NewsFilters>({});
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
			"admin-news",
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
		queryFn: async (): Promise<NewsResponse> => {
			const params = new URLSearchParams({
				page: String(currentPage),
				limit: String(pageSize),
			});

			if (search) params.set("search", search);
			if (filters.status) params.set("status", filters.status);
			if (filters.categoryId) params.set("categoryId", filters.categoryId);
			if (sortState.sortBy && sortState.sortOrder) {
				params.set("sortBy", sortState.sortBy);
				params.set(
					"sortOrder",
					sortState.sortOrder === "ascend" ? "asc" : "desc",
				);
			}

			const response = await adminFetch(
				`/api/admin/news?${params.toString()}`,
				{ cache: "no-store" },
			);
			const payload = await response.json();
			if (!response.ok || payload.error) {
				throw new Error(payload.error ?? "Cannot load news");
			}
			return {
				items: payload.items ?? [],
				page: payload.page ?? currentPage,
				limit: payload.limit ?? pageSize,
				total: payload.total ?? 0,
			};
		},
	});

	const { data: categoryData } = useQuery({
		queryKey: ["admin-news-categories", "options"],
		queryFn: async (): Promise<{ items: CategoryRow[] }> => {
			const response = await adminFetch(
				"/api/admin/news-categories?limit=100",
				{ cache: "no-store" },
			);
			const payload = await response.json();
			if (!response.ok || payload.error) {
				throw new Error(payload.error ?? "Cannot load categories");
			}
			return { items: payload.items ?? [] };
		},
	});

	const news = data?.items ?? [];
	const total = data?.total ?? 0;

	const confirmDelete = useCallback(
		(record: NewsRow) => {
			Modal.confirm({
				title: "Xóa tin tức?",
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
							`/api/admin/news/${record._id}`,
							{ method: "DELETE" },
						);
						const data = await response.json();
						if (!response.ok || data.error) {
							throw new Error(data.error ?? "Cannot delete news");
						}
						messageApi.success("Đã xóa tin tức");
						const nextPage =
							news.length === 1 && currentPage > 1
								? currentPage - 1
								: currentPage;
						if (nextPage !== currentPage) {
							setPagination((current) => ({
								...current,
								current: nextPage,
							}));
						} else {
							await queryClient.invalidateQueries({
								queryKey: ["admin-news"],
							});
						}
					} catch {
						messageApi.error("Không thể xóa tin này");
						throw new Error("Delete news failed");
					} finally {
						setDeletingId(null);
					}
				},
			});
		},
		[currentPage, deletingId, messageApi, news.length, queryClient],
	);

	const columns = useMemo<ColumnsType<NewsRow>>(
		() => [
			{
				title: "Ảnh",
				dataIndex: "thumbnailId",
				key: "thumbnailId",
				width: 82,
				minWidth: 82,
				align: 'center',
				render: (value: NewsRow["thumbnailId"], record) => {
					const imageUrl =
						typeof value === "object"
							? value?.secureUrl ?? value?.url
							: undefined;
					return imageUrl ? (
						<Image
							src={imageUrl}
							width={60}
							height={60}
							alt={record.title}
							preview={false}
							className="rounded object-cover"
						/>
					) : (
						<div className="h-12 w-12 rounded bg-gray-100" />
					);
				},
			},
			{
				title: "Tiêu đề",
				dataIndex: "title",
				key: "title",
				width: 280,
				minWidth: 280,
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
				title: "Danh mục",
				dataIndex: "categoryId",
				key: "categoryId",
				width: 180,
				minWidth: 180,
				align: 'center',
				filterMultiple: false,
				filters: (categoryData?.items ?? []).map((category) => ({
					text: category.name,
					value: category._id,
				})),
				filteredValue: filters.categoryId ? [filters.categoryId] : null,
				render: (value: NewsRow["categoryId"]) => categoryLabel(value),
			},
			{
				title: "Trạng thái",
				dataIndex: "status",
				key: "status",
				width: 120,
				minWidth: 120,
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
				title: "Ngày tạo",
				dataIndex: "createdAt",
				key: "createdAt",
				width: 130,
				minWidth: 130,
				align: 'center',
				sorter: true,
				sortOrder:
					sortState.sortBy === "createdAt"
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
							onClick={() => router.push(`/admin/news/${record._id}`)}
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
		[categoryData?.items, confirmDelete, filters, router, sortState],
	);

	const handleTableChange = (
		nextPagination: TablePaginationConfig,
		tableFilters: Record<string, FilterValue | null>,
		sorter: SorterResult<NewsRow> | SorterResult<NewsRow>[],
	) => {
		setPagination({
			current: nextPagination.current ?? 1,
			pageSize: nextPagination.pageSize ?? DEFAULT_PAGE_SIZE,
		});

		const statusValue = tableFilters.status?.[0];
		const categoryValue = tableFilters.categoryId?.[0];
		setFilters({
			status: statusValue !== undefined ? String(statusValue) : undefined,
			categoryId:
				categoryValue !== undefined ? String(categoryValue) : undefined,
		});

		const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
		if (activeSorter?.field === "createdAt" && activeSorter.order) {
			setSortState({
				sortBy: "createdAt",
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
					placeholder="Tìm kiếm theo tiêu đề tin tức"
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
					onClick={() => router.push("/admin/news/create")}
				>
					Thêm
				</Button>
			</div>
			<Block>
				<Table
					rowKey="_id"
					columns={columns}
					dataSource={news}
					loading={isFetching}
					scroll={{ y: 500 }}
					pagination={{
						current: currentPage,
						pageSize,
						total,
						showSizeChanger: false,
						showTotal: (total) => `${total} tin tức`,
					}}
					locale={{
						emptyText: <NoData description="Chưa có tin tức nào" />,
					}}
					onChange={handleTableChange}
					className="[&_.ant-pagination]:mb-0 [&_.ant-pagination]:mt-6"
				/>
			</Block>
		</div>
	);
}
