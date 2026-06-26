"use client";

import { useMessage } from "@/contexts/AdminMessageContext";
import { Info } from "lucide-react";
import { Button, Flex, Row, Tabs, Typography } from "antd";
import { useEffect, useState } from "react";
import ContentItemTable from "../(components)/ContentItemTable";
import type { ContentItem } from "../types";
import {
  createEmptyIntroductionSnapshot,
  loadIntroductionSnapshot,
  saveIntroductionPayload,
  type IntroductionSnapshot,
} from "../utils";

export default function IntroductionHistoryPage() {
  const messageApi = useMessage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [baseIntroduction, setBaseIntroduction] = useState<IntroductionSnapshot>(
    createEmptyIntroductionSnapshot(),
  );
  const [history, setHistory] = useState<ContentItem[]>([]);
  const [vision, setVision] = useState<ContentItem[]>([]);
  const [mission, setMission] = useState<ContentItem[]>([]);
  const [coreValues, setCoreValues] = useState<ContentItem[]>([]);
  const [achievements, setAchievements] = useState<ContentItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadIntroductionSnapshot()
      .then((snapshot) => {
        if (cancelled) return;

        setBaseIntroduction(snapshot);
        setHistory(snapshot.history);
        setVision(snapshot.vision);
        setMission(snapshot.mission);
        setCoreValues(snapshot.coreValues);
        setAchievements(snapshot.achievements);
      })
      .catch(() => messageApi.error("Không thể tải dữ liệu lịch sử và định hướng"))
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
      const response = await saveIntroductionPayload(baseIntroduction, {
        history,
        vision,
        mission,
        coreValues,
        achievements,
      });

      if (response?.item) {
        setBaseIntroduction({
          content: response.item.content ?? baseIntroduction.content,
          history: response.item.history ?? history,
          vision: response.item.vision ?? vision,
          mission: response.item.mission ?? mission,
          coreValues: response.item.coreValues ?? coreValues,
          achievements: response.item.achievements ?? achievements,
          imageIds: (response.item.imageIds ?? baseIntroduction.imageIds)
            .map((value: any) => String(value?._id ?? value))
            .filter(Boolean),
          members: response.item.members ?? baseIntroduction.members,
        });
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
      <Row className="flex items-center justify-between gap-4 mb-5 px-1">
        <Flex align="center" gap={6}>
          <Info size={18} color="#e69b08" />
          <Typography.Text type="secondary" className="text-sm text-[#e69b08]">
            Nhấn Cập nhật sau khi thêm các nội dung
          </Typography.Text>
        </Flex>
        <Button type="primary" size="large" loading={saving} disabled={loading} onClick={handleSave}>
          Cập nhật
        </Button>
      </Row>

      <Flex vertical gap={16}>
        <Tabs
          className="custom-tabs"
          type="card"
          size="medium"
          destroyOnHidden
          items={[
            {
              key: "history",
              label: "Lịch sử",
              children: (
                <ContentItemTable
                  label="Lịch sử"
                  items={history}
                  onChange={setHistory}
                  disabled={isDisabled}
                  addLabel="Thêm mốc lịch sử"
                />
              ),
            },
            {
              key: "vision",
              label: "Tầm nhìn",
              children: (
                <ContentItemTable
                  label="Tầm nhìn"
                  items={vision}
                  onChange={setVision}
                  disabled={isDisabled}
                  addLabel="Thêm tầm nhìn"
                />
              ),
            },
            {
              key: "mission",
              label: "Sứ mệnh",
              children: (
                <ContentItemTable
                  label="Sứ mệnh"
                  items={mission}
                  onChange={setMission}
                  disabled={isDisabled}
                  addLabel="Thêm sứ mệnh"
                />
              ),
            },
            {
              key: "coreValues",
              label: "Giá trị cốt lõi",
              children: (
                <ContentItemTable
                  label="Giá trị cốt lõi"
                  items={coreValues}
                  onChange={setCoreValues}
                  disabled={isDisabled}
                  addLabel="Thêm giá trị"
                />
              ),
            },
            {
              key: "achievements",
              label: "Thành tựu",
              children: (
                <ContentItemTable
                  label="Thành tựu"
                  items={achievements}
                  onChange={setAchievements}
                  disabled={isDisabled}
                  addLabel="Thêm thành tựu"
                />
              ),
            },
          ]}
        />
      </Flex>
    </>
  );
}
