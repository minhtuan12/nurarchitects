"use client";

import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import { useMessage } from "@/contexts/AdminMessageContext";
import { Button, Flex, Row } from "antd";
import { useEffect, useState } from "react";
import SeoSection, { SeoFormValue } from "../../homepage/(components)/SeoSection";
import { INTRODUCTION_SEO_SLUG } from "../utils";

const defaultSeoValue: SeoFormValue = {
  title: "Giới thiệu",
  description: "",
  ogImage: "",
  canonicalUrl: "",
  focusKeywords: [],
};

export default function IntroductionSeoPage() {
  const messageApi = useMessage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoValue, setSeoValue] = useState<SeoFormValue>(defaultSeoValue);
  const [seoId, setSeoId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    adminFetch(`/api/admin/seo-settings?entityType=page&slug=${INTRODUCTION_SEO_SLUG}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((seoRes) => {
        if (cancelled) return;

        const seo = seoRes?.items?.[0] ?? seoRes?.data ?? seoRes?.item ?? seoRes;
        if (seo?.slug) {
          setSeoId(seo._id);
          setSeoValue({
            title: seo.title ?? defaultSeoValue.title,
            description: seo.description ?? "",
            ogImage: seo.ogImage ?? "",
            canonicalUrl: seo.canonicalUrl ?? "",
            focusKeywords: seo.focusKeywords ?? [],
          });
        }
      })
      .catch(() => messageApi.error("Không thể tải dữ liệu SEO của trang giới thiệu"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [messageApi]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const seoPayload = {
        entityType: "page",
        slug: INTRODUCTION_SEO_SLUG,
        title: seoValue.title || "Giới thiệu | Nurarchitects",
        description: seoValue.description,
        ogImage: seoValue.ogImage,
        canonicalUrl: seoValue.canonicalUrl,
        focusKeywords: seoValue.focusKeywords,
      };

      const res = await adminFetch(
        seoId ? `/api/admin/seo-settings/${seoId}` : "/api/admin/seo-settings",
        {
          method: seoId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(seoPayload),
        },
      );
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Không thể cập nhật SEO");

      if (!seoId && (data?.item?._id ?? data?.data?._id)) {
        setSeoId(data?.item?._id ?? data?.data?._id);
      }

      messageApi.success("Cập nhật thành công");
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Row className="flex items-center justify-end mb-5 px-1">
        <Button type="primary" size="large" loading={saving} disabled={loading} onClick={handleSave}>
          Cập nhật
        </Button>
      </Row>

      <Flex vertical gap={16}>
        <Block>
          <SeoSection value={seoValue} onChange={setSeoValue} disabled={loading || saving} />
        </Block>
      </Flex>
    </>
  );
}
