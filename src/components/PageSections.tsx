import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowUpRight } from "lucide-react";
import { AppImage } from "@/components/AppImage";
import Link from "@/components/Link";
import type { MediaLike } from "@/types/media";

export function Hero({
  eyebrow,
  title,
  body,
  image,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  image?: MediaLike | null;
}) {
  return (
    <Box sx={{ minHeight: { xs: "70svh", md: "calc(100svh - 76px)" }, display: "grid", alignItems: "end", bgcolor: "primary.main", color: "#fff" }}>
      <Box sx={{ position: "absolute", inset: 0, opacity: 0.48 }}>
        <AppImage alt={title} media={image} fill sizes="100vw" priority />
      </Box>
      <Container maxWidth="xl" sx={{ position: "relative", py: { xs: 8, md: 12 } }}>
        <Stack maxWidth={760} gap={3}>
          {eyebrow ? <Typography sx={{ color: "secondary.main", fontWeight: 700 }}>{eyebrow}</Typography> : null}
          <Typography variant="h1" sx={{ fontSize: { xs: 48, md: 92 }, lineHeight: 0.95 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 620, color: "rgba(255,255,255,.78)" }}>
            {body}
          </Typography>
          <Button component={Link} href="/lien-he" variant="contained" color="secondary" endIcon={<ArrowUpRight size={18} />} sx={{ width: "fit-content" }}>
            Bắt đầu trao đổi
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export function PageIntro({ label, title, body }: { label: string; title: string; body?: string }) {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 7, md: 10 } }}>
      <Stack gap={2} maxWidth={880}>
        <Typography color="secondary" fontWeight={700}>{label}</Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: 42, md: 72 }, lineHeight: 1 }}>{title}</Typography>
        {body ? <Typography variant="h6" color="text.secondary">{body}</Typography> : null}
      </Stack>
    </Container>
  );
}

export function ListingGrid<T extends { _id?: string; slug: string; name?: string; title?: string; shortDescription?: string; thumbnailId?: MediaLike }>(
  { items, basePath, empty }: { items: T[]; basePath: string; empty: string },
) {
  if (!items.length) {
    return (
      <Container maxWidth="xl" sx={{ pb: 10 }}>
        <Typography color="text.secondary">{empty}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ pb: 10 }}>
      <Grid container spacing={4}>
        {items.map((item) => (
          <Grid key={item._id ?? item.slug} size={{ xs: 12, md: 6, lg: 4 }}>
            <Stack component={Link} href={`${basePath}/${item.slug}`} gap={2}>
              <AppImage alt={item.name ?? item.title ?? ""} media={item.thumbnailId} fill />
              <Typography variant="h5" fontWeight={700}>{item.name ?? item.title}</Typography>
              <Typography color="text.secondary">{item.shortDescription}</Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export function RichContent({ html }: { html?: string }) {
  if (!html) {
    return null;
  }
  return <Box className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />;
}
