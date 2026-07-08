"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, Select } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";

interface ForwardRegistermeterModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: {
    id: number;
    fullName: string;
    province?: { province_name: string } | null;
    district?: { district_name: string } | null;
    village?: { village_name: string } | null;
  } | null;
  mode: "create" | "update"; // 'create' for call center createForward, 'update' for branch updateForward
  onRefresh: () => void;
}

export function ForwardRegistermeterModal({ open, onClose, selectedDoc, mode, onRefresh }: ForwardRegistermeterModalProps) {
  const [meterStatusId, setMeterStatusId] = useState("");
  const [meterStatuses, setMeterStatuses] = useState<{ id: number; callcenter: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch meter statuses
  useEffect(() => {
    if (open) {
      const fetchStatuses = async () => {
        try {
          const res = await axiosInstance.get("/meterstatues/selectstatus");
          setMeterStatuses(res.data || []);

          // Preselect next logical status
          if (mode === "create") {
            setMeterStatusId("2"); // typically 2: Accepted/In Progress
          } else {
            setMeterStatusId("3"); // typically 3: Completed/Processed
          }
        } catch (err) {
          console.error("Failed to load meter statuses:", err);
        }
      };
      fetchStatuses();
    }
  }, [open, mode]);

  const handleForward = async () => {
    if (!selectedDoc) return;
    if (!meterStatusId) {
      setError("ກະລຸນາເລືອກສະຖານະ");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (mode === "create") {
        await axiosInstance.post("/registermeters/createforward", {
          meterId: Number(selectedDoc.id),
          meterStatusId: Number(meterStatusId),
        });
        toast.success("ຮັບເລື່ອງ ແລະ ສົ່ງຕໍ່ສຳເລັດ");
      } else {
        await axiosInstance.put(`/registermeters/updateforward/${selectedDoc.id}`, {
          meterStatusId: Number(meterStatusId),
        });
        toast.success("ຮັບເອກະສານສຳເລັດ");
      }
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to forward/update register meter:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "ຮັບເລື່ອງ ແລະ ສົ່ງຕໍ່ (Call Center)" : "ຮັບເອກະສານ"}
      size="sm"
    >
      <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {error && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex flex-col gap-1.5">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            ແຈ້ງຂໍໝໍ້ນັບໄຟໃໝ່ເລກທີ: <span className="font-mono">{selectedDoc?.id}</span>
          </p>
          <p>ຊື່ຜູ້ແຈ້ງ: <span className="font-bold text-slate-750 dark:text-slate-300">{selectedDoc?.fullName}</span></p>
          <p>ແຂວງ: <span className="font-bold text-slate-750 dark:text-slate-300">{selectedDoc?.province?.province_name || "-"}</span></p>
          <p>ເມືອງ: <span className="font-bold text-slate-750 dark:text-slate-300">{selectedDoc?.district?.district_name || "-"}</span></p>
          <p>ບ້ານ: <span className="font-bold text-slate-750 dark:text-slate-300">{selectedDoc?.village?.village_name || "-"}</span></p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button variant="primary" onClick={handleForward} loading={saving} className="flex-1">
            ຢືນຢັນ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
