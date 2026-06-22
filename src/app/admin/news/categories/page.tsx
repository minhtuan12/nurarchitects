"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Button,
	Form,
	Input,
	Modal,
	Space,
	Table,
	Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import { useMessage } from "@/contexts/AdminMessageContext";
import NoData from "@/components/NoData";
import { SquarePen, Trash } from "lucide-react";
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { toSlug } from "@/helpers";

const { Text } = Typography;

interface CategoryRow {
	_id: string;
	name: string;
	slug: string;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	newsCount?: number;
}

interface CategoryResponse {
	items: CategoryRow[];
	page: number;
	limit: number;
	total: number;
}

export default function () {
	const queryClient = useQueryClient();
	const messageApi = useMessage();
	const [deletingId, setDeletingId] = useState<string | null>(null);
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
			// reset về trang 1 mỗi khi search thay đổi
			setPagination((current) => ({ ...current, current: 1 }));
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [searchInput]);

	const currentPage = pagination.current;
	const pageSize = pagination.pageSize;

	const queryKey = useMemo(
		() => ["admin-news-categories", currentPage, pageSize, search],
		[currentPage, pageSize, search],
	);

	const { data, isFetching } = useQuery({
		queryKey,
		queryFn: async (): Promise<CategoryResponse> => {
			const params = new URLSearchParams({
				page: String(currentPage),
				limit: String(pageSize),
			});

			if (search) params.set("search", search);

			const response = await adminFetch(
				`/api/admin/news-categories?${params.toString()}`,
				{ cache: "no-store" },
			);
			const payload = await response.json();
			if (!response.ok || payload.error) {
				throw new Error(payload.error ?? "Cannot load categories");
			}
			return {
				items: payload.items ?? [],
				page: payload.page ?? currentPage,
				limit: payload.limit ?? pageSize,
				total: payload.total ?? 0,
			};
		},
	});

	const categories = data?.items ?? [];
	const total = data?.total ?? 0;

	const confirmDelete = useCallback(
		(record: CategoryRow) => {
			Modal.confirm({
				title: "Xóa danh mục?",
				content: `Bạn có chắc chắn muốn xóa "${record.name}"?`,
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
							`/api/admin/news-categories/${record._id}`,
							{
								method: "DELETE",
							},
						);
						const data = await response.json();
						if (!response.ok || data.error) {
							throw new Error(
								data.error ?? "Cannot delete category",
							);
						}
						messageApi.success("Đã xóa danh mục");
						const nextPage =
							categories.length === 1 && currentPage > 1
								? currentPage - 1
								: currentPage;
						if (nextPage !== currentPage) {
							setPagination((current) => ({
								...current,
								current: nextPage,
							}));
						} else {
							await queryClient.invalidateQueries({
								queryKey: ["admin-news-categories"],
							});
						}
					} catch {
						messageApi.error("Không thể xóa danh mục này");
						throw new Error("Delete category failed");
					} finally {
						setDeletingId(null);
					}
				},
			});
		},
		[categories.length, currentPage, deletingId, messageApi, queryClient],
	);

	// --- Add / Edit modal ---
	const [form] = Form.useForm<{ name: string }>();
	const [modalOpen, setModalOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [editingRecord, setEditingRecord] = useState<CategoryRow | null>(
		null,
	);

	const openCreateModal = useCallback(() => {
		setEditingRecord(null);
		form.resetFields();
		setModalOpen(true);
	}, [form]);

	const openEditModal = useCallback(
		(record: CategoryRow) => {
			setEditingRecord(record);
			form.setFieldsValue({ name: record.name });
			setModalOpen(true);
		},
		[form],
	);

	const closeModal = useCallback(() => {
		setModalOpen(false);
		form.resetFields();
		setEditingRecord(null);
	}, [form]);

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields();
			setSubmitting(true);

			const isEdit = Boolean(editingRecord);
			const url = isEdit
				? `/api/admin/news-categories/${editingRecord!._id}`
				: "/api/admin/news-categories";

			const response = await adminFetch(url, {
				method: isEdit ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: values.name, slug: toSlug(values.name) }),
			});
			const data = await response.json();
			if (!response.ok || data.error) {
				throw new Error(data.error ?? "Cannot save category");
			}

			messageApi.success(
				isEdit ? "Đã cập nhật danh mục" : "Đã thêm danh mục",
			);
			closeModal();
			await queryClient.invalidateQueries({
				queryKey: ["admin-news-categories"],
			});
		} catch (error: any) {
			if (error?.errorFields) return; // lỗi validate form, không cần toast
			messageApi.error(error?.message ?? "Không thể lưu danh mục");
		} finally {
			setSubmitting(false);
		}
	}, [closeModal, editingRecord, form, messageApi, queryClient]);

	const columns = useMemo<ColumnsType<CategoryRow>>(
		() => [
			{
				title: "Tên danh mục",
				dataIndex: "name",
				key: "name",
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
				title: "Số tin tức",
				dataIndex: "newsCount",
				key: "newsCount",
				width: 80,
				minWidth: 80,
				align: 'center',
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
							onClick={() => openEditModal(record)}
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
		[confirmDelete, openEditModal],
	);

	const handleTableChange = (nextPagination: {
		current?: number;
		pageSize?: number;
	}) => {
		setPagination({
			current: nextPagination.current ?? 1,
			pageSize: nextPagination.pageSize ?? DEFAULT_PAGE_SIZE,
		});
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between px-1">
				<Input
					placeholder="Tìm kiếm theo tên danh mục"
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
					onClick={openCreateModal}
				>
					Thêm
				</Button>
			</div>
			<Block>
				<Table
					rowKey="_id"
					columns={columns}
					dataSource={categories}
					loading={isFetching}
					pagination={{
						current: currentPage,
						pageSize,
						total,
						showSizeChanger: false,
						showTotal: (total) => `${total} danh mục`,
					}}
					locale={{
						emptyText: (
							<NoData description="Chưa có danh mục nào" />
						),
					}}
					onChange={handleTableChange as any}
					className="[&_.ant-pagination]:mb-0 [&_.ant-pagination]:mt-6 [&_.ant-table-body]:min-h-[calc(100vh-330px)] [&_.ant-table-body]:max-h-[calc(100vh-330px)]"
				/>
			</Block>

			<Modal
				title={editingRecord ? "Sửa danh mục" : "Thêm danh mục"}
				open={modalOpen}
				onOk={handleSubmit}
				onCancel={closeModal}
				okText={editingRecord ? "Cập nhật" : "Thêm"}
				cancelText="Hủy"
				confirmLoading={submitting}
				destroyOnHidden
			>
				<Form form={form} layout="vertical" className="mt-4">
					<Form.Item
						name="name"
						label="Tên danh mục"
						rules={[
							{
								required: true,
								message: "Vui lòng nhập tên danh mục",
							},
						]}
					>
						<Input
							placeholder="Nhập tên danh mục"
							autoFocus
							onPressEnter={handleSubmit}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
