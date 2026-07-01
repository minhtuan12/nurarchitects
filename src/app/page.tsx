import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/layout/SiteShell";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { getSeoBySlug } from "@/lib/content";
import { fetchApi } from "@/helpers";
import MediaRenderer from "@/components/MediaRenderer";
import { IMedia } from "@/types/media";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import Image from "next/image";
import BgPattern from "@/assets/images/bg-pattern.jpg";
import Button from "@/components/Button";
import { RichContent } from "@/components/PageSections";
import ActivitiesSection from "@/components/homepage/ActivitiesSection";
import { IHomepageConfigPopulated } from "@/types/home";
import { IActivityPopulated } from "@/types/activity";
import ProjectsSection from "@/components/homepage/ProjectsSection";
import { IProjectPopulated } from "@/types/project";
import { INewsPopulated } from "@/types/news";
import { IContactConfigPopulated } from "@/types/contact";
import ContactCTASection from "@/components/ContactCTASection";
import NewsSection from "@/components/homepage/NewsSection";
import IntroductionImage from '@/assets/images/introduction.webp';
import { GridFadeIn } from "@/components/base/Grid";

export async function generateMetadata() {
  const seo = await getSeoBySlug("homepage", "page");
  return buildMetadata({
    title: seo?.title ?? "Trang chủ",
    description:
      seo?.description ??
      "NUR Architects creates calm, precise architecture and interiors for contemporary living.",
    canonicalUrl: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    focusKeywords: seo?.focusKeywords,
  });
}

export default async function HomePage() {
  const [homepageRes, newsRes] = await Promise.all([
    fetchApi<IHomepageConfigPopulated>("/api/homepage"),
    fetchApi<INewsPopulated>("/api/news"),
  ]);

  const homepage = homepageRes?.item ?? null;
  const news = newsRes?.items ?? [];

  return (
    <SiteShell>
      <Box sx={{ mt: "-115px" }}>
        <Box sx={{ height: "100vh" }}>
          <MediaRenderer
            media={homepage?.bannerId as IMedia}
            autoPlay
            controls={false}
            loop
            className="h-screen"
            fill
            title="Giới thiệu về Công ty Nurarchitects"
          />
        </Box>
        <Box sx={{ py: 10, position: "relative" }}>
          <Image
            src={BgPattern.src}
            fill
            className="w-full h-full absolute"
            alt={
              homepage?.introductionTitle?.toUpperCase() ||
              "NURARCHITECTS CHÚNG TÔI LÀ AI?"
            }
          />
          <Container
            maxWidth="lg"
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Grid
              container
              spacing={{ xs: 5, md: 0 }}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { md: "center" },
                height: { xs: "auto", md: 400 },
              }}
            >
              {/* ── Left: Text ─────────────────────────────────────────────── */}
              <GridFadeIn
                size={{ xs: 12, md: 6 }}
                fadeInDirection="left"
                sx={{
                  flex: { md: "0 0 50%" },
                  maxWidth: { md: "50%" },
                  pr: { md: 8 },
                  py: { md: 6 },
                }}
              >
                <Stack spacing={3}>
                  {/* Label */}
                  <Typography
                    sx={{
                      color: "#8fa8c8",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}
                  >
                    {homepage?.introductionTitle ||
                      "Nurchitects chúng tôi là ai?"}
                  </Typography>

                  {/* Description */}
                  <RichContent
                    className="max-w-[520px] text-white"
                    html={homepage?.introductionContent}
                  />

                  {/* CTA button — outline style */}
                  <Box>
                    <Button
                      variant="outlined"
                      component='a'
                      href="/gioi-thieu"
                      sx={{
                        color: "#8fa8c8",
                        borderColor: "#8fa8c8",
                        borderRadius: 0,
                        px: 6,
                        py: 1.25,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        "&:hover": {
                          backgroundColor: "white",
                          color: "primary.main",
                        },
                      }}
                    >
                      {homepage?.contactCtaContent ||
                        "Tìm hiểu thêm"}
                    </Button>
                  </Box>
                </Stack>
              </GridFadeIn>

              {/* ── Right: Image ────────────────────────────────────────────── */}
              <GridFadeIn
                fadeInDirection="right"
                size={{ xs: 12, md: 6 }}
                sx={{
                  mt: { xs: 0, md: -8 },
                  mb: { xs: 0, md: -4 },
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    // tỉ lệ khung ảnh ~4:3
                    paddingTop: { xs: "50%", md: "70%" },
                    borderRadius: "4px",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
                  }}
                >
                  <Image
                    src={IntroductionImage.src}
                    alt={homepage?.introductionTitle ||
                      "Nurchitects chúng tôi là ai?"}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </Box>
              </GridFadeIn>
            </Grid>
          </Container>
        </Box>
        {homepage?.activities && homepage?.activities?.length > 0 && (
          <ActivitiesSection
            activities={(homepage?.activities || []) as IActivityPopulated[]}
          />
        )}
        {homepage?.featuredProjectIds && homepage?.featuredProjectIds?.length > 0 && (
          <ProjectsSection projects={homepage?.featuredProjectIds?.slice(0, 3)} />
        )}
        <ContactCTASection />
        <NewsSection news={news} />
      </Box>
    </SiteShell >
  );
}
