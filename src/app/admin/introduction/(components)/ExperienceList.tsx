"use client";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button, Card, Flex, Input, Space, Tooltip, Typography } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { SeoFormValue } from "./SeoSection";
import { Experience } from "../types";

const { Text } = Typography;

interface ExperienceListProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
  disabled?: boolean;
}

export default function ExperienceList({
  experiences,
  onChange,
  disabled,
}: ExperienceListProps) {
  const handleChange = (
    index: number,
    field: keyof Experience,
    value: string,
  ) =>
    onChange(
      experiences.map((e, i) =>
        i === index ? { ...e, [field]: value } : e,
      ),
    );

  const handleRemove = (index: number) =>
    onChange(experiences.filter((_, i) => i !== index));

  const handleAdd = () =>
    onChange([...experiences, { name: "", description: "" }]);

  const handleMove = (index: number, dir: "up" | "down") => {
    const next = [...experiences];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <Flex justify="space-between" align="center" className="mb-1">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Kinh nghiệm
        </Text>
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={disabled}
        >
          Thêm
        </Button>
      </Flex>

      {experiences.map((exp, index) => (
        <Card
          key={index}
          size="small"
          className="border border-gray-100 bg-gray-50"
          styles={{ body: { padding: "10px 12px" } }}
        >
          <Flex gap={8} align="flex-start">
            <Flex vertical gap={8} className="flex-1 min-w-0">
              <Input
                size="small"
                placeholder="Tên kinh nghiệm"
                value={exp.name}
                onChange={(e) =>
                  handleChange(index, "name", e.target.value)
                }
                disabled={disabled}
              />
              <SimpleEditor
                value={exp.description}
                onChange={(val: string) =>
                  handleChange(index, "description", val)
                }
              />
            </Flex>
            <Space size={2} className="shrink-0">
              <Tooltip title="Lên">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={disabled || index === 0}
                  onClick={() => handleMove(index, "up")}
                />
              </Tooltip>
              <Tooltip title="Xuống">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={
                    disabled ||
                    index === experiences.length - 1
                  }
                  onClick={() => handleMove(index, "down")}
                />
              </Tooltip>
              <Tooltip title="Xoá">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={disabled}
                  onClick={() => handleRemove(index)}
                />
              </Tooltip>
            </Space>
          </Flex>
        </Card>
      ))}

      {experiences.length === 0 && (
        <Text
          type="secondary"
          className="text-xs text-center py-2 block"
        >
          Chưa có kinh nghiệm nào.
        </Text>
      )}
    </div>
  );
}
