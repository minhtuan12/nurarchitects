"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Button,
	Descriptions,
	Dropdown,
	Input,
	Modal,
	Space,
	Table,
	Tag,
	Typography,
} from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import type { MenuProps } from "antd";
import { SearchOutlined, EyeOutlined, LinkOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import NoData from "@/components/NoData";
import { useMessage } from "@/contexts/AdminMessageContext";
import {
	COOPERATION_FORM_STATUS_OPTIONS,
	COOPERATION_SERVICE_OPTIONS,
	DEFAULT_PAGE_SIZE,
	SEARCH_DEBOUNCE_MS,
} from "@/lib/constants";
import type { SortOrder } from "@/types/shared";
import { ChevronDown } from "lucide-react";
import {
	CooperationFormStatus,
	CooperationService,
	ECooperationFormStatus,
	ECooperationService,
} from "@/types/cooperation";

const { Text, Link } = Typography;

interface CooperationFormRow {
	_id: string;
	companyName: string;
	contactName: string;
	position: string;
	phone: string;
	email: string;
	mainService?: CooperationService;
	otherService?: string;
	capacityProfileUrl?: string;
	catalogueUrl?: string;
	productSegmentUrl?: string;
	policyUrl?: string;
	status: CooperationFormStatus;
	createdAt?: string;
	updatedAt?: string;
}

interface CooperationFormResponse {
	items: CooperationFormRow[];
	page: number;
	limit: number;
	total: number;
}

interface CooperationFormFilters {
	status?: string;
	mainService?: CooperationService;
}

const STATUS_FILTER_OPTIONS = COOPERATION_FORM_STATUS_OPTIONS.map(
	({ label, value }) => ({
		text: label,
		value,
	}),
);

const SERVICE_FILTER_OPTIONS = COOPERATION_SERVICE_OPTIONS.map(
	({ label, value }) => ({
		text: label,
		value,
	}),
);

const formatDate = (value?: string) =>
	value
		? new Intl.DateTimeFormat("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(value))
		: "-";

const renderLink = (url?: string) =>
	url ? (
		<Link href={url} target="_blank" rel="noopener noreferrer">
			<LinkOutlined /> Xem
		</Link>
	) : (
		"-"
	);

export default function CooperationFormListAdminPage() {
	const queryClient = useQueryClient();
	const messageApi = useMessage();

	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: DEFAULT_PAGE_SIZE,
	});

	// --- Search (debounced) ---
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch(searchInput.trim());
			setPagination((current) => ({ ...current, current: 1 }));
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [searchInput]);

	// --- Filters ---
	const [filters, setFilters] = useState<CooperationFormFilters>({});

	// --- Sort ---
	const [sortState, setSortState] = useState<{
		sortBy?: string;
		sortOrder?: SortOrder;
	}>({});

	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [detailRecord, setDetailRecord] = useState<CooperationFormRow | null>(
		null,
	);

	const currentPage = pagination.current;
	const pageSize = pagination.pageSize;

	const queryKey = useMemo(
		() => [
			"admin-cooperation-forms",
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
		queryFn: async (): Promise<CooperationFormResponse> => {
			const params = new URLSearchParams({
				page: String(currentPage),
				limit: String(pageSize),
			});

			if (search) params.set("search", search);
			if (filters.status) params.set("status", filters.status);
			if (filters.mainService)
				params.set("mainService", filters.mainService);
			if (sortState.sortBy && sortState.sortOrder) {
				params.set("sortBy", sortState.sortBy);
				params.set(
					"sortOrder",
					sortState.sortOrder === "ascend" ? "asc" : "desc",
				);
			}

			const response = await adminFetch(
				`/api/admin/cooperation-forms?${params.toString()}`,
				{ cache: "no-store" },
			);
			const payload = await response.json();
			if (!response.ok || payload.error) {
				throw new Error(
					payload.error ?? "Cannot load cooperation forms",
				);
			}
			return {
				items: payload.items ?? [],
				page: payload.page ?? currentPage,
				limit: payload.limit ?? pageSize,
				total: payload.total ?? 0,
			};
		},
	});

	const items = data?.items ?? [];
	const total = data?.total ?? 0;

	const updateStatus = useCallback(
		async (
			record: CooperationFormRow,
			nextStatus: CooperationFormStatus,
		) => {
			if (record.status === nextStatus) return;

			setUpdatingId(record._id);
			try {
				const response = await adminFetch(
					`/api/admin/cooperation-forms/${record._id}`,
					{
						method: "PATCH",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ ...record, status: nextStatus }),
					},
				);
				const payload = await response.json();
				if (!response.ok || payload.error) {
					throw new Error(payload.error ?? "Cannot update status");
				}

				messageApi.success("Đã cập nhật trạng thái");
				setDetailRecord((current) =>
					current && current._id === record._id
						? { ...current, status: nextStatus }
						: current,
				);
				await queryClient.invalidateQueries({
					queryKey: ["admin-cooperation-forms"],
				});
			} catch {
				messageApi.error("Không thể cập nhật trạng thái");
			} finally {
				setUpdatingId(null);
			}
		},
		[messageApi, queryClient],
	);

	const buildStatusMenu = useCallback(
		(record: CooperationFormRow): MenuProps => ({
			items: COOPERATION_FORM_STATUS_OPTIONS.map(({ label, value }) => ({
				key: value,
				label: label,
				disabled: value === record.status,
			})),
			onClick: ({ key }) =>
				updateStatus(record, key as CooperationFormStatus),
		}),
		[updateStatus],
	);

	const columns = useMemo<ColumnsType<CooperationFormRow>>(
		() => [
			{
				title: "Đơn vị / Người liên hệ",
				dataIndex: "companyName",
				key: "companyName",
				width: 220,
				minWidth: 220,
				fixed: "left",
				render: (value: string, record) => (
					<div className="flex flex-col gap-1">
						<Text strong>{value}</Text>
						<Text type="secondary" className="text-xs">
							{record.contactName} · {record.position}
						</Text>
					</div>
				),
			},
			{
				title: "Thông tin liên hệ",
				dataIndex: "email",
				key: "email",
				width: 180,
				minWidth: 180,
				fixed: "left",
				render: (value: string, record) => (
					<div className="flex flex-col gap-1">
						<Link href={`tel:${record.phone}`}>{record.phone}</Link>
						<Link href={`mailto:${record.email}`} className="!text-underline text-blue-400">{record.email}</Link>
					</div>
				),
			},
			{
				title: "Dịch vụ chính",
				dataIndex: "mainService",
				key: "mainService",
				width: 150,
				minWidth: 150,
				align: "center",
				filterMultiple: false,
				filters: SERVICE_FILTER_OPTIONS,
				filteredValue: filters.mainService
					? [filters.mainService]
					: null,
				render: (value: CooperationService | undefined, record) =>
					value ? (
						<Tag
							variant="outlined"
							className="!whitespace-normal !break-words !leading-snug text-center"
							style={{ maxWidth: "100%", fontSize: 14 }}
						>
							{ECooperationService[value]?.label ?? value}
						</Tag>
					) : (
						<Text type="secondary">
							{record.otherService || "-"}
						</Text>
					),
			},
			{
				title: "Ngày gửi",
				dataIndex: "createdAt",
				key: "createdAt",
				width: 160,
				minWidth: 160,
				align: "center",
				sorter: true,
				sortOrder:
					sortState.sortBy === "createdAt"
						? sortState.sortOrder
						: undefined,
				render: (value?: string) => formatDate(value),
			},
			{
				title: "Trạng thái",
				dataIndex: "status",
				key: "status",
				width: 120,
				minWidth: 120,
				align: "center",
				filterMultiple: false,
				filters: STATUS_FILTER_OPTIONS,
				filteredValue: filters.status ? [filters.status] : null,
				render: (value: CooperationFormStatus, record) => (
					<div className="flex justify-center">
						<Dropdown
							menu={buildStatusMenu(record)}
							trigger={["click"]}
							disabled={updatingId === record._id}
						>
							<Tag
								color={
									ECooperationFormStatus[value]?.color ??
									"default"
								}
								className="cursor-pointer select-none !m-0 flex w-fit items-center justify-center gap-1"
							>
								{ECooperationFormStatus[value]?.label ?? value}
								<ChevronDown size={13.5} />
							</Tag>
						</Dropdown>
					</div>
				),
			},
			{
				title: "Thao tác",
				key: "actions",
				width: 90,
				minWidth: 90,
				fixed: "right",
				align: "center",
				render: (_, record) => (
					<Space className="gap-4">
						<EyeOutlined
							onClick={() => setDetailRecord(record)}
							className="cursor-pointer text-base"
							style={{ color: "#2b7fff" }}
						/>
					</Space>
				),
			},
		],
		[buildStatusMenu, filters, sortState, updatingId],
	);

	const handleTableChange = (
		nextPagination: TablePaginationConfig,
		tableFilters: Record<string, (string | number | boolean)[] | null>,
		sorter:
			| SorterResult<CooperationFormRow>
			| SorterResult<CooperationFormRow>[],
	) => {
		setPagination({
			current: nextPagination.current ?? 1,
			pageSize: nextPagination.pageSize ?? DEFAULT_PAGE_SIZE,
		});

		const statusValue = tableFilters.status?.[0];
		const mainServiceValue = tableFilters.mainService?.[0];

		setFilters({
			status: statusValue !== undefined ? String(statusValue) : undefined,
			mainService:
				mainServiceValue !== undefined
					? (String(mainServiceValue) as CooperationService)
					: undefined,
		});

		const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
		if (activeSorter?.field === "createdAt" && activeSorter.order) {
			setSortState({
				sortBy: activeSorter.field as string,
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
					placeholder="Tìm kiếm theo tên đơn vị, người liên hệ, SĐT hoặc email"
					prefix={<SearchOutlined className="text-gray-400 mr-1" />}
					allowClear
					value={searchInput}
					onChange={(event) => setSearchInput(event.target.value)}
					className="h-10 max-w-xs [&_.ant-input]:h-full"
				/>
			</div>

			<Block>
				<Table
					rowKey="_id"
					columns={columns}
					dataSource={items}
					loading={isFetching}
					pagination={{
						current: currentPage,
						pageSize,
						total,
						showSizeChanger: false,
						showTotal: (total) => `${total} yêu cầu`,
					}}
					locale={{
						emptyText: (
							<NoData description="Chưa có yêu cầu hợp tác nào" />
						),
					}}
					onChange={handleTableChange as any}
					className="[&_.ant-pagination]:mb-0 [&_.ant-pagination]:mt-6"
				/>
			</Block>

			<Modal
				title="Chi tiết yêu cầu hợp tác"
				centered
				open={!!detailRecord}
				onCancel={() => setDetailRecord(null)}
				footer={
					<Button onClick={() => setDetailRecord(null)}>Đóng</Button>
				}
				width={640}
			>
				{detailRecord && (
					<div className="flex flex-col gap-4">
						<Descriptions
							bordered
							column={1}
							size="small"
							styles={{
								label: { width: 200 }
							}}
						>
							<Descriptions.Item label="Tên đơn vị">
								{detailRecord.companyName}
							</Descriptions.Item>
							<Descriptions.Item label="Người liên hệ">
								{detailRecord.contactName}
							</Descriptions.Item>
							<Descriptions.Item label="Chức vụ">
								{detailRecord.position}
							</Descriptions.Item>
							<Descriptions.Item label="Số điện thoại">
								{detailRecord.phone}
							</Descriptions.Item>
							<Descriptions.Item label="Email">
								{detailRecord.email}
							</Descriptions.Item>
							<Descriptions.Item label="Sản phẩm/dịch vụ chính">
								{detailRecord.mainService
									? ECooperationService[
										detailRecord.mainService
									]?.label
									: "-"}
							</Descriptions.Item>
							<Descriptions.Item label="Sản phẩm/dịch vụ khác">
								{detailRecord.otherService || "-"}
							</Descriptions.Item>
							<Descriptions.Item label="Hồ sơ năng lực">
								{renderLink(detailRecord.capacityProfileUrl)}
							</Descriptions.Item>
							<Descriptions.Item label="Catalogue">
								{renderLink(detailRecord.catalogueUrl)}
							</Descriptions.Item>
							<Descriptions.Item label="Bảng phân khúc sản phẩm">
								{renderLink(detailRecord.productSegmentUrl)}
							</Descriptions.Item>
							<Descriptions.Item label="Chính sách hợp tác">
								{renderLink(detailRecord.policyUrl)}
							</Descriptions.Item>
							<Descriptions.Item label="Ngày gửi">
								{formatDate(detailRecord.createdAt)}
							</Descriptions.Item>
						</Descriptions>

						<div className="flex items-center gap-3">
							<Text strong>Trạng thái:</Text>
							<Dropdown
								menu={buildStatusMenu(detailRecord)}
								trigger={["click"]}
								disabled={updatingId === detailRecord._id}
							>
								<Tag
									color={
										ECooperationFormStatus[
											detailRecord.status
										]?.color ?? "default"
									}
									className="cursor-pointer select-none text-sm py-1 px-3 flex items-center justify-center gap-1"
								>
									{ECooperationFormStatus[detailRecord.status]
										?.label ?? detailRecord.status}
									<ChevronDown size={13.5} />
								</Tag>
							</Dropdown>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
}
