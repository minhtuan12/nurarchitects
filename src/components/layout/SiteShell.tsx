import Box from "@mui/material/Box";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";
import { SiteHeader } from "./SiteHeader";
import { fetchApi } from "@/helpers";
import { IContactConfig } from "@/types/contact";
import { FlyingContact } from "./FlyingContact";
import GoToTopBtn from "./GoToTopBtn";
import SiteFooter from "./SiteFooter";
import { INewsCategory } from "@/types/shared";

const nav = [
  ["Về chúng tôi", "/gioi-thieu"],
  ["Lĩnh vực", "/linh-vuc"],
  ["Dự án", "/du-an"],
  ["Tin tức", "/tin-tuc"],
  ["Hợp tác", "/hop-tac"],
  ["Tuyển dụng", "/tuyen-dung"],
  ["Liên hệ", "/lien-he"],
] as const;

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [contactRes, newsCategoriesRes] = await Promise.all([
    fetchApi<IContactConfig>("/api/contact"),
    fetchApi<INewsCategory>("/api/news/categories"),
  ]);
  const contact = contactRes?.item ?? { phone: '0987654321' };
  const newsCategories = newsCategoriesRes?.items ?? [];

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
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* SiteHeader handles: HotlineBar + AppBar + scroll/route logic */}
        <SiteHeader phone={contact?.phone} nav={nav} />

        {!!contact?.phone && <FlyingContact phone={contact?.phone} />}

        <GoToTopBtn />

        <Box component="main">{children}</Box>

        <SiteFooter />
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
