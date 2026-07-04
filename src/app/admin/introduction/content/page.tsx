"use client";

import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import MediaPickerModal from "@/components/admin/media/MediaPickerModal";
import {
  mediaToUploadFile,
  type AdminMediaItem,
  type MediaUploadFile,
} from "@/components/admin/media/media-upload-file";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useMessage } from "@/contexts/AdminMessageContext";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Row, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { useEffect, useState } from "react";
import GallerySection from "../(components)/GallerySection";
import {
  createEmptyIntroductionSnapshot,
  loadIntroductionSnapshot,
  mergeIntroductionSnapshot,
  mediaIdToUploadFile,
  saveIntroductionPayload,
  serializeGalleryFiles,
  type IntroductionSnapshot,
} from "../utils";

const { Title } = Typography;
type BannerUploadFile = MediaUploadFile;

export default function IntroductionContentPage() {
  const messageApi = useMessage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [baseIntroduction, setBaseIntroduction] = useState<IntroductionSnapshot>(
    createEmptyIntroductionSnapshot(),
  );
  const [bannerFiles, setBannerFiles] = useState<BannerUploadFile[]>([]);
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);
  const [content, setContent] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<MediaUploadFile[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadIntroductionSnapshot()
      .then(async (snapshot) => {
        if (cancelled) return;

        setBaseIntroduction(snapshot);
        setContent(snapshot.content ?? "");

        if (snapshot.bannerId) {
          const bannerFile = await mediaIdToUploadFile(snapshot.bannerId);
          if (!cancelled) setBannerFiles([bannerFile]);
        }

        const files = await Promise.all(snapshot.imageIds.map(mediaIdToUploadFile));
        if (!cancelled) setGalleryFiles(files);
      })
      .catch(() => messageApi.error("KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u ná»™i dung giá»›i thiá»‡u"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [messageApi]);

  const uploadBannerFile = async (file: BannerUploadFile): Promise<string | null> => {
    if (!file) return null;
    if (file.mediaId) return file.mediaId;
    if (!file.originFileObj) return null;

    const isVideo = file.originFileObj.type?.startsWith("video/");
    const formData = new FormData();
    formData.append("file", file.originFileObj);
    formData.append("resourceType", isVideo ? "video" : "image");

    const res = await adminFetch("/api/admin/media", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || data.error || !data.item?._id) {
      throw new Error(data.error ?? "Cannot upload banner");
    }

    return String(data.item._id);
  };

  const beforeBannerUpload: UploadProps["beforeUpload"] = (file) => {
    const isImageOrVideo =
      file.type?.startsWith("image/") || file.type?.startsWith("video/");
    if (!isImageOrVideo) {
      messageApi.error("Chỉ hỗ trợ tải ảnh hoặc video lên");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleSelectBannerMedia = (items: AdminMediaItem[]) => {
    setBannerFiles(items[0] ? [mediaToUploadFile(items[0])] : []);
    setBannerPickerOpen(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const bannerId =
        bannerFiles.length > 0 ? await uploadBannerFile(bannerFiles[0]) : null;
      const imageIds = await serializeGalleryFiles(galleryFiles);
      const response = await saveIntroductionPayload(baseIntroduction, {
        content,
        ...(bannerId !== null && { bannerId }),
        imageIds,
      });

      if (response?.item) {
        const updatedSnapshot = mergeIntroductionSnapshot(baseIntroduction, response.item);
        setBaseIntroduction(updatedSnapshot);
        setContent(updatedSnapshot.content);

        if (updatedSnapshot.bannerId) {
          const bannerFile = await mediaIdToUploadFile(updatedSnapshot.bannerId);
          setBannerFiles([bannerFile]);
        } else {
          setBannerFiles([]);
        }

        const updatedGalleryFiles = await Promise.all(
          updatedSnapshot.imageIds.map(mediaIdToUploadFile),
        );
        setGalleryFiles(updatedGalleryFiles);
      } else {
        setBaseIntroduction((current) => ({
          ...current,
          content,
          ...(bannerId !== null && { bannerId }),
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
          <Flex vertical gap={12}>
            <Title level={5} className="!mb-0 !text-black">
              Banner
            </Title>

            <Button
              className="self-start"
              disabled={isDisabled}
              onClick={() => setBannerPickerOpen(true)}
            >
              Chọn từ thư viện
            </Button>

            <Upload
              listType="picture-card"
              accept="image/*,video/*"
              maxCount={1}
              fileList={bannerFiles}
              beforeUpload={beforeBannerUpload}
              onChange={({ fileList }) => setBannerFiles(fileList as BannerUploadFile[])}
              disabled={isDisabled}
              className="w-full [&_.ant-upload]:w-full [&_.ant-upload]:h-50"
            >
              {bannerFiles.length >= 1 ? null : (
                <button type="button" className="border-0 bg-transparent">
                  <PlusOutlined />
                  <div className="mt-2">Tải ảnh/video mới</div>
                </button>
              )}
            </Upload>
          </Flex>
        </Block>

        <Block>
          <Title level={5} className="!mb-4 !text-black">
            Nội dung giới thiệu
          </Title>
          <SimpleEditor value={content} onChange={setContent} />
        </Block>

        <GallerySection files={galleryFiles} onChange={setGalleryFiles} disabled={isDisabled} />
      </Flex>

      {bannerPickerOpen && (
        <MediaPickerModal
          open
          title="Chọn banner"
          multiple={false}
          selectedIds={bannerFiles[0]?.mediaId ? [bannerFiles[0].mediaId] : []}
          onCancel={() => setBannerPickerOpen(false)}
          onConfirm={handleSelectBannerMedia}
        />
      )}
    </>
  );
}
