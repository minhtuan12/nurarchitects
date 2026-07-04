import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography, { TypographyProps } from "@mui/material/Typography";
import { ArrowUpRight } from "lucide-react";
import { AppImage } from "@/components/AppImage";
import Link from "@/components/Link";
import type { IMedia } from "@/types/media";

export function Hero({
  eyebrow,
  title,
  body,
  image,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  image?: IMedia | null;
}) {
  return (
    <Box
      sx={{
        minHeight: { xs: "70svh", md: "calc(100svh - 82px)" },
        display: "grid",
        alignItems: "end",
        bgcolor: "primary.main",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, opacity: 0.42 }}>
        <AppImage alt={title} media={image} fill sizes="100vw" priority />
      </Box>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(29,28,24,.88) 0%, rgba(29,28,24,.48) 44%, rgba(29,28,24,.12) 100%)",
        }}
      />
      <Container maxWidth="xl" sx={{ position: "relative", py: { xs: 8, md: 12 } }}>
        <Stack maxWidth={760} gap={3}>
          {eyebrow ? (
            <Typography sx={{ color: "secondary.main", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {eyebrow}
            </Typography>
          ) : null}
          <Typography variant="h1" sx={{ fontSize: { xs: 48, md: 92 }, lineHeight: 0.92, letterSpacing: "-0.06em" }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 620, color: "rgba(255,255,255,.78)", lineHeight: 1.55 }}>
            {body}
          </Typography>
          <Button
            component={Link}
            href="/lien-he"
            variant="contained"
            color="secondary"
            endIcon={<ArrowUpRight size={18} />}
            sx={{ width: "fit-content", px: 2.25 }}
          >
            Bắt đầu trao đổi
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export function PageIntro({ label, title, body }: { label: string; title: string; body?: string }) {
  return (
    <Box
      sx={{
        borderBottom: "1px solid rgba(29,28,24,.08)",
        background:
          "linear-gradient(180deg, rgba(29,28,24,.03) 0%, rgba(29,28,24,0) 100%)",
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 } }}>
        <Grid container spacing={4} alignItems="end">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack gap={2} maxWidth={900}>
              <Typography
                color="secondary"
                fontWeight={700}
                sx={{ textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13 }}
              >
                {label}
              </Typography>
              <Typography
                variant="h1"
                sx={{ fontSize: { xs: 42, md: 72 }, lineHeight: 0.96, letterSpacing: "-0.05em" }}
              >
                {title}
              </Typography>
              {body ? (
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.7 }}>
                  {body}
                </Typography>
              ) : null}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.25,
                borderColor: "rgba(29,28,24,.12)",
                background: "rgba(255,255,255,.66)",
              }}
            >
              <Stack gap={1}>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.16em" }}>
                  Studio
                </Typography>
                <Typography fontWeight={700}>NUR Architects</Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Calm, precise architecture and interiors shaped by proportion, material, and daily use.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export function ListingGrid<T extends { _id?: string; slug: string; name?: string; title?: string; shortDescription?: string; thumbnailId?: IMedia }>(
  { items, basePath, empty }: { items: T[]; basePath: string; empty: string },
) {
  if (!items.length) {
    return (
      <Container maxWidth="xl" sx={{ pb: 10, pt: 2 }}>
        <Typography color="text.secondary">{empty}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ pb: { xs: 8, md: 12 }, pt: { xs: 4, md: 6 } }}>
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid key={item._id ?? item.slug} size={{ xs: 12, md: 6, lg: 4 }}>
            <Paper
              component={Link}
              href={`${basePath}/${item.slug}`}
              variant="outlined"
              sx={{
                display: "block",
                height: "100%",
                overflow: "hidden",
                borderColor: "rgba(29,28,24,.12)",
                background: "rgba(255,255,255,.76)",
                transition: "transform .24s ease, box-shadow .24s ease, border-color .24s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor: "rgba(29,28,24,.22)",
                  boxShadow: "0 28px 80px rgba(29,28,24,.12)",
                },
              }}
            >
              <Stack gap={0}>
                <Box sx={{ position: "relative" }}>
                  <AppImage alt={item.name ?? item.title ?? ""} media={item.thumbnailId} fill aspectRatio="4 / 3" />
                </Box>
                <Stack gap={1.25} sx={{ p: 2.4 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                    {item.name ?? item.title}
                  </Typography>
                  {item.shortDescription ? (
                    <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
                      {item.shortDescription}
                    </Typography>
                  ) : null}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      View detail
                    </Typography>
                    <ArrowUpRight size={18} />
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

interface RichContentProps extends TypographyProps {
  html?: string;
}

export function RichContent({ html, className, ...props }: RichContentProps) {
  if (!html) {
    return null;
  }
  const { sx, ...restProps } = props;
  return <Typography
    component="div"
    className={`max-w-none ${className ?? ""}`}
    sx={{
      textAlign: 'justify',
      // Headings
      "& h1": { fontSize: "2rem", fontWeight: 700, mb: 1.5, lineHeight: 1.3 },
      "& h2": { fontSize: "1.5rem", fontWeight: 700, mb: 1.5, lineHeight: 1.3 },
      "& h3": { fontSize: "1.25rem", fontWeight: 600, mb: 1, lineHeight: 1.4 },
      "& h4": { fontSize: "1.1rem", fontWeight: 600, mb: 1, lineHeight: 1.4 },
      "& h5": { fontSize: "1rem", fontWeight: 600, mb: 1 },
      "& h6": { fontSize: "0.9rem", fontWeight: 600, mb: 1 },

      // Paragraph
      "& p": { mb: 1.5, lineHeight: 1.8 },

      // Lists
      "& ul": { listStyle: "disc", pl: 3, mb: 1.5 },
      "& ol": { listStyle: "decimal", pl: 3, mb: 1.5 },
      "& li": { mb: 0.5, lineHeight: 1.8 },
      "& li > ul, & li > ol": { mt: 0.5, mb: 0 }, // nested list

      // Inline
      "& strong, & b": { fontWeight: 700 },
      "& em, & i": { fontStyle: "italic" },
      "& u": { textDecoration: "underline" },
      "& s, & del": { textDecoration: "line-through" },
      "& mark": { backgroundColor: "#fff176", px: 0.5 },
      "& code": {
        fontFamily: "monospace",
        fontSize: "0.875em",
        backgroundColor: "rgba(0,0,0,0.06)",
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
      },

      // Block
      "& pre": {
        backgroundColor: "#1e1e1e",
        color: "#fff",
        p: 2,
        borderRadius: 1,
        overflowX: "auto",
        mb: 1.5,
        "& code": { backgroundColor: "transparent", p: 0 },
      },
      "& blockquote": {
        borderLeft: "4px solid",
        borderColor: "primary.main",
        pl: 2,
        ml: 0,
        my: 2,
        fontStyle: "italic",
        color: "text.secondary",
      },
      "& hr": { my: 2, borderColor: "divider" },

      // Links
      "& a": {
        color: "black",
        textDecoration: "underline",
        "&:hover": { textDecoration: "none" },
      },

      // Media
      "& img": { maxWidth: "100%", height: "auto", borderRadius: 1, my: 1 },
      "& video": { maxWidth: "100%", height: "auto", my: 1 },
      "& iframe": { maxWidth: "100%", my: 1 },

      // Table
      "& table": { width: "100%", borderCollapse: "collapse", mb: 2 },
      "& th": {
        border: "1px solid",
        borderColor: "divider",
        p: 1,
        fontWeight: 700,
        backgroundColor: "action.hover",
        textAlign: "left",
      },
      "& td": { border: "1px solid", borderColor: "divider", p: 1 },

      // Misc
      "& sub": { verticalAlign: "sub", fontSize: "0.75em" },
      "& sup": { verticalAlign: "super", fontSize: "0.75em" },
      "& abbr": { cursor: "help", textDecoration: "underline dotted" },
      ...(sx || {}),
    }}
    dangerouslySetInnerHTML={{ __html: html }}
    {...restProps}
  />;
}
