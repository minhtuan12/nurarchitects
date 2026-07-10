"use client";

import Block from "@/components/Block";
import { Button, Col, Flex, Input, Row, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/AdminShell";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
	mediaToUploadFile,
	type AdminMediaItem,
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import { useMessage } from "@/contexts/AdminMessageContext";
import LocationManager, { LocationItem } from "../(components)/LocationManager";
import FacebookIcon from "@/components/icons/Facebook";
import InstagramIcon from "@/components/icons/Instagram";
import YoutubeIcon from "@/components/icons/Youtube";
import TiktokIcon from "@/components/icons/Tiktok";
import { isValidUrl } from "@/helpers";

const { Title, Text } = Typography;

type SocialField = "facebookUrl" | "instagramUrl" | "youtubeUrl" | "tiktokUrl";
type BannerUploadFile = MediaUploadFile;

export default function ContactPage() {
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [locations, setLocations] = useState<LocationItem[]>([]);
	const [facebookUrl, setFacebookUrl] = useState("");
	const [instagramUrl, setInstagramUrl] = useState("");
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [tiktokUrl, setTiktokUrl] = useState("");

	// Banner state
	const [bannerFiles, setBannerFiles] = useState<BannerUploadFile[]>([]);
	const [bannerPickerOpen, setBannerPickerOpen] = useState(false);

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

					// bannerId có thể được backend populate thành object media
					// { _id, secureUrl/url, ... } hoặc đôi khi chỉ là string id thô
					// (hoặc field riêng contact.banner) tuỳ API - xử lý cả 3 trường hợp
					const bannerMedia = contact.bannerId ?? contact.banner;

					if (bannerMedia && typeof bannerMedia === "object") {
						setBannerFiles([mediaToUploadFile(bannerMedia as AdminMediaItem)]);
					} else if (typeof bannerMedia === "string") {
						// bannerId chỉ là id thô, chưa populate -> không có sẵn url để hiển thị preview
						setBannerFiles([
							{
								uid: bannerMedia,
								mediaId: bannerMedia,
								name: "banner",
								status: "done",
								url: contact.bannerUrl ?? "",
							} as BannerUploadFile,
						]);
					} else {
						setBannerFiles([]);
					}
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

	// Upload banner file lên Cloudinary qua /api/admin/media (nếu là file mới),
	// trả về mediaId cuối cùng; nếu đã có mediaId (chọn từ thư viện) thì dùng luôn
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
			throw new Error(data.error ?? "Không thể tải banner lên");
		}

		return String(data.item._id);
	};

	const beforeBannerUpload: UploadProps["beforeUpload"] = (file) => {
		const isImageOrVideo =
			file.type?.startsWith("image/") || file.type?.startsWith("video/");
		if (!isImageOrVideo) {
			messageApi.error("Chỉ hỗ trợ tải ảnh hoặc video lên");
			return Upload.LIST_IGNORE;
		}
		return false;
	};

	const handleSelectBannerMedia = (items: AdminMediaItem[]) => {
		setBannerFiles(items[0] ? [mediaToUploadFile(items[0])] : []);
		setBannerPickerOpen(false);
	};

	const handleSave = async () => {
		if (!validateSocials()) return;
		if (!validateLocations()) return;

		setSaving(true);
		try {
			const bannerId =
				bannerFiles.length > 0 ? await uploadBannerFile(bannerFiles[0]) : null;

			const res = await adminFetch("/api/admin/contact", {
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
					...(bannerId !== null && { bannerId }),
				}),
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			messageApi.success("Lưu thành công");
		} catch (err) {
			messageApi.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
		} finally {
			setSaving(false);
		}
	};

	const isDisabled = loading || saving;

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
				<Col span={24}>
					<Block>
						<Flex vertical gap={12}>
							<Title level={5} className="!mb-0 !text-black">
								Banner
							</Title>

							<Button
								className="self-start"
								disabled={isDisabled}
								onClick={() => setBannerPickerOpen(true)}
							>
								Chọn từ thư viện
							</Button>

							<Upload
								listType="picture-card"
								accept="image/*,video/*"
								maxCount={1}
								fileList={bannerFiles}
								beforeUpload={beforeBannerUpload}
								onChange={({ fileList }) =>
									setBannerFiles(fileList as BannerUploadFile[])
								}
								disabled={isDisabled}
								className="w-full [&_.ant-upload]:w-full [&_.ant-upload]:h-50"
							>
								{bannerFiles.length >= 1 ? null : (
									<button type="button" className="border-0 bg-transparent">
										<PlusOutlined />
										<div className="mt-2">Tải ảnh/video mới</div>
									</button>
								)}
							</Upload>
						</Flex>
					</Block>
				</Col>
			</Row>

			<Row gutter={[16, 16]} className="mt-4">
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

			{bannerPickerOpen && (
				<MediaPickerModal
					open
					title="Chọn banner"
					multiple={false}
					selectedIds={bannerFiles[0]?.mediaId ? [bannerFiles[0].mediaId] : []}
					onCancel={() => setBannerPickerOpen(false)}
					onConfirm={handleSelectBannerMedia}
				/>
			)}
		</>
	);
}
