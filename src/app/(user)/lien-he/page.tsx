import { getContact, getSeoBySlug } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Box, Divider, Stack, Typography } from "@mui/material";
import MediaRenderer from "@/components/MediaRenderer";
import { IMedia } from "@/types/media";
import BannerBreadcrumb from "@/components/layout/BannerBreadcrumb";
import { IContactConfigPopulated } from "@/types/contact";
import { MapPin, Phone, Send } from "lucide-react";
import Link from "next/link";

export async function generateMetadata() {
  const seo = await getSeoBySlug("lien-he", "page");
  return buildMetadata({
    title: seo?.title ?? "Liên hệ",
    slug: "lien-he",
    description:
      seo?.description ??
      "Liên hệ NUR Architects để trao đổi nhu cầu thiết kế và thi công.",
    canonicalUrl: seo?.canonicalUrl,
    ogImage: seo?.ogImage,
    focusKeywords: seo?.focusKeywords,
  });
}

export default async function () {
  const data: IContactConfigPopulated = await getContact();
  const locations = data?.locations ?? [];

  return (
    <Box sx={{ mt: { xs: "-78px", md: "-115px" }, bgcolor: 'white' }}>
      <Box
        position="relative"
        sx={{ height: { xs: "400px", md: "620px" } }}
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
          breadcrumbString="Trang chủ / Liên hệ"
          pageTitle="Liên hệ"
        />
      </Box>

      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 3 },
          pb: { xs: 4, md: 15 },
        }}
      >
        {/* Phone */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ py: { xs: 2, md: 4 } }}
        >
          <Phone size={20} className="text-[#434343]" />
          <Link
            href={`tel:${data?.phone?.replace(/[^0-9+]/g, "")}`}
            className="text-[#474747] text-[14px] font-[400] opacity-90 hover:opacity-100"
          >
            {data?.phone}
          </Link>
        </Stack>

        <Divider />

        {/* Email */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ py: { xs: 2, md: 4 } }}
        >
          <Send size={20} className="text-[#434343]" />
          <Link
            href={`mailto:${data?.email}`}
            className="text-[#474747] text-[14px] font-[400] opacity-90 hover:opacity-100"
          >
            {data?.email}
          </Link>
        </Stack>

        <Divider />

        {/* Locations */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {locations.map((location, index) => {
            const isLast = index === locations.length - 1;
            const markerLabel = location.name || location.address;
            // Cú pháp q=lat,lng(Label) buộc Google parse 2 số đầu là toạ độ
            // tuyệt đối (không chạy qua Local Search nên không bị snap sang
            // POI gần đó), đồng thời Label trong ngoặc hiển thị cạnh marker.
            const mapQuery = `${location.lat},${location.lng}(${markerLabel})`;
            const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
              mapQuery
            )}&z=16&output=embed`;
            const googleMapsUrl = location.link || `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

            return (
              <Box
                key={`${location.name}-${index}`}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  py: { xs: 3, md: 5 },
                  px: { xs: 0, md: 4 },
                  borderBottom: {
                    xs: isLast ? "none" : "1px solid #ececec",
                    md: "none",
                  },
                  borderRight: {
                    xs: "none",
                    md: isLast ? "none" : "1px solid #ececec",
                  },
                  "&:first-of-type": { pl: { md: 0 } },
                }}
              >
                <Link
                  className="flex gap-2 items-start mb-3"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <MapPin
                    size={20}
                    className="text-[#434343]"
                  />
                  <Typography
                    sx={{
                      fontSize: { xs: 14, md: 15 },
                      fontWeight: 600,
                      color: "text.primary",
                      lineHeight: 1.5,
                    }}
                  >
                    {location.name ? `${location.name}, ` : ""}
                    {location.address}
                  </Typography>
                </Link>

                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: { xs: 380, md: 415 },
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="iframe"
                    src={mapSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Bản đồ - ${location.name || location.address}`}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>

        <Divider />
      </Box>
    </Box>
  );
}
