"use client";

import { useState } from "react";
import {
	Button,
	Input,
	Typography,
	Flex,
	Modal,
	Empty,
	Tooltip,
} from "antd";
import {
	PlusOutlined,
	DeleteOutlined,
	HolderOutlined,
	EditOutlined,
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
	useSortable,
	verticalListSortingStrategy,
	arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CooperationStep } from "@/types/cooperation";
import Block from "@/components/Block";

const { Title, Text } = Typography;

// ─── Sortable row (drag handle + Steps item rendered as a custom row) ─────────

interface SortableStepRowProps {
	id: string;
	step: CooperationStep;
	index: number;
	isLast: boolean;
	disabled?: boolean;
	onEdit: () => void;
}

function SortableStepRow({
	id,
	step,
	index,
	isLast,
	disabled,
	onEdit,
}: SortableStepRowProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id, disabled });

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.4 : 1,
		zIndex: isDragging ? 10 : undefined,
	};

	return (
		<div ref={setNodeRef} style={style} className="flex items-stretch">
			{/* Drag handle column */}
			<div className="flex flex-col items-center mr-1 pt-0.5">
				<Tooltip title="Kéo để sắp xếp">
					<button
						ref={setActivatorNodeRef}
						type="button"
						className={[
							"flex items-center justify-center w-5 h-5 rounded mt-1",
							"text-gray-300 border-0 bg-transparent",
							"transition-colors duration-150",
							disabled
								? "cursor-not-allowed opacity-40"
								: "cursor-grab active:cursor-grabbing hover:text-gray-500 hover:bg-gray-100",
						].join(" ")}
						{...attributes}
						{...listeners}
					>
						<HolderOutlined style={{ fontSize: 11 }} />
					</button>
				</Tooltip>
			</div>

			{/* Step icon + connector line column */}
			<div className="flex flex-col items-center mr-3">
				{/* Dot */}
				<button
					type="button"
					onClick={disabled ? undefined : onEdit}
					disabled={disabled}
					className={[
						"flex items-center justify-center w-7 h-7 rounded-full",
						"text-xs font-semibold border-0",
						"ring-1 ring-inset transition-all duration-150",
						"mt-0.5 shrink-0",
						disabled
							? "cursor-not-allowed bg-gray-50 text-gray-300 ring-gray-200"
							: step.name
								? "cursor-pointer bg-blue-50 text-blue-600 ring-blue-200 hover:bg-blue-100 hover:ring-blue-400"
								: "cursor-pointer bg-gray-50 text-gray-400 ring-gray-200 hover:bg-gray-100",
					].join(" ")}
				>
					{index + 1}
				</button>

				{/* Connector line */}
				{!isLast && (
					<div className="w-px flex-1 bg-gray-200 my-1 min-h-[16px]" />
				)}
			</div>

			{/* Content column */}
			<button
				type="button"
				onClick={disabled ? undefined : onEdit}
				disabled={disabled}
				className={[
					"flex-1 text-left border-0 bg-transparent rounded px-2 py-0.5 mb-3",
					"transition-colors duration-150 group",
					disabled
						? "cursor-not-allowed"
						: "cursor-pointer hover:bg-gray-50",
				].join(" ")}
			>
				<div className="flex items-center justify-between gap-2">
					<span
						className={[
							"text-sm font-medium leading-7",
							step.name ? "text-gray-800" : "text-gray-400 italic",
						].join(" ")}
					>
						{step.name || "Chưa đặt tên"}
					</span>
					{!disabled && (
						<EditOutlined className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
					)}
				</div>
				{step.description && (
					<p className="text-xs text-gray-500 mt-0.5 mb-0 line-clamp-2 leading-relaxed">
						{step.description}
					</p>
				)}
			</button>
		</div>
	);
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

interface EditStepModalProps {
	step: CooperationStep | null;
	index: number;
	open: boolean;
	onClose: () => void;
	onSave: (updated: CooperationStep) => void;
	onRemove: () => void;
}

function EditStepModal({
	step,
	index,
	open,
	onClose,
	onSave,
	onRemove,
}: EditStepModalProps) {
	const [draft, setDraft] = useState<CooperationStep | null>(null);

	const handleAfterOpen = (isOpen: boolean) => {
		if (isOpen && step) setDraft({ ...step });
	};

	const handleSave = () => {
		if (draft) onSave(draft);
		onClose();
	};

	const handleRemove = () => {
		onRemove();
		onClose();
	};

	return (
		<Modal
			title={
				<span>
					Chỉnh sửa bước{" "}
					<Text type="secondary" className="font-normal text-sm">
						#{index + 1}
					</Text>
				</span>
			}
			open={open}
			onCancel={onClose}
			afterOpenChange={handleAfterOpen}
			destroyOnHidden
			width={480}
			footer={
				<Flex justify="space-between" align="center">
					<Button
						danger
						type="text"
						icon={<DeleteOutlined />}
						onClick={handleRemove}
					>
						Xoá bước
					</Button>
					<Flex gap={8}>
						<Button onClick={onClose}>Huỷ</Button>
						<Button type="primary" onClick={handleSave}>
							Lưu
						</Button>
					</Flex>
				</Flex>
			}
		>
			{draft && (
				<Flex vertical gap={12} className="py-2">
					<div>
						<Text className="text-xs text-gray-500 mb-1 block">Tên bước</Text>
						<Input
							placeholder="Nhập tên bước..."
							value={draft.name}
							onChange={(e) => setDraft({ ...draft, name: e.target.value })}
							autoFocus
						/>
					</div>
					<div>
						<Text className="text-xs text-gray-500 mb-1 block">Mô tả</Text>
						<Input.TextArea
							placeholder="Nhập mô tả bước..."
							value={draft.description}
							onChange={(e) =>
								setDraft({ ...draft, description: e.target.value })
							}
							autoSize={{ minRows: 3, maxRows: 6 }}
						/>
					</div>
				</Flex>
			)}
		</Modal>
	);
}

// ─── Main component ───────────────────────────────────────────────────────────

interface StepListProps {
	steps: CooperationStep[];
	onChange: (steps: CooperationStep[]) => void;
	disabled?: boolean;
}

export default function StepList({ steps, onChange, disabled }: StepListProps) {
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	const ids = steps.map((_, i) => `step-${i}`);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = ids.indexOf(active.id as string);
		const newIndex = ids.indexOf(over.id as string);
		if (oldIndex === -1 || newIndex === -1) return;

		onChange(
			arrayMove(steps, oldIndex, newIndex).map((s, i) => ({ ...s, order: i })),
		);
	};

	const handleAdd = () => {
		const newIndex = steps.length;
		onChange([
			...steps,
			{ order: newIndex, name: "", description: "" },
		]);
		setEditingIndex(newIndex);
	};

	const handleRemove = (index: number) => {
		onChange(
			steps
				.filter((_, i) => i !== index)
				.map((s, i) => ({ ...s, order: i })),
		);
	};

	const handleSave = (index: number, updated: CooperationStep) => {
		onChange(steps.map((s, i) => (i === index ? updated : s)));
	};

	return (
		<Block>
			<Flex justify="space-between" align="center" className="mb-4">
				<Title level={5} className="!mb-0">
					Quy trình hợp tác
				</Title>
				<Button
					type="dashed"
					icon={<PlusOutlined />}
					onClick={handleAdd}
					disabled={disabled}
				>
					Thêm bước
				</Button>
			</Flex>

			{steps.length === 0 ? (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={
						<span className="text-gray-400 text-sm">
							Chưa có bước nào. Nhấn <strong>Thêm bước</strong> để bắt đầu.
						</span>
					}
				/>
			) : (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext items={ids} strategy={verticalListSortingStrategy}>
						<div className="pt-1">
							{steps.map((step, index) => (
								<SortableStepRow
									key={ids[index]}
									id={ids[index]}
									step={step}
									index={index}
									isLast={index === steps.length - 1}
									disabled={disabled}
									onEdit={() => setEditingIndex(index)}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>
			)}

			<EditStepModal
				open={editingIndex !== null}
				index={editingIndex ?? 0}
				step={editingIndex !== null ? (steps[editingIndex] ?? null) : null}
				onClose={() => setEditingIndex(null)}
				onSave={(updated) => {
					if (editingIndex !== null) handleSave(editingIndex, updated);
				}}
				onRemove={() => {
					if (editingIndex !== null) handleRemove(editingIndex);
				}}
			/>
		</Block>
	);
}
