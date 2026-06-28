"use client";

import Block from "@/components/Block";
import { Button, Col, Input, Row, Tabs, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import FeaturedProjectsSection from "./(components)/FeaturedProjectsSection";
import { useCallback, useEffect, useState } from "react";
import FeaturedActivitiesSection from "./(components)/FeaturedActivitiesSection";
import { adminFetch } from "@/components/admin/AdminShell";
import { useMessage } from "@/contexts/AdminMessageContext";
import SeoSection, { SeoFormValue } from "./(components)/SeoSection";
import {
	mediaToUploadFile,
	type AdminMediaItem,
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import { mediaIdToUploadFile } from "../introduction/utils";

const { Title } = Typography;

const HOMEPAGE_SEO_SLUG = "homepage";

const defaultSeoValue: SeoFormValue = {
	title: "",
	description: "",
	ogImage: "",
	canonicalUrl: "",
	focusKeywords: [],
};

type BannerUploadFile = MediaUploadFile;

export default function () {
	const [introTitle, setIntroTitle] = useState("");
	const [introContent, setIntroContent] = useState("");
	const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
	const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
	const [ctaContent, setCtaContent] = useState("");
	const [seoValue, setSeoValue] = useState<SeoFormValue>(defaultSeoValue);
	const [seoId, setSeoId] = useState<string | undefined>(undefined);

	// ── Banner state ──────────────────────────────────────────────────────────
	const [bannerFiles, setBannerFiles] = useState<BannerUploadFile[]>([]);
	const [bannerPickerOpen, setBannerPickerOpen] = useState(false);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const messageApi = useMessage();

	useEffect(() => {
		Promise.all([
			adminFetch("/api/admin/homepage").then((res) => res.json()),
			adminFetch(
				`/api/admin/seo-settings?entityType=page&slug=${HOMEPAGE_SEO_SLUG}`,
			).then((res) => res.json()),
		])
			.then(async ([homepageRes, seoRes]) => {
				const homepage = homepageRes?.item ?? homepageRes?.data ?? homepageRes;
				if (homepage) {
					setIntroTitle(homepage.introductionTitle ?? "");
					setIntroContent(homepage.introductionContent ?? "");
					setSelectedProjects(
						(homepage.featuredProjectIds ?? []).map((id: unknown) =>
							String(id),
						),
					);
					setSelectedActivities(
						(homepage.activities ?? []).map((id: unknown) => String(id)),
					);
					setCtaContent(homepage.contactCtaContent ?? "");

					// Load banner nếu có bannerId
					if (homepage.bannerId) {
						const bannerFile = await mediaIdToUploadFile(
							String(homepage.bannerId),
						);
						setBannerFiles([bannerFile]);
					}
				}

				const seo =
					seoRes?.items?.[0] ?? seoRes?.data ?? seoRes?.item ?? seoRes;
				if (seo && seo.slug) {
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
			.catch(() => messageApi.error("Không thể tải dữ liệu trang chủ"))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Upload banner file lên server, trả về mediaId ─────────────────────────
	const uploadBannerFile = async (
		file: BannerUploadFile,
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
			throw new Error(data.error ?? "Cannot upload banner");
		}
		return String(data.item._id);
	};

	// ── beforeUpload: chặn auto-upload, chỉ cho ảnh/video ────────────────────
	const beforeBannerUpload: UploadProps["beforeUpload"] = (file) => {
		const isImageOrVideo =
			file.type?.startsWith("image/") || file.type?.startsWith("video/");
		if (!isImageOrVideo) {
			messageApi.error("Chỉ hỗ trợ tải ảnh hoặc video lên");
			return Upload.LIST_IGNORE;
		}
		return false; // chặn auto-upload
	};

	// ── Chọn từ media picker ──────────────────────────────────────────────────
	const handleSelectBannerMedia = (items: AdminMediaItem[]) => {
		setBannerFiles(items[0] ? [mediaToUploadFile(items[0])] : []);
		setBannerPickerOpen(false);
	};

	// ── Save ──────────────────────────────────────────────────────────────────
	const handleSave = async () => {
		setSaving(true);
		try {
			// Upload banner trước nếu có file mới
			const bannerId =
				bannerFiles.length > 0
					? await uploadBannerFile(bannerFiles[0])
					: null;

			const homepageRequest = adminFetch("/api/admin/homepage", {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					introductionTitle: introTitle,
					introductionContent: introContent,
					featuredProjectIds: selectedProjects,
					activities: selectedActivities,
					contactCtaContent: ctaContent,
					...(bannerId !== null && { bannerId }),
				}),
			}).then((res) => res.json());

			const seoPayload = {
				entityType: "page",
				slug: HOMEPAGE_SEO_SLUG,
				title: seoValue.title || "Nurarchitects | Chuyên gia Xây dựng",
				description: seoValue.description,
				ogImage: seoValue.ogImage,
				canonicalUrl: seoValue.canonicalUrl,
				focusKeywords: seoValue.focusKeywords,
			};
			const seoRequest = adminFetch(
				seoId
					? `/api/admin/seo-settings/${seoId}`
					: "/api/admin/seo-settings",
				{
					method: seoId ? "PATCH" : "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(seoPayload),
				},
			).then((res) => res.json());

			const [homepageData, seoData] = await Promise.all([
				homepageRequest,
				seoRequest,
			]);

			if (homepageData.error) throw new Error(homepageData.error);
			if (seoData.error) throw new Error(seoData.error);

			if (!seoId && (seoData?.item?._id ?? seoData?.data?._id)) {
				setSeoId(seoData?.item?._id ?? seoData?.data?._id);
			}

			messageApi.success("Lưu thành công");
		} catch {
			messageApi.error("Đã có lỗi xảy ra");
		} finally {
			setSaving(false);
		}
	};

	// ── Tab items ─────────────────────────────────────────────────────────────

	const tabItems = [
		{
			key: "general",
			label: "Tổng quan",
			children: (
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={10}>
						<Block className="h-full flex flex-col [&_.ant-upload]:w-full [&_.ant-upload]:h-50">
							<Title level={5} className="!mb-4">
								Banner
							</Title>

							{/* Nút chọn từ media library */}
							<Button
								className="mb-3 self-start"
								disabled={loading}
								onClick={() => setBannerPickerOpen(true)}
							>
								Chọn từ thư viện
							</Button>

							{/* Upload local */}
							<Upload
								listType="picture-card"
								accept="image/*,video/*"
								maxCount={1}
								fileList={bannerFiles}
								beforeUpload={beforeBannerUpload}
								onChange={({ fileList }) =>
									setBannerFiles(fileList as BannerUploadFile[])
								}
								disabled={loading}
								className="w-full"
							>
								{bannerFiles.length >= 1 ? null : (
									<button
										type="button"
										className="border-0 bg-transparent"
									>
										<PlusOutlined />
										<div className="mt-2">Tải ảnh/video mới</div>
									</button>
								)}
							</Upload>
						</Block>
					</Col>
					<Col xs={24} lg={14}>
						<Block className="h-full">
							<Title level={5} className="!mb-3">
								Tiêu đề giới thiệu
							</Title>
							<Input
								placeholder="NUR Architects chúng tôi là ai?"
								value={introTitle}
								onChange={(e) => setIntroTitle(e.target.value)}
								disabled={loading}
							/>
							<Title level={5} className="!mb-3 mt-6">
								Nội dung giới thiệu
							</Title>
							<Input.TextArea
								placeholder="Nội dung giới thiệu"
								autoSize={{ minRows: 4, maxRows: 4 }}
								value={introContent}
								onChange={(e) => setIntroContent(e.target.value)}
								disabled={loading}
							/>
							<Title level={5} className="!mb-3 mt-6">
								Nội dung CTA
							</Title>
							<Input
								placeholder="Ví dụ: Tìm hiểu thêm"
								value={ctaContent}
								onChange={(e) => setCtaContent(e.target.value)}
								disabled={loading}
							/>
						</Block>
					</Col>
				</Row>
			),
		},
		{
			key: "projects-activities",
			label: "Công trình/Lĩnh vực nổi bật",
			children: (
				<Row gutter={[16, 16]}>
					<Col xs={24} md={12} lg={8}>
						<Block>
							<FeaturedProjectsSection
								selected={selectedProjects}
								setSelected={setSelectedProjects}
							/>
						</Block>
					</Col>
					<Col xs={24} md={12} lg={10}>
						<Block>
							<FeaturedActivitiesSection
								selected={selectedActivities}
								setSelected={setSelectedActivities}
							/>
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
								disabled={loading}
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
			<div className="flex items-center justify-end mb-5 px-1">
				<Button
					type="primary"
					size="large"
					loading={saving}
					disabled={loading}
					onClick={handleSave}
					className="h-[38px]"
				>
					Cập nhật
				</Button>
			</div>

			<Tabs
				type="card"
				items={tabItems}
				className="[&_.ant-tabs-content-holder]:pt-4 custom-tabs"
			/>

			{/* Media picker modal */}
			{bannerPickerOpen && (
				<MediaPickerModal
					open
					title="Chọn banner"
					multiple={false}
					resourceType="auto"
					selectedIds={
						bannerFiles[0]?.mediaId ? [bannerFiles[0].mediaId] : []
					}
					onCancel={() => setBannerPickerOpen(false)}
					onConfirm={handleSelectBannerMedia}
				/>
			)}
		</>
	);
}
