"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Button,
	Descriptions,
	Dropdown,
	Input,
	Modal,
	Select,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
} from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
	SearchOutlined,
	EyeOutlined,
	DownloadOutlined,
	EditOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import NoData from "@/components/NoData";
import { useMessage } from "@/contexts/AdminMessageContext";
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type { SortOrder } from "@/types/shared";
import { ChevronDown } from "lucide-react";
import Developing from "@/components/admin/Developing";

const { Text } = Typography;
const { TextArea } = Input;

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicationStatus = "new" | "seen" | "match" | "mismatch" | "contacted";

interface JobOption {
	_id: string;
	title: string;
}

interface MediaRef {
	_id: string;
	secureUrl?: string;
	url?: string;
}

interface ApplicationRow {
	_id: string;
	jobId: { _id: string; title: string } | string;
	fullName: string;
	email: string;
	phone: string;
	resumeId?: MediaRef | null;
	status: ApplicationStatus;
	adminNote?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface ApplicationResponse {
	items: ApplicationRow[];
	page: number;
	limit: number;
	total: number;
}

interface ApplicationFilters {
	status?: ApplicationStatus;
	jobId?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const APPLICATION_STATUS_CONFIG: Record<
	ApplicationStatus,
	{ label: string; color: string }
> = {
	new: { label: "Mới", color: "blue" },
	seen: { label: "Đã xem", color: "default" },
	match: { label: "Phù hợp", color: "green" },
	mismatch: { label: "Không phù hợp", color: "red" },
	contacted: { label: "Đã liên hệ", color: "purple" },
};

const APPLICATION_STATUS_OPTIONS = (
	Object.entries(APPLICATION_STATUS_CONFIG) as [
		ApplicationStatus,
		{ label: string; color: string },
	][]
).map(([value, { label }]) => ({ label, value }));

const STATUS_FILTER_OPTIONS = APPLICATION_STATUS_OPTIONS.map(
	({ label, value }) => ({ text: label, value }),
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

const getJobTitle = (jobId: ApplicationRow["jobId"]) =>
	typeof jobId === "object" && jobId !== null ? jobId.title : String(jobId);

const getJobId = (jobId: ApplicationRow["jobId"]) =>
	typeof jobId === "object" && jobId !== null ? jobId._id : String(jobId);

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApplicationListAdminPage() {
	const queryClient = useQueryClient();
	const messageApi = useMessage();

	// --- Pagination ---
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
			setPagination((prev) => ({ ...prev, current: 1 }));
		}, SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [searchInput]);

	// --- Filters ---
	const [filters, setFilters] = useState<ApplicationFilters>({});

	// --- Sort ---
	const [sortState, setSortState] = useState<{
		sortBy?: string;
		sortOrder?: SortOrder;
	}>({});

	// --- UI state ---
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [detailRecord, setDetailRecord] = useState<ApplicationRow | null>(null);
	const [noteRecord, setNoteRecord] = useState<ApplicationRow | null>(null);
	const [noteInput, setNoteInput] = useState("");
	const [savingNote, setSavingNote] = useState(false);

	// --- Job options for filter dropdown ---
	const { data: jobsData } = useQuery({
		queryKey: ["admin-jobs-for-filter"],
		queryFn: async (): Promise<JobOption[]> => {
			const res = await adminFetch("/api/admin/jobs?limit=200", {
				cache: "no-store",
			});
			const payload = await res.json();
			if (!res.ok || payload.error) throw new Error(payload.error ?? "Cannot load jobs");
			return payload.items ?? payload ?? [];
		},
		staleTime: 60_000,
	});

	const jobOptions = jobsData ?? [];

	const currentPage = pagination.current;
	const pageSize = pagination.pageSize;

	const queryKey = useMemo(
		() => ["admin-applications", currentPage, pageSize, search, filters, sortState],
		[currentPage, pageSize, search, filters, sortState],
	);

	const { data, isFetching } = useQuery({
		queryKey,
		queryFn: async (): Promise<ApplicationResponse> => {
			const params = new URLSearchParams({
				page: String(currentPage),
				limit: String(pageSize),
			});
			if (search) params.set("search", search);
			if (filters.status) params.set("status", filters.status);
			if (filters.jobId) params.set("jobId", filters.jobId);
			if (sortState.sortBy && sortState.sortOrder) {
				params.set("sortBy", sortState.sortBy);
				params.set("sortOrder", sortState.sortOrder === "ascend" ? "asc" : "desc");
			}

			const res = await adminFetch(`/api/admin/applications?${params}`, { cache: "no-store" });
			const payload = await res.json();
			if (!res.ok || payload.error) throw new Error(payload.error ?? "Cannot load applications");

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

	// ── Update status ──────────────────────────────────────────────────────────

	const updateStatus = useCallback(
		async (record: ApplicationRow, nextStatus: ApplicationStatus) => {
			if (record.status === nextStatus) return;
			setUpdatingId(record._id);
			try {
				const res = await adminFetch(`/api/admin/applications/${record._id}`, {
					method: "PATCH",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ status: nextStatus }),
				});
				const payload = await res.json();
				if (!res.ok || payload.error) throw new Error(payload.error ?? "Cannot update status");

				messageApi.success("Đã cập nhật trạng thái");
				// sync detail modal if open
				setDetailRecord((cur) =>
					cur?._id === record._id ? { ...cur, status: nextStatus } : cur,
				);
				await queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
			} catch {
				messageApi.error("Không thể cập nhật trạng thái");
			} finally {
				setUpdatingId(null);
			}
		},
		[messageApi, queryClient],
	);

	const buildStatusMenu = useCallback(
		(record: ApplicationRow): MenuProps => ({
			items: APPLICATION_STATUS_OPTIONS.map(({ label, value }) => ({
				key: value,
				label,
				disabled: value === record.status,
			})),
			onClick: ({ key }) => updateStatus(record, key as ApplicationStatus),
		}),
		[updateStatus],
	);

	// ── Save admin note ────────────────────────────────────────────────────────

	const openNoteModal = useCallback((record: ApplicationRow) => {
		setNoteRecord(record);
		setNoteInput(record.adminNote ?? "");
	}, []);

	const handleSaveNote = useCallback(async () => {
		if (!noteRecord) return;
		setSavingNote(true);
		try {
			const res = await adminFetch(`/api/admin/applications/${noteRecord._id}`, {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ adminNote: noteInput }),
			});
			const payload = await res.json();
			if (!res.ok || payload.error) throw new Error(payload.error ?? "Cannot save note");

			messageApi.success("Đã lưu ghi chú");
			// sync detail modal
			setDetailRecord((cur) =>
				cur?._id === noteRecord._id ? { ...cur, adminNote: noteInput } : cur,
			);
			setNoteRecord(null);
			await queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
		} catch {
			messageApi.error("Không thể lưu ghi chú");
		} finally {
			setSavingNote(false);
		}
	}, [noteRecord, noteInput, messageApi, queryClient]);

	// ── Status tag (reusable) ──────────────────────────────────────────────────

	const renderStatusDropdown = useCallback(
		(record: ApplicationRow) => {
			const cfg = APPLICATION_STATUS_CONFIG[record.status];
			return (
				<div className="flex justify-center">
					<Dropdown
						menu={buildStatusMenu(record)}
						trigger={["click"]}
						disabled={updatingId === record._id}
					>
						<Tag
							color={cfg?.color ?? "default"}
							className="cursor-pointer select-none !m-0 flex w-fit items-center justify-center gap-1"
						>
							{cfg?.label ?? record.status}
							<ChevronDown size={13.5} />
						</Tag>
					</Dropdown>
				</div>
			);
		},
		[buildStatusMenu, updatingId],
	);

	// ── Columns ────────────────────────────────────────────────────────────────

	const columns = useMemo<ColumnsType<ApplicationRow>>(
		() => [
			{
				title: "Ứng viên",
				dataIndex: "fullName",
				key: "fullName",
				width: 220,
				minWidth: 220,
				fixed: "left",
				render: (value: string, record) => (
					<div className="flex flex-col gap-0.5">
						<Text strong>{value}</Text>
						<Text type="secondary" className="text-xs">{record.email}</Text>
						<Text type="secondary" className="text-xs">{record.phone}</Text>
					</div>
				),
			},
			{
				title: "Vị trí ứng tuyển",
				dataIndex: "jobId",
				key: "jobId",
				width: 200,
				minWidth: 200,
				render: (jobId: ApplicationRow["jobId"]) => (
					<Text>{getJobTitle(jobId)}</Text>
				),
			},
			{
				title: "Ngày nộp",
				dataIndex: "createdAt",
				key: "createdAt",
				width: 155,
				minWidth: 155,
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
				width: 165,
				minWidth: 165,
				align: "center",
				filterMultiple: false,
				filters: STATUS_FILTER_OPTIONS,
				filteredValue: filters.status ? [filters.status] : null,
				render: (_: ApplicationStatus, record) =>
					renderStatusDropdown(record),
			},
			{
				title: "Thao tác",
				key: "actions",
				width: 110,
				minWidth: 110,
				fixed: "right",
				align: "center",
				render: (_, record) => {
					const resumeUrl =
						record.resumeId?.secureUrl ?? record.resumeId?.url ?? null;
					return (
						<Space size={12}>
							{/* Xem chi tiết */}
							<Tooltip title="Xem chi tiết">
								<EyeOutlined
									onClick={() => setDetailRecord(record)}
									className="cursor-pointer text-base"
									style={{ color: "#2b7fff" }}
								/>
							</Tooltip>

							{/* Tải CV */}
							<Tooltip title={resumeUrl ? "Xem CV" : "Chưa có CV"}>
								<DownloadOutlined
									onClick={() => {
										if (resumeUrl) window.open(resumeUrl, "_blank", "noopener,noreferrer");
									}}
									className={`text-base ${resumeUrl ? "cursor-pointer" : "cursor-not-allowed opacity-30"}`}
									style={{ color: resumeUrl ? "#52c41a" : undefined }}
								/>
							</Tooltip>

							{/* Ghi chú */}
							<Tooltip title="Ghi chú">
								<EditOutlined
									onClick={() => openNoteModal(record)}
									className="cursor-pointer text-base"
									style={{ color: "#fa8c16" }}
								/>
							</Tooltip>
						</Space>
					);
				},
			},
		],
		[filters, sortState, renderStatusDropdown, openNoteModal],
	);

	// ── Table change handler ───────────────────────────────────────────────────

	const handleTableChange = (
		nextPagination: TablePaginationConfig,
		tableFilters: Record<string, (string | number | boolean)[] | null>,
	) => {
		setPagination({
			current: nextPagination.current ?? 1,
			pageSize: nextPagination.pageSize ?? DEFAULT_PAGE_SIZE,
		});

		const statusValue = tableFilters.status?.[0];
		setFilters((prev) => ({
			...prev,
			status: statusValue !== undefined ? (String(statusValue) as ApplicationStatus) : undefined,
		}));
	};

	// ── Render ─────────────────────────────────────────────────────────────────

	return (
		// <div className="flex flex-col gap-5">
		// 	{/* Toolbar */}
		// 	<div className="flex flex-wrap items-center gap-3 px-1">
		// 		<Input
		// 			placeholder="Tìm kiếm theo họ tên, email, số điện thoại"
		// 			prefix={<SearchOutlined className="mr-1 text-gray-400" />}
		// 			allowClear
		// 			value={searchInput}
		// 			onChange={(e) => setSearchInput(e.target.value)}
		// 			className="h-10 max-w-xs [&_.ant-input]:h-full"
		// 		/>

		// 		{/* Filter vị trí ứng tuyển */}
		// 		<Select
		// 			allowClear
		// 			placeholder="Lọc theo vị trí"
		// 			style={{ width: 220, height: 40 }}
		// 			value={filters.jobId ?? undefined}
		// 			onChange={(val) => {
		// 				setFilters((prev) => ({ ...prev, jobId: val }));
		// 				setPagination((prev) => ({ ...prev, current: 1 }));
		// 			}}
		// 			options={jobOptions.map((j) => ({ label: j.title, value: j._id }))}
		// 			showSearch
		// 			filterOption={(input, option) =>
		// 				(option?.label as string)
		// 					?.toLowerCase()
		// 					.includes(input.toLowerCase())
		// 			}
		// 		/>
		// 	</div>

		// 	{/* Table */}
		// 	<Block>
		// 		<Table
		// 			rowKey="_id"
		// 			columns={columns}
		// 			dataSource={items}
		// 			loading={isFetching}
		// 			pagination={{
		// 				current: currentPage,
		// 				pageSize,
		// 				total,
		// 				showSizeChanger: false,
		// 				showTotal: (t) => `${t} ứng viên`,
		// 			}}
		// 			locale={{
		// 				emptyText: <NoData description="Chưa có ứng viên nào" />,
		// 			}}
		// 			onChange={handleTableChange as any}
		// 			className="[&_.ant-pagination]:mb-0 [&_.ant-pagination]:mt-6"
		// 		/>
		// 	</Block>

		// 	{/* ── Modal: Chi tiết ứng viên ── */}
		// 	<Modal
		// 		title="Chi tiết ứng viên"
		// 		open={!!detailRecord}
		// 		onCancel={() => setDetailRecord(null)}
		// 		footer={
		// 			<div className="flex justify-between">
		// 				<Button
		// 					icon={<EditOutlined />}
		// 					onClick={() => {
		// 						if (detailRecord) openNoteModal(detailRecord);
		// 					}}
		// 				>
		// 					Ghi chú
		// 				</Button>
		// 				<Button onClick={() => setDetailRecord(null)}>Đóng</Button>
		// 			</div>
		// 		}
		// 		width={640}
		// 	>
		// 		{detailRecord && (
		// 			<div className="flex flex-col gap-4">
		// 				<Descriptions
		// 					bordered
		// 					column={1}
		// 					size="small"
		// 					labelStyle={{ width: 160 }}
		// 				>
		// 					<Descriptions.Item label="Họ tên">
		// 						{detailRecord.fullName}
		// 					</Descriptions.Item>
		// 					<Descriptions.Item label="Email">
		// 						{detailRecord.email}
		// 					</Descriptions.Item>
		// 					<Descriptions.Item label="Số điện thoại">
		// 						{detailRecord.phone}
		// 					</Descriptions.Item>
		// 					<Descriptions.Item label="Vị trí ứng tuyển">
		// 						{getJobTitle(detailRecord.jobId)}
		// 					</Descriptions.Item>
		// 					<Descriptions.Item label="CV">
		// 						{(() => {
		// 							const url =
		// 								detailRecord.resumeId?.secureUrl ??
		// 								detailRecord.resumeId?.url ??
		// 								null;
		// 							return url ? (
		// 								<a
		// 									href={url}
		// 									target="_blank"
		// 									rel="noopener noreferrer"
		// 									className="flex items-center gap-1 text-blue-500"
		// 								>
		// 									<DownloadOutlined />
		// 									Xem / Tải CV
		// 								</a>
		// 							) : (
		// 								<Text type="secondary">Chưa có CV</Text>
		// 							);
		// 						})()}
		// 					</Descriptions.Item>
		// 					<Descriptions.Item label="Ngày nộp">
		// 						{formatDate(detailRecord.createdAt)}
		// 					</Descriptions.Item>
		// 					<Descriptions.Item label="Ghi chú admin">
		// 						{detailRecord.adminNote ? (
		// 							<Text className="whitespace-pre-wrap">
		// 								{detailRecord.adminNote}
		// 							</Text>
		// 						) : (
		// 							<Text type="secondary">Chưa có ghi chú</Text>
		// 						)}
		// 					</Descriptions.Item>
		// 				</Descriptions>

		// 				{/* Cập nhật trạng thái */}
		// 				<div className="flex items-center gap-3">
		// 					<Text strong>Trạng thái:</Text>
		// 					{renderStatusDropdown(detailRecord)}
		// 				</div>
		// 			</div>
		// 		)}
		// 	</Modal>

		// 	{/* ── Modal: Ghi chú admin ── */}
		// 	<Modal
		// 		title="Ghi chú ứng viên"
		// 		open={!!noteRecord}
		// 		onCancel={() => setNoteRecord(null)}
		// 		footer={
		// 			<div className="flex justify-end gap-2">
		// 				<Button onClick={() => setNoteRecord(null)}>Huỷ</Button>
		// 				<Button
		// 					type="primary"
		// 					loading={savingNote}
		// 					onClick={handleSaveNote}
		// 				>
		// 					Lưu ghi chú
		// 				</Button>
		// 			</div>
		// 		}
		// 		width={480}
		// 		destroyOnClose
		// 	>
		// 		{noteRecord && (
		// 			<div className="flex flex-col gap-3 pt-1">
		// 				<Text type="secondary">
		// 					Ứng viên: <Text strong>{noteRecord.fullName}</Text>
		// 				</Text>
		// 				<TextArea
		// 					rows={5}
		// 					placeholder="Nhập ghi chú cho ứng viên này..."
		// 					value={noteInput}
		// 					onChange={(e) => setNoteInput(e.target.value)}
		// 					maxLength={1000}
		// 					showCount
		// 				/>
		// 			</div>
		// 		)}
		// 	</Modal>
		// </div>
		<Developing />
	);
}
