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
	MinusCircleOutlined,
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
import { IActivityProcess } from "@/types/activity";
import Block from "@/components/Block";

const { Title, Text } = Typography;

// ─── Sortable row (drag handle + process item rendered as a custom row) ──────

interface SortableProcessRowProps {
	id: string;
	process: IActivityProcess;
	index: number;
	isLast: boolean;
	disabled?: boolean;
	onEdit: () => void;
}

function SortableProcessRow({
	id,
	process,
	index,
	isLast,
	disabled,
	onEdit,
}: SortableProcessRowProps) {
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

	const details = process.details ?? [];
	const previewText =
		details.length === 0
			? ""
			: details.length === 1
				? String(details[0])
				: `${details[0]} +${details.length - 1} chi tiết khác`;

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
							: process.name
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
							process.name ? "text-gray-800" : "text-gray-400 italic",
						].join(" ")}
					>
						{String(process.name) || "Chưa đặt tên"}
					</span>
					{!disabled && (
						<EditOutlined className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
					)}
				</div>
				{previewText && (
					<p className="text-xs text-gray-500 mt-0.5 mb-0 line-clamp-2 leading-relaxed">
						{previewText}
					</p>
				)}
			</button>
		</div>
	);
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

interface EditProcessModalProps {
	process: IActivityProcess | null;
	index: number;
	open: boolean;
	onClose: () => void;
	onSave: (updated: IActivityProcess) => void;
	onRemove: () => void;
}

interface ProcessDraft {
	order: number;
	name: string;
	details: string[];
}

function EditProcessModal({
	process,
	index,
	open,
	onClose,
	onSave,
	onRemove,
}: EditProcessModalProps) {
	const [draft, setDraft] = useState<ProcessDraft | null>(null);

	const handleAfterOpen = (isOpen: boolean) => {
		if (isOpen && process) {
			setDraft({
				order: Number(process.order ?? index),
				name: String(process.name ?? ""),
				details: (process.details ?? []).map((d) => String(d)),
			});
		}
	};

	const handleSave = () => {
		if (!draft) return;
		onSave({
			order: draft.order,
			name: draft.name,
			details: draft.details.filter((d) => d.trim().length > 0),
		});
		onClose();
	};

	const handleRemove = () => {
		onRemove();
		onClose();
	};

	const updateDetail = (detailIndex: number, value: string) => {
		if (!draft) return;
		const next = [...draft.details];
		next[detailIndex] = value;
		setDraft({ ...draft, details: next });
	};

	const addDetail = () => {
		if (!draft) return;
		setDraft({ ...draft, details: [...draft.details, ""] });
	};

	const removeDetail = (detailIndex: number) => {
		if (!draft) return;
		setDraft({
			...draft,
			details: draft.details.filter((_, i) => i !== detailIndex),
		});
	};

	return (
		<Modal
			title={
				<span>
					Chỉnh sửa quy trình{" "}
					<Text type="secondary" className="font-normal text-sm">
						#{index + 1}
					</Text>
				</span>
			}
			open={open}
			onCancel={onClose}
			afterOpenChange={handleAfterOpen}
			destroyOnHidden
			width={520}
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
						<Text className="text-md text-black font-semibold mb-1 block">
							Tên bước
						</Text>
						<Input
							placeholder="Nhập tên bước..."
							value={draft.name}
							onChange={(e) => setDraft({ ...draft, name: e.target.value })}
							autoFocus
						/>
					</div>

					<div>
						<Flex justify="space-between" align="center" className="mb-1">
							<Text className="text-md text-black font-semibold block">Chi tiết</Text>
							<Button
								type="link"
								size="small"
								icon={<PlusOutlined />}
								onClick={addDetail}
								className="!px-0 text-xs"
							>
								Thêm chi tiết
							</Button>
						</Flex>

						{draft.details.length === 0 ? (
							<Text type="secondary" className="text-xs italic">
								Chưa có chi tiết nào.
							</Text>
						) : (
							<Flex vertical gap={8}>
								{draft.details.map((detail, i) => (
									<Flex key={i} gap={8} align="center">
										<Input
											placeholder={`Chi tiết ${i + 1}...`}
											value={detail}
											onChange={(e) => updateDetail(i, e.target.value)}
										/>
										<Button
											type="text"
											danger
											icon={<MinusCircleOutlined />}
											onClick={() => removeDetail(i)}
										/>
									</Flex>
								))}
							</Flex>
						)}
					</div>
				</Flex>
			)}
		</Modal>
	);
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProcessListProps {
	processes: IActivityProcess[];
	onChange: (processes: IActivityProcess[]) => void;
	disabled?: boolean;
}

export default function ProcessList({
	processes,
	onChange,
	disabled,
}: ProcessListProps) {
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	const ids = processes.map((_, i) => `process-${i}`);

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
			arrayMove(processes, oldIndex, newIndex).map((p, i) => ({
				...p,
				order: i,
			})),
		);
	};

	const handleAdd = () => {
		const newIndex = processes.length;
		onChange([
			...processes,
			{ order: newIndex, name: "", details: [] },
		]);
		setEditingIndex(newIndex);
	};

	const handleRemove = (index: number) => {
		onChange(
			processes
				.filter((_, i) => i !== index)
				.map((p, i) => ({ ...p, order: i })),
		);
	};

	const handleSave = (index: number, updated: IActivityProcess) => {
		onChange(processes.map((p, i) => (i === index ? updated : p)));
	};

	return (
		<Block>
			<Flex justify="space-between" align="center" className="mb-4">
				<Title level={5} className="!mb-0">
					Quy trình làm việc
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

			{processes.length === 0 ? (
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
							{processes.map((process, index) => (
								<SortableProcessRow
									key={ids[index]}
									id={ids[index]}
									process={process}
									index={index}
									isLast={index === processes.length - 1}
									disabled={disabled}
									onEdit={() => setEditingIndex(index)}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>
			)}

			<EditProcessModal
				open={editingIndex !== null}
				index={editingIndex ?? 0}
				process={editingIndex !== null ? (processes[editingIndex] ?? null) : null}
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
