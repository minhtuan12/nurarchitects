"use client";

import { Form, Input, Select } from "antd";
import SeoOgImageField from "@/components/admin/seo/SeoOgImageField";

type SeoFieldName = string | number | (string | number)[];

interface SeoFieldNames {
	title: SeoFieldName;
	description: SeoFieldName;
	ogImage: SeoFieldName;
	canonicalUrl: SeoFieldName;
	focusKeywords: SeoFieldName;
}

interface SeoFormFieldsProps {
	names?: Partial<SeoFieldNames>;
	disabled?: boolean;
}

const defaultNames: SeoFieldNames = {
	title: "title",
	description: "description",
	ogImage: "ogImage",
	canonicalUrl: "canonicalUrl",
	focusKeywords: "focusKeywords",
};

export default function SeoFormFields({ names, disabled }: SeoFormFieldsProps) {
	const fieldNames = { ...defaultNames, ...names };

	return (
		<>
			<Form.Item
				label="Tiêu đề SEO (title)"
				name={fieldNames.title}
				rules={[{ required: true, message: "Vui lòng nhập tiêu đề SEO" }]}
			>
				<Input placeholder="Ví dụ: NUR Architects - Kiến trúc & Nội thất" />
			</Form.Item>

			<Form.Item label="Canonical URL" name={fieldNames.canonicalUrl}>
				<Input placeholder="https://nurarchitects.com" />
			</Form.Item>

			<Form.Item label="Mô tả (description)" name={fieldNames.description}>
				<Input.TextArea
					placeholder="Mô tả ngắn hiển thị trên kết quả tìm kiếm"
					autoSize={{ minRows: 3, maxRows: 3 }}
				/>
			</Form.Item>

			<Form.Item label="Ảnh OG (ogImage)" name={fieldNames.ogImage}>
				<SeoOgImageField disabled={disabled} />
			</Form.Item>

			<Form.Item
				label="Từ khóa trọng tâm (focus keywords)"
				name={fieldNames.focusKeywords}
				tooltip="Ngăn cách các từ khóa bằng Enter hoặc dấu phẩy"
				className="[&_.ant-select-content]:!h-full"
			>
				<Select
					mode="tags"
					open={false}
					tokenSeparators={[","]}
					placeholder="Nhập từ khóa và Enter"
					suffixIcon={null}
				/>
			</Form.Item>
		</>
	);
}
