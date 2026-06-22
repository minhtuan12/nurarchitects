"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Empty,
  Image as AntImage,
  Input,
  Modal,
  Pagination,
  Spin,
  Tag,
} from "antd";
import { Check, FileText, ImageIcon, Search } from "lucide-react";
import { adminFetch } from "@/components/admin/AdminShell";
import type { AdminMediaItem } from "@/components/admin/media/media-upload-file";
import { useMessage } from "@/contexts/AdminMessageContext";

interface MediaPickerModalProps {
  open: boolean;
  title?: string;
  multiple?: boolean;
  resourceType?: AdminMediaItem["resourceType"];
  selectedIds?: string[];
  onCancel: () => void;
  onConfirm: (items: AdminMediaItem[]) => void;
}

interface MediaListResponse {
  items?: AdminMediaItem[];
  page?: number;
  limit?: number;
  total?: number;
  error?: string;
}

const pageSize = 24;
const emptySelectedIds: string[] = [];

function mediaLabel(item: AdminMediaItem) {
  return item.originalName ?? item.filename ?? item._id;
}

function formatFileSize(size?: number) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaPickerModal({
  open,
  title = "Chọn media đã tải lên",
  multiple = false,
  resourceType,
  selectedIds = emptySelectedIds,
  onCancel,
  onConfirm,
}: MediaPickerModalProps) {
  const messageApi = useMessage();
  const [items, setItems] = useState<AdminMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedSet, setSelectedSet] = useState<Set<string>>(
    () => new Set(selectedIds),
  );
  const [itemMap, setItemMap] = useState<Record<string, AdminMediaItem>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    });

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }
    if (resourceType) {
      params.set("resourceType", resourceType);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    adminFetch(`/api/admin/media?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as MediaListResponse;
        if (!response.ok || data.error) {
          throw new Error(data.error ?? "Không thể tải thư viện media");
        }
        const fetchedItems = data.items ?? [];
        setItems(fetchedItems);
        setItemMap((prev) => {
          const next = { ...prev };
          for (const it of fetchedItems) next[it._id] = it;
          return next;
        });
        setTotal(data.total ?? 0);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        messageApi.error(
          error instanceof Error
            ? error.message
            : "Không thể tải thư viện media",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedSearch, messageApi, open, page, resourceType]);

  const toggleItem = (item: AdminMediaItem) => {
    setItemMap((prev) => ({ ...prev, [item._id]: item }));
    setSelectedSet((current) => {
      const next = new Set(current);
      if (next.has(item._id)) {
        next.delete(item._id);
      } else {
        if (!multiple) next.clear();
        next.add(item._id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const result = Array.from(selectedSet)
      .map((id) => itemMap[id])
      .filter((it): it is AdminMediaItem => Boolean(it));
    onConfirm(result);
  };

  useEffect(() => {
    if (open) {
      setSelectedSet(new Set(selectedIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      width={920}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="confirm"
          type="primary"
          disabled={selectedSet.size === 0}
          onClick={handleConfirm}
        >
          Chọn{" "}
          {selectedSet.size > 0 ? `(${selectedSet.size})` : ""}
        </Button>,
      ]}
    >
      <div className="flex flex-col gap-4">
        <Input
          allowClear
          prefix={<Search size={16} />}
          placeholder="Tìm theo tên file, alt hoặc caption"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Spin spinning={loading}>
          {items.length === 0 ? (
            <Empty
              description="Không có media phù hợp"
              className="py-10"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => {
                const selected = selectedSet.has(item._id);
                const label = mediaLabel(item);
                const isImage = item.resourceType === "image";
                const previewUrl = item.secureUrl ?? item.url;

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => toggleItem(item)}
                    className={`cursor-pointer group relative overflow-hidden rounded-md border bg-white text-left transition ${selected
                      ? "border-[#8b6f47] ring-2 ring-[#8b6f47]/25"
                      : "border-black/10 hover:border-[#8b6f47]/60"
                      }`}
                  >
                    <div className="flex aspect-[4/3] items-center justify-center bg-[#f3f0e8]">
                      {isImage && previewUrl ? (
                        <AntImage
                          src={previewUrl}
                          alt={item.alt || label}
                          preview={false}
                          rootClassName="h-full w-full"
                          className="!h-full !w-full object-cover"
                        />
                      ) : (
                        <FileText
                          size={36}
                          className="text-[#8b6f47]"
                        />
                      )}
                    </div>
                    <div className="flex min-h-[78px] flex-col gap-1 p-3">
                      <div className="line-clamp-2 text-sm font-medium text-[#403c34]">
                        {label}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#7a7163]">
                        {isImage ? (
                          <ImageIcon size={13} />
                        ) : (
                          <FileText size={13} />
                        )}
                        <span>
                          {item.format ||
                            item.resourceType ||
                            "file"}
                        </span>
                        {item.size ? (
                          <span>
                            {formatFileSize(
                              item.size,
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {selected ? (
                      <Tag
                        color="success"
                        className="font-semibold absolute right-2 top-2 m-0 flex items-center gap-1"
                      >
                        <Check size={12} />
                        Đã chọn
                      </Tag>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </Spin>

        {total > pageSize ? (
          <div className="flex justify-end">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger={false}
              onChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
