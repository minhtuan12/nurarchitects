import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { RichContent } from "@/components/PageSections";
import { getProjectBySlug } from "@/lib/content";
import { buildMetadata, projectJsonLd } from "@/lib/seo";
import { Box, Divider } from "@mui/material";
import MediaRenderer from "@/components/MediaRenderer";
import { IMedia } from "@/types/media";
import { EBuildPlan } from "@/types/project";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return buildMetadata({
    title: project?.name ?? "Dự án",
    slug: `du-an/${slug}`,
    description: project?.shortDescription,
    ogImage: project?.thumbnailId?.secureUrl ?? project?.thumbnailId?.url,
  });
}

function InfoCell({ label, value }: { label: string; value?: string | null }) {
  return (
    <Stack spacing={0.5} alignItems="center" sx={{ textAlign: "center", px: 3, py: 4 }}>
      <Typography variant="body2" color="text.secondary" fontSize={14}>
        {label}:
      </Typography>
      <Typography variant="subtitle1" fontWeight={700} fontSize={14}>
        {value || "Đang cập nhật"}
      </Typography>
    </Stack>
  );
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <Box bgcolor='white'>
      <JsonLd data={projectJsonLd(project)} />

      <Box sx={{ mt: { xs: "-78px", md: "-115px" } }}>
        <Box position="relative" sx={{ height: { xs: "60vh", md: "98vh" } }}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "rgb(0 0 0 / 30%)",
              transition: "opacity 0.35s ease",
              zIndex: 10,
            }}
          />
          <MediaRenderer
            media={project.thumbnailId as IMedia}
            autoPlay
            controls={false}
            loop
            className="h-full"
            fill
            title="Các dự án tiêu biểu của Nurarchitects"
            priority
          />

          <Stack
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              textAlign: "center",
              px: { xs: 2, md: 4 },
              gap: 3,
              pb: 10,
            }}
          >
            <Typography
              sx={{ textTransform: "uppercase" }}
              color="#ffffffbe"
              fontSize={12}
              fontWeight={700}
            >
              Trang chủ / Dự án tiêu biểu
            </Typography>
            <Typography
              variant="h1"
              sx={{ textTransform: "uppercase" }}
              fontSize={{ xs: 27, md: 40 }}
              color="white"
            >
              {project.name}
            </Typography>
          </Stack>
        </Box>
      </Box>
      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <Grid container>
          <Grid size={{ xs: 12, sm: 4 }} sx={{
            borderBottom: { xs: "1px solid rgba(0, 0, 0, 0.12)", sm: 'none' },
          }}>
            <InfoCell label="Tổng diện tích" value={`${project.area} m²`} />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 4 }}
            sx={{
              borderLeft: { sm: "1px solid rgba(0, 0, 0, 0.12)" },
              borderRight: { sm: "1px solid rgba(0, 0, 0, 0.12)" },
              borderBottom: { xs: "1px solid rgba(0, 0, 0, 0.12)", sm: 'none' },
            }}
          >
            <InfoCell label="Mô hình" value={EBuildPlan[project?.category as keyof typeof EBuildPlan]?.label} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <InfoCell label="Địa điểm" value={project.address} />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        <RichContent html={project.description} className="text-[rgb(61,61,61)] text-[14px]" />
      </Container>
    </Box>
  );
}
