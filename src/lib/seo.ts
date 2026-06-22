import type { Metadata } from "next";

const siteName = "NUR Architects";

export interface SeoInput {
  title?: string;
  description?: string;
  slug?: string;
  canonicalUrl?: string;
  ogImage?: string;
  focusKeywords?: string[];
}

export function siteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nurarchitects.vn";
  return new URL(path, base).toString();
}

export function buildMetadata(input: SeoInput = {}): Metadata {
  const title = input.title ? `${input.title} | ${siteName}` : siteName;
  const description =
    input.description || "NUR Architects creates considered architecture, interiors, and built environments.";
  const canonical = input.canonicalUrl || siteUrl(input.slug ? `/${input.slug}` : "/");
  const images = input.ogImage ? [{ url: input.ogImage }] : [];

  return {
    title,
    description,
    keywords: input.focusKeywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      images,
      type: "website",
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
