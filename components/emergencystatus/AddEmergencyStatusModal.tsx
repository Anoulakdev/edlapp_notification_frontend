/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Button } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { createEmergencyStatusSchema } from "@/schemas/emergencystatus";
import { toast } from "react-toastify";

interface AddEmergencyStatusModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function AddEmergencyStatusModal({ open, onClose, onRefresh }: AddEmergencyStatusModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset fields when modal toggled
  useEffect(() => {
    if (open) {
      setName("");
      setErrors({});
    }
  }, [open]);

  const handleSubmit = async () => {
    const result = createEmergencyStatusSchema.safeParse({
      name,
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
      await axiosInstance.post("/emergencystatus", {
        name,
      });

      toast.success("ເພີ່ມຂໍ້ມູນສະຖານະມອດໄຟສຸກເສີນສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to add emergency status:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ເພີ່ມຂໍ້ມູນສະຖານະມອດໄຟສຸກເສີນ" size="md">
      <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {errors.apiError && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {errors.apiError}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="ຊື່ສະຖານະມອດໄຟສຸກເສີນ *"
            placeholder="ປ້ອນຊື່ສະຖານະມອດໄຟສຸກເສີນ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
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
