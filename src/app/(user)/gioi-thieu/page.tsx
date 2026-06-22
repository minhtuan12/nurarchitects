import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppImage } from "@/components/AppImage";
import { PageIntro, RichContent } from "@/components/PageSections";
import { getIntroduction } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Giới thiệu",
  slug: "gioi-thieu",
  description: "Tìm hiểu triết lý, tầm nhìn, sứ mệnh và giá trị cốt lõi của NUR Architects.",
});

export default async function IntroductionPage() {
  const data = await getIntroduction();
  const firstImage = data?.imageIds?.[0];

  return (
    <>
      <PageIntro label="Giới thiệu" title="Một studio kiến trúc tập trung vào đời sống thực." />
      <Container maxWidth="xl" sx={{ pb: 10 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AppImage alt="NUR Architects studio" media={firstImage} fill aspectRatio="3 / 4" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={4}>
              <RichContent html={data?.content || "Chúng tôi thiết kế các công trình có ngôn ngữ rõ ràng, vận hành tốt và giữ được giá trị theo thời gian."} />
              {[
                ["Lịch sử", data?.history],
                ["Tầm nhìn", data?.vision],
                ["Sứ mệnh", data?.mission],
                ["Giá trị cốt lõi", data?.coreValues],
                ["Thành tựu", data?.achievements],
              ].map(([label, items]) => (
                <Stack key={label as string} gap={1}>
                  <Typography variant="h5" fontWeight={700}>{label as string}</Typography>
                  {(items as Array<{ name: string; description: string }> | undefined)?.map((item) => (
                    <RichContent key={item.name} html={`<strong>${item.name}</strong><br/>${item.description}`} />
                  ))}
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
