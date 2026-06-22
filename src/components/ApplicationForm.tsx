"use client";

import { useState, useTransition } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { Send } from "lucide-react";

export function ApplicationForm({ jobId }: { jobId: string }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Stack
      component="form"
      gap={2}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          const response = await fetch("/api/jobs", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...Object.fromEntries(form), jobId }),
          });
          setMessage(response.ok ? "Hồ sơ đã được gửi." : "Không thể gửi hồ sơ. Vui lòng thử lại.");
        });
      }}
    >
      {message ? <Alert severity={message.includes("đã") ? "success" : "error"}>{message}</Alert> : null}
      <TextField name="fullName" label="Họ và tên" required />
      <TextField name="email" label="Email" type="email" required />
      <TextField name="phone" label="Số điện thoại" required />
      <Button type="submit" variant="contained" disabled={isPending} endIcon={<Send size={18} />}>
        Gửi hồ sơ
      </Button>
    </Stack>
  );
}
