import { getIntroduction, getSeoBySlug } from "@/lib/content";
import { aboutPageJsonLd, buildMetadata } from "@/lib/seo";
import { Box } from "@mui/material";
import MediaRenderer from "@/components/MediaRenderer";
import { IMedia } from "@/types/media";
import BannerBreadcrumb from "@/components/layout/BannerBreadcrumb";
import BlueSection from "@/components/BlueSection";
import BgPattern from "@/assets/images/bg-pattern-1.jpg";
import MissionAndVision from "./(components)/MissionAndVision";
import { IIntroductionConfigPopulated } from "@/types/introduction";
import Members from "./(components)/Members";
import { JsonLd } from "@/components/JsonLd";

export async function generateMetadata() {
  const seo = await getSeoBySlug("gioi-thieu", "page");
  return buildMetadata({
    title: seo?.title ?? "Về chúng tôi",
    slug: "gioi-thieu",
    description:
      seo?.description ??
      "Tìm hiểu triết lý, tầm nhìn, sứ mệnh và giá trị cốt lõi của NUR Architects.",
    canonicalUrl: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    focusKeywords: seo?.focusKeywords,
  });
}

export default async function IntroductionPage() {
  const data: IIntroductionConfigPopulated = await getIntroduction();

  return (
    <Box sx={{ mt: { xs: "-78px", md: "-115px" } }}>
      <JsonLd data={aboutPageJsonLd({ content: data?.content })} />
      <Box
        position="relative"
        sx={{ height: { xs: "60vh", md: "100vh" } }}
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
          media={data?.bannerId as IMedia}
          autoPlay
          controls={false}
          loop
          className="h-full"
          fill
          title="Giới thiệu về Nurarchitects"
        />
        <BannerBreadcrumb
          breadcrumbString="Trang chủ / Về chúng tôi"
          pageTitle="Về chúng tôi"
        />
      </Box>
      <BlueSection
        title={"Về Nurarchitects"}
        content={data?.content}
        rightImage={data?.imageIds?.[0]?.secureUrl}
        bgImage={BgPattern.src}
        leftSpacing={2}
      />
      <MissionAndVision
        missions={data?.mission || []}
        visions={data?.vision || []}
        history={data?.history || []}
        coreValues={data?.coreValues || []}
        achievements={data?.achievements || []}
      />
      <Members members={data.members} />
    </Box>
  );
}
