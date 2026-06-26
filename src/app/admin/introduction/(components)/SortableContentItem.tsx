"use client";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import {
	Button,
	Card,
	Flex,
	Input,
	Tooltip,
	Typography,
} from "antd";
import {
	DeleteOutlined,
	HolderOutlined,
} from "@ant-design/icons";
import {
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContentItem } from "../types";

interface SortableContentItemProps {
	id: string;
	item: ContentItem;
	index: number;
	total: number;
	disabled?: boolean;
	onChange: (field: keyof ContentItem, value: string) => void;
	onRemove: () => void;
}

const { Text } = Typography;

export default function SortableContentItem({
	id,
	item,
	index,
	disabled,
	onChange,
	onRemove,
}: SortableContentItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id, disabled });

	return (
		<div
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
				opacity: isDragging ? 0.5 : 1,
				position: "relative",
			}}
		>
			<Card
				size="small"
				className="border border-gray-200"
				styles={{ body: { padding: "14px 16px" } }}
			>
				<Flex gap={12} align="flex-start">
					{/* drag handle */}
					<Tooltip title="Kéo để sắp xếp">
						<button
							ref={setActivatorNodeRef}
							type="button"
							className={[
								"flex items-center justify-center p-1 rounded border-0 bg-transparent text-gray-300 transition-colors duration-150 mt-1",
								disabled
									? "cursor-not-allowed"
									: "cursor-grab active:cursor-grabbing hover:text-gray-500 hover:bg-gray-50",
							].join(" ")}
							{...attributes}
							{...listeners}
						>
							<HolderOutlined className="text-base" />
						</button>
					</Tooltip>

					<Flex vertical gap={10} className="flex-1 min-w-0">
						<Flex gap={8} align="center">
							<Text type="secondary" className="text-xs font-semibold w-5 shrink-0 select-none">
								{index + 1}
							</Text>
							<Input
								placeholder="Tên mục"
								value={item.name}
								onChange={(e) => onChange("name", e.target.value)}
								disabled={disabled}
							/>
						</Flex>
						<div className="ml-[26px]">
							<SimpleEditor
								value={item.description}
								onChange={(val: string) => onChange("description", val)}
							/>
						</div>
					</Flex>

					<Tooltip title="Xoá">
						<Button
							type="text"
							size="small"
							danger
							icon={<DeleteOutlined />}
							disabled={disabled}
							onClick={onRemove}
							className="mt-1"
						/>
					</Tooltip>
				</Flex>
			</Card>
		</div>
	);
}
