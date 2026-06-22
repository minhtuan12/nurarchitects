"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button, Checkbox, Skeleton, Tag, Typography } from "antd";
import { useMessage } from "@/contexts/AdminMessageContext";
import { adminFetch } from "@/components/admin/AdminShell";
import NoData from "@/components/NoData";
import { useRouter } from "next/navigation";
import { IActivityPopulated } from "@/types/activity";

const { Title, Text } = Typography;

const MAX_FEATURED = 3;

export default function FeaturedActivitiesSection({
	selected,
	setSelected,
}: {
	selected: string[];
	setSelected: Dispatch<SetStateAction<string[]>>;
}) {
	const messageApi = useMessage();
	const [activities, setProjects] = useState<IActivityPopulated[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const router = useRouter();

	useEffect(() => {
		let cancelled = false;

		Promise.all([
			adminFetch("/api/admin/activities?status=published").then((res) =>
				res.json(),
			),
			adminFetch("/api/admin/homepage").then((res) => res.json()),
		])
			.then(([projectsData, configData]) => {
				if (cancelled) return;
				setProjects(projectsData.items ?? []);
				setSelected(configData.item?.featuredProjectIds ?? []);
			})
			.catch(() =>
				messageApi.error("Không thể tải danh sách lĩnh vực hoạt động"),
			)
			.finally(() => !cancelled && setLoading(false));

		return () => {
			cancelled = true;
		};
	}, [messageApi]);

	const toggleSelect = (id: string, checked: boolean) => {
		if (checked && selected.length >= MAX_FEATURED) {
			messageApi.warning(`Chỉ được chọn tối đa ${MAX_FEATURED} lĩnh vực`);
			return;
		}
		setSelected((prev) =>
			checked ? [...prev, id] : prev.filter((item) => item !== id),
		);
	};

	const handleSave = () => {
		setSaving(true);
		adminFetch("/api/admin/homepage", {
			method: "PATCH",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ featuredProjectIds: selected }),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.error) throw new Error(data.error);
				messageApi.success("Đã lưu lĩnh vực hoạt động");
			})
			.catch(() =>
				messageApi.error("Không thể lưu lĩnh vực hoạt động đã chọn"),
			)
			.finally(() => setSaving(false));
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between mb-4">
				<Title level={4} className="!mb-0">
					Lĩnh vực hoạt động
				</Title>
				<Tag
					color={
						selected.length === MAX_FEATURED ? "green" : "default"
					}
				>
					{selected.length}/{MAX_FEATURED}
				</Tag>
			</div>

			<div className="flex-1 min-h-0 overflow-auto">
				{loading ? (
					<Skeleton active paragraph={{ rows: 4 }} />
				) : activities.length === 0 ? (
					<NoData description="Chưa có lĩnh vực hoạt động nào">
						<Button
							onClick={() => router.replace("/admin/activities")}
						>
							Thêm lĩnh vực hoạt động
						</Button>
					</NoData>
				) : (
					<div className="flex flex-col gap-2">
						{activities.map((activity) => {
							const id = activity._id as string;
							const isChecked = selected.includes(id);
							const isDisabled =
								!isChecked && selected.length >= MAX_FEATURED;
							return (
								<label
									key={id}
									className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${isChecked
										? "border-[#6366f1] bg-[#6366f1]/5"
										: "border-[#E8E6DE]"
										} ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FAFAF8]"}`}
								>
									<Checkbox
										checked={isChecked}
										disabled={isDisabled}
										onChange={(e) =>
											toggleSelect(id, e.target.checked)
										}
									/>
									{activity.thumbnailId?.secureUrl && (
										<img
											src={
												activity.thumbnailId
													.secureUrl as string
											}
											alt={activity.name}
											className="w-10 h-10 rounded object-cover shrink-0"
										/>
									)}
									<Text className="flex-1 truncate">
										{activity.name}
									</Text>
								</label>
							);
						})}
					</div>
				)}
			</div>

			{!loading && activities.length > 0 && (
				<Button
					type="primary"
					loading={saving}
					onClick={handleSave}
					className="mt-4"
				>
					Lưu thay đổi
				</Button>
			)}
		</div>
	);
}
