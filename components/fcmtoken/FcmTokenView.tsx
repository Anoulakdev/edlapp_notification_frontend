"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Trash2,
  Copy,
  Check,
  Smartphone,
  Search,
  Loader2,
  Info,
  ShieldCheck,
  User,
  Hash,
  Layers,
  Phone,
  Apple,
  Globe,
} from "lucide-react";
import apiClient from "@/lib/axiosInstance";
import { decryptId } from "@/lib/crypto";
import { getImageUrl } from "@/lib/utils";
import { toast } from "react-toastify";
import { Modal } from "@/components/ui/Modal";
import { Button, Badge } from "@/components/ui/FormElements";

type FcmToken = {
  id: number;
  userId: number;
  platform: string;
  model: string;
  fcmtoken: string;
};

type UserDetails = {
  id: number;
  username: string;
  role: { name: string };
  employee: {
    first_name: string;
    last_name: string;
    emp_code: string;
    email: string | null;
    tel: string | null;
    empimg: string | null;
    department?: { department_name: string } | null;
    division?: { division_name: string } | null;
    position?: { pos_name: string } | null;
  } | null;
  fcmtokens: FcmToken[];
};

export default function FcmTokenView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const encryptedId = searchParams.get("id") || "";

  // Decrypt user ID safely
  const userId = useMemo(() => {
    if (!encryptedId) return "";
    return decryptId(encryptedId);
  }, [encryptedId]);

  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Deletion state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<FcmToken | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<UserDetails>(`/users/${userId}`);
      setUserData(res.data);
    } catch (err) {
      console.error("Failed to load user fcm tokens:", err);
      toast.error("ດຶງຂໍ້ມູນຜູ້ໃຊ້ງານ ແລະ FCM Token ບໍ່ສຳເລັດ");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleCopy = (token: FcmToken) => {
    navigator.clipboard.writeText(token.fcmtoken);
    setCopiedId(token.id);
    toast.success("ຄັດລອກ FCM Token ສຳເລັດ!");
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const openDeleteModal = (token: FcmToken) => {
    setTokenToDelete(token);
    setDeleteModalOpen(true);
  };

  const handleDeleteToken = async () => {
    if (!tokenToDelete) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/users/deletefcm/${tokenToDelete.id}`);
      toast.success("ລຶບ FCM Token ສຳເລັດ!");
      setDeleteModalOpen(false);
      setTokenToDelete(null);
      // Refresh list
      await fetchUserData();
    } catch (err) {
      console.error("Failed to delete FCM Token:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລຶບ FCM Token!");
    } finally {
      setDeleting(false);
    }
  };

  // Filter fcm tokens
  const filteredTokens = useMemo(() => {
    if (!userData?.fcmtokens) return [];
    return userData.fcmtokens.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        (t.platform || "").toLowerCase().includes(q) ||
        (t.model || "").toLowerCase().includes(q) ||
        (t.fcmtoken || "").toLowerCase().includes(q)
      );
    });
  }, [userData?.fcmtokens, searchQuery]);

  const getPlatformColor = (platform: string): "blue" | "green" | "purple" | "gray" => {
    const p = (platform || "").toLowerCase();
    if (p.includes("ios") || p.includes("apple") || p.includes("iphone")) return "purple";
    if (p.includes("android")) return "green";
    if (p.includes("web") || p.includes("browser")) return "blue";
    return "gray";
  };

  // UI Initialized state
  const userName = userData?.employee
    ? `${userData.employee.first_name} ${userData.employee.last_name}`.trim()
    : userData?.username || `ID: ${userId}`;

  const avatarInitial = userName.charAt(0).toUpperCase() || "U";

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:opacity-80 border"
            style={{
              background: "rgb(var(--card))",
              borderColor: "rgb(var(--border))",
              color: "rgb(var(--text-secondary))",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
            >
              <Bell className="w-6 h-6" style={{ color: "rgb(var(--brand))" }} />
              ຈັດການ FCM Tokens
            </h1>
            <p className="text-sm mt-0.5 animate-fade-in" style={{ color: "rgb(var(--text-secondary))" }}>
              ເບິ່ງ ແລະ ຈັດການ tokens ທີ່ໃຊ້ໃນການສົ່ງແຈ້ງເຕືອນ (Push Notifications) ຂອງຜູ້ໃຊ້
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: "rgb(var(--brand))" }} />
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
      ) : !userId || !userData ? (
        <div className="p-8 text-center rounded-2xl border bg-red-50/10 border-red-200/20 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
            <Info className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "rgb(var(--text-primary))" }}>ບໍ່ພົບຜູ້ໃຊ້ງານ</h2>
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ງານທີ່ລະບຸ ຫຼື ລະຫັດຜູ້ໃຊ້ງານບໍ່ຖືກຕ້ອງ
          </p>
          <Button variant="secondary" onClick={() => router.back()}>ກັບຄືນ</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* User profile detail sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <div
              className="rounded-2xl p-6 relative overflow-hidden transition-all shadow-sm"
              style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
            >
              {/* Profile Card Header Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-2xl"></div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-lg border-2 border-white/20 overflow-hidden bg-gradient-to-tr from-brand to-cyan-500"
                >
                  {userData.employee?.empimg ? (
                    <img
                      src={getImageUrl(userData.employee.empimg) || userData.employee.empimg}
                      alt="profile"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    avatarInitial
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                    {userName}
                  </h3>
                  <div className="flex justify-center items-center gap-1.5">
                    <Badge color="purple">{userData.role?.name || "User"}</Badge>
                    <span className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                      @{userData.username}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Specs */}
              <div className="mt-6 pt-6 border-t space-y-4" style={{ borderColor: "rgb(var(--border))" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 shrink-0">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>
                      ລະຫັດພະນັກງານ
                    </p>
                    <p className="text-sm font-bold truncate" style={{ color: "rgb(var(--text-primary))" }}>
                      {userData.employee?.emp_code || "-"}
                    </p>
                  </div>
                </div>

                {userData.employee?.tel && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>
                        ເບີໂທລະສັບ
                      </p>
                      <p className="text-sm font-medium truncate" style={{ color: "rgb(var(--text-primary))" }}>
                        {userData.employee.tel}
                      </p>
                    </div>
                  </div>
                )}

                {userData.employee?.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>
                        ອີເມລ
                      </p>
                      <p className="text-sm font-medium truncate" style={{ color: "rgb(var(--text-primary))" }}>
                        {userData.employee.email}
                      </p>
                    </div>
                  </div>
                )}

                {userData.employee?.department?.department_name && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>
                        ຝ່າຍ
                      </p>
                      <p className="text-sm font-medium truncate" style={{ color: "rgb(var(--text-primary))" }}>
                        {userData.employee.department.department_name}
                      </p>
                    </div>
                  </div>
                )}

                {userData.employee?.division?.division_name && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>
                        ພະແນກ
                      </p>
                      <p className="text-sm font-medium truncate" style={{ color: "rgb(var(--text-primary))" }}>
                        {userData.employee.division.division_name}
                      </p>
                    </div>
                  </div>
                )}

                {userData.employee?.position?.pos_name && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 shrink-0">
                      <Info className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>
                        ຕຳແໜ່ງ
                      </p>
                      <p className="text-sm font-medium truncate" style={{ color: "rgb(var(--text-primary))" }}>
                        {userData.employee.position.pos_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tokens table area */}
          <div className="xl:col-span-3 space-y-6">
            <div
              className="rounded-2xl overflow-hidden transition-all shadow-sm"
              style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
            >
              {/* Header and search bar */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                    ລາຍການ FCM Tokens
                  </h2>
                  <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                    ທັງໝົດ {userData.fcmtokens?.length || 0} ລາຍການ
                  </p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາ platform, model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "rgb(var(--bg))",
                      border: "1px solid rgb(var(--border))",
                      color: "rgb(var(--text-primary))",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgb(var(--brand))")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgb(var(--border))")}
                  />
                </div>
              </div>

              {/* Table section */}
              <div className="overflow-x-auto">
                {filteredTokens.length === 0 ? (
                  <div className="px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-800"
                    >
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                        {searchQuery ? "ບໍ່ພົບຜົນການຄົ້ນຫາ" : "ບໍ່ພົບ FCM Token"}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "rgb(var(--text-secondary))" }}>
                        {searchQuery ? "ກະລຸນາລອງຄົ້ນຫາດ້ວຍຄຳສັບອື່ນ" : "ຜູ້ໃຊ້ນີ້ຍັງບໍ່ມີອຸປະກອນທີ່ລົງທະບຽນຮັບການແຈ້ງເຕືອນ"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full min-w-160">
                    <thead>
                      <tr
                        className="bg-gradient-to-r from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b text-sm font-bold"
                        style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--brand))" }}
                      >
                        <th className="text-left px-6 py-4 uppercase tracking-wider">ອຸປະກອນ / Platform</th>
                        <th className="text-left px-6 py-4 uppercase tracking-wider">ລຸ້ນ / Model</th>
                        <th className="text-left px-6 py-4 uppercase tracking-wider w-1/2">FCM Token</th>
                        <th className="text-center px-6 py-4 uppercase tracking-wider shrink-0 w-28">ຈັດການ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/20">
                      {filteredTokens.map((token, index) => {
                        const isCopied = copiedId === token.id;
                        return (
                          <tr
                            key={token.id}
                            className={`transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-900/10 ${index % 2 === 0 ? "bg-transparent" : "bg-gray-50/20 dark:bg-gray-800/10"
                              }`}
                          >
                            {/* Platform */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                  {(token.platform || "").toLowerCase().includes("ios") ||
                                  (token.platform || "").toLowerCase().includes("apple") ||
                                  (token.platform || "").toLowerCase().includes("iphone") ? (
                                    <Apple className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                  ) : (token.platform || "").toLowerCase().includes("android") ? (
                                    <Smartphone className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <Globe className="w-4 h-4 text-sky-500" />
                                  )}
                                </div>
                                <Badge color={getPlatformColor(token.platform)}>
                                  {token.platform}
                                </Badge>
                              </div>
                            </td>

                            {/* Model */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                                {token.model}
                              </span>
                            </td>

                            {/* FCM Token String */}
                            <td className="px-6 py-4 max-w-xs">
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-xs font-mono truncate select-all block max-w-[280px] xl:max-w-[400px] border border-transparent hover:border-gray-200 dark:hover:border-gray-800 rounded px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800/30"
                                  style={{ color: "rgb(var(--text-secondary))" }}
                                  title={token.fcmtoken}
                                >
                                  {token.fcmtoken}
                                </span>
                                <button
                                  onClick={() => handleCopy(token)}
                                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                                  title="คัดลอก FCM Token"
                                  style={{ color: isCopied ? "rgb(34 197 94)" : "rgb(var(--text-secondary))" }}
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => openDeleteModal(token)}
                                className="p-2 rounded-lg transition-all"
                                style={{ background: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                                }}
                                title="ลบ Token"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Token Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="ຢືນຢັນການລົບ FCM Token"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບ FCM Token ຂອງອຸປະກອນ <strong>{tokenToDelete?.model} ({tokenToDelete?.platform})</strong>?
            ຫຼັງຈາກລົບແລ້ວ ອຸປະກອນນີ້ຈະບໍ່ໄດ້ຮັບການແຈ້ງເຕືອນຈົນກວ່າຈະເຂົ້າສູ່ລະບົບໃໝ່.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1"
            >
              ຍົກເລີກ
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteToken}
              loading={deleting}
              className="flex-1"
              style={{ background: "rgb(239, 68, 68)", borderColor: "rgb(239, 68, 68)" }}
            >
              ຢືນຢັນການລົບ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
