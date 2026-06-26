"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Button,
	Col,
	Form,
	Input,
	Row,
	Space,
	Switch,
	Typography,
	Upload,
} from "antd";
import type { UploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
	mediaToUploadFile,
	type AdminMediaItem,
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import SeoFormFields from "@/components/admin/seo/SeoFormFields";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useMessage } from "@/contexts/AdminMessageContext";
import { IActivity } from "@/types/activity";
import { toSlug } from "@/helpers";
// import {
// 	buildActivityPayload,
// 	defaultActivityValues,
// 	toActivityFormValues,
// 	toSlug,
// 	type ActivityDetailResponse,
// 	type ActivityFormValues,
// } from "./activity-form-utils";

const { Title } = Typography;

export interface ActivityFormValues {
	name: string;
	slug: string;
	shortDescription?: string;
	description?: string;
	order?: number | null;
	status: "draft" | "published";
	seoTitle: string;
	seoSlug: string;
	seoDescription?: string;
	seoOgImage?: string;
	seoCanonicalUrl?: string;
	seoFocusKeywords?: string[];
}

export type ActivityResponse = Omit<IActivity, "createdAt" | "updatedAt"> & {
	_id: string;
	createdAt?: string;
	updatedAt?: string;
};

export interface ActivityDetailResponse {
	item?: ActivityResponse;
	seo?: SeoResponse | null;
	error?: string;
}

export interface SeoResponse {
	title?: string;
	slug?: string;
	description?: string;
	ogImage?: string;
	canonicalUrl?: string;
	focusKeywords?: string[];
}

export const defaultActivityValues: ActivityFormValues = {
	name: "",
	slug: "",
	shortDescription: "",
	description: "",
	order: 0,
	status: "draft",
	seoTitle: "",
	seoSlug: "",
	seoDescription: "",
	seoOgImage: "",
	seoCanonicalUrl: "",
	seoFocusKeywords: [],
};

export function toActivityFormValues(
	activity: Partial<ActivityResponse>,
	seo?: SeoResponse | null,
): ActivityFormValues {
	return {
		...defaultActivityValues,
		name: activity.name ?? "",
		slug: activity.slug ?? "",
		shortDescription: activity.shortDescription ?? "",
		description: activity.description ?? "",
		order: activity.order ?? 0,
		status: activity.status === "published" ? "published" : "draft",
		seoTitle: seo?.title ?? activity.name ?? "",
		seoSlug: seo?.slug ?? activity.slug ?? "",
		seoDescription: seo?.description ?? activity.shortDescription ?? "",
		seoOgImage: seo?.ogImage ?? "",
		seoCanonicalUrl: seo?.canonicalUrl ?? "",
		seoFocusKeywords: seo?.focusKeywords ?? [],
	};
}

export function buildActivityPayload(
	values: ActivityFormValues,
	thumbnailId: string,
	galleryMediaIds: string[],
) {
	return {
		name: values.name,
		slug: toSlug(values.name),
		shortDescription: values.shortDescription ?? "",
		description: values.description ?? "",
		thumbnailId,
		galleryMediaIds,
		status: values.status,
		seo: {
			title: values.seoTitle,
			slug: values.seoSlug || toSlug(values.name),
			description: values.seoDescription ?? "",
			ogImage: values.seoOgImage ?? "",
			canonicalUrl: values.seoCanonicalUrl ?? "",
			focusKeywords: values.seoFocusKeywords ?? [],
		},
	};
}

type ActivityUploadFile = MediaUploadFile;

export default function ActivityFormPage({
	mode,
}: {
	mode: "create" | "edit";
}) {
	const router = useRouter();
	const params = useParams<{ id?: string }>();
	const messageApi = useMessage();
	const [form] = Form.useForm<ActivityFormValues>();
	const [loading, setLoading] = useState(mode === "edit");
	const [saving, setSaving] = useState(false);
	const [thumbnailFiles, setThumbnailFiles] = useState<ActivityUploadFile[]>(
		[],
	);
	const [galleryFiles, setGalleryFiles] = useState<ActivityUploadFile[]>([]);
	const [mediaPickerTarget, setMediaPickerTarget] = useState<
		"thumbnail" | "gallery" | null
	>(null);
	const activityId = params?.id;

	const mediaIdToUploadFile = useCallback(
		async (mediaId: string): Promise<ActivityUploadFile> => {
			try {
				const response = await adminFetch(`/api/admin/media/${mediaId}`, {
					cache: "no-store",
				});
				const data = await response.json();
				const item = data.item;
				return item
					? mediaToUploadFile({ ...item, _id: mediaId })
					: {
						uid: mediaId,
						name: mediaId,
						status: "done",
						mediaId,
					};
			} catch {
				return {
					uid: mediaId,
					name: mediaId,
					status: "done",
					mediaId,
				};
			}
		},
		[],
	);

	useEffect(() => {
		if (mode !== "edit" || !activityId) {
			form.setFieldsValue(defaultActivityValues);
			return;
		}

		let cancelled = false;
		adminFetch(`/api/admin/activities/${activityId}`, { cache: "no-store" })
			.then((response) => response.json())
			.then(async (data: ActivityDetailResponse) => {
				if (cancelled) return;
				if (data.error || !data.item) {
					throw new Error(data.error ?? "Cannot load activity");
				}

				const [thumbnailFile, galleryFileList] = await Promise.all([
					data.item.thumbnailId
						? mediaIdToUploadFile(String(data.item.thumbnailId))
						: null,
					Promise.all(
						(data.item.galleryMediaIds ?? []).map((mediaId) =>
							mediaIdToUploadFile(String(mediaId)),
						),
					),
				]);
				if (cancelled) return;

				form.setFieldsValue(toActivityFormValues(data.item, data.seo));
				setThumbnailFiles(thumbnailFile ? [thumbnailFile] : []);
				setGalleryFiles(
					galleryFileList.filter(Boolean) as ActivityUploadFile[],
				);
			})
			.catch(() =>
				messageApi.error("Không thể lấy thông tin các lĩnh vực hoạt động"),
			)
			.finally(() => !cancelled && setLoading(false));

		return () => {
			cancelled = true;
		};
	}, [activityId, form, mediaIdToUploadFile, messageApi, mode]);

	const uploadButton = (
		<button type="button" className="border-0 bg-transparent">
			<PlusOutlined />
			<div className="mt-2">Tải ảnh mới</div>
		</button>
	);

	const beforeImageUpload: UploadProps["beforeUpload"] = (file) => {
		if (!file.type?.startsWith("image/")) {
			messageApi.error("Chỉ hỗ trợ tải ảnh lên");
			return Upload.LIST_IGNORE;
		}
		return false;
	};

	const uploadMediaFile = async (file: ActivityUploadFile) => {
		if (file.mediaId) {
			return file.mediaId;
		}
		if (!file.originFileObj) {
			throw new Error("Missing upload file");
		}

		const formData = new FormData();
		formData.append("file", file.originFileObj);
		formData.append("resourceType", "image");

		const response = await adminFetch("/api/admin/media", {
			method: "POST",
			body: formData,
		});
		const data = await response.json();
		if (!response.ok || data.error || !data.item?._id) {
			throw new Error(data.error ?? "Cannot upload image");
		}
		return String(data.item._id);
	};

	const selectedMediaIds = useMemo(() => {
		const files =
			mediaPickerTarget === "thumbnail" ? thumbnailFiles : galleryFiles;
		return files
			.map((file) => file.mediaId)
			.filter((mediaId): mediaId is string => Boolean(mediaId));
	}, [galleryFiles, mediaPickerTarget, thumbnailFiles]);

	const handleSelectExistingMedia = (items: AdminMediaItem[]) => {
		if (mediaPickerTarget === "thumbnail") {
			setThumbnailFiles(items[0] ? [mediaToUploadFile(items[0])] : []);
		}

		if (mediaPickerTarget === "gallery") {
			setGalleryFiles((current) => {
				const pendingUploads = current.filter((file) => !file.mediaId);
				return [...pendingUploads, ...items.map(mediaToUploadFile)];
			});
		}

		setMediaPickerTarget(null);
	};

	const handleValuesChange = (changedValues: Partial<ActivityFormValues>) => {
		if (changedValues.name) {
			const slug = toSlug(changedValues.name);
			form.setFieldsValue({
				slug,
				seoTitle: changedValues.name,
				seoSlug: slug,
			});
		}
	};

	const handleSubmit = async (values: ActivityFormValues) => {
		if (thumbnailFiles.length === 0) {
			messageApi.error("Vui lòng chọn ảnh đại diện lĩnh vực");
			return;
		}

		setSaving(true);
		try {
			const [thumbnailId, galleryMediaIds] = await Promise.all([
				uploadMediaFile(thumbnailFiles[0]),
				Promise.all(galleryFiles.map((file) => uploadMediaFile(file))),
			]);
			const payload = buildActivityPayload(
				values,
				thumbnailId,
				galleryMediaIds,
			);
			const response = await adminFetch(
				mode === "edit"
					? `/api/admin/activities/${activityId}`
					: "/api/admin/activities",
				{
					method: mode === "edit" ? "PATCH" : "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			const data = await response.json();
			if (!response.ok || data.error) {
				throw new Error(data.error ?? "Cannot save activity");
			}
			messageApi.success(
				mode === "edit"
					? "Cập nhật thành công"
					: "Tạo lĩnh vực thành công",
			);
			router.push("/admin/activities");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Đã có lỗi xảy ra";
			messageApi.error(message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between px-1">
				<Title level={4} className="!mb-0">
					{mode === "edit"
						? `Cập nhật lĩnh vực ${form.getFieldValue("name") ?? ""}`
						: "Tạo lĩnh vực mới"}
				</Title>
				<div className="flex justify-end gap-3">
					<Button onClick={() => router.push("/admin/activities")}>
						Quay lại
					</Button>
					<Button
						type="primary"
						loading={saving}
						onClick={() => form.submit()}
					>
						{mode === "edit" ? "Lưu" : "Tạo lĩnh vực"}
					</Button>
				</div>
			</div>
			<Form<ActivityFormValues>
				form={form}
				layout="vertical"
				initialValues={defaultActivityValues}
				disabled={loading || saving}
				onValuesChange={handleValuesChange}
				onFinish={handleSubmit}
				className="[&_.ant-form-item-label>label]:font-semibold"
			>
				<Block>
					<Row gutter={90}>
						<Col xs={24}>
							<Title level={5} className="!mb-5">
								Thông tin cơ bản
							</Title>
						</Col>
						<Col xs={24} lg={12}>
							<Form.Item
								label="Tên lĩnh vực"
								name="name"
								rules={[
									{
										required: true,
										message: "Nhập tên lĩnh vực",
									},
								]}
							>
								<Input placeholder="Tên lĩnh vực" />
							</Form.Item>
							<Form.Item label="Mô tả ngắn" name="shortDescription">
								<Input.TextArea
									placeholder="Mô tả ngắn lĩnh vực"
									autoSize={{ minRows: 2, maxRows: 4 }}
								/>
							</Form.Item>
							<Form.Item label="Mô tả chi tiết" name="description">
								<SimpleEditor />
							</Form.Item>
						</Col>

						<Form.Item name="slug" hidden>
							<Input />
						</Form.Item>
						<Col xs={24} lg={12}>
							<Form.Item label="Ảnh thumbnail" required>
								<Space
									orientation="vertical"
									className="w-full"
									size={12}
								>
									<Button
										onClick={() =>
											setMediaPickerTarget("thumbnail")
										}
									>
										Chọn ảnh đã tải lên
									</Button>
									<Upload
										listType="picture-card"
										accept="image/*"
										maxCount={1}
										fileList={thumbnailFiles}
										beforeUpload={beforeImageUpload}
										onChange={({ fileList }) =>
											setThumbnailFiles(
												fileList as ActivityUploadFile[],
											)
										}
									>
										{thumbnailFiles.length >= 1
											? null
											: uploadButton}
									</Upload>
								</Space>
							</Form.Item>
							<Form.Item label="Gallery ảnh lĩnh vực">
								<Space
									orientation="vertical"
									className="w-full"
									size={12}
								>
									<Button
										onClick={() =>
											setMediaPickerTarget("gallery")
										}
									>
										Chọn ảnh đã tải lên
									</Button>
									<Upload
										listType="picture-card"
										accept="image/*"
										multiple
										fileList={galleryFiles}
										beforeUpload={beforeImageUpload}
										onChange={({ fileList }) =>
											setGalleryFiles(
												fileList as ActivityUploadFile[],
											)
										}
										showUploadList={{
											showPreviewIcon: false,
											showRemoveIcon: true,
										}}
										onPreview={() => { }}
									>
										{uploadButton}
									</Upload>
								</Space>
							</Form.Item>
						</Col>
					</Row>
					<Row>
						<Col xs={24} lg={12}>
							<Form.Item
								label="Trạng thái"
								name="status"
								getValueProps={(value) => ({
									checked: value === "published",
								})}
								getValueFromEvent={(checked: boolean) =>
									checked ? "published" : "draft"
								}
							>
								<Switch
									checkedChildren="Công khai"
									unCheckedChildren="Nháp"
								/>
							</Form.Item>
						</Col>
					</Row>
				</Block>

				<Block className="mt-4">
					<Row gutter={16}>
						<Col xs={24}>
							<Title level={5} className="!mb-3">
								Quản lý SEO
							</Title>
						</Col>
					</Row>
					<SeoFormFields
						names={{
							title: "seoTitle",
							description: "seoDescription",
							ogImage: "seoOgImage",
							canonicalUrl: "seoCanonicalUrl",
							focusKeywords: "seoFocusKeywords",
						}}
					/>
				</Block>
			</Form>
			{mediaPickerTarget ? (
				<MediaPickerModal
					open
					title={
						mediaPickerTarget === "thumbnail"
							? "Chọn ảnh thumbnail"
							: "Chọn ảnh gallery"
					}
					multiple={mediaPickerTarget === "gallery"}
					resourceType="image"
					selectedIds={selectedMediaIds}
					onCancel={() => setMediaPickerTarget(null)}
					onConfirm={handleSelectExistingMedia}
				/>
			) : null}
		</div>
	);
}
