"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Button,
	Col,
	Form,
	Input,
	InputNumber,
	Row,
	Select,
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
import { useMessage } from "@/contexts/AdminMessageContext";
import { EBuildPlan, type BuildPlan, type IProject } from "@/types/project";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import SeoFormFields from "@/components/admin/seo/SeoFormFields";
import { toSlug } from "@/helpers";

const { Title } = Typography;

interface ProjectFormValues {
	name: string;
	slug: string;
	shortDescription?: string;
	description?: string;
	address?: string;
	area?: number | null;
	implementationYear?: number | null;
	category?: BuildPlan;
	status: "draft" | "published";
	isFeatured: boolean;
	seoTitle: string;
	seoSlug: string;
	seoDescription?: string;
	seoOgImage?: string;
	seoCanonicalUrl?: string;
	seoFocusKeywords?: string[];
}

type ProjectResponse = Omit<IProject, "createdAt" | "updatedAt"> & {
	_id: string;
	createdAt?: string;
	updatedAt?: string;
};

interface SeoResponse {
	title?: string;
	slug?: string;
	description?: string;
	ogImage?: string;
	canonicalUrl?: string;
	focusKeywords?: string[];
}

interface ProjectDetailResponse {
	item?: ProjectResponse;
	seo?: SeoResponse | null;
	error?: string;
}

type ProjectUploadFile = MediaUploadFile;

const defaultValues: ProjectFormValues = {
	name: "",
	slug: "",
	shortDescription: "",
	description: "",
	address: "",
	area: null,
	implementationYear: new Date().getFullYear(),
	category: "home",
	status: "draft",
	isFeatured: false,
	seoTitle: "",
	seoSlug: "",
	seoDescription: "",
	seoOgImage: "",
	seoCanonicalUrl: "",
	seoFocusKeywords: [],
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const idToString = (value: unknown) => (value ? String(value) : null);

export default function ProjectFormPage({ mode }: { mode: "create" | "edit" }) {
	const router = useRouter();
	const params = useParams<{ id?: string }>();
	const messageApi = useMessage();
	const [form] = Form.useForm<ProjectFormValues>();
	const [loading, setLoading] = useState(mode === "edit");
	const [saving, setSaving] = useState(false);
	const [thumbnailFiles, setThumbnailFiles] = useState<ProjectUploadFile[]>(
		[],
	);
	const [galleryFiles, setGalleryFiles] = useState<ProjectUploadFile[]>([]);
	const [mediaPickerTarget, setMediaPickerTarget] = useState<
		"thumbnail" | "gallery" | null
	>(null);
	const projectId = params?.id;

	const mediaIdToUploadFile = useCallback(
		async (mediaId: string): Promise<ProjectUploadFile> => {
			try {
				const response = await adminFetch(
					`/api/admin/media/${mediaId}`,
					{ cache: "no-store" },
				);
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
		if (mode !== "edit" || !projectId) {
			form.setFieldsValue(defaultValues);
			return;
		}

		let cancelled = false;
		adminFetch(`/api/admin/projects/${projectId}`, { cache: "no-store" })
			.then((response) => response.json())
			.then(async (data: ProjectDetailResponse) => {
				if (cancelled) return;
				if (data.error || !data.item) {
					throw new Error(data.error ?? "Cannot load project");
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

				form.setFieldsValue({
					name: data.item.name ?? "",
					slug: data.item.slug ?? "",
					shortDescription: data.item.shortDescription ?? "",
					description: data.item.description ?? "",
					address: data.item.address ?? "",
					area: data.item.area ?? null,
					implementationYear: data.item.implementationYear ?? null,
					category: data.item.category,
					status:
						data.item.status === "published"
							? "published"
							: "draft",
					isFeatured: Boolean(data.item.isFeatured),
					seoTitle: data.seo?.title ?? data.item.name ?? "",
					seoSlug: data.seo?.slug ?? data.item.slug ?? "",
					seoDescription:
						data.seo?.description ??
						data.item.shortDescription ??
						"",
					seoOgImage: data.seo?.ogImage ?? "",
					seoCanonicalUrl: data.seo?.canonicalUrl ?? "",
					seoFocusKeywords: data.seo?.focusKeywords ?? [],
				});
				setThumbnailFiles(thumbnailFile ? [thumbnailFile] : []);
				setGalleryFiles(
					galleryFileList.filter(Boolean) as ProjectUploadFile[],
				);
			})
			.catch(() => messageApi.error("Không thể lấy thông tin dự án"))
			.finally(() => !cancelled && setLoading(false));

		return () => {
			cancelled = true;
		};
	}, [form, mediaIdToUploadFile, messageApi, mode, projectId]);

	const uploadButton = (
		<button type="button" className="border-0 bg-transparent">
			<PlusOutlined />
			<div className="mt-2">Tải lên mới</div>
		</button>
	);

	const beforeImageUpload: UploadProps["beforeUpload"] = (file) => {
		if (!file.type?.startsWith("image/")) {
			messageApi.error("Chỉ hỗ trợ upload ảnh");
			return Upload.LIST_IGNORE;
		}
		return false;
	};

	const uploadMediaFile = async (file: ProjectUploadFile) => {
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
				// giữ lại các file đang upload trực tiếp, chưa có mediaId
				const pendingUploads = current.filter((file) => !file.mediaId);
				return [...pendingUploads, ...items.map(mediaToUploadFile)];
			});
		}

		setMediaPickerTarget(null);
	};

	const handleValuesChange = (changedValues: Partial<ProjectFormValues>) => {
		if (changedValues.name) {
			const slug = toSlug(changedValues.name);
			form.setFieldsValue({
				slug,
				seoTitle: changedValues.name,
				seoSlug: slug,
			});
		}
	};

	const handleSubmit = async (values: ProjectFormValues) => {
		if (thumbnailFiles.length === 0) {
			messageApi.error("Vui lòng chọn ảnh");
			return;
		}

		setSaving(true);
		try {
			const [thumbnailId, galleryMediaIds] = await Promise.all([
				uploadMediaFile(thumbnailFiles[0]),
				Promise.all(galleryFiles.map((file) => uploadMediaFile(file))),
			]);
			const payload = {
				name: values.name,
				slug: toSlug(values.name),
				shortDescription: values.shortDescription ?? "",
				description: values.description ?? "",
				thumbnailId,
				galleryMediaIds,
				address: values.address ?? "",
				area: values.area ?? undefined,
				implementationYear: values.implementationYear ?? undefined,
				category: values.category || "others",
				status: values.status,
				isFeatured: values.isFeatured,
				seo: {
					title: values.seoTitle,
					slug: values.seoSlug || toSlug(values.name),
					description: values.seoDescription ?? "",
					ogImage: values.seoOgImage ?? "",
					canonicalUrl: values.seoCanonicalUrl ?? "",
					focusKeywords: values.seoFocusKeywords ?? [],
				},
			};
			const response = await adminFetch(
				mode === "edit"
					? `/api/admin/projects/${projectId}`
					: "/api/admin/projects",
				{
					method: mode === "edit" ? "PATCH" : "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			const data = await response.json();
			if (!response.ok || data.error) {
				throw new Error(data.error ?? "Cannot save project");
			}
			messageApi.success(
				mode === "edit"
					? "Cập nhật thành công"
					: "Tạo dự án thành công",
			);
			router.push("/admin/projects");
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
						? `Cập nhật dự án ${form.getFieldValue("name") ?? ""}`
						: "Tạo dự án mới"}
				</Title>
				<div className="flex justify-end gap-3">
					<Button onClick={() => router.push("/admin/projects")}>
						Quay lại
					</Button>
					<Button
						type="primary"
						loading={saving}
						onClick={() => form.submit()}
					>
						{mode === "edit" ? "Lưu" : "Tạo dự án"}
					</Button>
				</div>
			</div>
			<Form<ProjectFormValues>
				form={form}
				layout="vertical"
				initialValues={defaultValues}
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
								label="Tên công trình/dự án"
								name="name"
								rules={[
									{
										required: true,
										message: "Nhập tên công trình/dự án",
									},
								]}
							>
								<Input placeholder="Tên công trình/dự án" />
							</Form.Item>
							<Form.Item
								label="Mô tả ngắn"
								name="shortDescription"
							>
								<Input.TextArea
									placeholder="Mô tả ngắn dự án"
									autoSize={{ minRows: 2, maxRows: 4 }}
								/>
							</Form.Item>
							<Form.Item
								label="Mô tả chi tiết"
								name="description"
							>
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
												fileList as ProjectUploadFile[],
											)
										}
									>
										{thumbnailFiles.length >= 1
											? null
											: uploadButton}
									</Upload>
								</Space>
							</Form.Item>
							<Form.Item label="Gallery ảnh dự án">
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
												fileList as ProjectUploadFile[],
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
				</Block>

				<Block className="mt-4">
					<Row gutter={90}>
						<Col xs={24}>
							<Title level={5} className="!mb-5">
								Thông tin khác
							</Title>
						</Col>
						<Col xs={24} lg={12}>
							<Form.Item label="Địa chỉ" name="address">
								<Input placeholder="Địa chỉ dự án" />
							</Form.Item>
						</Col>
						<Col xs={12} lg={6}>
							<Form.Item label="Diện tích (m²)" name="area">
								<InputNumber
									min={0}
									className="!w-full"
									placeholder="Diện tích"
								/>
							</Form.Item>
						</Col>
						<Col xs={12} lg={6}>
							<Form.Item
								label="Năm thực hiện"
								name="implementationYear"
							>
								<InputNumber
									min={1900}
									max={2200}
									className="!w-full"
									placeholder="Năm thực hiện"
								/>
							</Form.Item>
						</Col>
						<Col xs={24} lg={12}>
							<Form.Item label="Loại công trình" name="category">
								<Select
									placeholder="Chọn loại công trình"
									options={Object.values(EBuildPlan).map(
										(p) => ({
											label: p.label,
											value: p.value,
										}),
									)}
								/>
							</Form.Item>
						</Col>
						<Col xs={24} lg={6}>
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
						<Col xs={24} lg={6}>
							<Form.Item
								label="Nổi bật"
								name="isFeatured"
								valuePropName="checked"
							>
								<Switch />
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
