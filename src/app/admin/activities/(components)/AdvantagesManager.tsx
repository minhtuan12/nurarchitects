"use client";

import { useMemo, useState } from "react";
import { Avatar, Button, Form, Input, Modal, Space, Table, Typography, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PictureOutlined, PlusOutlined } from "@ant-design/icons";
import { SquarePen, Trash } from "lucide-react";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
	mediaToUploadFile,
	type AdminMediaItem,
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import { IActivityAdvantage, IActivityAdvantagePopulated } from "@/types/activity";
import { IMedia } from "@/types/media";
import { useMessage } from "@/contexts/AdminMessageContext";

const { Title, Text } = Typography;

type AdvantageThumbnail = string | (AdminMediaItem & { _id: string });

function getThumbnailUrl(thumbnailId?: AdvantageThumbnail): string | undefined {
	if (!thumbnailId || typeof thumbnailId === "string") return undefined;
	return (thumbnailId as any).secureUrl ?? (thumbnailId as any).url;
}

interface AdvantagesManagerProps {
	advantages: IActivityAdvantagePopulated[];
	onChange: (advantages: IActivityAdvantagePopulated[]) => void;
	disabled?: boolean;
}

export default function AdvantagesManager({
	advantages,
	onChange,
	disabled,
}: AdvantagesManagerProps) {
	const [form] = Form.useForm<{ name: string; description: string }>();
	const [modalOpen, setModalOpen] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [thumbnailFile, setThumbnailFile] = useState<MediaUploadFile | null>(null);
	const [pickerOpen, setPickerOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const messageApi = useMessage();

	const openCreateModal = () => {
		setEditingIndex(null);
		form.resetFields();
		setThumbnailFile(null);
		setModalOpen(true);
	};

	const openEditModal = (index: number) => {
		const advantage = advantages[index];
		setEditingIndex(index);
		form.setFieldsValue({
			name: String(advantage.name ?? ""),
			description: String(advantage.description ?? ""),
		});
		setThumbnailFile(
			advantage.thumbnailId && typeof advantage.thumbnailId === "object"
				? mediaToUploadFile(advantage.thumbnailId as unknown as AdminMediaItem)
				: null,
		);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		form.resetFields();
		setEditingIndex(null);
		setThumbnailFile(null);
	};

	const handleRemove = (index: number) => {
		Modal.confirm({
			title: "Xoá ưu điểm?",
			content: `Bạn có chắc chắn muốn xoá "${String(
				advantages[index]?.name ?? "",
			)}"?`,
			okText: "Xoá",
			okButtonProps: { danger: true },
			cancelText: "Huỷ",
			onOk: () => {
				onChange(advantages.filter((_, i) => i !== index));
			},
		});
	};

	const handleSelectThumbnail = (items: AdminMediaItem[]) => {
		if (items[0]) setThumbnailFile(mediaToUploadFile(items[0]));
		setPickerOpen(false);
	};

	// Upload thumbnail lên Cloudinary qua /api/admin/media (nếu là file mới chọn từ máy),
	// trả về { id, url } cuối cùng; nếu đã có mediaId (chọn từ thư viện) thì dùng luôn
	const uploadThumbnailFile = async (
		file: MediaUploadFile,
	): Promise<{ id: string; url?: string } | null> => {
		if (!file) return null;
		if (file.mediaId) return { id: file.mediaId, url: file.url };
		if (!file.originFileObj) return null;

		const formData = new FormData();
		formData.append("file", file.originFileObj);
		formData.append("resourceType", "image");

		const res = await adminFetch("/api/admin/media", {
			method: "POST",
			body: formData,
		});
		const data = await res.json();
		if (!res.ok || data.error || !data.item?._id) {
			throw new Error(data.error ?? "Không thể tải ảnh lên");
		}

		return {
			id: String(data.item._id),
			url: data.item.secureUrl ?? data.item.url,
		};
	};

	const beforeThumbnailUpload: any = (file: any) => {
		const isImage = file.type?.startsWith("image/");
		if (!isImage) {
			messageApi.error("Chỉ hỗ trợ tải ảnh lên");
			return Upload.LIST_IGNORE;
		}
		return false;
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();

		setSubmitting(true);
		try {
			const thumbnail = thumbnailFile
				? await uploadThumbnailFile(thumbnailFile)
				: null;

			const nextAdvantage: IActivityAdvantagePopulated = {
				name: values.name,
				description: values.description ?? "",
				thumbnailId: thumbnail
					? ({ _id: thumbnail.id, secureUrl: thumbnail.url } as IMedia)
					: undefined,
			};

			if (editingIndex !== null) {
				onChange(
					advantages.map((a, i) => (i === editingIndex ? nextAdvantage : a)),
				);
			} else {
				onChange([...advantages, nextAdvantage]);
			}
			closeModal();
		} catch (err) {
			messageApi.error(
				err instanceof Error ? err.message : "Không thể tải ảnh lên",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const columns = useMemo<ColumnsType<IActivityAdvantagePopulated>>(
		() => [
			{
				title: "Ảnh",
				dataIndex: "thumbnailId",
				key: "thumbnailId",
				width: 72,
				render: (thumbnailId: AdvantageThumbnail | undefined) => {
					const url = getThumbnailUrl(thumbnailId);
					return url ? (
						<Avatar shape="square" size={40} src={url} />
					) : (
						<Avatar shape="square" size={40} icon={<PictureOutlined />} />
					);
				},
			},
			{
				title: "Tên ưu điểm",
				dataIndex: "name",
				key: "name",
				width: 220,
				render: (value: string) => <Text strong>{String(value)}</Text>,
			},
			{
				title: "Mô tả",
				dataIndex: "description",
				key: "description",
				render: (value: string) => (
					<Text type="secondary" className="line-clamp-2">
						{String(value ?? "")}
					</Text>
				),
			},
			{
				title: "Thao tác",
				key: "actions",
				width: 100,
				align: "center",
				render: (_, __, index) => (
					<Space className="gap-4">
						<SquarePen
							onClick={() => (disabled ? undefined : openEditModal(index))}
							className={disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
							color="#2b7fff"
							width={18}
						/>
						<Trash
							onClick={() => (disabled ? undefined : handleRemove(index))}
							className={disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
							color="red"
							width={18}
						/>
					</Space>
				),
			},
		],
		[advantages, disabled],
	);

	return (
		<Block>
			<div className="flex items-center justify-between mb-4">
				<Title level={5} className="!mb-0">
					Ưu điểm
				</Title>
				<Button
					type="dashed"
					icon={<PlusOutlined />}
					onClick={openCreateModal}
					disabled={disabled}
				>
					Thêm
				</Button>
			</div>

			<Table
				rowKey={(_, index) => `advantage-${index}`}
				columns={columns}
				dataSource={advantages}
				pagination={false}
				locale={{
					emptyText: (
						<span className="text-gray-400 text-sm">
							Chưa có dữ liệu. Nhấn <strong>Thêm</strong> để bắt
							đầu.
						</span>
					),
				}}
			/>

			<Modal
				title={editingIndex !== null ? "Sửa ưu điểm" : "Thêm ưu điểm"}
				open={modalOpen}
				onOk={handleSubmit}
				onCancel={closeModal}
				okText={editingIndex !== null ? "Cập nhật" : "Thêm"}
				cancelText="Huỷ"
				confirmLoading={submitting}
				destroyOnHidden
			>
				<Form form={form} layout="vertical" className="mt-4">
					<Form.Item label="Ảnh minh hoạ">
						<Space direction="vertical" size={8}>
							<Button size="small" onClick={() => setPickerOpen(true)}>
								Chọn từ thư viện
							</Button>

							<Upload
								listType="picture-card"
								accept="image/*"
								maxCount={1}
								fileList={thumbnailFile ? [thumbnailFile] : []}
								beforeUpload={beforeThumbnailUpload}
								onChange={({ fileList }) =>
									setThumbnailFile(
										(fileList[0] as MediaUploadFile) ?? null,
									)
								}
								onRemove={() => setThumbnailFile(null)}
							>
								{thumbnailFile ? null : (
									<button type="button" className="border-0 bg-transparent">
										<PlusOutlined />
										<div className="mt-2">Tải ảnh mới</div>
									</button>
								)}
							</Upload>
						</Space>
					</Form.Item>

					<Form.Item
						name="name"
						label="Tên ưu điểm"
						rules={[{ required: true, message: "Vui lòng nhập tên ưu điểm" }]}
					>
						<Input placeholder="Nhập tên ưu điểm" autoFocus />
					</Form.Item>
					<Form.Item name="description" label="Mô tả">
						<Input.TextArea
							placeholder="Nhập mô tả"
							autoSize={{ minRows: 3, maxRows: 6 }}
						/>
					</Form.Item>
				</Form>
			</Modal>

			{pickerOpen && (
				<MediaPickerModal
					open
					title="Chọn ảnh ưu điểm"
					multiple={false}
					selectedIds={thumbnailFile?.mediaId ? [thumbnailFile.mediaId] : []}
					onCancel={() => setPickerOpen(false)}
					onConfirm={handleSelectThumbnail}
				/>
			)}
		</Block>
	);
}
