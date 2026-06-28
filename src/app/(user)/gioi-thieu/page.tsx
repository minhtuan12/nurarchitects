import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppImage } from "@/components/AppImage";
import { PageIntro, RichContent } from "@/components/PageSections";
import { getIntroduction, getSeoBySlug } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Box } from "@mui/material";
import Developing from "@/components/admin/Developing";

export async function generateMetadata() {
  const seo = await getSeoBySlug("gioi-thieu", "page");
  return buildMetadata({
    title: seo?.title ?? "Giới thiệu",
    slug: "gioi-thieu",
    description: seo?.description ?? "Tìm hiểu triết lý, tầm nhìn, sứ mệnh và giá trị cốt lõi của NUR Architects.",
    canonicalUrl: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    focusKeywords: seo?.focusKeywords,
  });
}

export default async function IntroductionPage() {
  const data = await getIntroduction();
  const firstImage = data?.imageIds?.[0];

  return (
    <Box sx={{ py: 20 }}>
      <Developing />
    </Box>
  );
}
