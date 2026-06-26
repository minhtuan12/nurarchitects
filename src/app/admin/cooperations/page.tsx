"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Button,
	Col,
	Flex,
	Form,
	Input,
	Row,
	Tabs,
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
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useMessage } from "@/contexts/AdminMessageContext";
import { CooperationStep, NeededFieldItemState } from "@/types/cooperation";
import NeededFieldList from "./(components)/NeededFieldList";
import StepList from "./(components)/StepList";
import SeoSection, { SeoFormValue } from "./(components)/SeoSection";

const { Title } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CooperationFormValues {
	introduction: string;
	firstCtaBtn: string;
	secondCtaBtn: string;
	thirdCtaBtn: string;
}

const COOPERATION_SEO_SLUG = "cooperation";

const defaultSeoValue: SeoFormValue = {
	title: "",
	description: "",
	ogImage: "",
	canonicalUrl: "",
	focusKeywords: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const idToString = (value: unknown): string | undefined => {
	if (!value) return undefined;
	if (typeof value === "string") return value;
	if (typeof value === "object" && "_id" in value) {
		return String((value as { _id?: unknown })._id);
	}
	return String(value);
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CooperationPage() {
	const [form] = Form.useForm<CooperationFormValues>();
	const messageApi = useMessage();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Banner
	const [bannerFile, setBannerFile] = useState<MediaUploadFile | null>(null);
	const [bannerPickerOpen, setBannerPickerOpen] = useState(false);

	// Gallery imageIds
	const [galleryFiles, setGalleryFiles] = useState<MediaUploadFile[]>([]);
	const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);

	// Steps & fields
	const [steps, setSteps] = useState<CooperationStep[]>([]);
	const [neededFields, setNeededFields] = useState<NeededFieldItemState[]>([]);

	// SEO
	const [seoValue, setSeoValue] = useState<SeoFormValue>(defaultSeoValue);
	const [seoId, setSeoId] = useState<string | undefined>(undefined);

	// ── Load media helper ─────────────────────────────────────────────────────

	const mediaIdToUploadFile = useCallback(
		async (mediaId: string): Promise<MediaUploadFile> => {
			try {
				const res = await adminFetch(`/api/admin/media/${mediaId}`, {
					cache: "no-store",
				});
				const data = await res.json();
				const item = data.item;
				return item
					? mediaToUploadFile({ ...item, _id: mediaId })
					: { uid: mediaId, name: mediaId, status: "done", mediaId };
			} catch {
				return { uid: mediaId, name: mediaId, status: "done", mediaId };
			}
		},
		[],
	);

	// ── Fetch initial data ────────────────────────────────────────────────────

	useEffect(() => {
		Promise.all([
			adminFetch("/api/admin/cooperation", { cache: "no-store" }).then((res) =>
				res.json(),
			),
			adminFetch(
				`/api/admin/seo-settings?entityType=page&slug=${COOPERATION_SEO_SLUG}`,
			).then((res) => res.json()),
		])
			.then(async ([cooperationRes, seoRes]) => {
				// ── Cooperation data ──
				const data = cooperationRes?.item ?? cooperationRes;
				if (data) {
					form.setFieldsValue({
						introduction: data.introduction ?? "",
						firstCtaBtn: data.firstCtaBtn ?? "",
						secondCtaBtn: data.secondCtaBtn ?? "",
						thirdCtaBtn: data.thirdCtaBtn ?? "",
					});

					// Banner
					const bannerId = idToString(data.bannerId);
					if (bannerId) {
						const file = await mediaIdToUploadFile(bannerId);
						setBannerFile(file);
					}

					// Gallery
					const rawImageIds: string[] = (data.imageIds ?? [])
						.map(idToString)
						.filter(Boolean) as string[];
					if (rawImageIds.length > 0) {
						const files = await Promise.all(
							rawImageIds.map(mediaIdToUploadFile),
						);
						setGalleryFiles(files);
					}

					// Steps
					const rawSteps: CooperationStep[] = (data.steps ?? []).map(
						(s: any, i: number) => ({
							order: s.order ?? i,
							name: s.name ?? "",
							description: s.description ?? "",
						}),
					);
					setSteps(rawSteps);

					// Needed fields
					const fieldPromises = (data.neededFields ?? []).map(
						async (f: any): Promise<NeededFieldItemState> => {
							const imageId = idToString(f.imageId);
							const imageFile = imageId
								? await mediaIdToUploadFile(imageId)
								: undefined;
							return {
								name: f.name ?? "",
								description: f.description ?? "",
								imageId,
								imageFile,
							};
						},
					);
					setNeededFields(await Promise.all(fieldPromises));
				}

				// ── SEO data ──
				const seo = seoRes?.items?.[0] ?? seoRes?.data ?? seoRes?.item ?? seoRes;
				if (seo?.slug) {
					setSeoId(seo._id);
					setSeoValue({
						title: seo.title ?? "",
						description: seo.description ?? "",
						ogImage: seo.ogImage ?? "",
						canonicalUrl: seo.canonicalUrl ?? "",
						focusKeywords: seo.focusKeywords ?? [],
					});
				}
			})
			.catch(() => messageApi.error("Không thể tải dữ liệu trang Hợp tác"))
			.finally(() => setLoading(false));
	}, [form, mediaIdToUploadFile, messageApi]);

	// ── Upload helper ─────────────────────────────────────────────────────────

	const uploadMediaFile = async (file: MediaUploadFile): Promise<string> => {
		if (file.mediaId) return file.mediaId;
		if (!file.originFileObj) throw new Error("Missing upload file");

		const formData = new FormData();
		formData.append("file", file.originFileObj);
		formData.append("resourceType", "image");

		const res = await adminFetch("/api/admin/media", {
			method: "POST",
			body: formData,
		});
		const data = await res.json();
		if (!res.ok || data.error || !data.item?._id) {
			throw new Error(data.error ?? "Cannot upload image");
		}
		return String(data.item._id);
	};

	// ── Validate ──────────────────────────────────────────────────────────────

	const validateSteps = (): boolean => {
		for (let i = 0; i < steps.length; i++) {
			if (!steps[i].name.trim()) {
				messageApi.error(`Bước ${i + 1}: vui lòng nhập tên bước`);
				return false;
			}
		}
		return true;
	};

	const validateNeededFields = (): boolean => {
		for (let i = 0; i < neededFields.length; i++) {
			if (!neededFields[i].name.trim()) {
				messageApi.error(`Điều kiện ${i + 1}: vui lòng nhập tên`);
				return false;
			}
		}
		return true;
	};

	// ── Save ──────────────────────────────────────────────────────────────────

	const handleSave = async () => {
		try {
			await form.validateFields();
		} catch {
			return;
		}

		if (!validateSteps()) return;
		if (!validateNeededFields()) return;

		setSaving(true);
		try {
			const values = form.getFieldsValue();

			// Upload banner
			const bannerId = bannerFile ? await uploadMediaFile(bannerFile) : null;

			// Upload gallery
			const imageIds = await Promise.all(galleryFiles.map(uploadMediaFile));

			// Upload neededFields images
			const neededFieldsPayload = await Promise.all(
				neededFields.map(async (f) => {
					const imageId = f.imageFile
						? await uploadMediaFile(f.imageFile)
						: f.imageId ?? undefined;
					return {
						name: f.name,
						description: f.description ?? "",
						...(imageId ? { imageId } : {}),
					};
				}),
			);

			const cooperationPayload = {
				bannerId: bannerId ?? undefined,
				introduction: values.introduction ?? "",
				steps: steps.map((s, i) => ({ ...s, order: i })),
				neededFields: neededFieldsPayload,
				imageIds,
				firstCtaBtn: values.firstCtaBtn ?? "",
				secondCtaBtn: values.secondCtaBtn ?? "",
				thirdCtaBtn: values.thirdCtaBtn ?? "",
			};

			const seoPayload = {
				entityType: "page",
				slug: COOPERATION_SEO_SLUG,
				title:
					seoValue.title ||
					"Liên hệ Hợp tác với Nurarchitects! | Nurarchitects",
				description: seoValue.description,
				ogImage: seoValue.ogImage,
				canonicalUrl: seoValue.canonicalUrl,
				focusKeywords: seoValue.focusKeywords,
			};

			const [cooperationRes, seoRes] = await Promise.all([
				adminFetch("/api/admin/cooperation", {
					method: "PATCH",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(cooperationPayload),
				}).then((r) => r.json()),

				adminFetch(
					seoId
						? `/api/admin/seo-settings/${seoId}`
						: "/api/admin/seo-settings",
					{
						method: seoId ? "PATCH" : "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify(seoPayload),
					},
				).then((r) => r.json()),
			]);

			if (cooperationRes.error) throw new Error(cooperationRes.error);
			if (seoRes.error) throw new Error(seoRes.error);

			if (!seoId && (seoRes?.data?._id ?? seoRes?.item?._id)) {
				setSeoId(seoRes?.data?._id ?? seoRes?.item?._id);
			}

			messageApi.success("Cập nhật thành công");
		} catch (err) {
			messageApi.error(
				err instanceof Error ? err.message : "Đã có lỗi xảy ra",
			);
		} finally {
			setSaving(false);
		}
	};

	// ── Gallery helpers ───────────────────────────────────────────────────────

	const gallerySelectedIds = useMemo(
		() =>
			galleryFiles
				.map((f) => f.mediaId)
				.filter((id): id is string => Boolean(id)),
		[galleryFiles],
	);

	const beforeImageUpload: UploadProps["beforeUpload"] = (file) => {
		if (!file.type?.startsWith("image/")) {
			messageApi.error("Chỉ hỗ trợ tải ảnh lên");
			return Upload.LIST_IGNORE;
		}
		return false;
	};

	// ── Tab items ─────────────────────────────────────────────────────────────

	const tabItems = [
		{
			key: "banner",
			label: "Banner & CTA",
			children: (
				<Row gutter={[16, 16]}>
					{/* Banner */}
					<Col xs={24} lg={12}>
						<Block className="h-full">
							<Title level={5} className="!mb-4">
								Ảnh Banner
							</Title>
							<Flex vertical className="w-full h-full" gap={12}>
								<Button
									onClick={() => setBannerPickerOpen(true)}
									className="w-full h-[42px]"
									variant="outlined"
								>
									Chọn ảnh đã tải lên
								</Button>
								<Upload
									className="w-full [&_.ant-upload-list]:h-full [&_.ant-upload]:w-full [&_.ant-upload]:h-full flex-1"
									listType="picture-card"
									accept="image/*"
									maxCount={1}
									fileList={bannerFile ? [bannerFile] : []}
									beforeUpload={beforeImageUpload}
									onChange={({ fileList }) =>
										setBannerFile((fileList[0] as MediaUploadFile) ?? null)
									}
								>
									{bannerFile ? null : (
										<button type="button" className="border-0 bg-transparent">
											<PlusOutlined />
											<div className="mt-2">Tải ảnh mới</div>
										</button>
									)}
								</Upload>
							</Flex>
						</Block>
					</Col>

					{/* CTA */}
					<Col xs={24} lg={12}>
						<Block className="h-full">
							<Title level={5} className="!mb-4">
								CTA Form liên hệ
							</Title>
							<Form.Item label="Nút CTA 1" name="firstCtaBtn" className="!mb-3">
								<Input placeholder="VD: Đăng ký hợp tác ngay" />
							</Form.Item>
							<Form.Item
								label="Nút CTA 2"
								name="secondCtaBtn"
								className="!mb-3"
							>
								<Input placeholder="VD: Tìm hiểu thêm" />
							</Form.Item>
							<Form.Item label="Nút CTA 3" name="thirdCtaBtn" className="!mb-0">
								<Input placeholder="VD: Liên hệ tư vấn" />
							</Form.Item>
						</Block>
					</Col>
				</Row>
			),
		},
		{
			key: "gallery",
			label: "Thư viện ảnh",
			children: (
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Block>
							<Flex className="mb-4" align="center" justify="space-between">
								<Title level={5} className="!mb-0">
									Thư viện ảnh
								</Title>
								<Button
									onClick={() => setGalleryPickerOpen(true)}
									className="h-[42px] font-semibold"
								>
									Chọn ảnh đã tải lên
								</Button>
							</Flex>
							<Upload
								listType="picture-card"
								accept="image/*"
								multiple
								fileList={galleryFiles}
								beforeUpload={beforeImageUpload}
								onChange={({ fileList }) =>
									setGalleryFiles(fileList as MediaUploadFile[])
								}
							>
								<button type="button" className="border-0 bg-transparent">
									<PlusOutlined />
									<div className="mt-2">Tải ảnh mới</div>
								</button>
							</Upload>
						</Block>
					</Col>
				</Row>
			),
		},
		{
			key: "content",
			label: "Nội dung",
			children: (
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={12}>
						<StepList
							steps={steps}
							onChange={setSteps}
							disabled={loading || saving}
						/>
					</Col>
					<Col xs={24} lg={12}>
						<Block>
							<Title level={5} className="!mb-4">
								Giới thiệu
							</Title>
							<Form.Item name="introduction" className="!mb-0">
								<SimpleEditor className="min-h-[163px]" />
							</Form.Item>
						</Block>
					</Col>
				</Row>
			),
		},
		{
			key: "seo",
			label: "Quản lý SEO",
			children: (
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Block>
							<SeoSection
								value={seoValue}
								onChange={setSeoValue}
								disabled={loading || saving}
							/>
						</Block>
					</Col>
				</Row>
			),
		},
	];

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<>
			<Button
				type="primary"
				size="large"
				loading={saving}
				disabled={loading}
				onClick={handleSave}
				className="fixed bottom-5 left-1/2 z-9999"
			>
				Cập nhật
			</Button>

			<Form
				form={form}
				layout="vertical"
				disabled={loading || saving}
				className="[&_.ant-form-item-label>label]:font-semibold"
			>
				<Tabs
					type="card"
					items={tabItems}
					className="[&_.ant-tabs-content-holder]:pt-4 custom-tabs"
				/>
			</Form>

			{/* Media pickers */}
			{bannerPickerOpen && (
				<MediaPickerModal
					open
					title="Chọn ảnh banner"
					resourceType="image"
					selectedIds={bannerFile?.mediaId ? [bannerFile.mediaId] : []}
					onCancel={() => setBannerPickerOpen(false)}
					onConfirm={(items) => {
						setBannerFile(items[0] ? mediaToUploadFile(items[0]) : null);
						setBannerPickerOpen(false);
					}}
				/>
			)}

			{galleryPickerOpen && (
				<MediaPickerModal
					open
					title="Chọn ảnh thư viện"
					resourceType="image"
					multiple
					selectedIds={gallerySelectedIds}
					onCancel={() => setGalleryPickerOpen(false)}
					onConfirm={(items) => {
						setGalleryFiles(items.map(mediaToUploadFile));
						setGalleryPickerOpen(false);
					}}
				/>
			)}
		</>
	);
}
