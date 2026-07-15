import Box from "@mui/material/Box";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { cookies } from "next/headers";
import { SiteHeader } from "./SiteHeader";
import { fetchApi } from "@/helpers";
import { IContactConfig } from "@/types/contact";
import { FlyingContact } from "./FlyingContact";
import GoToTopBtn from "./GoToTopBtn";
import SiteFooter from "./SiteFooter";
import { defaultSiteSettings, INewsCategory, SiteSettings } from "@/types/shared";
import { GlobalStyles } from "@mui/material";
import ThemeProvider from "./ThemeProvider";

const PREVIEW_COOKIE_NAME = "preview-theme";

export async function SiteShell({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const [contactRes, newsCategoriesRes, settingsRes] = await Promise.all([
    fetchApi<IContactConfig>("/api/contact"),
    fetchApi<INewsCategory>("/api/news/categories"),
    fetchApi<SiteSettings>("/api/settings"),
  ]);
  const contact = contactRes?.item ?? { phone: "0987654321" };
  const newsCategories = newsCategoriesRes?.items ?? [];

  const dbSettings = settingsRes?.item ?? defaultSiteSettings;

  // ── Đọc cookie preview ──────────────────────────────────────────────────
  // Lưu ý: Layout của Next.js KHÔNG bao giờ nhận được `searchParams`,
  // nên preview chỉ có thể "sống sót" qua các route khác nhau bằng cookie
  // (do middleware ghi vào khi phát hiện ?preview=1), không phải qua query string.
  const cookieStore = await cookies();
  const rawPreview = cookieStore.get(PREVIEW_COOKIE_NAME)?.value;

  let previewFromCookie: Partial<SiteSettings> = {};
  if (rawPreview) {
    try {
      previewFromCookie = JSON.parse(rawPreview);
    } catch {
      previewFromCookie = {};
    }
  }

  // ── Merge: db < cookie preview < searchParams (nếu Page truyền vào) ─────
  const searchParamsOverride =
    searchParams &&
    Object.fromEntries(
      Object.entries(searchParams).filter(
        ([, v]) => typeof v === "string"
      ) as [string, string][]
    );

  const settings: SiteSettings = {
    ...dbSettings,
    ...previewFromCookie,
    ...searchParamsOverride,
  };

  const nav = [
    { label: "Trang chủ", href: "/" },
    { label: "Về chúng tôi", href: "/gioi-thieu" },
    { label: "Lĩnh vực", href: "/linh-vuc" },
    { label: "Dự án", href: "/du-an" },
    {
      label: "Tin tức",
      href: "/tin-tuc",
      children: newsCategories.map((cat) => ({
        label: cat.name,
        href: `/tin-tuc/${cat.slug}`,
      })),
    },
    { label: "Hợp tác", href: "/hop-tac" },
    { label: "Tuyển dụng", href: "/tuyen-dung" },
  ];

  return (
    <AppRouterCacheProvider>
      <ThemeProvider settings={settings}>
        <CssBaseline />

        <GlobalStyles
          styles={{
            ":root": {
              "--color-header-bg": settings.headerBackgroundColor || "transparent",
              "--color-header-text": settings.textColor,
              "--color-footer-bg": settings.footerBackgroundColor,
              "--color-footer-text": settings.footerTextColor,
            },
          }}
        />

        {/* SiteHeader handles: HotlineBar + AppBar + scroll/route logic */}
        <SiteHeader phone={contact?.phone} nav={nav} contact={contact as IContactConfig} />

        {!!contact?.phone && <FlyingContact phone={contact?.phone} />}

        <GoToTopBtn />

        <Box component="main">{children}</Box>

        <SiteFooter />
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
