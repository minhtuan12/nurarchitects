import { getContact, getSeoBySlug } from "@/lib/content";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import Developing from "@/components/admin/Developing";
import { Box } from "@mui/material";

export async function generateMetadata() {
  const seo = await getSeoBySlug("activities", "page");
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

export default async function () {
  const contact = await getContact();
  const primaryLocation = contact?.locations?.[0];

  return (
    <>
      <Box sx={{ py: 20 }}>
        <Developing />
      </Box>
    </>
  );
}
