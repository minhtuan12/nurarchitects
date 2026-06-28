import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/layout/SiteShell";
import { HomepageLanding, type ContactConfig, type HomepageConfig, type NewsCard, type ProjectCard } from "@/components/HomepageLanding";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { getSeoBySlug } from "@/lib/content";
import { fetchApi } from "@/helpers";
import Developing from "@/components/admin/Developing";
import { Box } from "@mui/material";

export async function generateMetadata() {
  const seo = await getSeoBySlug("homepage", "page");
  return buildMetadata({
    title: seo?.title ?? "Trang chủ",
    description:
      seo?.description ?? "NUR Architects creates calm, precise architecture and interiors for contemporary living.",
    canonicalUrl: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    focusKeywords: seo?.focusKeywords,
  });
}

export default async function HomePage() {
  const [homepageRes, projectsRes, newsRes, contactRes] = await Promise.all([
    fetchApi<HomepageConfig>("/api/homepage"),
    fetchApi<ProjectCard>("/api/projects"),
    fetchApi<NewsCard>("/api/news"),
    fetchApi<ContactConfig>("/api/contact"),
  ]);

  const homepage = homepageRes?.item ?? null;
  const projects = projectsRes?.items ?? [];
  const news = newsRes?.items ?? [];
  const contact = contactRes?.item ?? null;

  return (
    <SiteShell>
      <Box sx={{ py: 20 }}>
        <Developing />
      </Box>
    </SiteShell>
  );
}
