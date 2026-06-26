"use client";

import Block from "@/components/Block";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
  mediaToUploadFile,
  type AdminMediaItem,
  type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import {
  Button,
  Card,
  Col,
  Flex,
  Input,
  Row,
  Typography,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import {
  DeleteOutlined,
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useState } from "react";
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
import { SeoFormValue } from "./SeoSection";
import { ContentItem, Experience, MemberItem } from "../types";
import ExperienceList from "./ExperienceList";

const { Title, Text } = Typography;

interface MemberCardProps {
  id: string;
  member: MemberItem;
  index: number;
  disabled?: boolean;
  onChange: (member: MemberItem) => void;
  onRemove: () => void;
}

function MemberCard({ id, member, index, disabled, onChange, onRemove }: MemberCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const beforeImageUpload: UploadProps["beforeUpload"] = (file) => {
    if (!file.type?.startsWith("image/")) return Upload.LIST_IGNORE;
    return false;
  };

  const handleSelectMedia = (items: AdminMediaItem[]) => {
    const item = items[0];
    if (!item) { setPickerOpen(false); return; }
    onChange({ ...member, imageFile: mediaToUploadFile(item), imageId: item._id });
    setPickerOpen(false);
  };

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
        styles={{ body: { padding: "16px" } }}
        title={
          <Flex align="center" gap={8}>
            <button
              ref={setActivatorNodeRef}
              type="button"
              className={[
                "flex items-center p-1 rounded border-0 bg-transparent text-gray-300 transition-colors",
                disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing hover:text-gray-500",
              ].join(" ")}
              {...attributes}
              {...listeners}
            >
              <HolderOutlined />
            </button>
            <Text className="font-semibold text-sm">
              {member.name || `Nhân sự ${index + 1}`}
            </Text>
          </Flex>
        }
        extra={
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            disabled={disabled}
            onClick={onRemove}
          />
        }
      >
        <Row gutter={[16, 16]}>
          {/* Left: avatar */}
          <Col xs={24} md={8}>
            <Flex vertical gap={8}>
              <Text className="text-xs font-semibold text-gray-500">Ảnh đại diện</Text>
              <Button size="small" onClick={() => setPickerOpen(true)} disabled={disabled}>
                Chọn ảnh đã tải lên
              </Button>
              <Upload
                listType="picture-card"
                accept="image/*"
                maxCount={1}
                fileList={member.imageFile ? [member.imageFile] : []}
                beforeUpload={beforeImageUpload}
                onChange={({ fileList }) => {
                  const f = fileList[0] as MediaUploadFile | undefined;
                  onChange({ ...member, imageFile: f, imageId: f?.mediaId });
                }}
                disabled={disabled}
              >
                {member.imageFile ? null : (
                  <button type="button" className="border-0 bg-transparent">
                    <PlusOutlined />
                    <div className="mt-1 text-xs">Tải ảnh</div>
                  </button>
                )}
              </Upload>
            </Flex>
          </Col>

          {/* Right: fields */}
          <Col xs={24} md={16}>
            <Flex vertical gap={12}>
              <Flex vertical gap={4}>
                <Text className="text-xs font-semibold">Tên nhân sự</Text>
                <Input
                  placeholder="Họ và tên"
                  value={member.name}
                  onChange={(e) => onChange({ ...member, name: e.target.value })}
                  disabled={disabled}
                />
              </Flex>

              <Flex vertical gap={4}>
                <Text className="text-xs font-semibold">Mô tả</Text>
                <SimpleEditor
                  value={member.description}
                  onChange={(val: string) => onChange({ ...member, description: val })}
                />
              </Flex>

              <ExperienceList
                experiences={member.experiences}
                onChange={(exps: MemberItem["experiences"]) => onChange({ ...member, experiences: exps })}
                disabled={disabled}
              />
            </Flex>
          </Col>
        </Row>

        {pickerOpen && (
          <MediaPickerModal
            open
            title="Chọn ảnh nhân sự"
            resourceType="image"
            selectedIds={member.imageId ? [member.imageId] : []}
            onCancel={() => setPickerOpen(false)}
            onConfirm={handleSelectMedia}
          />
        )}
      </Card>
    </div>
  );
}

// ─── MemberList ───────────────────────────────────────────────────────────────

interface MemberListProps {
  members: MemberItem[];
  onChange: (members: MemberItem[]) => void;
  disabled?: boolean;
}

export default function MemberList({ members, onChange, disabled }: MemberListProps) {
  const ids = members.map((_, i) => `member-${i}`);
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
    onChange(arrayMove(members, oldIndex, newIndex));
  };

  const handleAdd = () =>
    onChange([...members, { name: "", description: "", experiences: [] }]);

  return (
    <Block>
      <Flex justify="space-between" align="center" className="mb-4">
        <Title level={5} className="!mb-0">Nhân sự</Title>
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd} disabled={disabled}>
          Thêm nhân sự
        </Button>
      </Flex>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <Flex vertical gap={12}>
            {members.map((member, index) => (
              <MemberCard
                key={ids[index]}
                id={ids[index]}
                member={member}
                index={index}
                disabled={disabled}
                onChange={(updated) =>
                  onChange(members.map((m, i) => (i === index ? updated : m)))
                }
                onRemove={() => onChange(members.filter((_, i) => i !== index))}
              />
            ))}
            {members.length === 0 && (
              <Text type="secondary" className="text-center py-4 block">
                Chưa có nhân sự nào.
              </Text>
            )}
          </Flex>
        </SortableContext>
      </DndContext>
    </Block>
  );
}
