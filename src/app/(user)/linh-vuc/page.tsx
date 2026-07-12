import { getActivities, getActivityConfig, getSeoBySlug } from "@/lib/content";
import { buildMetadata, webPageJsonLd } from "@/lib/seo";
import { Box } from "@mui/material";
import MediaRenderer from "@/components/MediaRenderer";
import BannerBreadcrumb from "@/components/layout/BannerBreadcrumb";
import ActivitiesSection from "./(components)/ActivitiesSection";
import { IActivityPopulated } from "@/types/activity";
import ContactCTASection from "@/components/ContactCTASection";
import ProcessSection from "./(components)/ProcessSection";
import AdvantagesSection from "./(components)/AdvantagesSection";
import { JsonLd } from "@/components/JsonLd";

export async function generateMetadata() {
  const seo = await getSeoBySlug("activity", "page");
  return buildMetadata({
    title: seo?.title ?? "Lĩnh vực",
    description: seo?.description ?? "Lĩnh vực hoạt động ở NUR Architects",
    canonicalUrl: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    focusKeywords: seo?.focusKeywords,
  });
}

export default async function () {
  const [activities, config] = await Promise.all([
    getActivities(),
    getActivityConfig()
  ]);

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: "Lĩnh vực hoạt động",
          description: "Lĩnh vực hoạt động ở NUR Architects",
          slug: "linh-vuc-hoat-dong",
        })}
      />
      <Box sx={{ mt: { xs: "-78px", md: "-115px" }, bgcolor: "white" }}>
        <Box
          position="relative"
          sx={{ height: { xs: "400px", md: "650px" } }}
        >
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
            media={null}
            autoPlay
            controls={false}
            loop
            className="h-full"
            fill
            title="Lĩnh vực hoạt động ở Nurarchitects"
          />
          <BannerBreadcrumb
            breadcrumbString="Trang chủ / Lĩnh vực hoạt động"
            pageTitle="Lĩnh vực hoạt động"
          />
        </Box>
      </Box>

      <ActivitiesSection activities={activities} />
      <ContactCTASection />
      <AdvantagesSection advantages={config?.advantages || []} />
      <ProcessSection process={config?.process || []} />
      <ContactCTASection />
    </>
  );
}
