import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro } from "@/components/PageSections";
import { getContact } from "@/lib/content";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Liên hệ",
  slug: "lien-he",
  description: "Liên hệ NUR Architects để trao đổi nhu cầu thiết kế và thi công.",
});

export default async function ContactPage() {
  const contact = await getContact();
  return (
    <>
      <JsonLd data={organizationJsonLd(contact ?? undefined)} />
      <PageIntro label="Liên hệ" title="Trao đổi về công trình của bạn." />
      <Container maxWidth="xl" sx={{ pb: 10 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack gap={2}>
              <Typography variant="h5">{contact?.phone || "Số điện thoại đang cập nhật"}</Typography>
              <Typography variant="h5">{contact?.email || "Email đang cập nhật"}</Typography>
              <Typography color="text.secondary">{contact?.addresses || "Địa chỉ đang cập nhật"}</Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <ContactForm />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
