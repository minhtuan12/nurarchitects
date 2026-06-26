"use client";

import Block from "@/components/Block";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
	mediaToUploadFile,
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import {
	Button,
	Flex,
	Typography,
	Upload,
} from "antd";
import type { UploadProps } from "antd";
import {
	PlusOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";

const { Title } = Typography;

interface GallerySectionProps {
	files: MediaUploadFile[];
	onChange: (files: MediaUploadFile[]) => void;
	disabled?: boolean;
}

export default function GallerySection({ files, onChange, disabled }: GallerySectionProps) {
	const [pickerOpen, setPickerOpen] = useState(false);

	const selectedIds = useMemo(
		() => files.map((f) => f.mediaId).filter((id): id is string => Boolean(id)),
		[files],
	);

	const beforeUpload: UploadProps["beforeUpload"] = (file) => {
		if (!file.type?.startsWith("image/")) return Upload.LIST_IGNORE;
		return false;
	};

	return (
		<Block>
			<Flex justify="space-between" align="center" className="mb-4">
				<Title level={5} className="!mb-0 !text-black">Thư viện ảnh</Title>
				<Button onClick={() => setPickerOpen(true)} disabled={disabled} className="h-[38px] font-semibold">
					Chọn ảnh đã tải lên
				</Button>
			</Flex>

			<Upload
				listType="picture-card"
				accept="image/*"
				multiple
				fileList={files}
				beforeUpload={beforeUpload}
				onChange={({ fileList }) => onChange(fileList as MediaUploadFile[])}
				disabled={disabled}
			>
				<button type="button" className="border-0 bg-transparent">
					<PlusOutlined />
					<div className="mt-2">Tải ảnh mới</div>
				</button>
			</Upload>

			{pickerOpen && (
				<MediaPickerModal
					open
					title="Chọn ảnh thư viện"
					resourceType="image"
					multiple
					selectedIds={selectedIds}
					onCancel={() => setPickerOpen(false)}
					onConfirm={(items) => {
						onChange(items.map(mediaToUploadFile));
						setPickerOpen(false);
					}}
				/>
			)}
		</Block>
	);
}
