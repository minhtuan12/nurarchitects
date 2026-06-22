import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppImage } from "@/components/AppImage";
import { PageIntro, RichContent } from "@/components/PageSections";
import { getCooperation } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Hợp tác",
  slug: "hop-tac",
  description: "Quy trình hợp tác thiết kế và thi công cùng NUR Architects.",
});

export default async function CooperationPage() {
  const data = await getCooperation();
  return (
    <>
      <PageIntro label="Hợp tác" title="Quy trình rõ ràng cho từng giai đoạn dự án." />
      <Container maxWidth="xl" sx={{ pb: 10 }}>
        <Stack gap={5}>
          <RichContent html={data?.introduction || "Chúng tôi làm việc theo từng bước có mục tiêu, đầu ra và trách nhiệm rõ ràng."} />
          <AppImage alt="Hợp tác với NUR Architects" media={data?.imageIds?.[0]} fill aspectRatio="16 / 7" />
          {(data?.steps ?? []).map((step: { order: number; name: string; description: string }) => (
            <Stack key={`${step.order}-${step.name}`} direction={{ xs: "column", md: "row" }} gap={4}>
              <Typography variant="h3" color="secondary">{String(step.order).padStart(2, "0")}</Typography>
              <Stack>
                <Typography variant="h4">{step.name}</Typography>
                <RichContent html={step.description} />
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Container>
    </>
  );
}
