"use client";

import { Modal } from "@/components/ui/Modal";
import { UserPlus, User, Phone, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";

interface AddUserappModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserappModal({
  open,
  onClose,
  onSuccess,
}: AddUserappModalProps) {
  const [username, setUsername] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername("");
    setPhoneNo("");
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const cleanPhone = phoneNo.trim().replace(/[\s\-]/g, "");
    const normalizedPhone = cleanPhone.startsWith("020")
      ? cleanPhone.slice(1)
      : cleanPhone;

    if (!trimmedUsername) {
      toast.warn("ກະລຸນາປ້ອນຊື່ ແລະ ນາມສະກຸນ");
      return;
    }

    if (!normalizedPhone) {
      toast.warn("ກະລຸນາປ້ອນເບີໂທລະສັບ");
      return;
    }

    if (!/^\d{8,15}$/.test(normalizedPhone)) {
      toast.warn("ຮູບແບບເບີໂທລະສັບບໍ່ຖືກຕ້ອງ (ຕົວຢ່າງ: 20xxxxxxxx)");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/userapp", {
        username: trimmedUsername,
        phone_no: normalizedPhone,
      });

      toast.success("ສ້າງບັນຊີຜູ້ໃຊ້ແອັບສຳເລັດ");
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to create userapp:", error);
      toast.error("ເບີໂທນີ້ໄດ້ລົງທະບຽນແລ້ວ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2 text-brand">
          <UserPlus className="w-5 h-5" />
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            ເພີ່ມຜູ້ໃຊ້ແອັບໃໝ່
          </span>
        </div>
      }
      size="md"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 text-sm"
        style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
      >
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            ຊື່ ແລະ ນາມສະກຸນ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-theme bg-theme-bg text-theme-primary focus:border-brand"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            ເບີໂທລະສັບ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              required
              placeholder="ຕົວຢ່າງ: 20xxxxxxxx"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all border border-theme bg-theme-bg text-theme-primary focus:border-brand font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            * ລະບົບຈະກວດສອບເບີໂທລະສັບຊ້ຳ ແລະ ຕັ້ງລະຫັດຜ່ານເລີ່ມຕົ້ນໃຫ້ອັດໂນມັດ
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            ຍົກເລີກ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:opacity-90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>ກຳລັງບັນທຶກ...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>ບັນທຶກຂໍ້ມູນ</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
