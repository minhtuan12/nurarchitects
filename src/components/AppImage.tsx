import Image, { type ImageProps } from "next/image";
import Box from "@mui/material/Box";
import type { MediaLike } from "@/types/media";
import { buildCloudinaryUrl } from "@/lib/cloudinary-url";

type AppImageProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  alt: string;
  media?: MediaLike | null;
  src?: any;
  cloudinaryPublicId?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  objectFit?: React.CSSProperties["objectFit"];
  fallbackSrc?: string;
};

export function AppImage({
  alt,
  media,
  src,
  cloudinaryPublicId,
  width,
  height,
  aspectRatio = "4 / 3",
  objectFit = "cover",
  fallbackSrc = "/placeholder.svg",
  fill,
  sizes = "(max-width: 768px) 100vw, 50vw",
  style,
  ...props
}: AppImageProps) {
  const resolvedSrc =
    src ||
    media?.secureUrl ||
    media?.url ||
    (cloudinaryPublicId ? buildCloudinaryUrl(cloudinaryPublicId, ["f_auto", "q_auto"]) : "") ||
    fallbackSrc;

  const imageAlt = alt || media?.alt || "";

  if (fill) {
    return (
      <Box sx={{ position: "relative", width: "100%", aspectRatio, overflow: "hidden" }}>
        <Image
          {...props}
          fill
          src={resolvedSrc}
          alt={imageAlt}
          sizes={sizes}
          style={{ objectFit, ...style }}
        />
      </Box>
    );
  }

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={imageAlt}
      width={width ?? media?.width ?? 1200}
      height={height ?? media?.height ?? 800}
      sizes={sizes}
      style={{ width: "100%", height: "auto", objectFit, ...style }}
    />
  );
}
