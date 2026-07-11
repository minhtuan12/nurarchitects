"use client";

import { useState } from "react";
import { Button, Flex, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Block from "@/components/Block";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
	mediaToUploadFile,
	type AdminMediaItem,
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import { useMessage } from "@/contexts/AdminMessageContext";

const { Title } = Typography;

interface BannerManagerProps {
	files: MediaUploadFile[];
	onChange: (files: MediaUploadFile[]) => void;
	disabled?: boolean;
}

export default function BannerManager({
	files,
	onChange,
	disabled,
}: BannerManagerProps) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const messageApi = useMessage();

	const beforeUpload: UploadProps["beforeUpload"] = (file) => {
		const isImageOrVideo =
			file.type?.startsWith("image/") || file.type?.startsWith("video/");
		if (!isImageOrVideo) {
			messageApi.error("Chỉ hỗ trợ tải ảnh hoặc video lên");
			return Upload.LIST_IGNORE;
		}
		return false;
	};

	const handleSelectMedia = (items: AdminMediaItem[]) => {
		onChange(items[0] ? [mediaToUploadFile(items[0])] : []);
		setPickerOpen(false);
	};

	return (
		<Block>
			<Flex vertical gap={12}>
				<Title level={5} className="!mb-0 !text-black">
					Banner
				</Title>

				<Button
					className="self-start"
					disabled={disabled}
					onClick={() => setPickerOpen(true)}
				>
					Chọn từ thư viện
				</Button>

				<Upload
					listType="picture-card"
					accept="image/*,video/*"
					maxCount={1}
					fileList={files}
					beforeUpload={beforeUpload}
					onChange={({ fileList }) => onChange(fileList as MediaUploadFile[])}
					disabled={disabled}
					className="w-full [&_.ant-upload]:w-full [&_.ant-upload]:h-50"
				>
					{files.length >= 1 ? null : (
						<button type="button" className="border-0 bg-transparent">
							<PlusOutlined />
							<div className="mt-2">Tải ảnh/video mới</div>
						</button>
					)}
				</Upload>
			</Flex>

			{pickerOpen && (
				<MediaPickerModal
					open
					title="Chọn banner"
					multiple={false}
					selectedIds={files[0]?.mediaId ? [files[0].mediaId] : []}
					onCancel={() => setPickerOpen(false)}
					onConfirm={handleSelectMedia}
				/>
			)}
		</Block>
	);
}
