"use client";

import Block from "@/components/Block";
import {
	Button,
	Flex,
	Typography,
} from "antd";
import {
	PlusOutlined,
} from "@ant-design/icons";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	arrayMove,
} from "@dnd-kit/sortable";
import { ContentItem } from "../types";
import SortableContentItem from "../(components)/SortableContentItem";

const { Title, Text } = Typography;

interface ContentItemListProps {
	label: string;
	items: ContentItem[];
	onChange: (items: ContentItem[]) => void;
	disabled?: boolean;
	addLabel?: string;
}

export default function ContentItemList({
	label,
	items,
	onChange,
	disabled,
	addLabel = "Thêm mục",
}: ContentItemListProps) {
	const ids = items.map((_, i) => `item-${i}`);
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = ids.indexOf(active.id as string);
		const newIndex = ids.indexOf(over.id as string);
		if (oldIndex === -1 || newIndex === -1) return;
		onChange(arrayMove(items, oldIndex, newIndex));
	};

	const handleChange = (index: number, field: keyof ContentItem, value: string) =>
		onChange(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));

	const handleRemove = (index: number) =>
		onChange(items.filter((_, i) => i !== index));

	const handleAdd = () =>
		onChange([...items, { name: "", description: "" }]);

	return (
		<Block>
			<Flex justify="space-between" align="center" className="mb-4">
				<Title level={5} className="!mb-0">{label}</Title>
				<Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd} disabled={disabled}>
					{addLabel}
				</Button>
			</Flex>

			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={ids} strategy={verticalListSortingStrategy}>
					<Flex vertical gap={10}>
						{items.map((item, index) => (
							<SortableContentItem
								key={ids[index]}
								id={ids[index]}
								item={item}
								index={index}
								total={items.length}
								disabled={disabled}
								onChange={(field, val) => handleChange(index, field, val)}
								onRemove={() => handleRemove(index)}
							/>
						))}
						{items.length === 0 && (
							<Text type="secondary" className="text-center py-4 block">
								Chưa có mục nào. Nhấn "{addLabel}" để thêm.
							</Text>
						)}
					</Flex>
				</SortableContext>
			</DndContext>
		</Block>
	);
}
