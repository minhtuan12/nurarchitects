"use client";

import { Button, Flex, Row } from "antd";
import { useEffect, useRef, useState } from "react";
import { useMessage } from "@/contexts/AdminMessageContext";
import MemberTable, { type MemberTableHandle } from "../(components)/MemberTable";
import type { MemberItem } from "../types";
import {
  createEmptyIntroductionSnapshot,
  loadIntroductionSnapshot,
  saveIntroductionPayload,
  serializeMemberItems,
  type IntroductionSnapshot,
} from "../utils";

export default function IntroductionMembersPage() {
  const messageApi = useMessage();
  const tableRef = useRef<MemberTableHandle>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [baseIntroduction, setBaseIntroduction] =
    useState<IntroductionSnapshot>(createEmptyIntroductionSnapshot());
  const [members, setMembers] = useState<MemberItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadIntroductionSnapshot()
      .then((snapshot) => {
        if (cancelled) return;

        setBaseIntroduction(snapshot);

        // imageId is now a populated Media object from the server —
        // no extra fetch needed.
        const memberItems: MemberItem[] = snapshot.members.map((member) => ({
          imageId: member.imageId,
          name: member.name,
          description: member.description,
          experiences: member.experiences,
        }));

        if (!cancelled) setMembers(memberItems);
      })
      .catch(() => messageApi.error("Không thể tải dữ liệu nhân sự"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [messageApi]);

  /**
   * Accepts an explicit members list so the modal can pass the freshly
   * computed next-state without relying on React's batched setState.
   */
  const handleSave = async (nextMembers: MemberItem[]) => {
    setSaving(true);
    try {
      const memberRecords = await serializeMemberItems(nextMembers);
      const response = await saveIntroductionPayload(baseIntroduction, {
        members: memberRecords,
      });

      if (response?.item) {
        const updatedSnapshot = {
          content: response.item.content ?? baseIntroduction.content,
          history: response.item.history ?? baseIntroduction.history,
          vision: response.item.vision ?? baseIntroduction.vision,
          mission: response.item.mission ?? baseIntroduction.mission,
          coreValues: response.item.coreValues ?? baseIntroduction.coreValues,
          achievements: response.item.achievements ?? baseIntroduction.achievements,
          imageIds: (response.item.imageIds ?? baseIntroduction.imageIds)
            .map((value: any) => String(value?._id ?? value))
            .filter(Boolean),
          members: response.item.members ?? memberRecords,
        };

        setBaseIntroduction(updatedSnapshot);
        // ← Thêm dòng này: sync members từ server (đã có populated imageId object)
        const updatedMembers: MemberItem[] = updatedSnapshot.members.map((member: any) => ({
          imageId: member.imageId,   // server trả về populated object { _id, url, ... }
          name: member.name,
          description: member.description,
          experiences: member.experiences,
        }));
        setMembers(updatedMembers);
      }

      messageApi.success("Cập nhật thành công");
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : "Đã có lỗi xảy ra",
      );
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = loading || saving;

  return (
    <>
      <Row className="flex items-center justify-end mb-5 px-1">
        <Button
          type="primary"
          size="large"
          icon={<span className="anticon">+</span>}
          loading={saving}
          disabled={loading}
          onClick={() => tableRef.current?.openCreate()}
        >
          Thêm nhân sự
        </Button>
      </Row>

      <Flex vertical gap={16}>
        <MemberTable
          ref={tableRef}
          members={members}
          onChange={setMembers}
          onSave={handleSave}
          disabled={isDisabled}
          saving={saving}
          loading={loading}
        />
      </Flex>
    </>
  );
}
