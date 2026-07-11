import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppImage } from "@/components/AppImage";
import { PageIntro, RichContent } from "@/components/PageSections";
import { getContact, getCooperation, getSeoBySlug } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import Developing from "@/components/admin/Developing";
import { Box } from "@mui/material";
import MediaRenderer from "@/components/MediaRenderer";
import { IMedia } from "@/types/media";
import BannerBreadcrumb from "@/components/layout/BannerBreadcrumb";
import NeededFields from "./(components)/NeededFields";
import Steps from "./(components)/Steps";
import PartnerRegisterCTA from "./(components)/PartnerRegisterCTA";
import BlueSection from "@/components/BlueSection";
import BlueCtaSection from "./(components)/BlueCtaSection";
import { GridFadeIn } from "@/components/base/Grid";

export async function generateMetadata() {
  const seo = await getSeoBySlug("hop-tac", "page");
  return buildMetadata({
    title: seo?.title ?? "Hợp tác",
    slug: "hop-tac",
    description:
      seo?.description ??
      "Quy trình hợp tác thiết kế và thi công cùng NUR Architects.",
    canonicalUrl: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    focusKeywords: seo?.focusKeywords,
  });
}

export default async function CooperationPage() {
  const [data, contactConfig] = await Promise.all([
    getCooperation(),
    getContact(),
  ]);

  return (
    <>
      <Box sx={{ mt: { xs: "-78px", md: "-115px" } }}>
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
            media={data.bannerId as IMedia}
            autoPlay
            controls={false}
            loop
            className="h-full"
            fill
            title="Các dự án tiêu biểu của Nurarchitects"
          />
          <BannerBreadcrumb
            breadcrumbString="Trang chủ / Liên hệ hợp tác"
            pageTitle="Trở thành đối tác của NUR Architects"
            pageSubTitle="Chúng tôi tin rằng thành công của một công ty xây dựng đến từ sự đồng hành của những đối tác chất lượng"
          />
        </Box>
        <NeededFields
          introductionContent={data.introduction}
          fields={data.neededFields}
          ctaContent={data.firstCtaBtn}
          image={data.imageIds?.[0]}
        />
        <Steps
          ctaContent={data.secondCtaBtn}
          steps={data.steps || []}
          email={contactConfig?.email}
          image={data.imageIds?.[1]}
        />
        <Box bgcolor={'white'} width={'100%'}>
          <GridFadeIn fadeInDirection="left" sx={{ maxWidth: 'lg', mx: 'auto', py: 5, bgcolor: 'white' }}>
            <BlueCtaSection
              content={`Trở thành đối tác của Nurarchitects và cùng <span style="color: red">tiến bước</span> với những thành công mới!`}
              ctaContent={data.thirdCtaBtn}
            />
          </GridFadeIn>
        </Box>
      </Box>
    </>
  );
}
