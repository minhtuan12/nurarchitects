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
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import NoData from "@/components/NoData";
import { useMessage } from "@/contexts/AdminMessageContext";
import { BUILD_AREA_OPTIONS, BUILD_PLAN_OPTIONS, CONTACT_FORM_STATUS_OPTIONS, DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type { ContactFormStatus } from "@/types/shared";
import type { SortOrder } from "@/types/shared";
import { BuildArea, BuildPlan, EBuildPlan } from "@/types/project";
import { EArea, EContactFormStatus } from "@/types/contact";
import { EBuildArea } from "@/lib/enums";
import { ChevronDown } from "lucide-react";

const { Text } = Typography;

interface ContactFormRow {
	_id: string;
	fullName: string;
	phone: string;
	planningToBuild?: string;
	buildPlan: BuildPlan;
	area?: EBuildArea;
	floors?: number;
	address?: string;
	specialRequirement?: string;
	status: ContactFormStatus;
	createdAt?: string;
	updatedAt?: string;
}

interface ContactFormResponse {
	items: ContactFormRow[];
	page: number;
	limit: number;
	total: number;
}

interface ContactFormFilters {
	status?: string;
	buildPlan?: BuildPlan;
	area?: BuildArea;
}

const STATUS_FILTER_OPTIONS = CONTACT_FORM_STATUS_OPTIONS.map(({ label, value }) => ({
	text: label,
	value,
}));

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

export default function ContactFormListAdminPage() {
	const queryClient = useQueryClient();
	const messageApi = useMessage();

	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: DEFAULT_PAGE_SIZE,
	});

	// --- Search (debounced), giống pattern ProjectsAdminPage ---
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
	const [filters, setFilters] = useState<ContactFormFilters>({});

	// --- Sort: hỗ trợ cả area và createdAt (đúng theo sortFields của API) ---
	const [sortState, setSortState] = useState<{
		sortBy?: string;
		sortOrder?: SortOrder;
	}>({});

	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [detailRecord, setDetailRecord] = useState<ContactFormRow | null>(
		null,
	);

	const currentPage = pagination.current;
	const pageSize = pagination.pageSize;

	const queryKey = useMemo(
		() => ["admin-contact-forms", currentPage, pageSize, search, filters, sortState],
		[currentPage, pageSize, search, filters, sortState],
	);

	const { data, isFetching } = useQuery({
		queryKey,
		queryFn: async (): Promise<ContactFormResponse> => {
			const params = new URLSearchParams({
				page: String(currentPage),
				limit: String(pageSize),
			});

			if (search) params.set("search", search);
			if (filters.status) params.set("status", filters.status);
			if (filters.buildPlan) params.set("buildPlan", filters.buildPlan);
			if (filters.area) params.set("area", filters.area);
			if (sortState.sortBy && sortState.sortOrder) {
				params.set("sortBy", sortState.sortBy);
				params.set(
					"sortOrder",
					sortState.sortOrder === "ascend" ? "asc" : "desc",
				);
			}

			const response = await adminFetch(
				`/api/admin/contact-forms?${params.toString()}`,
				{ cache: "no-store" },
			);
			const payload = await response.json();
			if (!response.ok || payload.error) {
				throw new Error(payload.error ?? "Cannot load contact forms");
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
		async (record: ContactFormRow, nextStatus: ContactFormStatus) => {
			if (record.status === nextStatus) return;

			setUpdatingId(record._id);
			try {
				const response = await adminFetch(
					`/api/admin/contact-forms/${record._id}`,
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
					queryKey: ["admin-contact-forms"],
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
		(record: ContactFormRow): MenuProps => ({
			items: CONTACT_FORM_STATUS_OPTIONS.map(
				({ label, value }) => ({
					key: value,
					label: label,
					disabled: value === record.status,
				}),
			),
			onClick: ({ key }) => updateStatus(record, key as ContactFormStatus),
		}),
		[updateStatus],
	);

	const columns = useMemo<ColumnsType<ContactFormRow>>(
		() => [
			{
				title: "Họ tên",
				dataIndex: "fullName",
				key: "fullName",
				width: 200,
				minWidth: 200,
				fixed: "left",
				render: (value: string, record) => (
					<div className="flex flex-col gap-1">
						<Text strong>{value}</Text>
						<Text type="secondary" className="text-xs">
							{record.phone}
						</Text>
					</div>
				),
			},
			{
				title: "Loại công trình",
				dataIndex: "buildPlan",
				key: "buildPlan",
				width: 160,
				minWidth: 160,
				align: "center",
				filterMultiple: false,
				filters: BUILD_PLAN_OPTIONS.map((option) => ({
					text: option.label,
					value: option.value,
				})),
				filteredValue: filters.buildPlan ? [filters.buildPlan] : null,
				render: (value: BuildPlan) => (
					<Tag
						color={EBuildPlan[value].color}
						variant="outlined"
						className="!whitespace-normal !break-words !leading-snug text-center"
						style={{ maxWidth: "100%" }}
					>
						{EBuildPlan[value].label}
					</Tag>
				),
			},
			{
				title: "Diện tích",
				dataIndex: "area",
				key: "area",
				width: 120,
				minWidth: 120,
				align: "center",
				filterMultiple: false,
				filters: BUILD_AREA_OPTIONS.map((option) => ({
					text: option.label,
					value: option.value,
				})),
				filteredValue: filters.area ? [filters.area] : null,
				render: (value: EBuildArea) => (
					<Tag
						color={EArea[value].color}
						variant="outlined"
						className="!whitespace-normal !break-words !leading-snug text-center"
						style={{ maxWidth: "100%" }}
					>
						{EArea[value].label}
					</Tag>
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
					sortState.sortBy === "createdAt" ? sortState.sortOrder : undefined,
				render: (value?: string) => formatDate(value),
			},
			{
				title: "Trạng thái",
				dataIndex: "status",
				key: "status",
				width: 150,
				minWidth: 150,
				align: "center",
				filterMultiple: false,
				filters: STATUS_FILTER_OPTIONS,
				filteredValue: filters.status ? [filters.status] : null,
				render: (value: ContactFormStatus, record) => (
					<div className="flex justify-center">
						<Dropdown
							menu={buildStatusMenu(record)}
							trigger={["click"]}
							disabled={updatingId === record._id}
						>
							<Tag
								color={EContactFormStatus[value]?.color ?? "default"}
								className="cursor-pointer select-none !m-0 flex w-fit items-center justify-center gap-1"
							>
								{EContactFormStatus[value]?.label ?? value}
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

	// Lưu ý: chỉ cho phép sort 1 cột tại một thời điểm (giống pattern ProjectsAdminPage),
	// vì sortFields ở backend chỉ nhận 1 sortBy duy nhất qua query string.
	const handleTableChange = (
		nextPagination: TablePaginationConfig,
		tableFilters: Record<string, (string | number | boolean)[] | null>,
		sorter: SorterResult<ContactFormRow> | SorterResult<ContactFormRow>[],
	) => {
		setPagination({
			current: nextPagination.current ?? 1,
			pageSize: nextPagination.pageSize ?? DEFAULT_PAGE_SIZE,
		});

		const statusValue = tableFilters.status?.[0];
		const buildPlanValue = tableFilters.buildPlan?.[0];
		const buildAreaValue = tableFilters.area?.[0];

		setFilters({
			status: statusValue !== undefined ? String(statusValue) : undefined,
			buildPlan:
				buildPlanValue !== undefined
					? (String(buildPlanValue) as BuildPlan)
					: undefined,
			area:
				buildAreaValue !== undefined
					? (String(buildAreaValue) as EBuildArea)
					: undefined,
		});

		const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
		if (
			(activeSorter?.field === "area" ||
				activeSorter?.field === "createdAt") &&
			activeSorter.order
		) {
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
					placeholder="Tìm kiếm theo họ tên, số điện thoại hoặc địa chỉ"
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
						emptyText: <NoData description="Chưa có yêu cầu tư vấn nào" />,
					}}
					onChange={handleTableChange as any}
					className="[&_.ant-pagination]:mb-0 [&_.ant-pagination]:mt-6"
				/>
			</Block>

			<Modal
				title="Chi tiết yêu cầu tư vấn"
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
							labelStyle={{ width: 160 }}
						>
							<Descriptions.Item label="Họ tên">
								{detailRecord.fullName}
							</Descriptions.Item>
							<Descriptions.Item label="Số điện thoại">
								{detailRecord.phone}
							</Descriptions.Item>
							<Descriptions.Item label="Dự định xây dựng">
								{detailRecord.planningToBuild || "-"}
							</Descriptions.Item>
							<Descriptions.Item label="Loại công trình">
								{EBuildPlan[detailRecord.buildPlan]?.label ??
									detailRecord.buildPlan}
							</Descriptions.Item>
							<Descriptions.Item label="Diện tích">
								{EArea[detailRecord.area as BuildArea].label || "-"}
							</Descriptions.Item>
							<Descriptions.Item label="Số tầng">
								{detailRecord.floors ?? "-"}
							</Descriptions.Item>
							<Descriptions.Item label="Địa chỉ">
								{detailRecord.address || "-"}
							</Descriptions.Item>
							<Descriptions.Item label="Yêu cầu đặc biệt">
								{detailRecord.specialRequirement || "-"}
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
									color={EContactFormStatus[detailRecord.status]?.color ?? "default"}
									className="cursor-pointer select-none text-sm py-1 px-3 flex items-center justify-center gap-1"
								>
									{EContactFormStatus[detailRecord.status]?.label ??
										detailRecord.status}
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
