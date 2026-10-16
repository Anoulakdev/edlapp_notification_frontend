"use client";

import { Modal } from "@/components/ui/Modal";
import { UserApp } from "@/schemas/userapp";
import { KeyRound, AlertTriangle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: UserApp | null;
  onSuccess: () => void;
}

export function ResetPasswordModal({
  open,
  onClose,
  user,
  onSuccess,
}: ResetPasswordModalProps) {
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleReset = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`/userapp/${user.user_id}`);
      toast.success("ຣີເຊັດລະຫັດຜ່ານສຳເລັດ");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to reset password:", error);
      toast.error(
        error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການຣີເຊັດລະຫັດຜ່ານ",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !loading && onClose()}
      title={
        <div className="flex items-center gap-2 text-amber-500">
          <KeyRound className="w-5 h-5" />
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            ຣີເຊັດລະຫັດຜ່ານ
          </span>
        </div>
      }
      size="md"
    >
      <div
        className="space-y-5 text-sm"
        style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
      >
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-xs">
              ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຣີເຊັດລະຫັດຜ່ານ?
            </p>
            <p className="text-xs opacity-90">
              ລະບົບຈະປ່ຽນລະຫັດຜ່ານຂອງບັນຊີນີ້ເປັນລະຫັດເລີ່ມຕົ້ນ.
            </p>
          </div>
        </div>

        {/* User preview */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">ລະຫັດຜູ້ໃຊ້:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              #{user.user_id}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">ຊື່ ແລະ ນາມສະກຸນ:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {user.username || "ບໍ່ມີຊື່"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">ເບີໂທລະສັບ:</span>
            <span className="font-mono font-semibold text-brand">
              {user.phone_no || "-"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            ຍົກເລີກ
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>ກຳລັງຣີເຊັດ...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>ຢືນຢັນຣີເຊັດ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
