import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/layout/SiteShell";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { getContact, getPublishedNews, getSeoBySlug } from "@/lib/content";
import { fetchApi } from "@/helpers";
import MediaRenderer from "@/components/MediaRenderer";
import { IMedia } from "@/types/media";
import { Box, Typography } from "@mui/material";
import ActivitiesSection from "@/components/homepage/ActivitiesSection";
import { IHomepageConfigPopulated } from "@/types/home";
import { IActivityPopulated } from "@/types/activity";
import ProjectsSection from "@/components/homepage/ProjectsSection";
import { INewsPopulated } from "@/types/news";
import ContactCTASection from "@/components/ContactCTASection";
import NewsSection from "@/components/homepage/NewsSection";
import IntroductionImage from "@/assets/images/introduction.webp";
import BlueSection from "@/components/BlueSection";
import NewsResultsGrid from "@/components/homepage/NewsResult";

type PageSearchParams = Record<string, string | string[] | undefined>;

function getSearchQuery(sParams?: PageSearchParams) {
  const raw = sParams?.s;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() || undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  const sParams = await searchParams;
  const searchQuery = getSearchQuery(sParams);

  // Trang kết quả tìm kiếm -> metadata riêng, không lấy SEO của homepage
  if (searchQuery) {
    return buildMetadata({
      title: `Kết quả tìm kiếm cho "${searchQuery}"`,
      description: `Kết quả tìm kiếm cho từ khóa "${searchQuery}" trên website Arteco.`,
      // Không set canonicalUrl cố định vì URL search thay đổi theo query;
      // nếu SEO team muốn noindex trang search thì thêm robots ở buildMetadata,
      // ví dụ: robots: { index: false, follow: true }
    });
  }

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
  searchParams?: Promise<PageSearchParams>;
}) {
  const sParams = await searchParams;
  const searchQuery = getSearchQuery(sParams);

  // ---- Trang kết quả tìm kiếm ----
  if (searchQuery) {
    const searchRes = await getPublishedNews({ search: searchQuery });
    const searchResults = searchRes?.items ?? [];

    return (
      <SiteShell searchParams={sParams}>
        <Box sx={{ pb: { xs: 6, md: 10 }, pt: 6, bgcolor: 'white' }}>
          <Box sx={{ maxWidth: "md", mx: "auto", px: 2 }}>
            <Typography
              component="h1"
              sx={{ fontSize: { xs: 20, md: 26 }, fontWeight: 700, mb: 4 }}
            >
              Kết quả tìm kiếm cho &quot;{searchQuery}&quot;
            </Typography>

            {searchResults.length === 0 ? (
              <Typography sx={{ color: "text.secondary" }}>
                Không tìm thấy kết quả phù hợp.
              </Typography>
            ) : (
              <NewsResultsGrid news={searchResults} />
            )}
          </Box>
        </Box>
      </SiteShell>
    );
  }

  // ---- Trang chủ mặc định ----
  const [homepageRes, newsRes, contact] = await Promise.all([
    fetchApi<IHomepageConfigPopulated>("/api/homepage"),
    fetchApi<INewsPopulated>("/api/news"),
    getContact(),
  ]);

  const homepage = homepageRes?.item ?? null;
  const news = newsRes?.items ?? [];

  return (
    <SiteShell searchParams={sParams}>
      <JsonLd
        data={organizationJsonLd({
          phone: contact?.phone,
          email: contact?.email,
          addresses: contact?.locations?.map((l: any) => l.address).join("; "),
        })}
      />
      <Box sx={{ mt: { xs: '-78px', md: "-115px" } }}>
        <Box sx={{ height: { xs: '60vh', md: "100vh" } }}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "rgb(0 0 0 / 30%)",
              transition: "opacity 0.35s ease",
              zIndex: 10,
              height: { xs: '60.5vh', md: "100vh" }
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
