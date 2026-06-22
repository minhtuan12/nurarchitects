"use client";

import { useState, useTransition } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { Send } from "lucide-react";

export function ContactForm() {
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  return (
    <Stack
      component="form"
      gap={2}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(Object.fromEntries(form)),
          });
          setMessage(response.ok ? "Yêu cầu đã được gửi." : "Không thể gửi yêu cầu. Vui lòng thử lại.");
        });
      }}
    >
      {message ? <Alert severity={message.includes("đã") ? "success" : "error"}>{message}</Alert> : null}
      <TextField name="fullName" label="Họ và tên" required />
      <TextField name="phone" label="Số điện thoại" required />
      <TextField name="planningToBuild" label="Nhu cầu xây dựng" />
      <TextField name="buildPlan" label="Loại công trình" select defaultValue="home">
        <MenuItem value="home">Nhà ở</MenuItem>
        <MenuItem value="businessHome">Nhà ở kinh doanh</MenuItem>
        <MenuItem value="villa">Biệt thự</MenuItem>
        <MenuItem value="others">Khác</MenuItem>
      </TextField>
      <TextField name="area" label="Diện tích" />
      <TextField name="floors" label="Số tầng" type="number" />
      <TextField name="address" label="Địa chỉ" />
      <TextField name="specialRequirement" label="Yêu cầu đặc biệt" multiline minRows={4} />
      <Button type="submit" variant="contained" disabled={isPending} endIcon={<Send size={18} />}>
        Gửi yêu cầu
      </Button>
    </Stack>
  );
}

