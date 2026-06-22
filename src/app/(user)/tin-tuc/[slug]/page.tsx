import Container from "@mui/material/Container";
import { notFound } from "next/navigation";
import { AppImage } from "@/components/AppImage";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro, RichContent } from "@/components/PageSections";
import { getNewsBySlug } from "@/lib/content";
import { articleJsonLd, buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  return buildMetadata({
    title: item?.title ?? "Tin tức",
    slug: `tin-tuc/${slug}`,
    description: item?.shortDescription,
    ogImage: item?.thumbnailId?.secureUrl ?? item?.thumbnailId?.url,
  });
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  return (
    <>
      <JsonLd data={articleJsonLd(item)} />
      <PageIntro label="Tin tức" title={item.title} body={item.shortDescription} />
      <Container maxWidth="md" sx={{ pb: 10 }}>
        <AppImage alt={item.title} media={item.thumbnailId} fill aspectRatio="16 / 9" priority />
        <RichContent html={item.description} />
      </Container>
    </>
  );
}
