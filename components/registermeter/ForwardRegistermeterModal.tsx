"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { RegisterMeter } from "@/schemas/registermeter";

interface ForwardRegistermeterModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: RegisterMeter | null;
  mode: "create" | "update"; // 'create' for call center createForward, 'update' for branch updateForward
  onRefresh: () => void;
}

export function ForwardRegistermeterModal({
  open,
  onClose,
  selectedDoc,
  mode,
  onRefresh,
}: ForwardRegistermeterModalProps) {
  const [meterStatusId, setMeterStatusId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      setIsConfirmed(false);
      if (mode === "create") {
        setMeterStatusId("2"); // typically 2: Accepted & Forwarded to Branch/District
      } else {
        setMeterStatusId("3"); // typically 3: Completed/Received by Branch
      }
    }
  }, [open, mode]);

  const handleForward = async () => {
    if (!selectedDoc) return;
    if (!meterStatusId) {
      setError("ກະລຸນາເລືອກສະຖານະ");
      return;
    }
    if (!isConfirmed) {
      setError(
        mode === "create"
          ? "ກະລຸນາໝາຍຕິກຢືນຢັນວ່າໄດ້ກວດກາເອກະສານຄົບຖ້ວນແລ້ວ"
          : "ກະລຸນາໝາຍຕິກຢືນຢັນການຮັບຮູ້ ແລະ ຮັບເອກະສານ"
      );
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
        await axiosInstance.put(
          `/registermeters/updateforward/${selectedDoc.id}`,
          {
            meterStatusId: Number(meterStatusId),
          },
        );
        toast.success("ຮັບເອກະສານສຳເລັດ");
      }
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to forward/update register meter:", err);
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
          <span>
            {mode === "create"
              ? "ຮັບເລື່ອງ ແລະ ສົ່ງຕໍ່ (Call Center)"
              : "ຮັບເອກະສານ (ສາຂາ/ເມືອງ)"}
          </span>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${mode === "create"
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              }`}
          >
            {mode === "create" ? "ສົ່ງຕໍ່ໃຫ້ເມືອງ" : "ຮັບຮູ້ເອກະສານ"}
          </span>
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
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Notice based on mode */}
        {mode === "create" ? (
          /* Call Center Notice */
          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200/90 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-800 dark:text-amber-300">
                ກະລຸນາກວດກາເອກະສານໃຫ້ຄົບຖ້ວນກ່ອນດຳເນີນການ
              </p>
              <p className="text-amber-700/90 dark:text-amber-300/80 text-[11px]">
                ກວດສອບຂໍ້ມູນລູກຄ້າ, ທີ່ຢູ່, ເລກບັນຊີໃກ້ຄຽງ ແລະ
                ຮູບພາບເອກະສານຄັດຕິດ (ໃບແຈ້ງບິນໃກ້ຄຽງ ແລະ ບັດປະຈຳຕົວ)
                ໃຫ້ລະອຽດຖືກຕ້ອງ. ຖ້າເອກະສານບໍ່ຄົບຖ້ວນ ກະລຸນາຍົກເລີກ ແລະ ເລືອກ{" "}
                <strong>&quot;ເອກະສານບໍ່ຄົບ&quot;</strong> ເພື່ອສົ່ງເລື່ອງກັບຄືນ.
              </p>
            </div>
          </div>
        ) : (
          /* District/Branch Acceptance & Acknowledgment Notice */
          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-200/90 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-800 dark:text-emerald-300">
                ເອກະສານໄດ້ຜ່ານການກວດກາຄວາມຖືກຕ້ອງແລ້ວ
              </p>
              <p className="text-emerald-700/90 dark:text-emerald-300/80 text-[11px]">
                ເອກະສານຄຳຮ້ອງຊຸດນີ້ໄດ້ຜ່ານການກວດສອບຄວາມຖືກຕ້ອງ ແລະ ຄົບຖ້ວນຈາກສູນ Contact Center (1199) ຮຽບຮ້ອຍແລ້ວ. ກະລຸນາຮັບຮູ້ ແລະ ຢືນຢັນການຮັບເລື່ອງເຂົ້າລະບົບ ເພື່ອສືບຕໍ່ດຳເນີນການປະສານງານຕໍ່ໄປ.
              </p>
            </div>
          </div>
        )}

        {/* Detailed Document Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              ແຈ້ງຂໍໝໍ້ນັບໄຟໃໝ່ເລກທີ:
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
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

        {/* Confirmation Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer pt-1 select-none">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => {
              setIsConfirmed(e.target.checked);
              if (error) setError("");
            }}
            className={`w-4 h-4 rounded border-slate-300 dark:border-slate-700 cursor-pointer ${mode === "create"
              ? "text-indigo-600 focus:ring-indigo-500"
              : "text-emerald-600 focus:ring-emerald-500"
              }`}
          />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
            {mode === "create"
              ? "ຂ້າພະເຈົ້າໄດ້ກວດກາຄວາມຖືກຕ້ອງ ແລະ ເອກະສານຄົບຖ້ວນແລ້ວ"
              : "ຂ້າພະເຈົ້າຮັບຮູ້ ແລະ ຢືນຢັນການຮັບເອກະສານຊຸດນີ້ເຂົ້າລະບົບ"}
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button
            variant="primary"
            onClick={handleForward}
            loading={saving}
            disabled={!isConfirmed || saving}
            className={`flex-1 ${!isConfirmed
              ? "opacity-50 cursor-not-allowed"
              : mode === "create"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
          >
            {mode === "create" ? "ຢືນຢັນການສົ່ງຕໍ່" : "ຢືນຢັນການຮັບເອກະສານ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
