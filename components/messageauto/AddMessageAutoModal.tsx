/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Button, Textarea } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { createMessageAutoSchema } from "@/schemas/messageauto";
import { toast } from "react-toastify";

interface TopicOption {
  id: number;
  name: string;
}

interface AddMessageAutoModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function AddMessageAutoModal({ open, onClose, onRefresh }: AddMessageAutoModalProps) {
  const [topicId, setTopicId] = useState("");
  const [messageTopic, setMessageTopic] = useState("");
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset fields & fetch topics when modal toggled
  useEffect(() => {
    if (open) {
      setTopicId("");
      setMessageTopic("");
      setErrors({});

      const fetchTopics = async () => {
        try {
          setLoadingTopics(true);
          const res = await axiosInstance.get("/topics/selecttopic");
          const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
          setTopics(data);
        } catch (err) {
          console.error("Failed to load topics:", err);
          toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຫົວຂໍ້ໄດ້");
        } finally {
          setLoadingTopics(false);
        }
      };
      fetchTopics();
    }
  }, [open]);

  const handleSubmit = async () => {
    const parsedTopicId = topicId ? Number(topicId) : undefined;
    const result = createMessageAutoSchema.safeParse({
      topicId: parsedTopicId,
      messageTopic,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await axiosInstance.post("/messageautos", {
        topicId: Number(topicId),
        messageTopic,
      });

      toast.success("ເພີ່ມຂໍ້ມູນຂໍ້ຄວາມອັດໂນມັດສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to add message auto:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ເພີ່ມຂໍ້ມູນຂໍ້ຄວາມອັດໂນມັດ" size="md">
      <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {errors.apiError && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {errors.apiError}
          </div>
        )}

        <div className="space-y-4">
          <Select
            label="ຫົວຂໍ້ *"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            error={errors.topicId}
            disabled={loadingTopics}
            options={[
              { value: "", label: "-- ເລືອກຫົວຂໍ້ --" },
              ...topics.map((t) => ({ value: String(t.id), label: t.name })),
            ]}
          />

          <Textarea
            label="ຂໍ້ຄວາມອັດໂນມັດ *"
            placeholder="ປ້ອນຂໍ້ຄວາມອັດໂນມັດ..."
            rows={4}
            value={messageTopic}
            onChange={(e) => setMessageTopic(e.target.value)}
            error={errors.messageTopic}
          />
        </div>

        <div className="flex gap-3 pt-3 border-t border-theme">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving} className="flex-1">
            ບັນທຶກ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
