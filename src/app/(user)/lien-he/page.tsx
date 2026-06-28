import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
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
  const primaryLocation = contact?.locations?.[0];

  return (
    <>
      <JsonLd data={organizationJsonLd(contact ?? undefined)} />
      <PageIntro label="Liên hệ" title="Trao đổi về công trình của bạn." />
      <Container maxWidth="xl" sx={{ pb: { xs: 8, md: 12 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack gap={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderColor: "rgba(29,28,24,.12)",
                  background: "rgba(255,255,255,.78)",
                }}
              >
                <Stack gap={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: "0.16em" }}
                  >
                    Studio contact
                  </Typography>
                  <Stack gap={1.25}>
                    <Stack gap={0.25}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {contact?.phone || "Số điện thoại đang cập nhật"}
                      </Typography>
                    </Stack>
                    <Divider sx={{ borderColor: "rgba(29,28,24,.08)" }} />
                    <Stack gap={0.25}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {contact?.email || "Email đang cập nhật"}
                      </Typography>
                    </Stack>
                    <Divider sx={{ borderColor: "rgba(29,28,24,.08)" }} />
                    <Stack gap={0.25}>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography color="text.secondary">
                        {contact?.addresses || "Địa chỉ đang cập nhật"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              {primaryLocation ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderColor: "rgba(29,28,24,.12)",
                    background: "rgba(255,255,255,.72)",
                  }}
                >
                  <Stack gap={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", letterSpacing: "0.16em" }}
                    >
                      Primary location
                    </Typography>
                    <Typography fontWeight={700}>{primaryLocation.name || "Studio by appointment"}</Typography>
                    <Typography color="text.secondary">{primaryLocation.address}</Typography>
                  </Stack>
                </Paper>
              ) : null}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderColor: "rgba(29,28,24,.12)",
                background: "rgba(255,255,255,.78)",
              }}
            >
              <ContactForm />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
