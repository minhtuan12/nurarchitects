"use client";

import Block from "@/components/Block";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
	mediaToUploadFile,
	type AdminMediaItem,
	type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import NoData from "@/components/NoData";
import {
	DeleteOutlined,
	EditOutlined,
	HolderOutlined,
	PlusOutlined,
	UserOutlined,
} from "@ant-design/icons";
import {
	DndContext,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	Avatar,
	Button,
	Col,
	Divider,
	Flex,
	Form,
	Input,
	Modal,
	Row,
	Space,
	Table,
	Typography,
	Upload,
	type TableProps,
	type UploadProps,
} from "antd";
import React, {
	createContext,
	forwardRef,
	useContext,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import type { MemberItem } from "../types";
import ExperienceList from "./ExperienceList";
import { mediaIdToUploadFile } from "../utils";

const { Text, Title } = Typography;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * imageId can be either:
 *   - a plain string ID (when user picks from media picker / newly uploaded)
 *   - a populated Media object { _id, url, alt, ... } (when loaded from server)
 */
type PopulatedMedia = { _id: string; url: string; secureUrl?: string; alt?: string };

function resolveImageId(imageId: MemberItem["imageId"]): string | undefined {
	if (!imageId) return undefined;
	if (typeof imageId === "string") return imageId;
	return (imageId as PopulatedMedia)._id;
}

function resolveImageUrl(imageId: MemberItem["imageId"]): string | undefined {
	if (!imageId) return undefined;
	if (typeof imageId === "string") return undefined; // sẽ show fallback icon, ổn
	const media = imageId as PopulatedMedia;
	return media.secureUrl ?? media.url;
}

function resolveImageAlt(imageId: MemberItem["imageId"]): string | undefined {
	if (!imageId || typeof imageId === "string") return undefined;
	return (imageId as PopulatedMedia).alt;
}

function stripHtml(value: string) {
	return value
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

// ─── Drag-handle context ──────────────────────────────────────────────────────

type DragHandleContextValue = {
	setActivatorNodeRef: (node: HTMLElement | null) => void;
	listeners: any;
	attributes: any;
};

const DragHandleContext = createContext<DragHandleContextValue | null>(null);

function DragHandle() {
	const ctx = useContext(DragHandleContext);
	if (!ctx) return null;
	return (
		<Button
			type="text"
			size="small"
			className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700"
			icon={<HolderOutlined />}
			ref={ctx.setActivatorNodeRef as any}
			{...ctx.attributes}
			{...ctx.listeners}
		/>
	);
}

// ─── Sortable table row ───────────────────────────────────────────────────────

type RowProps = React.HTMLAttributes<HTMLTableRowElement> & {
	"data-row-key": string;
};

const SortableRow = React.forwardRef<HTMLTableRowElement, RowProps>(
	function SortableRow(props, _ref) {
		const {
			attributes,
			listeners,
			setNodeRef,
			setActivatorNodeRef,
			transform,
			transition,
			isDragging,
		} = useSortable({ id: props["data-row-key"] });

		const style: React.CSSProperties = {
			...props.style,
			transform: CSS.Transform.toString(transform),
			transition,
			opacity: isDragging ? 0.6 : 1,
			filter: isDragging ? "blur(0.35px)" : undefined,
			boxShadow: isDragging
				? "0 14px 32px rgba(15,23,42,0.18)"
				: undefined,
			background: isDragging ? "rgba(255,255,255,0.96)" : undefined,
			zIndex: isDragging ? 10 : undefined,
			position: "relative",
		};

		return (
			<DragHandleContext.Provider
				value={{ setActivatorNodeRef, listeners, attributes }}
			>
				<tr ref={setNodeRef} style={style} {...props} />
			</DragHandleContext.Provider>
		);
	},
);

// ─── Member modal ─────────────────────────────────────────────────────────────

interface MemberModalState {
	imageFile: MediaUploadFile | undefined;
	// Always store the plain string ID inside the modal — the modal only
	// ever needs to send the ID back to the server, not render the full object.
	imageId: string | undefined;
	// URL for preview, derived from the populated Media object on open.
	imagePreviewUrl: string | undefined;
	description: string;
	experiences: MemberItem["experiences"];
}

interface MemberModalProps {
	open: boolean;
	editingIndex: number | null;
	initialValues: MemberItem | null;
	saving?: boolean;
	disabled?: boolean;
	onOk: (member: MemberItem) => void;
	onCancel: () => void;
}

function MemberModal({
	open,
	editingIndex,
	initialValues,
	saving,
	disabled,
	onOk,
	onCancel,
}: MemberModalProps) {
	const [form] = Form.useForm<{ name: string; description: string }>();
	const [pickerOpen, setPickerOpen] = useState(false);

	const [modalState, setModalState] = useState<MemberModalState>({
		imageFile: undefined,
		imageId: undefined,
		imagePreviewUrl: undefined,
		description: "",
		experiences: [],
	});

	const editorKey = useRef(0);

	const handleAfterOpen = async (visible: boolean) => {
		if (!visible) return;
		editorKey.current += 1;
		if (initialValues) {
			form.setFieldsValue({
				name: initialValues.name,
				description: initialValues.description,
			});
			setModalState({
				imageFile: undefined,
				imageId: resolveImageId(initialValues.imageId),
				imagePreviewUrl: resolveImageUrl(initialValues.imageId),
				description: initialValues.description,
				experiences: initialValues.experiences,
			});
		} else {
			form.resetFields();
			setModalState({
				imageFile: undefined,
				imageId: undefined,
				imagePreviewUrl: undefined,
				description: "",
				experiences: [],
			});
		}
	};

	const handleSelectMedia = (items: AdminMediaItem[]) => {
		const item = items[0];
		if (!item) { setPickerOpen(false); return; }
		setModalState((s) => ({
			...s,
			imageFile: mediaToUploadFile(item),
			imageId: item._id,
			imagePreviewUrl: item.secureUrl ?? item.url,
		}));
		setPickerOpen(false);
	};

	const beforeImageUpload: UploadProps["beforeUpload"] = (file) => {
		if (!file.type?.startsWith("image/")) return Upload.LIST_IGNORE;
		return false;
	};

	const handleOk = async () => {
		const values = await form.validateFields();
		onOk({
			name: values.name?.trim() ?? "",
			description: values.description,
			// Pass the plain string ID back — server only needs the ID
			imageId: modalState.imageId,
			imageFile: modalState.imageFile,
			experiences: modalState.experiences,
		});
	};

	// Derive the fileList shown in the Upload component:
	// prefer imageFile (newly picked local file), fall back to a synthetic
	// entry built from the server-populated URL so the existing image shows.
	const uploadFileList: MediaUploadFile[] = useMemo(() => {
		if (modalState.imageFile) return [modalState.imageFile];
		if (modalState.imagePreviewUrl && modalState.imageId) {
			return [{
				uid: modalState.imageId,
				name: "image",
				status: "done",
				url: modalState.imagePreviewUrl,
				mediaId: modalState.imageId,
			} as MediaUploadFile];
		}
		return [];
	}, [modalState.imageFile, modalState.imageId, modalState.imagePreviewUrl]);

	return (
		<>
			<Modal
				open={open}
				title={editingIndex === null ? "Thêm nhân sự" : "Cập nhật nhân sự"}
				onCancel={onCancel}
				onOk={handleOk}
				okText="Lưu"
				cancelText="Hủy"
				confirmLoading={saving}
				width={900}
				destroyOnHidden
				afterOpenChange={handleAfterOpen}
				className="[&_.ant-modal-body]:max-h-[650px] [&_.ant-modal-body]:overflow-y-auto [&_.ant-modal-body]:overflow-x-hidden [&_.ant-modal-body]:pr-3"
			>
				<Form form={form} layout="vertical" className="mt-4">
					<Row gutter={[24, 0]}>
						{/* Left: avatar */}
						<Col xs={24} md={8}>
							<Flex vertical gap={8}>
								<Text className="font-semibold">Ảnh đại diện</Text>
								<Button
									size="small"
									onClick={() => setPickerOpen(true)}
									disabled={disabled}
									className="h-[38px]"
								>
									Chọn ảnh đã tải lên
								</Button>
								<Upload
									className="[&_.ant-upload-list]:h-[100px] [&_.ant-upload]:w-full [&_.ant-upload]:h-[100px]"
									listType="picture-card"
									accept="image/*"
									maxCount={1}
									fileList={uploadFileList}
									beforeUpload={beforeImageUpload}
									onChange={({ fileList }) => {
										const f = fileList[0] as MediaUploadFile | undefined;
										setModalState((s) => ({
											...s,
											imageFile: f,
											imageId: f?.mediaId ?? s.imageId,
											imagePreviewUrl: f?.url ?? s.imagePreviewUrl,
										}));
									}}
									disabled={disabled}
								>
									{uploadFileList.length === 0 ? (
										<button type="button" className="border-0 bg-transparent">
											<PlusOutlined />
											<div className="mt-1 text-xs">Tải ảnh</div>
										</button>
									) : null}
								</Upload>
							</Flex>
						</Col>

						{/* Right: fields */}
						<Col xs={24} md={16}>
							<Form.Item
								label="Tên nhân sự"
								name="name"
								rules={[
									{ required: true, message: "Vui lòng nhập tên nhân sự" },
									{ max: 160, message: "Tên không được vượt quá 160 ký tự" },
								]}
							>
								<Input placeholder="Họ và tên" disabled={disabled} />
							</Form.Item>
						</Col>
					</Row>

					<Row className="mt-4">
						<Col span={24}>
							<Form.Item
								label="Mô tả"
								name="description"
							>
								<SimpleEditor key={editorKey.current} />
							</Form.Item>
						</Col>
					</Row>

					<Divider />

					<Row>
						<Col span={24}>
							<ExperienceList
								experiences={modalState.experiences}
								onChange={(exps) =>
									setModalState((s) => ({ ...s, experiences: exps }))
								}
								disabled={disabled}
							/>
						</Col>
					</Row>
				</Form>
			</Modal>

			{pickerOpen && (
				<MediaPickerModal
					open
					title="Chọn ảnh nhân sự"
					resourceType="image"
					selectedIds={modalState.imageId ? [modalState.imageId] : []}
					onCancel={() => setPickerOpen(false)}
					onConfirm={handleSelectMedia}
				/>
			)}
		</>
	);
}

// ─── MemberTable ──────────────────────────────────────────────────────────────

type TableRowItem = MemberItem & { key: string };

export interface MemberTableHandle {
	openCreate: () => void;
}

interface MemberTableProps {
	members: MemberItem[];
	onChange: (members: MemberItem[]) => void;
	onSave: (nextMembers: MemberItem[]) => Promise<void>;
	disabled?: boolean;
	saving?: boolean;
	loading?: boolean;
}

const MemberTable = forwardRef<MemberTableHandle, MemberTableProps>(
	function MemberTable({ members, onChange, onSave, disabled, saving, loading }, ref) {
		const [modalOpen, setModalOpen] = useState(false);
		const [editingIndex, setEditingIndex] = useState<number | null>(null);

		const ids = useMemo(
			() => members.map((_, i) => `member-${i}`),
			[members],
		);

		const tableItems = useMemo<TableRowItem[]>(
			() => members.map((m, i) => ({ ...m, key: ids[i] })),
			[members, ids],
		);

		const sensors = useSensors(
			useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		);

		useImperativeHandle(ref, () => ({
			openCreate: () => {
				setEditingIndex(null);
				setModalOpen(true);
			},
		}));

		const openEdit = (index: number) => {
			setEditingIndex(index);
			setModalOpen(true);
		};

		const closeModal = () => {
			setModalOpen(false);
			setEditingIndex(null);
		};

		const handleModalOk = async (member: MemberItem) => {
			const nextMembers =
				editingIndex === null
					? [...members, member]
					: members.map((m, i) => (i === editingIndex ? member : m));

			onChange(nextMembers);
			await onSave(nextMembers);
			closeModal();
		};

		const handleDelete = (index: number) => {
			onChange(members.filter((_, i) => i !== index));
		};

		const handleDragEnd = (event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;
			const oldIndex = ids.indexOf(active.id as string);
			const newIndex = ids.indexOf(over.id as string);
			if (oldIndex === -1 || newIndex === -1) return;
			const nextMembers = arrayMove(members, oldIndex, newIndex);
			onChange(nextMembers);
			onSave(nextMembers);
		};

		const columns: TableProps<TableRowItem>["columns"] = [
			{
				title: "",
				key: "drag",
				width: 56,
				render: (_, _record, index) => (
					<Flex gap={2} align="center">
						<DragHandle />
						<Text className="text-gray-500">{index + 1}</Text>
					</Flex>
				),
			},
			{
				title: "Tên nhân sự",
				dataIndex: "name",
				key: "name",
				width: 280,
				render: (value: string, record) => {
					const avatarUrl = resolveImageUrl(record.imageId);
					const avatarAlt = resolveImageAlt(record.imageId) ?? value;
					return (
						<Flex align="center" gap={10}>
							<Avatar
								src={avatarUrl}
								alt={avatarAlt}
								size={36}
								shape="circle"
								icon={<UserOutlined />}
							/>
							<Text className="font-medium">
								{value || "Chưa đặt tên"}
							</Text>
						</Flex>
					);
				},
			},
			{
				title: "Mô tả",
				dataIndex: "description",
				key: "description",
				width: 300,
				render: (value: string) => {
					const preview = stripHtml(value);
					return (
						<Text type="secondary">
							{preview
								? preview.length > 140
									? `${preview.slice(0, 140)}…`
									: preview
								: "Trống"}
						</Text>
					);
				},
			},
			{
				title: "Kinh nghiệm",
				key: "experiences",
				width: 120,
				align: "center",
				render: (_: any, record: TableRowItem) => (
					<Text type="secondary">
						{record.experiences?.length ?? 0} mục
					</Text>
				),
			},
			{
				title: "Thao tác",
				key: "actions",
				width: 120,
				align: "center",
				render: (_: any, __: any, index: number) => (
					<Space size={4}>
						<Button
							type="text"
							size="small"
							icon={<EditOutlined />}
							disabled={disabled}
							onClick={() => openEdit(index)}
						/>
						<Button
							type="text"
							size="small"
							danger
							icon={<DeleteOutlined />}
							disabled={disabled}
							onClick={() => handleDelete(index)}
						/>
					</Space>
				),
			},
		];

		return (
			<>
				<Block>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={ids}
							strategy={verticalListSortingStrategy}
						>
							<Table
								size="middle"
								rowKey="key"
								columns={columns}
								dataSource={tableItems}
								pagination={false}
								components={{ body: { row: SortableRow } }}
								locale={{
									emptyText: (
										<NoData description="Chưa có nhân sự nào" />
									),
								}}
								loading={loading}
							/>
						</SortableContext>
					</DndContext>
				</Block>

				<MemberModal
					open={modalOpen}
					editingIndex={editingIndex}
					initialValues={
						editingIndex !== null
							? (members[editingIndex] ?? null)
							: null
					}
					saving={saving}
					disabled={disabled}
					onOk={handleModalOk}
					onCancel={closeModal}
				/>
			</>
		);
	},
);

export default MemberTable;
