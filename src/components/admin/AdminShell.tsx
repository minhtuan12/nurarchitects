"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { StyleProvider } from "@ant-design/cssinjs";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/assets/images/logo.png";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Image,
  Layout,
  Menu,
  message,
  theme,
  Typography,
} from "antd";
import { Box } from "@mui/material";
import { ADMIN_ROUTES } from "@/lib/constants";
import AdminMenu from "./UserMenu";
import { AntdMessageProvider } from "@/contexts/AdminMessageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "@/app/globals.css";
import { useAtom } from "jotai";
import { pageTitleAtom } from "@/atoms/admin";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const siderStyle: React.CSSProperties = {
  overflow: "hidden",
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  boxShadow: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
  backgroundColor: "white",
};

export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  return fetch(input, {
    ...init,
    credentials: "same-origin",
    headers,
  });
}

const MAIN_PAGE = process.env.NEXT_PUBLIC_SITE_URL!;

const queryClient = new QueryClient();

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useAtom(pageTitleAtom);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    if (isLogin) {
      return;
    }

    let cancelled = false;

    fetch("/api/admin/auth/session", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((response) => {
        if (cancelled) return;

        if (response.ok) {
          setIsAuthenticated(true);
          return;
        }

        router.replace("/admin/login");
      })
      .catch(() => {
        if (!cancelled) {
          router.replace("/admin/login");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLogin, pathname, router]);

  const activeKeys = useMemo(
    () =>
      ADMIN_ROUTES.filter((item) => pathname.includes(item.href))?.map(
        (item) => item.key,
      ),
    [pathname],
  );

  useEffect(() => {
    const title =
      ADMIN_ROUTES.find((r) =>
        r.key.includes(activeKeys[activeKeys.length - 1]),
      )?.label || "";
    setPageTitle(title);
  }, [activeKeys]);

  if (isLogin) {
    return children;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AntdMessageProvider>
      <Toaster position="top-center" richColors />
      <QueryClientProvider client={queryClient}>
        <StyleProvider layer>
          <Layout style={{ height: "100vh" }} hasSider>
            <Sider
              trigger={null}
              collapsible
              collapsed={collapsed}
              style={siderStyle}
              width={270}
            >
              <Box
                sx={{
                  px: 3,
                  pb: 3,
                  pt: 4,
                  bgcolor: "white",
                  marginRight: "-10px",
                  height: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  // borderBottom: '1px solid black'
                }}
              >
                <Image
                  src={Logo.src}
                  width={150}
                  preview={false}
                  onClick={() =>
                    (window.location.href = MAIN_PAGE)
                  }
                  className="hover:cursor-pointer"
                />
              </Box>
              <Menu
                className="custom-menu"
                theme="light"
                mode="inline"
                defaultSelectedKeys={["homepage"]}
                selectedKeys={activeKeys}
                items={
                  ADMIN_ROUTES.map((item) => ({
                    label: item.label,
                    key: item.key,
                    icon: <item.icon size={16} />,
                    onClick: () => router.push(item.href),
                  })) as any
                }
              />
            </Sider>
            <Layout className="min-h-screen overflow-auto">
              <Header
                style={{
                  padding: 0,
                  paddingRight: 30,
                  background: colorBgContainer,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Flex align="center">
                  <Button
                    type="text"
                    icon={
                      collapsed ? (
                        <MenuUnfoldOutlined />
                      ) : (
                        <MenuFoldOutlined />
                      )
                    }
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                      fontSize: "16px",
                      width: 64,
                      height: 64,
                    }}
                  />
                  <Title level={5} className="!mb-0">{pageTitle}</Title>
                </Flex>
                <AdminMenu />
              </Header>
              <Content
                style={{
                  padding: 24,
                  flex: 1, // ← chiếm hết phần còn lại
                  overflow: "auto", // ← chỉ Content tự scroll
                  minHeight: 0,
                  // background: colorBgContainer,
                  // borderRadius: borderRadiusLG,
                }}
              >
                {children}
              </Content>
            </Layout>
          </Layout>
        </StyleProvider>
      </QueryClientProvider>
    </AntdMessageProvider>
  );
}
