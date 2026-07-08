import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/layout/SiteShell";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { getSeoBySlug } from "@/lib/content";
import { fetchApi } from "@/helpers";
import MediaRenderer from "@/components/MediaRenderer";
import { IMedia } from "@/types/media";
import { Box } from "@mui/material";
import ActivitiesSection from "@/components/homepage/ActivitiesSection";
import { IHomepageConfigPopulated } from "@/types/home";
import { IActivityPopulated } from "@/types/activity";
import ProjectsSection from "@/components/homepage/ProjectsSection";
import { INewsPopulated } from "@/types/news";
import ContactCTASection from "@/components/ContactCTASection";
import NewsSection from "@/components/homepage/NewsSection";
import IntroductionImage from '@/assets/images/introduction.webp';
import BlueSection from "@/components/BlueSection";

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

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sParams = await searchParams;
  const [homepageRes, newsRes] = await Promise.all([
    fetchApi<IHomepageConfigPopulated>("/api/homepage"),
    fetchApi<INewsPopulated>("/api/news"),
  ]);

  const homepage = homepageRes?.item ?? null;
  const news = newsRes?.items ?? [];

  return (
    <SiteShell searchParams={sParams}>
      <Box sx={{ mt: { xs: '-78px', md: "-115px" } }}>
        <Box sx={{ height: { xs: '60vh', md: "100vh" } }}>
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
            media={homepage?.bannerId as IMedia}
            autoPlay
            controls={false}
            loop
            className="h-full"
            fill
            title="Giới thiệu về Công ty Nurarchitects"
          />
        </Box>
        <BlueSection
          title={homepage?.introductionTitle}
          content={homepage?.introductionContent}
          ctaContent={homepage?.contactCtaContent}
          rightImage={IntroductionImage.src}
          hasCta={true}
        />
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
    </SiteShell>
  );
}
