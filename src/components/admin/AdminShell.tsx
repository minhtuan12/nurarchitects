"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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

const findActiveKeys = (routes: any[], pathname: string): string[] => {
  for (const route of routes) {
    if (route.href === pathname) {
      return [route.key];
    }

    if (route.children?.length) {
      const childKeys = findActiveKeys(route.children, pathname);

      if (childKeys.length) {
        return [route.key, ...childKeys];
      }
    }
  }

  return [];
};

const findRouteByKey = (routes: any[], key: string): any => {
  for (const route of routes) {
    if (route.key === key) {
      return route;
    }

    if (route.children?.length) {
      const found = findRouteByKey(route.children, key);

      if (found) {
        return found;
      }
    }
  }

  return null;
};

const MAIN_PAGE = process.env.NEXT_PUBLIC_SITE_URL!;

const queryClient = new QueryClient();

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [pageTitle, setPageTitle] = useAtom(pageTitleAtom);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const renderMenuItems = useCallback((items: any) => {
    return items.map((item: any) => ({
      label: item.label,
      key: item.key,
      icon: <item.icon size={16} />,
      ...(!item.children && {
        onClick: () => router.push(item.href),
      }),
      ...(item.children?.length && {
        children: renderMenuItems(item.children),
      }),
    }));
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/auth/session", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((response) => {
        if (cancelled) return;

        if (response.ok) {
          setIsAuthenticated(true);
          if (isLogin) {
            // đã login rồi mà vẫn vào /admin/login → đẩy về trang chính
            router.replace("/admin/homepage");
          }
        } else {
          setIsAuthenticated(false);
          if (!isLogin) {
            router.replace("/admin/login");
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAuthenticated(false);
          if (!isLogin) {
            router.replace("/admin/login");
          }
        }
      }).finally(() => {
        if (!cancelled) setCheckingAuth(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLogin, pathname, router]);

  const activeKeys = useMemo(
    () => findActiveKeys(ADMIN_ROUTES, pathname),
    [pathname],
  );

  useEffect(() => {
    const currentKey = activeKeys[activeKeys.length - 1];

    const currentRoute = findRouteByKey(
      ADMIN_ROUTES,
      currentKey
    );

    setPageTitle(currentRoute?.label || "");
  }, [activeKeys]);

  const openKeys = useMemo(
    () => activeKeys.slice(0, -1),
    [activeKeys]
  );

  // Đang check session → chưa render gì để tránh nhấp nháy UI
  if (checkingAuth) {
    return null;
  }

  // Trang login: chỉ hiển thị nếu CHƯA đăng nhập
  if (isLogin) {
    return isAuthenticated ? null : children;
  }

  // Các trang khác: chỉ hiển thị nếu ĐÃ đăng nhập
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
                defaultOpenKeys={openKeys}
                items={renderMenuItems(ADMIN_ROUTES)}
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
