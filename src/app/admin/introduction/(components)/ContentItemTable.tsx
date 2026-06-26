"use client";

import Block from "@/components/Block";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
  PlusOutlined,
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
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Typography,
  type TableProps,
} from "antd";
import React, { createContext, useContext, useMemo, useState } from "react";
import type { ContentItem } from "../types";
import NoData from "@/components/NoData";

const { Text } = Typography;

interface ContentItemTableProps {
  label: string;
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  disabled?: boolean;
  addLabel?: string;
}

type TableRowItem = ContentItem & { key: string };

type DragHandleContextValue = {
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  listeners: any;
  attributes: any;
};

const DragHandleContext = createContext<DragHandleContextValue | null>(null);

function DragHandle() {
  const context = useContext(DragHandleContext);
  if (!context) return null;

  return (
    <Button
      type="text"
      size="small"
      className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700"
      icon={<HolderOutlined />}
      ref={context.setActivatorNodeRef as any}
      {...context.attributes}
      {...context.listeners}
    />
  );
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
        ? "0 14px 32px rgba(15, 23, 42, 0.18)"
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

export default function ContentItemTable({
  label,
  items,
  onChange,
  disabled,
  addLabel = "Thêm mục",
}: ContentItemTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = Form.useForm<ContentItem>();

  const ids = useMemo(
    () => items.map((_, index) => `content-item-${index}`),
    [items],
  );
  const tableItems = useMemo<TableRowItem[]>(
    () => items.map((item, index) => ({ ...item, key: ids[index] })),
    [ids, items],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const closeModal = () => {
    setModalOpen(false);
    setEditingIndex(null);
    form.resetFields();
  };

  const openCreate = () => {
    setEditingIndex(null);
    form.setFieldsValue({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    form.setFieldsValue(items[index] ?? { name: "", description: "" });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!form.getFieldValue("description")) {
      form.setFields([
        { name: "description", errors: ["Vui lòng nhập mô tả"] },
      ]);
      return;
    }

    const nextItem: ContentItem = {
      name: values.name?.trim() ?? "",
      description: values.description?.trim() ?? "",
    };

    if (editingIndex === null) {
      onChange([...items, nextItem]);
    } else {
      onChange(
        items.map((item, index) =>
          index === editingIndex ? nextItem : item,
        ),
      );
    }

    closeModal();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(items, oldIndex, newIndex));
  };

  const handleDelete = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const columns: TableProps<TableRowItem>["columns"] = [
    {
      title: "",
      key: "drag",
      width: 56,
      render: (_, record, index) => (
        <Flex gap={2} align="center">
          <DragHandle />
          <Text className="text-gray-500">{index + 1}</Text>
        </Flex>
      ),
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (value: string) => (
        <Text className="font-medium">{value || "Chưa đặt tên"}</Text>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (value: string) => {
        const preview = stripHtml(value);
        return (
          <Text type="secondary">
            {preview
              ? preview.length > 140
                ? `${preview.slice(0, 140)}...`
                : preview
              : "Trống"}
          </Text>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      align: "center",
      render: (_, __, index) => (
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
    <Block>
      <div className="flex items-center justify-between gap-3 mb-4">
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={openCreate}
          disabled={disabled}
          className="h-[38px]"
        >
          {addLabel}
        </Button>
      </div>

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
            components={{
              body: {
                row: SortableRow,
              },
            }}
            locale={{
              emptyText: <NoData description="Chưa có dữ liệu" />,
            }}
          />
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <Text type="secondary" className="block text-center py-4">
          Chưa có mục nào. Nhấn "{addLabel}" để thêm.
        </Text>
      )}

      <Modal
        open={modalOpen}
        title={
          editingIndex === null
            ? `Thêm ${label.toLowerCase()}`
            : `Cập nhật ${label.toLowerCase()}`
        }
        onCancel={closeModal}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
        width={840}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          // preserve={false}
          className="mt-4"
        >
          <Form.Item
            label="Tên mục"
            name="name"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên mục",
              },
              {
                max: 160,
                message:
                  "Tên mục không được vượt quá 160 ký tự",
              },
            ]}
          >
            <Input placeholder="Nhập tên mục" disabled={disabled} />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả" },
            ]}
          >
            <SimpleEditor />
          </Form.Item>
        </Form>
      </Modal>
    </Block>
  );
}
