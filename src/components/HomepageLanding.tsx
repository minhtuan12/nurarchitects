import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Mail,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { AppImage } from "@/components/AppImage";
import { RichContent } from "@/components/PageSections";
import Link from "@/components/Link";
import { EBuildPlan } from "@/types/project";
import type { MediaLike } from "@/types/media";

export type HomepageMedia = MediaLike & {
  _id?: string;
};

export type ProjectCard = {
  _id?: string;
  slug: string;
  name: string;
  shortDescription?: string;
  address?: string;
  category?: string;
  implementationYear?: number;
  thumbnailId?: MediaLike;
  isFeatured?: boolean;
};

export type NewsCard = {
  _id?: string;
  slug: string;
  title: string;
  shortDescription?: string;
  createdAt?: string;
  thumbnailId?: MediaLike;
};

export type HomepageConfig = {
  bannerMediaId?: MediaLike | null;
  introductionTitle?: string;
  introductionContent?: string;
  contactCtaContent?: string;
  featuredProjectIds?: ProjectCard[];
  mediaIds?: HomepageMedia[];
};

export type ContactConfig = {
  phone?: string;
  email?: string;
  locations?: Array<{ name?: string; address?: string }>;
  otherSocials?: Array<{ name?: string; url?: string }>;
};

type HomepageLandingProps = {
  homepage: HomepageConfig | null;
  projects: ProjectCard[];
  news: NewsCard[];
  contact: ContactConfig | null;
};

const projectCategoryLabels: Record<string, string> = Object.fromEntries(
  Object.values(EBuildPlan).map((plan) => [plan.value, plan.label]),
);

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <Stack gap={1.5} maxWidth={860}>
      <Typography
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          color: "secondary.main",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        <Sparkles size={14} />
        {eyebrow}
      </Typography>
      <Typography
        variant="h2"
        sx={{ fontSize: { xs: 34, md: 60 }, lineHeight: 0.94, letterSpacing: "-0.05em" }}
      >
        {title}
      </Typography>
      {body ? (
        <Typography variant="h6" sx={{ maxWidth: 780, color: "text.secondary", lineHeight: 1.7 }}>
          {body}
        </Typography>
      ) : null}
    </Stack>
  );
}

function StatPill({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2,
        py: 1.5,
        borderColor: "rgba(29,28,24,.12)",
        background: "rgba(255,255,255,.7)",
        boxShadow: "none",
      }}
    >
      <Stack gap={0.5}>
        <Typography variant="h5" fontWeight={700} lineHeight={1}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
    </Paper>
  );
}

function ProjectCardView({
  project,
  href,
  featured = false,
}: {
  project: ProjectCard;
  href: string;
  featured?: boolean;
}) {
  const categoryLabel = project.category ? projectCategoryLabels[project.category] ?? project.category : "Selected work";

  return (
    <Paper
      component={Link}
      href={href}
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
          <AppImage
            alt={project.name}
            media={project.thumbnailId}
            fill
            aspectRatio={featured ? "16 / 10" : "4 / 3"}
            sizes="(max-width: 900px) 100vw, 50vw"
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(16,14,10,0) 30%, rgba(16,14,10,.52) 100%)",
            }}
          />
          <Stack
            direction="row"
            gap={1}
            sx={{ position: "absolute", top: 16, left: 16, right: 16, justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <Chip
              label={categoryLabel}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,.88)",
                color: "primary.main",
                fontWeight: 700,
                backdropFilter: "blur(12px)",
              }}
            />
          </Stack>
        </Box>
        <Stack gap={1.4} sx={{ p: 2.4 }}>
          <Stack gap={0.5}>
            <Typography variant="h5" sx={{ fontSize: featured ? { xs: 24, md: 30 } : 20, lineHeight: 1.08 }} fontWeight={700}>
              {project.name}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
              {project.shortDescription || "An architecture-led space shaped by light, material, and proportion."}
            </Typography>
          </Stack>
          <Divider />
          <Stack direction="row" gap={1.5} flexWrap="wrap">
            {project.address ? (
              <Chip icon={<MapPin size={14} />} label={project.address} variant="outlined" />
            ) : null}
            {project.implementationYear ? (
              <Chip icon={<CalendarDays size={14} />} label={`${project.implementationYear}`} variant="outlined" />
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

function NewsCardView({ item }: { item: NewsCard }) {
  return (
    <Paper
      component={Link}
      href={`/tin-tuc/${item.slug}`}
      variant="outlined"
      sx={{
        height: "100%",
        overflow: "hidden",
        borderColor: "rgba(29,28,24,.12)",
        background: "rgba(255,255,255,.76)",
        transition: "transform .24s ease, box-shadow .24s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 24px 70px rgba(29,28,24,.1)",
        },
      }}
    >
      <Stack gap={0}>
        <Box sx={{ position: "relative" }}>
          <AppImage
            alt={item.title}
            media={item.thumbnailId}
            fill
            aspectRatio="16 / 11"
            sizes="(max-width: 900px) 100vw, 33vw"
          />
        </Box>
        <Stack gap={1.25} sx={{ p: 2.4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {item.title}
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
            {item.shortDescription || "A short note from the studio on process, material, and place."}
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              {formatDate(item.createdAt)}
            </Typography>
            <ArrowUpRight size={18} />
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const content = (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: "rgba(29,28,24,.12)",
        background: "rgba(255,255,255,.74)",
        height: "100%",
      }}
    >
      <Stack direction="row" gap={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(138,111,67,.12)",
            color: "secondary.main",
            flex: "0 0 auto",
          }}
        >
          {icon}
        </Box>
        <Stack gap={0.5}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography fontWeight={700} sx={{ lineHeight: 1.45 }}>
            {value}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );

  if (!href) return content;

  return (
    <Box component={Link} href={href} sx={{ display: "block", height: "100%" }}>
      {content}
    </Box>
  );
}

export function HomepageLanding({ homepage, projects, news, contact }: HomepageLandingProps) {
  const featuredProjects = homepage?.featuredProjectIds?.length ? homepage.featuredProjectIds : projects.slice(0, 3);
  const leadProject = featuredProjects[0] ?? projects[0];
  const secondaryProjects = featuredProjects.slice(1, 3);
  const galleryMedia = [homepage?.bannerMediaId, ...(homepage?.mediaIds ?? [])].filter(Boolean) as MediaLike[];
  const introBody =
    homepage?.introductionContent ||
    "NUR Architects develops calm and precise homes, villas, and working spaces with a focus on proportion, material, and everyday use.";
  const introTitle = homepage?.introductionTitle || "Design that stays disciplined from concept to construction.";
  const ctaLabel = homepage?.contactCtaContent || "Discuss a project";
  const contactLocation = contact?.locations?.[0];
  const phoneHref = contact?.phone ? `tel:${contact.phone.replace(/\s+/g, "")}` : undefined;
  const emailHref = contact?.email ? `mailto:${contact.email}` : undefined;

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "clip",
        background: 'black',
        top: -115,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(138,111,67,.12) 0, rgba(138,111,67,0) 35%), radial-gradient(circle at 85% 10%, rgba(29,28,24,.08) 0, rgba(29,28,24,0) 32%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", py: { xs: 6, md: 30 } }}>
        <Grid container spacing={4} alignItems="stretch">
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack
              gap={3}
              sx={{
                minHeight: { xs: "auto", lg: "calc(100svh - 190px)" },
                justifyContent: "space-between",
              }}
            >
              <Stack gap={2.5} maxWidth={760}>
                <Chip
                  label="Architecture studio"
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: "rgba(255,255,255,.84)",
                    borderColor: "rgba(29,28,24,.12)",
                    border: "1px solid",
                    fontWeight: 700,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: 52, sm: 68, md: 88 },
                    lineHeight: 0.92,
                    letterSpacing: "-0.06em",
                    maxWidth: 720,
                  }}
                >
                  NUR Architects
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    maxWidth: 640,
                    color: "text.secondary",
                    lineHeight: 1.55,
                    fontWeight: 400,
                  }}
                >
                  {introTitle}
                </Typography>
                <Box sx={{ maxWidth: 700 }}>
                  <RichContent html={introBody} />
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                  <Button
                    component={Link}
                    href="/du-an"
                    variant="contained"
                    endIcon={<ArrowUpRight size={18} />}
                    sx={{ px: 2.5, py: 1.4 }}
                  >
                    View projects
                  </Button>
                  <Button
                    component={Link}
                    href="/lien-he"
                    variant="outlined"
                    sx={{ px: 2.5, py: 1.4, borderColor: "rgba(29,28,24,.18)" }}
                  >
                    Get in touch
                  </Button>
                </Stack>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} flexWrap="wrap">
                <StatPill value={String(featuredProjects.length || projects.length || 0).padStart(2, "0")} label="Featured works" />
                <StatPill value={String(news.length || 0).padStart(2, "0")} label="Published notes" />
                <StatPill value={contact?.locations?.length ? String(contact.locations.length).padStart(2, "0") : "01"} label="Studio locations" />
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper
              variant="outlined"
              sx={{
                height: "100%",
                overflow: "hidden",
                borderColor: "rgba(29,28,24,.12)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.84) 0%, rgba(247,245,239,.94) 100%)",
                boxShadow: "0 30px 120px rgba(29,28,24,.08)",
              }}
            >
              <Stack gap={2} sx={{ p: { xs: 2, md: 2.5 }, height: "100%" }}>
                <Box sx={{ position: "relative", flex: "1 1 auto", minHeight: { xs: 320, md: 420 } }}>
                  <AppImage
                    alt={homepage?.bannerMediaId?.alt || "NUR Architects banner"}
                    media={homepage?.bannerMediaId}
                    fill
                    aspectRatio="4 / 5"
                    sizes="(max-width: 900px) 100vw, 38vw"
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(16,14,10,0) 32%, rgba(16,14,10,.56) 100%)",
                    }}
                  />
                  <Stack
                    gap={1}
                    sx={{ position: "absolute", left: 18, right: 18, bottom: 18, color: "#fff" }}
                  >
                    <Chip
                      label={leadProject ? "Featured project" : "Studio overview"}
                      size="small"
                      sx={{
                        alignSelf: "flex-start",
                        bgcolor: "rgba(255,255,255,.18)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,.2)",
                        backdropFilter: "blur(12px)",
                      }}
                    />
                    <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                      {leadProject?.name || "Selected architecture with a clear material story."}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,.8)", maxWidth: 420, lineHeight: 1.6 }}>
                      {leadProject?.shortDescription || "The homepage highlights the studio's current work, recent writing, and a direct path to contact."}
                    </Typography>
                  </Stack>
                </Box>

                {galleryMedia.length ? (
                  <Grid container spacing={1.2}>
                    {galleryMedia.slice(0, 3).map((media, index) => (
                      <Grid key={media._id ?? media.publicId ?? index} size={{ xs: 4 }}>
                        <Box
                          sx={{
                            position: "relative",
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid rgba(29,28,24,.08)",
                          }}
                        >
                          <AppImage
                            alt={media.alt || `Gallery image ${index + 1}`}
                            media={media}
                            fill
                            aspectRatio="1 / 1"
                            sizes="20vw"
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : null}

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderColor: "rgba(29,28,24,.12)",
                    background: "rgba(255,255,255,.74)",
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} gap={2} justifyContent="space-between">
                    <Stack gap={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Current focus
                      </Typography>
                      <Typography fontWeight={700}>{homepage?.contactCtaContent || ctaLabel}</Typography>
                    </Stack>
                    {leadProject ? (
                      <Button component={Link} href={`/du-an/${leadProject.slug}`} endIcon={<ArrowUpRight size={18} />}>
                        Open work
                      </Button>
                    ) : null}
                  </Stack>
                </Paper>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="xl" sx={{ pb: { xs: 6, md: 10 } }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderColor: "rgba(29,28,24,.12)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,.92) 0%, rgba(247,245,239,.8) 100%)",
          }}
        >
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h4" sx={{ mb: 1.5, fontSize: { xs: 28, md: 40 }, lineHeight: 1.05 }}>
                {introTitle}
              </Typography>
              <RichContent html={introBody} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack gap={1.5}>
                <ContactCard
                  icon={<PhoneCall size={18} />}
                  title="Phone"
                  value={contact?.phone || "Not published"}
                  href={phoneHref}
                />
                <ContactCard
                  icon={<Mail size={18} />}
                  title="Email"
                  value={contact?.email || "Not published"}
                  href={emailHref}
                />
                <ContactCard
                  icon={<MapPin size={18} />}
                  title="Office"
                  value={contactLocation?.name || contactLocation?.address || "Studio by appointment"}
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Container maxWidth="xl" sx={{ pb: { xs: 8, md: 12 } }}>
        <Stack gap={3.5}>
          <SectionHeading
            eyebrow="Selected work"
            title="Projects arranged to read like a small editorial archive."
            body="The homepage presents the strongest published projects first, then gives the visitor a clear path into the full archive."
          />
          {leadProject ? (
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <ProjectCardView project={leadProject} href={`/du-an/${leadProject.slug}`} featured />
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Stack gap={2.5}>
                  {secondaryProjects.length ? (
                    secondaryProjects.map((project) => (
                      <ProjectCardView key={project._id ?? project.slug} project={project} href={`/du-an/${project.slug}`} />
                    ))
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        minHeight: 260,
                        display: "grid",
                        placeItems: "center",
                        borderColor: "rgba(29,28,24,.12)",
                        background: "rgba(255,255,255,.74)",
                      }}
                    >
                      <Typography color="text.secondary">No additional featured projects yet.</Typography>
                    </Paper>
                  )}
                </Stack>
              </Grid>
            </Grid>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                borderColor: "rgba(29,28,24,.12)",
                background: "rgba(255,255,255,.74)",
              }}
            >
              <Typography color="text.secondary">No projects have been published yet.</Typography>
            </Paper>
          )}
        </Stack>
      </Container>

      <Container maxWidth="xl" sx={{ pb: { xs: 8, md: 12 } }}>
        <Stack gap={3.5}>
          <SectionHeading
            eyebrow="Studio notes"
            title="Recent writing and updates from the studio."
            body="A light editorial grid keeps the news visible without competing with the project showcase."
          />
          <Grid container spacing={2.5}>
            {(news.length ? news : []).slice(0, 3).map((item) => (
              <Grid key={item._id ?? item.slug} size={{ xs: 12, md: 4 }}>
                <NewsCardView item={item} />
              </Grid>
            ))}
            {!news.length ? (
              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    borderColor: "rgba(29,28,24,.12)",
                    background: "rgba(255,255,255,.74)",
                  }}
                >
                  <Typography color="text.secondary">No published articles yet.</Typography>
                </Paper>
              </Grid>
            ) : null}
          </Grid>
        </Stack>
      </Container>

      <Container maxWidth="xl" sx={{ pb: { xs: 8, md: 12 } }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 4.5 },
            borderColor: "rgba(29,28,24,.12)",
            background:
              "linear-gradient(135deg, rgba(29,28,24,.96) 0%, rgba(52,47,39,.96) 100%)",
            color: "#f7f5ef",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, lg: 7 }}>
              <Stack gap={1.5} maxWidth={760}>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,.68)",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  Contact
                </Typography>
                <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 56 }, lineHeight: 0.98 }}>
                  Start the next project with a clear brief.
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,.76)", maxWidth: 720, lineHeight: 1.75 }}>
                  {homepage?.contactCtaContent ||
                    "Share the site, budget, and timeframe. We will respond with a concise next step and the right people on the studio side."}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack gap={1.5}>
                <Button
                  component={Link}
                  href="/lien-he"
                  variant="contained"
                  color="secondary"
                  endIcon={<ArrowUpRight size={18} />}
                  sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, px: 2.5, py: 1.4 }}
                >
                  Contact us
                </Button>
                <Typography sx={{ color: "rgba(255,255,255,.76)" }}>
                  {contact?.phone ? `P: ${contact.phone}` : "Phone not published"}
                  {contact?.email ? `  •  E: ${contact.email}` : ""}
                </Typography>
                {contactLocation ? (
                  <Typography sx={{ color: "rgba(255,255,255,.76)" }}>
                    {contactLocation.name ? `${contactLocation.name} - ` : ""}
                    {contactLocation.address}
                  </Typography>
                ) : null}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
