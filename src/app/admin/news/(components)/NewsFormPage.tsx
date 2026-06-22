"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import slugify from "slugify";
import {
	Button,
	Col,
	Form,
	Input,
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
import SeoFormFields from "@/components/admin/seo/SeoFormFields";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useMessage } from "@/contexts/AdminMessageContext";
import type { INewsPopulated } from "@/types/news";

const { Title } = Typography;

type NewsStatus = "draft" | "published";

interface NewsFormValues {
	title: string;
	slug: string;
	shortDescription?: string;
	description?: string;
	categoryId?: string | null;
	relatedNewsIds: string[];
	status: NewsStatus;
	seoTitle: string;
	seoSlug: string;
	seoDescription?: string;
	seoOgImage?: string;
	seoCanonicalUrl?: string;
	seoFocusKeywords?: string[];
}

type NewsResponse = Omit<
	INewsPopulated,
	"createdAt" | "updatedAt" | "thumbnailId" | "categoryId" | "relatedNewsIds"
> & {
	_id: string;
	thumbnailId?: string | { _id?: string };
	categoryId?: string | { _id?: string };
	relatedNewsIds?: Array<string | { _id?: string }>;
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

interface NewsDetailResponse {
	item?: NewsResponse;
	seo?: SeoResponse | null;
	error?: string;
}

interface CategoryOption {
	_id: string;
	name: string;
}

interface RelatedNewsOption {
	_id: string;
	title: string;
}

type NewsUploadFile = MediaUploadFile;

const defaultValues: NewsFormValues = {
	title: "",
	slug: "",
	shortDescription: "",
	description: "",
	categoryId: null,
	relatedNewsIds: [],
	status: "draft",
	seoTitle: "",
	seoSlug: "",
	seoDescription: "",
	seoOgImage: "",
	seoCanonicalUrl: "",
	seoFocusKeywords: [],
};

const toSlug = (value: string) =>
	slugify(value, { lower: true, strict: true, locale: "vi" });

const idToString = (value: unknown) => {
	if (!value) return undefined;
	if (typeof value === "string") return value;
	if (typeof value === "object" && "_id" in value) {
		return String((value as { _id?: unknown })._id);
	}
	return String(value);
};

const isString = (value: string | undefined): value is string =>
	Boolean(value);

function toNewsFormValues(news: NewsResponse, seo?: SeoResponse | null) {
	return {
		...defaultValues,
		title: news.title ?? "",
		slug: news.slug ?? "",
		shortDescription: news.shortDescription ?? "",
		description: news.description ?? "",
		categoryId: idToString(news.categoryId) ?? null,
		relatedNewsIds:
			news.relatedNewsIds?.map(idToString).filter(isString) ?? [],
		status: news.status === "published" ? "published" : "draft",
		seoTitle: seo?.title ?? news.title ?? "",
		seoSlug: seo?.slug ?? news.slug ?? "",
		seoDescription: seo?.description ?? news.shortDescription ?? "",
		seoOgImage: seo?.ogImage ?? "",
		seoCanonicalUrl: seo?.canonicalUrl ?? "",
		seoFocusKeywords: seo?.focusKeywords ?? [],
	} satisfies NewsFormValues;
}

export default function NewsFormPage({ mode }: { mode: "create" | "edit" }) {
	const router = useRouter();
	const params = useParams<{ id?: string }>();
	const messageApi = useMessage();
	const [form] = Form.useForm<NewsFormValues>();
	const [loading, setLoading] = useState(mode === "edit");
	const [saving, setSaving] = useState(false);
	const [thumbnailFiles, setThumbnailFiles] = useState<NewsUploadFile[]>([]);
	const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
	const [categories, setCategories] = useState<CategoryOption[]>([]);
	const [relatedNews, setRelatedNews] = useState<RelatedNewsOption[]>([]);
	const newsId = params?.id;

	const mediaIdToUploadFile = useCallback(
		async (mediaId: string): Promise<NewsUploadFile> => {
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
		const controller = new AbortController();

		Promise.all([
			adminFetch("/api/admin/news-categories?limit=100", {
				cache: "no-store",
				signal: controller.signal,
			}).then((response) => response.json()),
			adminFetch("/api/admin/news?limit=100", {
				cache: "no-store",
				signal: controller.signal,
			}).then((response) => response.json()),
		])
			.then(([categoryPayload, newsPayload]) => {
				setCategories(categoryPayload.items ?? []);
				setRelatedNews(newsPayload.items ?? []);
			})
			.catch((error) => {
				if (!controller.signal.aborted) {
					messageApi.error(
						error instanceof Error
							? error.message
							: "Không thể tải dữ liệu tin tức",
					);
				}
			});

		return () => controller.abort();
	}, [messageApi]);

	useEffect(() => {
		if (mode !== "edit" || !newsId) {
			form.setFieldsValue(defaultValues);
			setLoading(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		adminFetch(`/api/admin/news/${newsId}`, { cache: "no-store" })
			.then((response) => response.json())
			.then(async (data: NewsDetailResponse) => {
				if (cancelled) return;
				if (data.error || !data.item) {
					throw new Error(data.error ?? "Cannot load news");
				}

				const thumbnailId = idToString(data.item.thumbnailId);
				const thumbnailFile = thumbnailId
					? await mediaIdToUploadFile(thumbnailId)
					: null;
				if (cancelled) return;

				form.setFieldsValue(toNewsFormValues(data.item, data.seo));
				setThumbnailFiles(thumbnailFile ? [thumbnailFile] : []);
			})
			.catch(() => messageApi.error("Không thể lấy thông tin tin tức"))
			.finally(() => !cancelled && setLoading(false));

		return () => {
			cancelled = true;
		};
	}, [form, mediaIdToUploadFile, messageApi, mode, newsId]);

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

	const uploadMediaFile = async (file: NewsUploadFile) => {
		if (file.mediaId) return file.mediaId;
		if (!file.originFileObj) throw new Error("Missing upload file");

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

	const selectedMediaIds = useMemo(
		() =>
			thumbnailFiles
				.map((file) => file.mediaId)
				.filter((mediaId): mediaId is string => Boolean(mediaId)),
		[thumbnailFiles],
	);

	const handleSelectExistingMedia = (items: AdminMediaItem[]) => {
		setThumbnailFiles(items[0] ? [mediaToUploadFile(items[0])] : []);
		setMediaPickerOpen(false);
	};

	const handleValuesChange = (changedValues: Partial<NewsFormValues>) => {
		if (changedValues.title) {
			const slug = toSlug(changedValues.title);
			form.setFieldsValue({
				slug,
				seoTitle: changedValues.title,
				seoSlug: slug,
			});
		}
	};

	const handleSubmit = async (values: NewsFormValues) => {
		if (thumbnailFiles.length === 0) {
			messageApi.error("Vui lòng chọn ảnh đại diện tin tức");
			return;
		}

		setSaving(true);
		try {
			const thumbnailId = await uploadMediaFile(thumbnailFiles[0]);
			const payload = {
				title: values.title,
				slug: toSlug(values.title),
				shortDescription: values.shortDescription ?? "",
				description: values.description ?? "",
				thumbnailId,
				categoryId: values.categoryId || null,
				relatedNewsIds: (values.relatedNewsIds ?? []).filter(
					(id) => id !== newsId,
				),
				status: values.status,
				seo: {
					title: values.seoTitle || values.title,
					slug: values.seoSlug || toSlug(values.title),
					description: values.seoDescription ?? "",
					ogImage: values.seoOgImage ?? "",
					canonicalUrl: values.seoCanonicalUrl ?? "",
					focusKeywords: values.seoFocusKeywords ?? [],
				},
			};

			const response = await adminFetch(
				mode === "edit" ? `/api/admin/news/${newsId}` : "/api/admin/news",
				{
					method: mode === "edit" ? "PATCH" : "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			const data = await response.json();
			if (!response.ok || data.error) {
				throw new Error(data.error ?? "Cannot save news");
			}

			messageApi.success(
				mode === "edit"
					? "Cập nhật tin tức thành công"
					: "Tạo tin tức thành công",
			);
			router.push("/admin/news/list");
		} catch (error) {
			messageApi.error(
				error instanceof Error ? error.message : "Đã có lỗi xảy ra",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-3 px-1">
				<Title level={4} className="!mb-0">
					{mode === "edit"
						? `Cập nhật tin tức ${form.getFieldValue("title") ?? ""}`
						: "Tạo tin tức mới"}
				</Title>
				<div className="flex justify-end gap-3">
					<Button onClick={() => router.push("/admin/news/list")}>
						Quay lại
					</Button>
					<Button
						type="primary"
						loading={saving}
						onClick={() => form.submit()}
					>
						{mode === "edit" ? "Lưu" : "Tạo tin tức"}
					</Button>
				</div>
			</div>

			<Form<NewsFormValues>
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
							<Title level={4} className="!mb-5">
								Thông tin cơ bản
							</Title>
						</Col>
						<Col xs={24} lg={12}>
							<Form.Item
								label="Tiêu đề tin tức"
								name="title"
								rules={[
									{
										required: true,
										message: "Nhập tiêu đề tin tức",
									},
								]}
							>
								<Input placeholder="Tiêu đề tin tức" />
							</Form.Item>
							<Form.Item label="Mô tả ngắn" name="shortDescription">
								<Input.TextArea
									placeholder="Mô tả ngắn hiển thị ở danh sách tin tức"
									autoSize={{ minRows: 2, maxRows: 4 }}
								/>
							</Form.Item>
							<Form.Item label="Nội dung chi tiết" name="description">
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
									<Button onClick={() => setMediaPickerOpen(true)}>
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
												fileList as NewsUploadFile[],
											)
										}
									>
										{thumbnailFiles.length >= 1
											? null
											: uploadButton}
									</Upload>
								</Space>
							</Form.Item>
							<Form.Item label="Danh mục" name="categoryId">
								<Select
									allowClear
									placeholder="Chọn danh mục tin tức"
									options={categories.map((category) => ({
										label: category.name,
										value: category._id,
									}))}
								/>
							</Form.Item>
							<Form.Item label="Tin liên quan" name="relatedNewsIds">
								<Select
									mode="multiple"
									allowClear
									showSearch
									optionFilterProp="label"
									placeholder="Chọn các tin liên quan"
									options={relatedNews
										.filter((item) => item._id !== newsId)
										.map((item) => ({
											label: item.title,
											value: item._id,
										}))}
								/>
							</Form.Item>
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
							<Title level={4} className="!mb-3">
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

			{mediaPickerOpen ? (
				<MediaPickerModal
					open
					title="Chọn ảnh thumbnail"
					resourceType="image"
					selectedIds={selectedMediaIds}
					onCancel={() => setMediaPickerOpen(false)}
					onConfirm={handleSelectExistingMedia}
				/>
			) : null}
		</div>
	);
}
