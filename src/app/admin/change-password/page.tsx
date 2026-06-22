"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Form, Input, Typography } from "antd";
import { KeyRound } from "lucide-react";
import { adminFetch } from "@/components/admin/AdminShell";
import { useMessage } from "@/contexts/AdminMessageContext";

const { Title } = Typography;

export default function ChangePasswordPage() {
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();
  const [form] = Form.useForm();
  const messageApi = useMessage();

  const handleSubmit = (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    startTransition(async () => {
      const response = await adminFetch(
        "/api/admin/auth/change-password",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const data = await response.json();
      setSeverity(response.ok ? "success" : "error");
      if (response.ok) {
        messageApi.success("Đổi mật khẩu thành công");
      } else {
        messageApi.error(data.error ?? "Không thể đổi mật khẩu");
      }
      if (response.ok) form.resetFields();
    });
  };

  return (
    <div className="max-w-[560px]">
      <Title level={4} className="!mb-6">
        Đổi mật khẩu
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isPending}
      >
        {message && (
          <Form.Item>
            <Alert
              type={severity}
              message={message}
              showIcon
              closable
              onClose={() => setMessage("")}
            />
          </Form.Item>
        )}

        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu hiện tại",
            },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu mới",
            },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={["newPassword"]}
          rules={[
            {
              required: true,
              message: "Vui lòng xác nhận mật khẩu mới",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (
                  !value ||
                  getFieldValue("newPassword") === value
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp"),
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu mới" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            icon={<KeyRound size={16} />}
            style={{ backgroundColor: "#6366f1" }}
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
