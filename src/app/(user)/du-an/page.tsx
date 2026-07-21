import BannerBreadcrumb from "@/components/layout/BannerBreadcrumb";
import MediaRenderer from "@/components/MediaRenderer";
import { getPublishedProjects, getSeoBySlug } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { IMedia } from "@/types/media";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";
import ProjectsSection from "./(components)/ProjectsSection";

const ContactCTASection = dynamic(() => import("@/components/ContactCTASection"));

export async function generateMetadata() {
  const seo = await getSeoBySlug("du-an", "page");
  return buildMetadata({
    title: seo?.title || "Dự án",
    slug: seo?.slug || "du-an",
    description: seo?.description || "Danh mục dự án kiến trúc và nội thất đã xuất bản của NUR Architects.",
    canonicalUrl: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    focusKeywords: seo?.focusKeywords,
  });
}

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  return (
    <>
      <Box sx={{ mt: { xs: "-78px", md: "-115px" } }}>
        <Box
          position="relative"
          sx={{ height: { xs: "400px", md: "750px" } }}
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
            media={projects?.[0]?.thumbnailId as IMedia}
            autoPlay
            controls={false}
            loop
            className="h-full"
            fill
            title="Các dự án tiêu biểu của Nurarchitects"
            priority
          />
          <BannerBreadcrumb
            breadcrumbString="Trang chủ / Dự án"
            pageTitle="Dự án tiêu biểu"
          />
        </Box>
        <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: 'white' }}>
          <ProjectsSection projects={projects} />
          <Box mt={8}>
            <ContactCTASection />
          </Box>
        </Box>
      </Box>
    </>
  );
}
