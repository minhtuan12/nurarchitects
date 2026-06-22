import { ListingGrid, PageIntro } from "@/components/PageSections";
import { getPublishedProjects } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Dự án",
  slug: "du-an",
  description: "Danh mục dự án kiến trúc và nội thất đã xuất bản của NUR Architects.",
});

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  return (
    <>
      <PageIntro label="Dự án" title="Không gian được thiết kế từ nhu cầu thật." />
      <ListingGrid items={projects} basePath="/du-an" empty="Chưa có dự án được xuất bản." />
    </>
  );
}
