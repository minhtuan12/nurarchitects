import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { notFound } from "next/navigation";
import { AppImage } from "@/components/AppImage";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro, RichContent } from "@/components/PageSections";
import { getProjectBySlug } from "@/lib/content";
import { buildMetadata, projectJsonLd } from "@/lib/seo";

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

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <JsonLd data={projectJsonLd(project)} />
      <PageIntro label="Dự án" title={project.name} body={project.shortDescription} />
      <Container maxWidth="xl" sx={{ pb: 10 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 7 }}>
            <AppImage alt={project.name} media={project.thumbnailId} fill aspectRatio="16 / 10" priority />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack gap={2}>
              <Typography color="text.secondary">Địa điểm: {project.address || "Đang cập nhật"}</Typography>
              <Typography color="text.secondary">Diện tích: {project.area ? `${project.area} m²` : "Đang cập nhật"}</Typography>
              <Typography color="text.secondary">Năm: {project.implementationYear || "Đang cập nhật"}</Typography>
              <RichContent html={project.description} />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
