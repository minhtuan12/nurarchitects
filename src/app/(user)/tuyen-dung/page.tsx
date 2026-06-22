import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import { PageIntro } from "@/components/PageSections";
import { getRecruitingJobs } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tuyển dụng",
  slug: "tuyen-dung",
  description: "Các vị trí đang tuyển dụng tại NUR Architects.",
});

export default async function JobsPage() {
  const jobs = await getRecruitingJobs();
  return (
    <>
      <PageIntro label="Tuyển dụng" title="Cùng xây dựng những không gian có giá trị dài hạn." />
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Stack gap={2}>
          {jobs.length ? jobs.map((job) => (
            <Stack key={job._id ?? job.slug} component={Link} href={`/tuyen-dung/${job.slug}`} direction={{ xs: "column", md: "row" }} justifyContent="space-between" sx={{ py: 3, borderTop: "1px solid rgba(29,28,24,.12)" }}>
              <Typography variant="h5">{job.title}</Typography>
              <Typography color="text.secondary">{job.workingType} · {job.workingAddress}</Typography>
            </Stack>
          )) : <Typography color="text.secondary">Chưa có vị trí đang tuyển.</Typography>}
        </Stack>
      </Container>
    </>
  );
}
