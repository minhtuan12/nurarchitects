"use client";

import Block from "@/components/Block";
import {
	Button,
	Col,
	ColorPicker,
	Row,
	Switch,
	Typography,
} from "antd";
import type { Color } from "antd/es/color-picker";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/AdminShell";
import { useMessage } from "@/contexts/AdminMessageContext";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
	mediaToUploadFile,
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";

const { Title, Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsFormValue = {
	primaryColor: string;
	backgroundColor: string;
	textColor: string;
	headerBackgroundColor: string; // "" nghĩa là trong suốt
	footerBackgroundColor: string;
	footerTextColor: string;
};

const defaultSettingsValue: SettingsFormValue = {
	primaryColor: "#1a2340",
	backgroundColor: "#ffffff",
	textColor: "#ffffff",
	headerBackgroundColor: "",
	footerBackgroundColor: "#0e1a33",
	footerTextColor: "#ffffff",
};

// Các field màu bắt buộc phải có giá trị (không cho phép trong suốt), kèm ảnh nền tuỳ chọn
const colorFields = [
	{
		colorKey: "backgroundColor",
		label: "Màu nền chung",
	},
	{
		colorKey: "footerBackgroundColor",
		label: "Màu nền Footer",
	},
] as const satisfies ReadonlyArray<{
	colorKey: keyof SettingsFormValue;
	label: string;
}>;

const primaryOnlyField = {
	key: "primaryColor",
	label: "Màu chủ đạo",
	hint: "Dùng cho nút, link, điểm nhấn",
} as const;

const footerTextField = {
	key: "footerTextColor",
	label: "Màu chữ Footer",
	hint: "",
} as const;

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

export default function () {
	const [value, setValue] = useState<SettingsFormValue>(defaultSettingsValue);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const messageApi = useMessage();

	const previewUrl = new URL(
		process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
	);
	previewUrl.searchParams.set("preview", "1");
	previewUrl.searchParams.set("primaryColor", value.primaryColor);
	previewUrl.searchParams.set("textColor", value.textColor);
	previewUrl.searchParams.set("backgroundColor", value.backgroundColor);
	previewUrl.searchParams.set("headerBackgroundColor", value.headerBackgroundColor);
	previewUrl.searchParams.set("footerBackgroundColor", value.footerBackgroundColor);
	previewUrl.searchParams.set("footerTextColor", value.footerTextColor);

	// ── Fetch initial data ────────────────────────────────────────────────────

	useEffect(() => {
		adminFetch("/api/admin/settings")
			.then((res) => res.json())
			.then(async (res) => {
				const item = res?.item ?? res?.data ?? res;
				if (!item) return;

				setValue({
					primaryColor: item.primaryColor ?? defaultSettingsValue.primaryColor,
					backgroundColor: item.backgroundColor ?? defaultSettingsValue.backgroundColor,
					headerBackgroundColor: item.headerBackgroundColor ?? "",
					textColor: item.textColor ?? "#ffffff",
					footerBackgroundColor:
						item.footerBackgroundColor ?? defaultSettingsValue.footerBackgroundColor,
					footerTextColor: item.footerTextColor ?? defaultSettingsValue.footerTextColor,
				});
			})
			.catch(() => messageApi.error("Không thể tải cài đặt hệ thống"))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleColorChange = (key: keyof SettingsFormValue, color: Color) => {
		setValue((prev) => ({ ...prev, [key]: color.toHexString() }));
	};

	const handleHeaderTransparentToggle = (isTransparent: boolean) => {
		setValue((prev) => ({
			...prev,
			headerBackgroundColor: isTransparent ? "" : defaultSettingsValue.footerBackgroundColor,
		}));
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const res = await adminFetch("/api/admin/settings", {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					...value,
				}),
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			messageApi.success("Lưu thành công");
		} catch {
			messageApi.error("Đã có lỗi xảy ra");
		} finally {
			setSaving(false);
		}
	};

	// ── Render helper cho 1 dòng field màu + ảnh ──────────────────────────────

	const renderColorWithImageField = (field: (typeof colorFields)[number]) => {
		return (
			<Col span={24} key={field.colorKey}>
				<div className="flex items-center justify-between gap-2 flex-wrap">
					<Text strong>{field.label}</Text>
					<div className="flex items-center gap-2">
						<ColorPicker
							value={value[field.colorKey]}
							disabled={loading}
							disabledAlpha
							onChangeComplete={(color) => handleColorChange(field.colorKey, color)}
						/>
					</div>
				</div>
			</Col>
		);
	};

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

			<Row gutter={[16, 16]}>
				<Col xs={24} lg={6}>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Block>
								<Title level={5} className="!mb-1">
									Bảng màu hệ thống
								</Title>
								<Text type="secondary">
									Áp dụng cho toàn bộ giao diện website
								</Text>

								<Row gutter={[24, 24]} className="mt-6">
									<Col span={24}>
										<div className="flex items-center justify-between gap-2">
											<Text strong>{primaryOnlyField.label}</Text>
											<ColorPicker
												value={value.primaryColor}
												disabled={loading}
												disabledAlpha
												onChangeComplete={(color) =>
													handleColorChange("primaryColor", color)
												}
											/>
										</div>
									</Col>

									{colorFields.map(renderColorWithImageField)}

									<Col span={24}>
										<div className="flex items-center justify-between gap-2">
											<Text strong>{footerTextField.label}</Text>
											<ColorPicker
												value={value.footerTextColor}
												disabled={loading}
												disabledAlpha
												onChangeComplete={(color) =>
													handleColorChange("footerTextColor", color)
												}
											/>
										</div>
									</Col>
								</Row>
							</Block>
						</Col>

						<Col span={24}>
							<Block>
								<Title level={5} className="!mb-1">
									Header
								</Title>
								<Text type="secondary">
									Màu/ảnh nền riêng cho thanh header, có thể để trong suốt để
									hiện ảnh/nền phía sau
								</Text>

								<div className="flex items-center gap-3 mt-6">
									<Switch
										checked={value.headerBackgroundColor === ""}
										disabled={loading}
										onChange={handleHeaderTransparentToggle}
									/>
									<Text>Trong suốt (không đặt màu/ảnh nền riêng)</Text>
								</div>

								{value.headerBackgroundColor !== "" && (
									<div className="flex items-center justify-between gap-2 mt-4">
										<Text strong>Màu nền Header</Text>
										<ColorPicker
											value={value.headerBackgroundColor}
											disabled={loading}
											disabledAlpha
											onChangeComplete={(color) =>
												handleColorChange("headerBackgroundColor", color)
											}
										/>
									</div>
								)}
								<div className="flex items-center justify-between gap-2 mt-6">
									<Text strong>Màu chữ Header</Text>
									<ColorPicker
										value={value.textColor}
										disabled={loading}
										disabledAlpha
										onChangeComplete={(color) =>
											handleColorChange("textColor", color)
										}
									/>
								</div>
							</Block>
						</Col>
					</Row>
				</Col>

				{/* ── Preview: dính theo khi cuộn để luôn thấy kết quả trong lúc chỉnh màu ── */}
				<Col xs={24} lg={18}>
					<div className="sticky top-4">
						<Block>
							<Title level={5} className="!mb-1">
								Xem trước
							</Title>
							<Text type="secondary" className="!text-xs">
								Mô phỏng bố cục trang chủ, cập nhật theo màu/ảnh đang chọn (chưa lưu)
							</Text>
							<div className="mt-4 overflow-hidden rounded-lg border h-[700px]">
								<iframe
									key={previewUrl.toString()}
									src={previewUrl.toString()}
									className="w-full h-full border-0"
								/>
							</div>
						</Block>
					</div>
				</Col>
			</Row>
		</>
	);
}
