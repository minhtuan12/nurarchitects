import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Link from "@/components/Link";
import theme from "@/theme";
import { SiteHeader } from "./SiteHeader";
import { fetchApi } from "@/helpers";
import { IContactConfig } from "@/types/contact";
import { FlyingContact } from "./FlyingContact";
import GoToTopBtn from "./GoToTopBtn";
import ConcreteBg from '@/assets/images/concrete-bg.jpg';
import SiteFooter from "./SiteFooter";

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
  const [contactRes] = await Promise.all([
    fetchApi<IContactConfig>("/api/contact"),
  ]);
  const contact = contactRes?.item ?? { phone: '0987654321' };

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* SiteHeader handles: HotlineBar + AppBar + scroll/route logic */}
        <SiteHeader phone={contact?.phone} />

        {!!contact?.phone && <FlyingContact phone={contact?.phone} />}

        <GoToTopBtn />

        <Box component="main">{children}</Box>

        <SiteFooter />
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
