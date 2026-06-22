import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro, RichContent } from "@/components/PageSections";
import { getJobBySlug } from "@/lib/content";
import { buildMetadata, jobJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  return buildMetadata({
    title: job?.title ?? "Tuyển dụng",
    slug: `tuyen-dung/${slug}`,
    description: job?.workingAddress,
  });
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  return (
    <>
      <JsonLd data={jobJsonLd(job)} />
      <PageIntro label="Tuyển dụng" title={job.title} body={`${job.workingType} · ${job.workingAddress}`} />
      <Container maxWidth="xl" sx={{ pb: 10 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack gap={4}>
              <Typography color="text.secondary">Lương: {job.salary || "Trao đổi khi phỏng vấn"}</Typography>
              <RichContent html={job.description} />
              <RichContent html={job.requirements} />
              <RichContent html={job.benefits} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <ApplicationForm jobId={job._id} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
