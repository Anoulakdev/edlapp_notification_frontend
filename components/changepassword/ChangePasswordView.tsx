"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";

export default function ChangePasswordView() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility states
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        if (res.data?.id) {
          setUserId(res.data.id);
        } else {
          router.push("/signin");
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ງານໄດ້");
        router.push("/signin");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("ລະຫັດຜ່ານໃໝ່ ແລະ ຢືນຢັນລະຫັດຜ່ານ ບໍ່ກົງກັນ");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ");
      return;
    }

    setErrorMsg(null);
    setSaving(true);

    try {
      await axiosInstance.put(`/users/changepassword/${userId}`, {
        oldpassword: oldPassword,
        password1: newPassword,
        password2: confirmPassword,
      });

      toast.success("ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ, ກະລຸນາເຂົ້າສູ່ລະບົບຄືນໃໝ່...");

      // Clear local storage and perform logout
      localStorage.removeItem("userRoleId");
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (error) {
        console.error("Logout error during password change:", error);
      }

      // Redirect to signin page after 1.5 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 1500);

    } catch (err: any) {
      console.error("Failed to change password:", err);
      const backendError = err.response?.data?.message;

      if (backendError === "Old password is incorrect") {
        setErrorMsg("ລະຫັດຜ່ານເກົ່າບໍ່ຖືກຕ້ອງ");
      } else if (backendError === "Password not match") {
        setErrorMsg("ລະຫັດຜ່ານບໍ່ກົງກັນ");
      } else {
        setErrorMsg(backendError || "ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ");
      }
      toast.error("ເກີດຂໍ້ຜິດພาดໃນການປ່ຽນລະຫັດຜ່ານ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>

      {loadingUser ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgb(var(--brand))" }} />
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            ກຳລັງໂຫຼດຂໍ້ມູນ...
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border p-8 shadow-sm transition-all"
          style={{
            background: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-8 pb-6 border-b" style={{ borderColor: "rgb(var(--border))" }}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner"
              style={{ background: "rgb(var(--brand)/0.1)", color: "rgb(var(--brand))" }}
            >
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                ປ່ຽນລະຫັດຜ່ານ
              </h2>
              <p className="text-xs mt-1" style={{ color: "rgb(var(--text-secondary))" }}>
                ອັບເດດລະຫັດຜ່ານເພື່ອຄວາມປອດໄພຂອງບັນຊີທ່ານ
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="flex items-start gap-3 p-4 rounded-xl text-sm border bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Old Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "rgb(var(--text-secondary))" }}>
                ລະຫັດຜ່ານເກົ່າ *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showOld ? "text" : "password"}
                  required
                  placeholder="ລະຫັດຜ່ານເກົ່າຂອງທ່ານ"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none bg-slate-500/5 focus:bg-transparent border transition-all"
                  style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--text-primary))" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgb(var(--brand))")}
                  onBlur={(e) => (e.target.style.borderColor = "rgb(var(--border))")}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showOld ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "rgb(var(--text-secondary))" }}>
                ລະຫັດຜ່ານໃໝ່ *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNew ? "text" : "password"}
                  required
                  placeholder="ລະຫັດຜ່ານໃໝ່ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none bg-slate-500/5 focus:bg-transparent border transition-all"
                  style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--text-primary))" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgb(var(--brand))")}
                  onBlur={(e) => (e.target.style.borderColor = "rgb(var(--border))")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNew ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "rgb(var(--text-secondary))" }}>
                ຢືນຢັນລະຫັດຜ່ານໃໝ່ *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="ຢືนຢັນລະຫັດຜ່ານໃໝ່ຂອງທ່ານ"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none bg-slate-500/5 focus:bg-transparent border transition-all"
                  style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--text-primary))" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgb(var(--brand))")}
                  onBlur={(e) => (e.target.style.borderColor = "rgb(var(--border))")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 border rounded-xl text-sm font-semibold hover:bg-slate-500/5 transition-all cursor-pointer shadow-sm text-center"
                style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--text-primary))" }}
              >
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                disabled={saving || !oldPassword || !newPassword || !confirmPassword}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:opacity-90 disabled:opacity-50"
                style={{ background: "rgb(var(--brand))" }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ກຳລັງອັບເດດ...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5" />
                    ອັບເດດລະຫັດຜ່ານ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
