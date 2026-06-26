"use client";

import Block from "@/components/Block";
import { Button, Flex, Typography } from "antd";

const { Title, Text } = Typography;

const INTRODUCTION_CHILDREN = [
  {
    label: "Quản lý Nội dung",
    href: "/admin/introduction/content",
  },
  {
    label: "Lịch sử, Tầm nhìn, ...",
    href: "/admin/introduction/history",
  },
  {
    label: "Quản lý nhân sự",
    href: "/admin/introduction/members",
  },
  {
    label: "Quản lý SEO",
    href: "/admin/introduction/seo",
  },
];

export default function IntroductionRootPage() {
  return (
    <Block>
      <Flex vertical gap={16}>
        <div>
          <Title level={4} className="!mb-2">
            Quản lý Giới thiệu
          </Title>
          <Text type="secondary">
            Chọn khu vực cần chỉnh sửa.
          </Text>
        </div>

        <Flex gap={12} wrap="wrap">
          {INTRODUCTION_CHILDREN.map((item) => (
            <Button key={item.href} type={item.href.endsWith("/content") ? "primary" : "default"} href={item.href}>
              {item.label}
            </Button>
          ))}
        </Flex>
      </Flex>
    </Block>
  );
}
