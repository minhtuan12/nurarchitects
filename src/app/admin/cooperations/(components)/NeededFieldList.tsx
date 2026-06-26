"use client";

import { useState } from "react";
import {
	Button,
	Col,
	Input,
	Row,
	Space,
	Upload,
	Card,
	Typography,
	Flex,
} from "antd";
import type { UploadProps } from "antd";
import {
	PlusOutlined,
	DeleteOutlined,
} from "@ant-design/icons";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
	mediaToUploadFile,
	MediaUploadFile,
	type AdminMediaItem,
} from "@/components/admin/media/media-upload-file";
import { NeededFieldItemState, NeededFieldListProps } from "@/types/cooperation";
import Block from "@/components/Block";

const { Text, Title } = Typography;

export default function NeededFieldList({ fields, onChange, disabled }: NeededFieldListProps) {
	const [pickerOpenIndex, setPickerOpenIndex] = useState<number | null>(null);

	const handleAdd = () => {
		onChange([...fields, { name: "", description: "" }]);
	};

	const handleRemove = (index: number) => {
		onChange(fields.filter((_, i) => i !== index));
	};

	const handleChange = (
		index: number,
		field: keyof NeededFieldItemState,
		value: string,
	) => {
		onChange(
			fields.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
		);
	};

	const handleImageChange = (
		index: number,
		fileList: MediaUploadFile[],
	) => {
		onChange(
			fields.map((f, i) =>
				i === index
					? { ...f, imageFile: fileList[0] ?? undefined, imageId: fileList[0]?.mediaId ?? undefined }
					: f,
			),
		);
	};

	const handleSelectMedia = (index: number, items: AdminMediaItem[]) => {
		const item = items[0];
		if (!item) {
			setPickerOpenIndex(null);
			return;
		}
		const uploadFile = mediaToUploadFile(item);
		onChange(
			fields.map((f, i) =>
				i === index
					? { ...f, imageFile: uploadFile, imageId: item._id }
					: f,
			),
		);
		setPickerOpenIndex(null);
	};

	const beforeImageUpload: UploadProps["beforeUpload"] = (file) => {
		if (!file.type?.startsWith("image/")) return Upload.LIST_IGNORE;
		return false;
	};

	return (
		<Block>
			<Flex justify="space-between" align="center" className="mb-4">
				<Title level={5} className="!mb-0">
					Lĩnh vực cần tìm kiếm ở đối tác
				</Title>
				<Button
					type="dashed"
					icon={<PlusOutlined />}
					onClick={handleAdd}
					disabled={disabled}
				>
					Thêm lĩnh vực
				</Button>
			</Flex>
			<div className="flex flex-col gap-3">
				{fields.map((field, index) => (
					<Card
						key={index}
						size="small"
						className="border border-gray-200"
						styles={{ body: { padding: "16px" } }}
					>
						<div className="flex items-start justify-between gap-2 mb-3">
							<Text strong className="text-sm">
								Điều kiện {index + 1}
							</Text>
							<Button
								type="text"
								size="small"
								danger
								icon={<DeleteOutlined />}
								disabled={disabled}
								onClick={() => handleRemove(index)}
							/>
						</div>

						<Row gutter={[12, 0]}>
							<Col xs={24} md={12}>
								<div className="flex flex-col gap-2">
									<Input
										placeholder="Tên điều kiện"
										value={field.name}
										onChange={(e) =>
											handleChange(index, "name", e.target.value)
										}
										disabled={disabled}
									/>
									<Input.TextArea
										placeholder="Mô tả điều kiện"
										value={field.description ?? ""}
										onChange={(e) =>
											handleChange(index, "description", e.target.value)
										}
										autoSize={{ minRows: 2, maxRows: 4 }}
										disabled={disabled}
									/>
								</div>
							</Col>
							<Col xs={24} md={12}>
								<Space orientation="vertical" size={8} className="w-full">
									<Button
										size="small"
										onClick={() => setPickerOpenIndex(index)}
										disabled={disabled}
									>
										Chọn ảnh đã tải lên
									</Button>
									<Upload
										listType="picture-card"
										accept="image/*"
										maxCount={1}
										fileList={field.imageFile ? [field.imageFile] : []}
										beforeUpload={beforeImageUpload}
										onChange={({ fileList }) =>
											handleImageChange(
												index,
												fileList as MediaUploadFile[],
											)
										}
										disabled={disabled}
									>
										{field.imageFile ? null : (
											<button
												type="button"
												className="border-0 bg-transparent"
											>
												<PlusOutlined />
												<div className="mt-2 text-xs">Tải ảnh</div>
											</button>
										)}
									</Upload>
								</Space>
							</Col>
						</Row>

						{pickerOpenIndex === index && (
							<MediaPickerModal
								open
								title="Chọn ảnh điều kiện"
								resourceType="image"
								selectedIds={field.imageId ? [field.imageId] : []}
								onCancel={() => setPickerOpenIndex(null)}
								onConfirm={(items) => handleSelectMedia(index, items)}
							/>
						)}
					</Card>
				))}
			</div>
		</Block>
	);
}
