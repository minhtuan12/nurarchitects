"use client";

import Block from "@/components/Block";
import UploadSection from "@/components/UploadSection";
import { Button, Col, Input, Row, Typography } from "antd";
import FeaturedProjectsSection from "./(components)/FeaturedProjectsSection";
import { useEffect, useState } from "react";
import FeaturedActivitiesSection from "./(components)/FeaturedActivitiesSection";
import { adminFetch } from "@/components/admin/AdminShell";
import { useMessage } from "@/contexts/AdminMessageContext";
import SeoSection, { SeoFormValue } from "./(components)/SeoSection";
import Developing from "@/components/admin/Developing";

const { Title } = Typography;

const HOMEPAGE_SEO_SLUG = "homepage";

const defaultSeoValue: SeoFormValue = {
	title: "",
	description: "",
	ogImage: "",
	canonicalUrl: "",
	focusKeywords: [],
};

export default function () {
	const [introTitle, setIntroTitle] = useState("");
	const [introContent, setIntroContent] = useState("");
	const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
	const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
	const [ctaContent, setCtaContent] = useState("");
	const [seoValue, setSeoValue] = useState<SeoFormValue>(defaultSeoValue);
	const [seoId, setSeoId] = useState<string | undefined>(undefined);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const messageApi = useMessage();

	useEffect(() => {
		Promise.all([
			adminFetch("/admin/homepage").then((res) => res.json()),
			adminFetch(
				`/admin/seo-settings?entityType=page&slug=${HOMEPAGE_SEO_SLUG}`,
			).then((res) => res.json()),
		])
			.then(([homepageRes, seoRes]) => {
				const homepage = homepageRes?.data ?? homepageRes;
				if (homepage) {
					setIntroTitle(homepage.introductionTitle ?? "");
					setIntroContent(homepage.introductionContent ?? "");
					setSelectedProjects(
						(homepage.featuredProjectIds ?? []).map((id: unknown) =>
							String(id),
						),
					);
					setSelectedActivities(
						(homepage.activities ?? []).map((id: unknown) =>
							String(id),
						),
					);
					setCtaContent(homepage.contactCtaContent ?? "");
				}

				const seo = seoRes?.data ?? seoRes?.item ?? seoRes;
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

	const handleSave = () => {
		setSaving(true);

		const homepageRequest = adminFetch("/admin/homepage", {
			method: "PATCH",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				introductionTitle: introTitle,
				introductionContent: introContent,
				featuredProjectIds: selectedProjects,
				activities: selectedActivities,
				contactCtaContent: ctaContent,
			}),
		}).then((res) => res.json());

		const seoPayload = {
			entityType: "page",
			slug: HOMEPAGE_SEO_SLUG,
			title: seoValue.title,
			description: seoValue.description,
			ogImage: seoValue.ogImage,
			canonicalUrl: seoValue.canonicalUrl,
			focusKeywords: seoValue.focusKeywords,
		};
		const seoRequest = adminFetch(
			seoId ? `/admin/seo-settings/${seoId}` : "/admin/seo-settings",
			{
				method: seoId ? "PATCH" : "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(seoPayload),
			},
		).then((res) => res.json());

		Promise.all([homepageRequest, seoRequest])
			.then(([homepageData, seoData]) => {
				if (homepageData.error) throw new Error(homepageData.error);
				if (seoData.error) throw new Error(seoData.error);

				if (!seoId && seoData?.data?._id) {
					setSeoId(seoData.data._id);
				}

				messageApi.success("Lưu thành công");
			})
			.catch(() => messageApi.error("Đã có lỗi xảy ra"))
			.finally(() => setSaving(false));
	};

	return (
		// <>
		// 	<Row
		// 		gutter={[16, 16]}
		// 		className="flex items-center justify-between mb-5 px-1"
		// 	>
		// 		<Title level={4}>Quản lý Trang chủ</Title>
		// 		<Button
		// 			type="primary"
		// 			size="large"
		// 			loading={saving}
		// 			disabled={loading}
		// 			onClick={handleSave}
		// 		>
		// 			Cập nhật
		// 		</Button>
		// 	</Row>
		// 	<Row gutter={[16, 16]}>
		// 		<Col span={10}>
		// 			<Block className="h-full">
		// 				<Title level={4} className="!mb-4">
		// 					Banner
		// 				</Title>
		// 				<div className="flex-1 min-h-0">
		// 					<UploadSection />
		// 				</div>
		// 			</Block>
		// 		</Col>
		// 		<Col span={14}>
		// 			<Block className="h-full">
		// 				<Title level={4} className="!mb-3">
		// 					Tiêu đề giới thiệu
		// 				</Title>
		// 				<Input
		// 					placeholder="NUR Architects chúng tôi là ai?"
		// 					value={introTitle}
		// 					onChange={(e) => setIntroTitle(e.target.value)}
		// 					disabled={loading}
		// 				/>
		// 				<Title level={4} className="!mb-3 mt-6">
		// 					Nội dung giới thiệu
		// 				</Title>
		// 				<Input.TextArea
		// 					placeholder="Nội dung giới thiệu"
		// 					autoSize={{ minRows: 4, maxRows: 4 }}
		// 					value={introContent}
		// 					onChange={(e) => setIntroContent(e.target.value)}
		// 					disabled={loading}
		// 				/>
		// 			</Block>
		// 		</Col>
		// 	</Row>
		// 	<Row gutter={[16, 16]} className="mt-4">
		// 		<Col span={10}>
		// 			<Block className="h-full">
		// 				<FeaturedProjectsSection
		// 					selected={selectedProjects}
		// 					setSelected={setSelectedProjects}
		// 				/>
		// 			</Block>
		// 		</Col>
		// 		<Col span={14}>
		// 			<Block className="h-full">
		// 				<FeaturedActivitiesSection
		// 					selected={selectedActivities}
		// 					setSelected={setSelectedActivities}
		// 				/>
		// 			</Block>
		// 		</Col>
		// 	</Row>
		// 	<Row gutter={[16, 16]} className="mt-4">
		// 		<Col span={10}>
		// 			<Block className="h-full">
		// 				<Title level={4} className="!mb-3">
		// 					Nội dung CTA
		// 				</Title>
		// 				<Input
		// 					placeholder="Ví dụ: Tìm hiểu thêm"
		// 					value={ctaContent}
		// 					onChange={(e) => setCtaContent(e.target.value)}
		// 					disabled={loading}
		// 				/>
		// 			</Block>
		// 		</Col>
		// 		<Col span={14}>
		// 			<Block className="h-full">
		// 				<SeoSection
		// 					value={seoValue}
		// 					onChange={setSeoValue}
		// 					disabled={loading}
		// 				/>
		// 			</Block>
		// 		</Col>
		// 	</Row>
		// </>
		<Developing />
	);
}
