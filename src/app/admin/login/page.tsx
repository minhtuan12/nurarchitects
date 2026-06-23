"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AppImage } from "@/components/AppImage";
import Logo from "@/assets/images/logo.png";
import { styled } from "@mui/material/styles";
import MuiCard from '@mui/material/Card';
import Loading from "@/components/Loading";

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
  borderRadius: 10,
}));

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        placeItems: "center",
        px: 20,
      }}
    >
      <Box
        sx={{
          width: 1 / 2,
          minHeight: "100vh",
          px: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <AppImage src={Logo} alt="Logo" />
      </Box>
      <Box sx={{
        width: 1 / 2, display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Card variant="outlined">
          <Stack
            component="form"
            gap={2.25}
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              const form = new FormData(event.currentTarget);
              startTransition(async () => {
                const response = await fetch(
                  "/api/admin/auth/login",
                  {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                    },
                    body: JSON.stringify(
                      Object.fromEntries(form),
                    ),
                  },
                );
                const data = await response.json();
                if (!response.ok) {
                  setError(data.error ?? "Login failed");
                  return;
                }
                router.replace("/admin/homepage");
                router.refresh();
              });
            }}
          >
            <Typography
              component="h2"
              variant="h6"
              sx={{ width: '100%', fontSize: 30, fontWeight: 500, mb: 1 }}
            >
              Đăng nhập
            </Typography>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Stack gap={2}>
              <Stack gap={1}>
                <Typography>Tên đăng nhập</Typography>
                <TextField
                  name="username"
                  defaultValue="admin"
                  required
                  placeholder="Nhập tên đăng nhập"
                />
              </Stack>
              <Stack gap={1}>
                <Typography>Mật khẩu</Typography>
                <TextField
                  name="password"
                  type="password"
                  defaultValue="admin123"
                  required
                  placeholder="Nhập mật khẩu"
                />
              </Stack>
            </Stack>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              loading={isPending}
              sx={{ bgcolor: "rgb(5, 7, 10)", height: 45, fontSize: 16, textTransform: 'none', fontWeight: 500, '&:hover': { bgcolor: "rgb(38, 41, 45))" } }}
            >
              Đăng nhập
            </Button>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
