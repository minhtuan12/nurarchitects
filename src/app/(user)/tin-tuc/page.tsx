import { ListingGrid, PageIntro } from "@/components/PageSections";
import { getPublishedNews } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tin tức",
  slug: "tin-tuc",
  description: "Tin tức, bài viết và góc nhìn từ NUR Architects.",
});

export default async function NewsPage() {
  const news = await getPublishedNews();
  return (
    <>
      <PageIntro label="Tin tức" title="Góc nhìn về kiến trúc, nội thất và thi công." />
      <ListingGrid items={news} basePath="/tin-tuc" empty="Chưa có bài viết được xuất bản." />
    </>
  );
}
