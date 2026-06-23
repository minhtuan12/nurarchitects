"use client";

import {
	Button,
	Col,
	Collapse,
	Empty,
	Input,
	Row,
	Space,
	Typography,
} from "antd";
import {
	PlusOutlined,
	DeleteOutlined,
	AimOutlined,
	CaretRightOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import { useMessage } from "@/contexts/AdminMessageContext";
import { LatLng, parseGoogleMapsUrl } from "../utils";
import NoData from "@/components/NoData";

const { Title, Text } = Typography;

export type LocationItem = {
	_id?: string;
	name: string;
	address: string;
	lat: number | null;
	lng: number | null;
};

type LocationManagerProps = {
	value: LocationItem[];
	onChange: (locations: LocationItem[]) => void;
	disabled?: boolean;
};

function createEmptyLocation(): LocationItem {
	return { name: "", address: "", lat: null, lng: null };
}

export default function LocationManager({
	value,
	onChange,
	disabled,
}: LocationManagerProps) {
	console.log(value)
	const messageApi = useMessage();
	// Lưu giá trị input link tạm thời theo index, để không phải parse lại liên tục
	const [mapLinkDrafts, setMapLinkDrafts] = useState<Record<number, string>>(
		{},
	);

	const handleAdd = () => {
		onChange([...value, createEmptyLocation()]);
	};

	const handleRemove = (index: number) => {
		const next = value.filter((_, i) => i !== index);
		onChange(next);
	};

	const handleFieldChange = (
		index: number,
		field: keyof LocationItem,
		fieldValue: string | number | null,
	) => {
		const next = value.map((loc, i) =>
			i === index ? { ...loc, [field]: fieldValue } : loc,
		);
		onChange(next);
	};

	const handleParseLink = (index: number) => {
		const link = mapLinkDrafts[index];
		if (!link) {
			messageApi.warning("Vui lòng dán link Google Maps trước");
			return;
		}

		const coords: LatLng | null = parseGoogleMapsUrl(link);

		if (!coords) {
			messageApi.error(
				"Không thể đọc tọa độ từ link này. Vui lòng dán link đầy đủ (mở link rút gọn trên trình duyệt rồi copy URL trên thanh địa chỉ), hoặc nhập tọa độ tay.",
			);
			return;
		}

		const next = value.map((loc, i) =>
			i === index ? { ...loc, lat: coords.lat, lng: coords.lng } : loc,
		);
		onChange(next);
		messageApi.success("Đã lấy được tọa độ");
	};

	const addressCollapses = useMemo(() => {
		return value.map((location, index) => ({
			label: (
				<div className="flex items-center justify-between">
					<Text strong>{location.name || `Địa điểm #${index + 1}`}</Text>
					<Button
						type="text"
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleRemove(index)}
						disabled={disabled}
					/>
				</div>
			),
			children: (
				<Row gutter={[12, 12]}>
					<Col span={12}>
						<Text type="secondary" className="block mb-1">
							Tên địa điểm
						</Text>
						<Input
							placeholder="Ví dụ: Văn phòng Hà Nội"
							value={location.name}
							onChange={(e) =>
								handleFieldChange(index, "name", e.target.value)
							}
							disabled={disabled}
						/>
					</Col>
					<Col span={12}>
						<Text type="secondary" className="block mb-1">
							Địa chỉ
						</Text>
						<Input
							placeholder="Số nhà, đường, quận, thành phố"
							value={location.address}
							onChange={(e) =>
								handleFieldChange(
									index,
									"address",
									e.target.value,
								)
							}
							disabled={disabled}
						/>
					</Col>

					<Col span={24}>
						<Text type="secondary" className="block mb-1">
							Dán link Google Maps để tự lấy tọa độ
						</Text>
						<Space.Compact className="w-full">
							<Input
								placeholder="https://www.google.com/maps/place/..."
								value={mapLinkDrafts[index] ?? ""}
								onChange={(e) =>
									setMapLinkDrafts((prev) => ({
										...prev,
										[index]: e.target.value,
									}))
								}
								disabled={disabled}
							/>
							<Button
								icon={<AimOutlined />}
								onClick={() => handleParseLink(index)}
								disabled={disabled}
								className="h-[42px]"
							>
								Lấy tọa độ
							</Button>
						</Space.Compact>
					</Col>

					<Col span={12}>
						<Text type="secondary" className="block mb-1">
							Vĩ độ (lat)
						</Text>
						<Input
							placeholder="21.0285"
							value={location.lat ?? ""}
							onChange={(e) =>
								handleFieldChange(
									index,
									"lat",
									e.target.value === ""
										? null
										: Number(e.target.value),
								)
							}
							disabled={disabled}
						/>
					</Col>
					<Col span={12}>
						<Text type="secondary" className="block mb-1">
							Kinh độ (lng)
						</Text>
						<Input
							placeholder="105.8542"
							value={location.lng ?? ""}
							onChange={(e) =>
								handleFieldChange(
									index,
									"lng",
									e.target.value === ""
										? null
										: Number(e.target.value),
								)
							}
							disabled={disabled}
						/>
					</Col>
				</Row>
			),
		}));
	}, [value]);

	return (
		<div>
			<div className="flex items-center justify-between mb-5">
				<Title level={5} className="!mb-0">
					Bản đồ - Địa điểm
				</Title>
				<Button
					icon={<PlusOutlined />}
					onClick={handleAdd}
					disabled={disabled}
				>
					Thêm địa điểm
				</Button>
			</div>

			{value.length === 0 && (
				<NoData description="Chưa có địa điểm nào" />
			)}

			{value.length > 0 && (
				<Space orientation="vertical" size={16} className="w-full">
					<Collapse
						expandIcon={({ isActive }) => (
							<CaretRightOutlined
								rotate={isActive ? 90 : 0}
								className="mt-2.5"
							/>
						)}
						items={addressCollapses}
					/>
				</Space>
			)}
		</div>
	);
}
