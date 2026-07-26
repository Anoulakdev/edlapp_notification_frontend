"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Select, Button, Textarea } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { editMessageAutoSchema, MessageAuto } from "@/schemas/messageauto";
import { toast } from "react-toastify";

interface TopicOption {
  id: number;
  name: string;
}

interface EditMessageAutoModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: MessageAuto | null;
  onRefresh: () => void;
}

export function EditMessageAutoModal({ open, onClose, selectedDoc, onRefresh }: EditMessageAutoModalProps) {
  const [topicId, setTopicId] = useState("");
  const [messageTopic, setMessageTopic] = useState("");
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch topics and load document details on open
  useEffect(() => {
    if (open && selectedDoc) {
      const fetchData = async () => {
        try {
          setLoadingDoc(true);
          const [topicsRes, docRes] = await Promise.all([
            axiosInstance.get("/topics/selecttopic"),
            axiosInstance.get(`/messageautos/${selectedDoc.id}`),
          ]);

          const topicsData = Array.isArray(topicsRes.data) ? topicsRes.data : (topicsRes.data.data || []);
          setTopics(topicsData);

          const doc = docRes.data;
          setTopicId(doc.topicId ? String(doc.topicId) : "");
          setMessageTopic(doc.messageTopic || "");
          setErrors({});
        } catch (err) {
          console.error("Failed to load message auto details:", err);
          setErrors({ apiError: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຂໍ້ຄວາມອັດໂນມັດໄດ້" });
        } finally {
          setLoadingDoc(false);
        }
      };
      fetchData();
    }
  }, [open, selectedDoc]);

  const handleSubmit = async () => {
    if (!selectedDoc) return;

    const parsedTopicId = topicId ? Number(topicId) : undefined;
    const result = editMessageAutoSchema.safeParse({
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
      await axiosInstance.put(`/messageautos/${selectedDoc.id}`, {
        topicId: Number(topicId),
        messageTopic,
      });

      toast.success("ແກ້ໄຂຂໍ້ມູນຂໍ້ຄວາມອັດໂນມັດສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to update message auto:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ແກ້ໄຂຂໍ້ມູນຂໍ້ຄວາມອັດໂນມັດ" size="md">
      {loadingDoc ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
        </div>
      ) : (
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
              ອັບເດດ
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
