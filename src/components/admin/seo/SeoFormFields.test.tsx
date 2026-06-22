import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Button, Form } from "antd";
import { describe, expect, it, vi } from "vitest";
import SeoFormFields from "@/components/admin/seo/SeoFormFields";

vi.mock("@/components/admin/seo/SeoOgImageField", () => ({
	default: ({
		value,
		onChange,
	}: {
		value?: string;
		onChange?: (value: string) => void;
	}) => (
		<button type="button" onClick={() => onChange?.("https://cdn.example.com/og.jpg")}>
			{value || "Pick OG image"}
		</button>
	),
}));

describe("SeoFormFields", () => {
	it("renders the complete SEO field set", () => {
		render(
			<Form layout="vertical">
				<SeoFormFields />
			</Form>,
		);

		expect(screen.getByLabelText("Tiêu đề SEO (title)")).toBeInTheDocument();
		expect(screen.getByLabelText("Mô tả (description)")).toBeInTheDocument();
		expect(screen.getByText("Ảnh OG (ogImage)")).toBeInTheDocument();
		expect(screen.getByLabelText("Canonical URL")).toBeInTheDocument();
		expect(
			screen.getByLabelText("Từ khóa trọng tâm (focus keywords)"),
		).toBeInTheDocument();
	});

	it("binds to custom project SEO field names", async () => {
		const onFinish = vi.fn();

		render(
			<Form
				layout="vertical"
				initialValues={{ seoFocusKeywords: [] }}
				onFinish={onFinish}
			>
				<SeoFormFields
					names={{
						title: "seoTitle",
						description: "seoDescription",
						ogImage: "seoOgImage",
						canonicalUrl: "seoCanonicalUrl",
						focusKeywords: "seoFocusKeywords",
					}}
				/>
				<Button htmlType="submit">Save</Button>
			</Form>,
		);

		fireEvent.change(screen.getByLabelText("Tiêu đề SEO (title)"), {
			target: { value: "Project SEO title" },
		});
		fireEvent.change(screen.getByLabelText("Mô tả (description)"), {
			target: { value: "Project SEO description" },
		});
		fireEvent.click(screen.getByText("Pick OG image"));
		fireEvent.change(screen.getByLabelText("Canonical URL"), {
			target: { value: "https://nurarchitects.com/projects/sample" },
		});
		fireEvent.mouseDown(
			screen.getByLabelText("Từ khóa trọng tâm (focus keywords)"),
		);
		fireEvent.change(screen.getByRole("combobox"), {
			target: { value: "architecture" },
		});
		fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
		fireEvent.click(screen.getByText("Save"));

		await waitFor(() => {
			expect(onFinish).toHaveBeenCalledWith(
				expect.objectContaining({
					seoTitle: "Project SEO title",
					seoDescription: "Project SEO description",
					seoOgImage: "https://cdn.example.com/og.jpg",
					seoCanonicalUrl: "https://nurarchitects.com/projects/sample",
					seoFocusKeywords: ["architecture"],
				}),
			);
		});
	});
});
