import type { Metadata } from "next";

const siteName = "NUR Architects";

export interface SeoInput {
  title?: string;
  description?: string;
  slug?: string;
  canonicalUrl?: string;
  ogImage?: string;
  focusKeywords?: string[];
  type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
}

export function siteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nurarchitects.com";
  return new URL(path, base).toString();
}

export function buildMetadata(input: SeoInput = {}): Metadata {
  const title = input.title ? `${input.title}` : siteName;
  const description =
    input.description || "NUR Architects - đơn vị thiết kế kiến trúc, nội thất và xây dựng nhà trọn gói tại Hà Nội. Tư vấn miễn phí, thiết kế độc bản, thi công trọn gói uy tín.";
  const canonical = input.canonicalUrl || siteUrl(input.slug ? `/${input.slug}` : "/");
  const images = input.ogImage ? [{ url: input.ogImage, width: 1200, height: 630 }] : [];

  return {
    title,
    description,
    keywords: input.focusKeywords || [
      'thiết kế nội thất',
      'thiết kế kiến trúc',
      'xây nhà trọn gói',
      'công ty kiến trúc nội thất Hà Nội',

      'thiết kế nội thất nhà liền kề',
      'thiết kế nội thất nhà phố kết hợp kinh doanh',
      'thiết kế nội thất chung cư đẹp',
      'xây dựng nhà trọn gói Hà Nội',
      'công ty thiết kế thi công nội thất trọn gói',
      'thiết kế nội thất phong cách Wabi Sabi',
      'mẫu thiết kế nội thất đẹp 2026',
      'thiết kế kiến trúc nhà ở dân dụng',

      'NUR Architects',
      'Nurarchitects Hà Nội',
      'nurarchitects',
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      images,
      locale: "vi_VN",
      type: input.type || "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: input.ogImage ? [input.ogImage] : undefined,
    },
  };
}

export function organizationJsonLd(contact?: { phone?: string; email?: string; addresses?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl(),
    telephone: contact?.phone,
    email: contact?.email,
    address: contact?.addresses,
  };
}

export function articleJsonLd(item: { title: string; shortDescription?: string; slug: string; createdAt?: string; updatedAt?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.shortDescription,
    url: siteUrl(`/tin-tuc/${item.slug}`),
    datePublished: item.createdAt,
    dateModified: item.updatedAt,
  };
}

export function projectJsonLd(item: { name: string; shortDescription?: string; slug: string; address?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.name,
    description: item.shortDescription,
    url: siteUrl(`/du-an/${item.slug}`),
    locationCreated: item.address,
  };
}

export function jobJsonLd(item: { title: string; slug: string; description?: string; workingAddress?: string; deadline?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: item.title,
    description: item.description,
    url: siteUrl(`/tuyen-dung/${item.slug}`),
    validThrough: item.deadline,
    jobLocation: item.workingAddress,
    hiringOrganization: {
      "@type": "Organization",
      name: siteName,
      sameAs: siteUrl(),
    },
  };
}

export function contactJsonLd(data?: {
  phone?: string;
  email?: string;
  locations?: { name?: string; address?: string; lat?: number; lng?: number }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl(),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: data?.phone,
      email: data?.email,
      contactType: "customer service",
    },
    location: (data?.locations ?? []).map((loc) => ({
      "@type": "Place",
      name: loc.name,
      address: loc.address,
      ...(loc.lat && loc.lng
        ? { geo: { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng } }
        : {}),
    })),
  };
}

export function aboutPageJsonLd(input?: { content?: string; slug?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `Về chúng tôi | ${siteName}`,
    url: siteUrl(input?.slug ?? "gioi-thieu"),
    description: input?.content,
    mainEntity: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl(),
    },
  };
}

export function webPageJsonLd(input: { name: string; description?: string; slug?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: siteUrl(input.slug),
  };
}
