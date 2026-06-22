"use client";

import { Form, Typography } from "antd";
import { useEffect } from "react";
import SeoFormFields from "@/components/admin/seo/SeoFormFields";

const { Title } = Typography;

export interface SeoFormValue {
	title: string;
	description: string;
	ogImage: string;
	canonicalUrl: string;
	focusKeywords: string[];
}

interface SeoSectionProps {
	value: SeoFormValue;
	onChange: (value: SeoFormValue) => void;
	disabled?: boolean;
}

export default function SeoSection({ value, onChange, disabled }: SeoSectionProps) {
	const [form] = Form.useForm();

	useEffect(() => {
		form.setFieldsValue({
			title: value.title,
			description: value.description,
			ogImage: value.ogImage,
			canonicalUrl: value.canonicalUrl,
			focusKeywords: value.focusKeywords,
		});
	}, [
		value.title,
		value.description,
		value.ogImage,
		value.canonicalUrl,
		value.focusKeywords,
		form,
	]);

	const emitChange = (patch: Partial<SeoFormValue>) => {
		onChange({ ...value, ...patch });
	};

	return (
		<div>
			<Title level={4} className="!mb-3">
				Quản lý SEO
			</Title>
			<Form
				form={form}
				layout="vertical"
				disabled={disabled}
				onValuesChange={(_, allValues) => emitChange(allValues)}
			>
				<SeoFormFields disabled={disabled} />
			</Form>
		</div>
	);
}
