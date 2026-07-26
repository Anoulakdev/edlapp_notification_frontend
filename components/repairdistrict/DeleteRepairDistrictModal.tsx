"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/FormElements";
import { Trash2 } from "lucide-react";
import { RepairDistrict } from "@/schemas/repairdistrict";

interface DeleteRepairDistrictModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  selectedDoc: RepairDistrict | null;
}

export function DeleteRepairDistrictModal({
  open,
  onClose,
  onDelete,
  selectedDoc,
}: DeleteRepairDistrictModalProps) {
  const [saving, setSaving] = useState(false);

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      console.error("Failed to delete repair district:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ລົບຂໍ້ມູນສູນສ້ອມແປງເມືອງ" size="sm">
      <div className="space-y-5" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        <div
          className="flex items-center gap-4 p-4 rounded-xl"
          style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(239, 68, 68, 0.12)" }}
          >
            <Trash2 className="w-5 h-5" style={{ color: "rgb(var(--danger))" }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate" style={{ color: "rgb(var(--text-primary))" }}>
              {selectedDoc?.name}
            </div>
            {selectedDoc?.branch?.name && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {selectedDoc.branch.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={saving} className="flex-1">
            ລົບຂໍ້ມູນ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
