"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, Textarea } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  FileText,
  MapPin,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { RegisterMeter } from "@/schemas/registermeter";

interface RejectRegistermeterModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: RegisterMeter | null;
  onRefresh: () => void;
}

export function RejectRegistermeterModal({
  open,
  onClose,
  selectedDoc,
  onRefresh,
}: RejectRegistermeterModalProps) {
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setComment(selectedDoc?.comment || "");
      setError("");
    }
  }, [open, selectedDoc]);

  const handleReject = async () => {
    if (!selectedDoc) return;

    if (!comment.trim()) {
      setError("ກະລຸນາປ້ອນເຫດຜົນ ຫຼື ລາຍລະອຽດທີ່ເອກະສານບໍ່ຄົບ");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await axiosInstance.put(`/registermeters/updatereject/${selectedDoc.id}`, {
        comment: comment.trim(),
      });
      toast.success("ບັນທຶກເອກະສານບໍ່ຄົບສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to reject register meter:", err);
      const errMsg =
        err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
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
      title={
        <div className="flex items-center gap-2">
          <span>ແຈ້ງເອກະສານບໍ່ຄົບ (ປະຕິເສດ)</span>
        </div>
      }
      size="md"
    >
      <div
        className="space-y-4"
        style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
      >
        {error && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Warning / Verification Notice */}
        <div className="p-3.5 rounded-xl bg-red-50/80 dark:bg-red-950/25 border border-red-200/90 dark:border-red-900/50 text-red-900 dark:text-red-200 text-xs leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-red-800 dark:text-red-300">
              ກະລຸນາລະບຸເຫດຜົນ ຫຼື ຂໍ້ມູນທີ່ເອກະສານບໍ່ຄົບຖ້ວນໃຫ້ຊັດເຈນ
            </p>
            <p className="text-red-700/90 dark:text-red-300/80 text-[11px]">
              ເອກະສານນີ້ຈະຖືກປ່ຽນສະຖານະເປັນ <strong>&quot;ເອກະສານບໍ່ຄົບ&quot;</strong> ແລະ ສົ່ງແຈ້ງເຕືອນກັບຄືນໃຫ້ຜູ້ກ່ຽວແກ້ໄຂ ຫຼື ເພີ່ມເຕີມເອກະສານໃຫ້ຄົບຖ້ວນ.
            </p>
          </div>
        </div>

        {/* Detailed Document Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              ແຈ້ງຂໍໝໍ້ນັບໄຟໃໝ່ເລກທີ:
            </span>
            <span className="font-mono font-bold text-red-600 dark:text-red-400">
              #{selectedDoc?.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                <User className="w-3 h-3" /> ຊື່ຜູ້ແຈ້ງ:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {selectedDoc?.fullName || "-"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                <Phone className="w-3 h-3" /> ເບີໂທລະສັບ:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {selectedDoc?.phone || "-"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                <FileText className="w-3 h-3" /> ເລກບັນຊີໃກ້ຄຽງ:
              </span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {selectedDoc?.accountNear || "-"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                <MapPin className="w-3 h-3" /> ທີ່ຢູ່ຕິດຕັ້ງ:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {selectedDoc?.village?.village_name || "-"},{" "}
                {selectedDoc?.district?.district_name || "-"},{" "}
                {selectedDoc?.province?.province_name || "-"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Textarea
            label="ເຫດຜົນ / ລາຍລະອຽດທີ່ເອກະສານບໍ່ຄົບ *"
            placeholder="ລະບຸເຫດຜົນ ຫຼື ຂໍ້ມູນ/ຮູບພາບທີ່ຍັງຂາດ ເພື່ອແຈ້ງໃຫ້ແກ້ໄຂ..."
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (error) setError("");
            }}
            rows={4}
            className="text-xs"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            loading={saving}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            ຢືນຢັນເອກະສານບໍ່ຄົບ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
