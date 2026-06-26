"use client";

import Block from "@/components/Block";
import { Button, Col, Input, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/AdminShell";
import { useMessage } from "@/contexts/AdminMessageContext";
import LocationManager, { LocationItem } from "../(components)/LocationManager";
import FacebookIcon from "@/components/icons/Facebook";
import InstagramIcon from "@/components/icons/Instagram";
import YoutubeIcon from "@/components/icons/Youtube";
import TiktokIcon from "@/components/icons/Tiktok";
import { isValidUrl } from "@/helpers";

const { Title, Text } = Typography;

type SocialField = "facebookUrl" | "instagramUrl" | "youtubeUrl" | "tiktokUrl";

export default function ContactPage() {
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [locations, setLocations] = useState<LocationItem[]>([]);
	const [facebookUrl, setFacebookUrl] = useState("");
	const [instagramUrl, setInstagramUrl] = useState("");
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [tiktokUrl, setTiktokUrl] = useState("");

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const messageApi = useMessage();

	const [socialErrors, setSocialErrors] = useState<
		Partial<Record<SocialField, string>>
	>({});

	useEffect(() => {
		adminFetch("/api/admin/contact")
			.then((res) => res.json())
			.then((res) => {
				const contact = res?.item ?? res;
				if (contact) {
					setPhone(contact.phone ?? "");
					setEmail(contact.email ?? "");
					setLocations(
						(contact.locations ?? []).map((loc: any) => ({
							_id: loc._id,
							name: loc.name ?? "",
							address: loc.address ?? "",
							lat: loc.lat ?? null,
							lng: loc.lng ?? null,
						})),
					);
					setFacebookUrl(contact.facebookUrl ?? "");
					setInstagramUrl(contact.instagramUrl ?? "");
					setYoutubeUrl(contact.youtubeUrl ?? "");
					setTiktokUrl(contact.tiktokUrl ?? "");
				}
			})
			.catch(() => messageApi.error("Không thể tải dữ liệu liên hệ"))
			.finally(() => setLoading(false));
	}, []);

	// Validate 1 field social url ngay khi thay đổi, cập nhật state lỗi tương ứng
	const handleSocialChange = (field: SocialField, value: string) => {
		const setters: Record<SocialField, (v: string) => void> = {
			facebookUrl: setFacebookUrl,
			instagramUrl: setInstagramUrl,
			youtubeUrl: setYoutubeUrl,
			tiktokUrl: setTiktokUrl,
		};
		setters[field](value);

		setSocialErrors((prev) => ({
			...prev,
			[field]: isValidUrl(value) ? "" : "URL không hợp lệ",
		}));
	};

	const validateSocials = (): boolean => {
		const values: Record<SocialField, string> = {
			facebookUrl,
			instagramUrl,
			youtubeUrl,
			tiktokUrl,
		};

		const nextErrors: Partial<Record<SocialField, string>> = {};
		let hasError = false;

		for (const field of Object.keys(values) as SocialField[]) {
			if (!isValidUrl(values[field])) {
				nextErrors[field] = "URL không hợp lệ";
				hasError = true;
			}
		}

		setSocialErrors(nextErrors);

		if (hasError) {
			messageApi.error("Vui lòng kiểm tra lại các đường dẫn mạng xã hội");
		}

		return !hasError;
	};

	const validateLocations = (): boolean => {
		for (const loc of locations) {
			if (!loc.name.trim()) {
				messageApi.error("Vui lòng nhập tên cho tất cả địa điểm");
				return false;
			}
			if (loc.lat === null || loc.lng === null) {
				messageApi.error(
					`Địa điểm "${loc.name}" chưa có tọa độ. Vui lòng dán link Google Maps hoặc nhập tay lat/lng.`,
				);
				return false;
			}
		}
		return true;
	};

	const handleSave = () => {
		if (!validateSocials()) return;
		if (!validateLocations()) return;

		setSaving(true);

		adminFetch("/api/admin/contact", {
			method: "PATCH",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				phone,
				email,
				locations: locations.map(({ _id, ...rest }) => ({
					...(_id ? { _id } : {}),
					...rest,
				})),
				facebookUrl,
				instagramUrl,
				youtubeUrl,
				tiktokUrl,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.error) throw new Error(data.error);
				messageApi.success("Lưu thành công");
			})
			.catch(() => messageApi.error("Đã có lỗi xảy ra"))
			.finally(() => setSaving(false));
	};

	return (
		<>
			<Row
				gutter={[16, 16]}
				className="flex items-center justify-end mb-5 px-1"
			>
				<Button
					type="primary"
					size="large"
					loading={saving}
					disabled={loading}
					onClick={handleSave}
				>
					Cập nhật
				</Button>
			</Row>

			<Row gutter={[16, 16]}>
				<Col span={12}>
					<Block className="h-full">
						<Title level={5} className="!mb-3 !text-black">
							Số điện thoại
						</Title>
						<Input
							placeholder="Nhập số điện thoại"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							disabled={loading}
						/>
						<Title level={5} className="!mb-3 mt-6 !text-black">
							Email
						</Title>
						<Input
							placeholder="Nhập email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
						/>
					</Block>
				</Col>

				<Col span={12}>
					<Block className="h-full">
						<Title level={5} className="!mb-3 !text-black">
							Mạng xã hội
						</Title>
						<Input
							prefix={<FacebookIcon className="text-gray-400 mr-1" />}
							className="mb-3"
							placeholder="Facebook URL"
							value={facebookUrl}
							onChange={(e) =>
								handleSocialChange("facebookUrl", e.target.value)
							}
							status={socialErrors.facebookUrl ? "error" : undefined}
							disabled={loading}
						/>
						{socialErrors.facebookUrl && (
							<Text type="danger" className="block text-xs mb-2">
								{socialErrors.facebookUrl}
							</Text>
						)}

						<Input
							prefix={<InstagramIcon className="text-gray-400 mr-1" />}
							className="mb-3"
							placeholder="Instagram URL"
							value={instagramUrl}
							onChange={(e) =>
								handleSocialChange("instagramUrl", e.target.value)
							}
							status={socialErrors.instagramUrl ? "error" : undefined}
							disabled={loading}
						/>
						{socialErrors.instagramUrl && (
							<Text type="danger" className="block text-xs mb-2">
								{socialErrors.instagramUrl}
							</Text>
						)}

						<Input
							prefix={<YoutubeIcon className="text-gray-400 mr-1" />}
							className="mb-3"
							placeholder="Youtube URL"
							value={youtubeUrl}
							onChange={(e) =>
								handleSocialChange("youtubeUrl", e.target.value)
							}
							status={socialErrors.youtubeUrl ? "error" : undefined}
							disabled={loading}
						/>
						{socialErrors.youtubeUrl && (
							<Text type="danger" className="block text-xs mb-2">
								{socialErrors.youtubeUrl}
							</Text>
						)}

						<Input
							prefix={<TiktokIcon className="text-gray-400 mr-1" />}
							placeholder="TikTok URL"
							value={tiktokUrl}
							onChange={(e) =>
								handleSocialChange("tiktokUrl", e.target.value)
							}
							status={socialErrors.tiktokUrl ? "error" : undefined}
							disabled={loading}
						/>
						{socialErrors.tiktokUrl && (
							<Text type="danger" className="block text-xs">
								{socialErrors.tiktokUrl}
							</Text>
						)}
					</Block>
				</Col>
			</Row>

			<Row gutter={[16, 16]} className="mt-4">
				<Col span={24}>
					<Block>
						<LocationManager
							value={locations}
							onChange={setLocations}
							disabled={loading}
						/>
					</Block>
				</Col>
			</Row>
		</>
	);
}
