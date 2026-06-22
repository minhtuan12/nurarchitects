import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { ArrowUpRight } from "lucide-react";
import Link from "@/components/Link";
import theme from "@/theme";

const nav = [
  ["Giới thiệu", "/gioi-thieu"],
  ["Dự án", "/du-an"],
  ["Tin tức", "/tin-tuc"],
  ["Hợp tác", "/hop-tac"],
  ["Tuyển dụng", "/tuyen-dung"],
  ["Liên hệ", "/lien-he"],
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(29,28,24,.1)" }}>
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ gap: 3, minHeight: 76 }}>
              <Typography component={Link} href="/" variant="h6" sx={{ fontWeight: 700, mr: "auto" }}>
                NUR Architects
              </Typography>
              <Stack direction="row" gap={1} sx={{ display: { xs: "none", md: "flex" } }}>
                {nav.map(([label, href]) => (
                  <Button key={href} component={Link} href={href} color="inherit">
                    {label}
                  </Button>
                ))}
              </Stack>
              <Button component={Link} href="/lien-he" variant="contained" endIcon={<ArrowUpRight size={18} />}>
                Tư vấn
              </Button>
            </Toolbar>
          </Container>
        </AppBar>
        <Box component="main">{children}</Box>
        <Box component="footer" sx={{ py: 6, borderTop: "1px solid rgba(29,28,24,.1)" }}>
          <Container maxWidth="xl">
            <Stack direction={{ xs: "column", md: "row" }} gap={2} justifyContent="space-between">
              <Typography variant="h6" fontWeight={700}>NUR Architects</Typography>
              <Typography color="text.secondary">Architecture, interiors, and considered built environments.</Typography>
            </Stack>
          </Container>
        </Box>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
