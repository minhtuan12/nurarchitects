"use client";

import { useEffect, useState } from "react";
import { Button, Col, Flex, Row, Typography } from "antd";
import { adminFetch } from "@/components/admin/AdminShell";
import { useMessage } from "@/contexts/AdminMessageContext";
import {
	mediaToUploadFile,
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import {
	IActivityProcess,
	IActivityConfigPopulated,
	IActivityAdvantagePopulated,
} from "@/types/activity";
import BannerManager from "../(components)/BannerManager";
import AdvantagesManager from "../(components)/AdvantagesManager";
import ProcessList from "../(components)/ProcessList";
import { Info } from "lucide-react";

export default function ActivityConfigPage() {
	const messageApi = useMessage();

	const [bannerFiles, setBannerFiles] = useState<MediaUploadFile[]>([]);
	const [advantages, setAdvantages] = useState<IActivityAdvantagePopulated[]>([]);
	const [process, setProcess] = useState<IActivityProcess[]>([]);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		adminFetch("/api/admin/activity-config")
			.then((res) => res.json())
			.then((res) => {
				const config: IActivityConfigPopulated | undefined = res?.item ?? res;
				if (!config) return;

				if (config.bannerId && typeof config.bannerId === "object") {
					setBannerFiles([mediaToUploadFile(config.bannerId as any)]);
				} else {
					setBannerFiles([]);
				}

				setAdvantages(config.advantages ?? []);
				setProcess(
					(config.process ?? []).map((p, i) => ({
						order: p.order ?? i,
						name: p.name,
						details: p.details ?? [],
					})),
				);
			})
			.catch(() => messageApi.error("Không thể tải dữ liệu quy trình hoạt động"))
			.finally(() => setLoading(false));
	}, []);

	// Upload banner mới lên Cloudinary (nếu là file vừa chọn từ máy), hoặc
	// dùng luôn mediaId nếu đã chọn từ thư viện. Trả về null nếu không có banner.
	const uploadBannerFile = async (
		file: MediaUploadFile,
	): Promise<string | null> => {
		if (!file) return null;
		if (file.mediaId) return file.mediaId;
		if (!file.originFileObj) return null;

		const isVideo = file.originFileObj.type?.startsWith("video/");
		const formData = new FormData();
		formData.append("file", file.originFileObj);
		formData.append("resourceType", isVideo ? "video" : "image");

		const res = await adminFetch("/api/admin/media", {
			method: "POST",
			body: formData,
		});
		const data = await res.json();
		if (!res.ok || data.error || !data.item?._id) {
			throw new Error(data.error ?? "Không thể tải banner lên");
		}

		return String(data.item._id);
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const bannerId =
				bannerFiles.length > 0 ? await uploadBannerFile(bannerFiles[0]) : null;

			const res = await adminFetch("/api/admin/activity-config", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...(bannerId !== null && { bannerId }),
					advantages: advantages.map((a) => ({
						...a,
						thumbnailId:
							a.thumbnailId && typeof a.thumbnailId === "object"
								? (a.thumbnailId as any)._id
								: a.thumbnailId,
					})),
					process,
				}),
			});
			const data = await res.json();
			if (!res.ok || data.error) {
				throw new Error(data.error ?? "Không thể lưu cấu hình");
			}
			messageApi.success("Lưu thành công");
		} catch (err) {
			messageApi.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
		} finally {
			setSaving(false);
		}
	};

	const isDisabled = loading || saving;

	return (
		<>
			<Row gutter={[16, 16]} className="flex items-center justify-between mb-5 px-2">
				<Flex align="center" gap={6}>
					<Info size={18} color="#e69b08" />
					<Typography.Text type="secondary" className="text-sm text-[#e69b08]">
						Nhấn Cập nhật sau khi thêm các nội dung
					</Typography.Text>
				</Flex>
				<Button
					type="primary"
					size="large"
					loading={saving}
					disabled={loading}
					onClick={handleSave}
				>
					Cập nhật
				</Button>
			</Row>

			<Row gutter={[16, 16]}>
				<Col span={24}>
					<BannerManager
						files={bannerFiles}
						onChange={setBannerFiles}
						disabled={isDisabled}
					/>
				</Col>
			</Row>

			<Row gutter={[16, 16]} className="mt-4">
				<Col span={24}>
					<AdvantagesManager
						advantages={advantages}
						onChange={setAdvantages}
						disabled={isDisabled}
					/>
				</Col>
			</Row>

			<Row gutter={[16, 16]} className="mt-4">
				<Col span={24}>
					<ProcessList
						processes={process}
						onChange={setProcess}
						disabled={isDisabled}
					/>
				</Col>
			</Row>
		</>
	);
}
