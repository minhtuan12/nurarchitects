"use client";

import { useCallback, useMemo, useState } from "react";
import {
	Button,
	Form,
	Input,
	Modal,
	Space,
	Table,
	Typography,
	Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { SquarePen, Trash, ImageOff } from "lucide-react";
import Block from "@/components/Block";
import NoData from "@/components/NoData";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
	mediaToUploadFile,
	MediaUploadFile,
	type AdminMediaItem,
} from "@/components/admin/media/media-upload-file";
import { NeededFieldItemState, NeededFieldListProps } from "@/types/cooperation";

const { Text } = Typography;

interface NeededFieldFormValues {
	name: string;
	description?: string;
}

export default function NeededFieldList({
	fields,
	onChange,
	disabled,
}: NeededFieldListProps) {
	const [form] = Form.useForm<NeededFieldFormValues>();
	const [modalOpen, setModalOpen] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [modalImageFile, setModalImageFile] = useState<
		MediaUploadFile | undefined
	>(undefined);
	const [pickerOpen, setPickerOpen] = useState(false);

	const isEdit = editingIndex !== null;

	// --- Modal add/edit ---

	const openAddModal = useCallback(() => {
		setEditingIndex(null);
		form.resetFields();
		setModalImageFile(undefined);
		setModalOpen(true);
	}, [form]);

	const openEditModal = useCallback(
		(index: number) => {
			const field = fields[index];
			setEditingIndex(index);
			form.setFieldsValue({
				name: field.name,
				description: field.description ?? "",
			});
			setModalImageFile(field.imageFile);
			setModalOpen(true);
		},
		[fields, form],
	);

	const closeModal = useCallback(() => {
		setModalOpen(false);
		form.resetFields();
		setEditingIndex(null);
		setModalImageFile(undefined);
	}, [form]);

	const handleSubmit = useCallback(async () => {
		let values: NeededFieldFormValues;
		try {
			values = await form.validateFields();
		} catch {
			return; // lỗi validate form, không cần xử lý thêm
		}

		const nextField: NeededFieldItemState = {
			name: values.name,
			description: values.description ?? "",
			imageFile: modalImageFile,
			imageId: modalImageFile?.mediaId,
		};

		if (isEdit && editingIndex !== null) {
			onChange(fields.map((f, i) => (i === editingIndex ? nextField : f)));
		} else {
			onChange([...fields, nextField]);
		}

		closeModal();
	}, [closeModal, editingIndex, fields, form, isEdit, modalImageFile, onChange]);

	// --- Xoá ---

	const handleRemove = useCallback(
		(index: number) => {
			Modal.confirm({
				title: "Xóa lĩnh vực?",
				content: `Bạn có chắc chắn muốn xóa "${fields[index].name}"?`,
				okText: "Xóa",
				okButtonProps: { danger: true },
				cancelText: "Hủy",
				onOk: () => {
					onChange(fields.filter((_, i) => i !== index));
				},
			});
		},
		[fields, onChange],
	);

	// --- Ảnh trong modal ---

	const handleSelectMedia = (items: AdminMediaItem[]) => {
		const item = items[0];
		if (item) setModalImageFile(mediaToUploadFile(item));
		setPickerOpen(false);
	};

	const beforeImageUpload: UploadProps["beforeUpload"] = (file) => {
		if (!file.type?.startsWith("image/")) return Upload.LIST_IGNORE;
		return false;
	};

	// --- Cột bảng ---

	const columns = useMemo<ColumnsType<NeededFieldItemState>>(
		() => [
			{
				title: "Ảnh",
				key: "image",
				align: 'center',
				width: 72,
				render: (_, record) =>
					(record.imageFile?.url || record.imageFile?.thumbUrl) ? (
						<img
							src={record.imageFile.url || record.imageFile.thumbUrl}
							alt={record.name}
							className="w-10 h-10 object-cover rounded"
						/>
					) : (
						<div className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 text-gray-400">
							<ImageOff width={16} />
						</div>
					),
			},
			{
				title: "Tên lĩnh vực",
				dataIndex: "name",
				key: "name",
				render: (value: string, record) => (
					<div className="flex flex-col gap-1">
						<Text strong>{value}</Text>
						{record.description ? (
							<Text
								type="secondary"
								className="text-xs line-clamp-1"
							>
								{record.description}
							</Text>
						) : null}
					</div>
				),
			},
			{
				title: "Thao tác",
				key: "actions",
				width: 100,
				align: "center",
				render: (_, record, index) => (
					<Space className="gap-4">
						<SquarePen
							onClick={() => !disabled && openEditModal(index)}
							className="cursor-pointer"
							color="#2b7fff"
							width={18}
						/>
						<Trash
							onClick={() => !disabled && handleRemove(index)}
							className="cursor-pointer"
							color="red"
							width={18}
						/>
					</Space>
				),
			},
		],
		[disabled, handleRemove, openEditModal],
	);

	return (
		<Block>
			<div className="flex items-center justify-between mb-4">
				<Text strong className="text-base">
					Lĩnh vực cần tìm kiếm ở đối tác
				</Text>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={openAddModal}
					disabled={disabled}
				>
					Thêm lĩnh vực
				</Button>
			</div>

			<Table<NeededFieldItemState>
				rowKey={Math.random().toString()}
				columns={columns}
				dataSource={fields}
				pagination={false}
				locale={{
					emptyText: <NoData description="Chưa có lĩnh vực nào" />,
				}}
			/>

			<Modal
				title={isEdit ? "Sửa lĩnh vực" : "Thêm lĩnh vực"}
				open={modalOpen}
				onOk={handleSubmit}
				onCancel={closeModal}
				okText={isEdit ? "Cập nhật" : "Thêm"}
				cancelText="Hủy"
				destroyOnHidden
			>
				<Form form={form} layout="vertical" className="mt-4">
					<Form.Item
						name="name"
						label="Tên lĩnh vực"
						rules={[
							{ required: true, message: "Vui lòng nhập tên lĩnh vực" },
						]}
					>
						<Input placeholder="VD: Thiết kế kiến trúc" autoFocus />
					</Form.Item>
					<Form.Item name="description" label="Mô tả">
						<Input.TextArea
							placeholder="Mô tả lĩnh vực"
							autoSize={{ minRows: 2, maxRows: 4 }}
						/>
					</Form.Item>
					<Form.Item label="Ảnh minh hoạ">
						<div className="flex flex-col gap-3">
							<Button onClick={() => setPickerOpen(true)}>
								Chọn ảnh đã tải lên
							</Button>
							<Upload
								className="w-full [&_.ant-upload-list]:h-full [&_.ant-upload]:w-full flex-1"
								listType="picture-card"
								accept="image/*"
								maxCount={1}
								fileList={modalImageFile ? [modalImageFile] : []}
								beforeUpload={beforeImageUpload}
								onChange={({ fileList }) =>
									setModalImageFile(
										(fileList[0] as MediaUploadFile) ?? undefined,
									)
								}
							>
								{modalImageFile ? null : (
									<button
										type="button"
										className="border-0 bg-transparent"
									>
										<PlusOutlined />
										<div className="mt-2 text-xs">Tải ảnh</div>
									</button>
								)}
							</Upload>
						</div>
					</Form.Item>
				</Form>
			</Modal>

			{pickerOpen && (
				<MediaPickerModal
					open
					title="Chọn ảnh lĩnh vực"
					resourceType="image"
					selectedIds={
						modalImageFile?.mediaId ? [modalImageFile.mediaId] : []
					}
					onCancel={() => setPickerOpen(false)}
					onConfirm={handleSelectMedia}
				/>
			)}
		</Block>
	);
}
