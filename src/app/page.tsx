import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { JsonLd } from "@/components/JsonLd";
import { Hero, ListingGrid, RichContent } from "@/components/PageSections";
import { getContact, getHomepage, getPublishedNews, getPublishedProjects, getSeoBySlug } from "@/lib/content";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { SiteShell } from "@/components/SiteShell";

export async function generateMetadata() {
  const seo = await getSeoBySlug("homepage", "page");
  return buildMetadata({
    title: seo?.title ?? "Trang chủ",
    description:
      seo?.description ?? "NUR Architects creates calm, precise architecture and interiors for contemporary living.",
    canonicalUrl: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    focusKeywords: seo?.focusKeywords,
  });
}

export default async function HomePage() {
  const [homepage, projects, news, contact] = await Promise.all([
    getHomepage(),
    getPublishedProjects(3),
    getPublishedNews(3),
    getContact(),
  ]);

  return (
    <></>
    // <SiteShell>
    //   <JsonLd data={organizationJsonLd(contact ?? undefined)} />
    //   <Hero
    //     eyebrow="Architecture studio"
    //     title="NUR Architects"
    //     body="Không gian sống được cân nhắc từ cấu trúc, ánh sáng, vật liệu đến trải nghiệm sử dụng hằng ngày."
    //     image={homepage?.bannerMediaId}
    //   />
    //   <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
    //     <Grid container spacing={6}>
    //       <Grid size={{ xs: 12, md: 5 }}>
    //         <Typography variant="h2">Thiết kế có chiều sâu, thi công có kiểm soát.</Typography>
    //       </Grid>
    //       <Grid size={{ xs: 12, md: 7 }}>
    //         <RichContent html={homepage?.introduction || "NUR Architects phát triển các dự án nhà ở, biệt thự và không gian kinh doanh với cách tiếp cận rõ ràng, tiết chế và bền vững."} />
    //       </Grid>
    //     </Grid>
    //   </Container>
    //   <Stack gap={4}>
    //     <Typography component="h2" variant="h3" sx={{ px: { xs: 3, md: 6 } }}>Dự án nổi bật</Typography>
    //     <ListingGrid items={projects} basePath="/du-an" empty="Chưa có dự án được xuất bản." />
    //   </Stack>
    //   <Stack gap={4}>
    //     <Typography component="h2" variant="h3" sx={{ px: { xs: 3, md: 6 } }}>Góc nhìn mới</Typography>
    //     <ListingGrid items={news} basePath="/tin-tuc" empty="Chưa có bài viết được xuất bản." />
    //   </Stack>
    // </SiteShell>
  );
}
