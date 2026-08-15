"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/FormElements";
import { CheckCheck, MapPin, Phone, AlertCircle } from "lucide-react";
import { ProblemDoc } from "@/schemas/problemdoc";

interface AlreadyReportedModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  selectedDoc: ProblemDoc | null;
}

export function AlreadyReportedModal({
  open,
  onClose,
  onConfirm,
  selectedDoc,
}: AlreadyReportedModalProps) {
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Failed to mark problem doc as already reported:", err);
    } finally {
      setSaving(false);
    }
  };

  const locationText = [
    selectedDoc?.village?.village_name,
    selectedDoc?.district?.district_name,
    selectedDoc?.province?.province_name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Modal open={open} onClose={onClose} title="ຢືນຢັນ: ຈຸດນີ້ໄດ້ຖືກແຈ້ງແລ້ວ" size="sm">
      <div className="space-y-5" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        <div
          className="p-4 rounded-xl space-y-3"
          style={{
            background: "rgba(147, 51, 234, 0.06)",
            border: "1px solid rgba(147, 51, 234, 0.15)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(147, 51, 234, 0.12)" }}
            >
              <CheckCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold truncate text-slate-800 dark:text-slate-200">
                {selectedDoc?.fullName || "-"}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                {selectedDoc?.problemtype?.name || "ແຈ້ງບັນຫາ"} #{selectedDoc?.id}
              </div>
            </div>
          </div>

          {(selectedDoc?.tel || locationText) && (
            <div className="pt-2 border-t border-purple-500/10 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {selectedDoc?.tel && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>{selectedDoc.tel}</span>
                </div>
              )}
              {locationText && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="truncate">{locationText}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການປ່ຽນສະຖານະຂອງລາຍການນີ້ເປັນ{" "}
            <strong className="font-bold">"ຈຸດນີ້ໄດ້ຖືກແຈ້ງແລ້ວ"</strong>?
          </span>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving} className="flex-1">
            ຍົກເລີກ
          </Button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center font-semibold rounded-xl px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              "ຢືນຢັນ"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
