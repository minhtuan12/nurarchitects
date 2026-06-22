import { fireEvent, render, screen } from "@testing-library/react";
import { Form } from "antd";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import SeoOgImageField from "@/components/admin/seo/SeoOgImageField";

vi.mock("@/contexts/AdminMessageContext", () => ({
	useMessage: () => ({
		error: vi.fn(),
		success: vi.fn(),
	}),
}));

vi.mock("@/components/admin/AdminShell", () => ({
	adminFetch: vi.fn(),
}));

vi.mock("@/components/admin/media/MediaPickerModal", () => ({
	default: ({ onConfirm }: { onConfirm: (items: unknown[]) => void }) => (
		<button
			type="button"
			onClick={() =>
				onConfirm([
					{
						_id: "media-1",
						secureUrl: "https://cdn.example.com/og.jpg",
						resourceType: "image",
					},
				])
			}
		>
			Confirm media
		</button>
	),
}));

vi.mock("antd", async (importOriginal) => {
	const actual = await importOriginal<typeof import("antd")>();
	return {
		...actual,
		Image: ({ alt, src }: { alt?: string; src?: string }) => (
			<span aria-label={alt} data-src={src} role="img" />
		),
	};
});

const TestForm = ({ children }: { children: ReactNode }) => {
	return <Form layout="vertical">{children}</Form>;
};

describe("SeoOgImageField", () => {
	it("shows media picker and uploader controls when empty", () => {
		render(
			<TestForm>
				<SeoOgImageField value="" onChange={vi.fn()} />
			</TestForm>,
		);

		expect(screen.getByText("Chọn ảnh đã tải lên")).toBeInTheDocument();
		expect(screen.getByText("Nhấn vào hoặc thả ảnh để tải lên")).toBeInTheDocument();
		expect(screen.getByText("Hỗ trợ định dạng ảnh (jpg, png, webp...)")).toBeInTheDocument();
	});

	it("previews and clears the current image", () => {
		const onChange = vi.fn();

		render(
			<TestForm>
				<SeoOgImageField
					value="https://cdn.example.com/current-og.jpg"
					onChange={onChange}
				/>
			</TestForm>,
		);

		expect(screen.getByRole("img", { name: "OG preview" })).toHaveAttribute(
			"data-src",
			"https://cdn.example.com/current-og.jpg",
		);

		fireEvent.click(screen.getByText("Xóa ảnh"));

		expect(onChange).toHaveBeenCalledWith("");
	});

	it("uses the selected uploaded media URL", () => {
		const onChange = vi.fn();

		render(
			<TestForm>
				<SeoOgImageField value="" onChange={onChange} />
			</TestForm>,
		);

		fireEvent.click(screen.getByText("Chọn ảnh đã tải lên"));
		fireEvent.click(screen.getByText("Confirm media"));

		expect(onChange).toHaveBeenCalledWith("https://cdn.example.com/og.jpg");
	});
});
