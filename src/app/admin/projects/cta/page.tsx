"use client";

import { useEffect, useState } from "react";
import { Button, Col, Input, Row, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import { mediaIdToUploadFile, uploadMediaFile } from "../../introduction/utils";
import {
	mediaToUploadFile,
	type AdminMediaItem,
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import { useMessage } from "@/contexts/AdminMessageContext";

const { Title, Text } = Typography;

export default function ProjectCtaPage() {
	const messageApi = useMessage();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [buttonText, setButtonText] = useState("");
	const [background, setBackground] = useState<MediaUploadFile[]>([]);
	const [pickerOpen, setPickerOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		adminFetch("/api/admin/projects/cta", { cache: "no-store" })
			.then((res) => res.json())
			.then(async ({ item }) => {
				setTitle(item?.title ?? "");
				setDescription(item?.description ?? "");
				setButtonText(item?.buttonText ?? "");
				if (item?.backgroundImageId)
					setBackground([
						await mediaIdToUploadFile(
							String(item.backgroundImageId),
						),
					]);
			})
			.catch(() => messageApi.error("Không thể tải cấu hình CTA"))
			.finally(() => setLoading(false));
	}, [messageApi]);

	const beforeUpload: UploadProps["beforeUpload"] = (file) => {
		if (!file.type?.startsWith("image/")) {
			messageApi.error("Chỉ hỗ trợ tải ảnh lên");
			return Upload.LIST_IGNORE;
		}
		return false;
	};

	const save = async () => {
		setSaving(true);
		try {
			const backgroundImageId = background[0]
				? await uploadMediaFile(background[0])
				: null;
			const res = await adminFetch("/api/admin/projects/cta", {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					title,
					description,
					buttonText,
					backgroundImageId,
				}),
			});
			const data = await res.json();
			if (!res.ok || data.error)
				throw new Error(data.error ?? "Không thể lưu cấu hình CTA");
			messageApi.success("Lưu cấu hình CTA thành công");
		} catch (error) {
			messageApi.error(
				error instanceof Error
					? error.message
					: "Không thể lưu cấu hình CTA",
			);
		} finally {
			setSaving(false);
		}
	};

	const previewUrl = background[0]?.url;
	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between px-1">
				<Title level={4} className="!mb-0">
					Cấu hình CTA dự án
				</Title>
				<Button
					type="primary"
					size="large"
					loading={saving}
					disabled={loading}
					onClick={save}
				>
					Cập nhật
				</Button>
			</div>
			<Row gutter={30}>
				<Col span={12}>
					<Block>
						<Title level={5}>Nội dung CTA</Title>
						<Input
							className="mb-4"
							placeholder="Tiêu đề"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={loading}
						/>
						<Input.TextArea
							className="mb-4"
							placeholder="Mô tả ngắn"
							autoSize={{ minRows: 3, maxRows: 5 }}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={loading}
						/>
						<Input
							placeholder="Chữ trên nút"
							value={buttonText}
							onChange={(e) => setButtonText(e.target.value)}
							disabled={loading}
						/>
					</Block>
				</Col>
				<Col span={12}>
					<Block>
						<Title level={5}>Ảnh nền</Title>
						<Button
							onClick={() => setPickerOpen(true)}
							disabled={loading}
							className="w-full h-[42px] mb-3"
							variant="outlined"
						>
							Chọn ảnh từ thư viện
						</Button>
						<Upload
							listType="picture-card"
							accept="image/*"
							maxCount={1}
							fileList={background}
							beforeUpload={beforeUpload}
							onChange={({ fileList }) =>
								setBackground(fileList as MediaUploadFile[])
							}
						>
							{background.length ? null : (
								<button
									type="button"
									className="border-0 bg-transparent"
								>
									<PlusOutlined />
									<div className="mt-2">Tải ảnh mới</div>
								</button>
							)}
						</Upload>
					</Block>
				</Col>
			</Row>
			{pickerOpen && (
				<MediaPickerModal
					open
					title="Chọn ảnh nền CTA"
					multiple={false}
					resourceType="image"
					selectedIds={
						background[0]?.mediaId ? [background[0].mediaId] : []
					}
					onCancel={() => setPickerOpen(false)}
					onConfirm={(items: AdminMediaItem[]) => {
						setBackground(
							items[0] ? [mediaToUploadFile(items[0])] : [],
						);
						setPickerOpen(false);
					}}
				/>
			)}
		</div>
	);
}
