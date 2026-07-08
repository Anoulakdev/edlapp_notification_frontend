"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Button } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { editRoleSchema } from "@/schemas/role";
import { toast } from "react-toastify";

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: { id: number; name: string } | null;
  onRefresh: () => void;
}

export function EditRoleModal({ open, onClose, selectedDoc, onRefresh }: EditRoleModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load document details on open
  useEffect(() => {
    if (open && selectedDoc) {
      const fetchDocDetails = async () => {
        try {
          setLoadingDoc(true);
          const res = await axiosInstance.get(`/roles/${selectedDoc.id}`);
          const doc = res.data;

          setName(doc.name || "");
          setDescription(doc.description || "");
          setErrors({});
        } catch (err) {
          console.error("Failed to load role details:", err);
          setErrors({ apiError: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສິດຜູ້ໃຊ້ງານໄດ້" });
        } finally {
          setLoadingDoc(false);
        }
      };
      fetchDocDetails();
    }
  }, [open, selectedDoc]);

  const handleSubmit = async () => {
    if (!selectedDoc) return;

    const result = editRoleSchema.safeParse({
      name,
      description: description || null,
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
      await axiosInstance.put(`/roles/${selectedDoc.id}`, {
        name,
        description: description || null,
      });

      toast.success("ແກ້ໄຂຂໍ້ມູນສິດຜູ້ໃຊ້ງານສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to update role:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ແກ້ໄຂຂໍ້ມູນສິດຜູ້ໃຊ້ງານ" size="md">
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
            <Input
              label="ຊື່ສິດຜູ້ໃຊ້ງານ *"
              placeholder="ປ້ອນຊື່ສິດຜູ້ໃຊ້ງານ..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <Textarea
              label="ຄຳອະທິບາຍ"
              placeholder="ປ້ອນຄຳອະທິບາຍສິດຜູ້ໃຊ້ງານ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
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
