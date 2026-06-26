"use client";

import Block from "@/components/Block";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useMessage } from "@/contexts/AdminMessageContext";
import { Button, Flex, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import GallerySection from "../(components)/GallerySection";
import { type MediaUploadFile } from "@/components/admin/media/media-upload-file";
import {
  createEmptyIntroductionSnapshot,
  loadIntroductionSnapshot,
  mediaIdToUploadFile,
  saveIntroductionPayload,
  serializeGalleryFiles,
  type IntroductionSnapshot,
} from "../utils";

const { Title } = Typography;

export default function IntroductionContentPage() {
  const messageApi = useMessage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [baseIntroduction, setBaseIntroduction] = useState<IntroductionSnapshot>(
    createEmptyIntroductionSnapshot(),
  );
  const [content, setContent] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<MediaUploadFile[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadIntroductionSnapshot()
      .then(async (snapshot) => {
        if (cancelled) return;

        setBaseIntroduction(snapshot);
        setContent(snapshot.content ?? "");
        const files = await Promise.all(snapshot.imageIds.map(mediaIdToUploadFile));
        if (!cancelled) setGalleryFiles(files);
      })
      .catch(() => messageApi.error("Không thể tải dữ liệu nội dung giới thiệu"))
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
      const imageIds = await serializeGalleryFiles(galleryFiles);
      const response = await saveIntroductionPayload(baseIntroduction, {
        content,
        imageIds,
      });

      if (response?.item) {
        setBaseIntroduction({
          content: response.item.content ?? content,
          history: response.item.history ?? baseIntroduction.history,
          vision: response.item.vision ?? baseIntroduction.vision,
          mission: response.item.mission ?? baseIntroduction.mission,
          coreValues: response.item.coreValues ?? baseIntroduction.coreValues,
          achievements: response.item.achievements ?? baseIntroduction.achievements,
          imageIds: (response.item.imageIds ?? imageIds)
            .map((value: any) => String(value?._id ?? value))
            .filter(Boolean),
          members: response.item.members ?? baseIntroduction.members,
        });
      } else {
        setBaseIntroduction((current) => ({
          ...current,
          content,
          imageIds,
        }));
      }

      messageApi.success("Cập nhật thành công");
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = loading || saving;

  return (
    <>
      <Row className="flex items-center justify-end mb-5 px-1">
        <Button type="primary" size="large" loading={saving} disabled={loading} onClick={handleSave}>
          Cập nhật
        </Button>
      </Row>

      <Flex vertical gap={16}>
        <Block>
          <Title level={5} className="!mb-4 !text-black">
            Nội dung giới thiệu
          </Title>
          <SimpleEditor value={content} onChange={setContent} />
        </Block>

        <GallerySection files={galleryFiles} onChange={setGalleryFiles} disabled={isDisabled} />
      </Flex>
    </>
  );
}
