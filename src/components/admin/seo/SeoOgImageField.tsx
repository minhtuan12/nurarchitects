"use client";

import { InboxOutlined } from "@ant-design/icons";
import { Button, Image as AntImage, Space, Upload } from "antd";
import type { UploadProps } from "antd";
import { useState } from "react";
import { adminFetch } from "@/components/admin/AdminShell";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
	mediaToOgImageUrl,
	type AdminMediaItem,
} from "@/components/admin/media/media-upload-file";
import { useMessage } from "@/contexts/AdminMessageContext";

const { Dragger } = Upload;

interface SeoOgImageFieldProps {
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
}

export default function SeoOgImageField({
	value = "",
	onChange,
	disabled,
}: SeoOgImageFieldProps) {
	const [uploading, setUploading] = useState(false);
	const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
	const messageApi = useMessage();

	const emitChange = (nextValue: string) => {
		onChange?.(nextValue);
	};

	const handleSelectExistingOgImage = (items: AdminMediaItem[]) => {
		const imageUrl = items[0] ? mediaToOgImageUrl(items[0]) : "";
		if (!imageUrl) {
			messageApi.error("Không nhận được URL ảnh từ media đã chọn");
			return;
		}
		emitChange(imageUrl);
		setMediaPickerOpen(false);
	};

	const uploadProps: UploadProps = {
		name: "file",
		multiple: false,
		showUploadList: false,
		disabled: disabled || uploading,
		accept: "image/*",
		customRequest: async (options) => {
			const { file, onSuccess, onError } = options;
			try {
				setUploading(true);
				const formData = new FormData();
				formData.append("file", file as File);
				formData.append("resourceType", "image");

				const res = await adminFetch("/api/admin/media", {
					method: "POST",
					body: formData,
				});
				const data = await res.json();

				if (!res.ok || data.error) {
					throw new Error(data.error || "Tải ảnh lên thất bại");
				}

				const imageUrl = data.item ? mediaToOgImageUrl(data.item) : "";
				if (!imageUrl) {
					throw new Error("Không nhận được URL ảnh từ server");
				}

				emitChange(imageUrl);
				messageApi.success("Tải ảnh lên thành công");
				onSuccess?.(data);
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("Tải ảnh lên thất bại");
				messageApi.error(error.message);
				onError?.(error);
			} finally {
				setUploading(false);
			}
		},
	};

	return (
		<Space orientation="vertical" className="w-full" size={12}>
			{value ? (
				<div className="flex items-center gap-3">
					<AntImage
						src={value}
						alt="OG preview"
						preview={false}
						width={96}
						height={96}
						className="rounded border object-cover"
					/>
					<Space>
						<Button
							disabled={disabled || uploading}
							onClick={() => setMediaPickerOpen(true)}
						>
							Chọn ảnh đã tải lên
						</Button>
						<Button
							danger
							disabled={disabled || uploading}
							onClick={() => emitChange("")}
						>
							Xóa ảnh
						</Button>
					</Space>
				</div>
			) : (
				<Button
					disabled={disabled || uploading}
					onClick={() => setMediaPickerOpen(true)}
				>
					Chọn ảnh đã tải lên
				</Button>
			)}
			<Dragger {...uploadProps} className="mb-2">
				<p className="ant-upload-drag-icon">
					<InboxOutlined />
				</p>
				<p className="ant-upload-text">Nhấn vào hoặc thả ảnh để tải lên</p>
				<p className="ant-upload-hint">Hỗ trợ định dạng ảnh (jpg, png, webp...)</p>
			</Dragger>
			{mediaPickerOpen ? (
				<MediaPickerModal
					open
					title="Chọn ảnh OG"
					resourceType="image"
					onCancel={() => setMediaPickerOpen(false)}
					onConfirm={handleSelectExistingOgImage}
				/>
			) : null}
		</Space>
	);
}
