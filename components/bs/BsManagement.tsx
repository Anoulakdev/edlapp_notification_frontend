"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RotateCcw,
  Building2,
  Calendar,
  Hash,
  FileSpreadsheet,
  Zap,
  Receipt,
  User,
  Phone,
  MapPin,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import { BsEnergyItem, BsDebtItem, BsApiResponse, ProvinceItem } from "@/schemas/bs";
import { EnergyConsumptionChart } from "./EnergyConsumptionChart";
import { DebtHistoryTable } from "./DebtHistoryTable";

export function BsManagement() {
  const router = useRouter();

  // Auth state
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // Provinces
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  // Search Filter State
  const [provinceId, setProvinceId] = useState<string>("");
  const [accountNo, setAccountNo] = useState<string>("");

  // Year Options: Current year down to 10 years back
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearOptions = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => currentYear - i);
  }, [currentYear]);

  const [startYear, setStartYear] = useState<string>(String(currentYear));
  const [endYear, setEndYear] = useState<string>(String(currentYear));

  // Query Result State
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [energyList, setEnergyList] = useState<BsEnergyItem[]>([]);
  const [debtList, setDebtList] = useState<BsDebtItem[]>([]);

  // Active Tab: 'energy' | 'debt'
  const [activeTab, setActiveTab] = useState<"energy" | "debt">("energy");

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        if ([2, 3, 4].includes(res.data?.roleId)) {
          setAuthorized(true);
        } else {
          router.replace("/unauthorized");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/signin");
      }
    };
    checkAuth();
  }, [router]);

  // Load provinces from /provinces/selectprovince
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await axiosInstance.get<ProvinceItem[]>("/provinces/selectprovince");
        if (Array.isArray(res.data)) {
          setProvinces(res.data);
          if (res.data.length > 0) {
            setProvinceId((prev) => (prev ? prev : String(res.data[0].id)));
          }
        }
      } catch (err) {
        console.error("Failed to load provinces:", err);
        toast.error("ບໍ່ສາມາດໂຫຼດລາຍຊື່ແຂວງໄດ້");
      } finally {
        setLoadingProvinces(false);
      }
    };
    if (authorized) {
      fetchProvinces();
    }
  }, [authorized]);

  // Perform search against /bs
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!provinceId || !provinceId.trim()) {
      toast.warning("ກະລຸນາເລືອກແຂວງ");
      return;
    }
    if (!accountNo.trim()) {
      toast.warning("ກະລຸນາປ້ອນເລກບັນຊີ");
      return;
    }
    if (!startYear) {
      toast.warning("ກະລຸນາເລືອກປີເລີ່ມຕົ້ນ");
      return;
    }
    if (!endYear) {
      toast.warning("ກະລຸນາເລືອກປີສິ້ນສຸດ");
      return;
    }
    if (Number(startYear) > Number(endYear)) {
      toast.warning("ປີເລີ່ມຕົ້ນ ບໍ່ສາມາດໃຫຍ່ກວ່າ ປີສິ້ນສຸດ");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get<BsApiResponse>("/bs", {
        params: {
          provinceId: Number(provinceId),
          accountNo: accountNo.trim(),
          start_year: String(startYear).trim(),
          end_year: String(endYear).trim(),
        },
      });

      const energies = Array.isArray(res.data?.energy?.data) ? res.data.energy.data : [];
      const debts = Array.isArray(res.data?.debt?.data) ? res.data.debt.data : [];

      setEnergyList(energies);
      setDebtList(debts);
      setHasSearched(true);

      if (energies.length === 0 && debts.length === 0) {
        toast.info("ບໍ່ພົບຂໍ້ມູນໃນລະບົບ BS ຕາມເງື່ອນໄຂທີ່ເລືອກ");
      } else {
        toast.success(
          `ໂຫຼດຂໍ້ມູນສຳເລັດ: ພະລັງງານ ${energies.length} ລາຍການ, ໜີ້ສິນ ${debts.length} ລາຍການ`
        );
      }
    } catch (error: any) {
      console.error("Error fetching BS data:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.errorr?.message ||
        "ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ລະບົບ BS";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Reset filter form
  const handleReset = () => {
    if (provinces.length > 0) {
      setProvinceId(String(provinces[0].id));
    } else {
      setProvinceId("");
    }
    setAccountNo("");
    setStartYear(String(currentYear));
    setEndYear(String(currentYear));
    setEnergyList([]);
    setDebtList([]);
    setHasSearched(false);
  };

  // Customer info extraction from first energy item
  const customerInfo = useMemo(() => {
    if (energyList.length > 0) {
      const first = energyList[0];
      return {
        customer_name: first.customer_name || "-",
        account_no: first.account_no || accountNo,
        barnch: first.barnch || "-",
        phone: first.phone_no || first.tel || "-",
        tel: first.tel || first.phone_no || "-",
        address: first.address || "-",
        meter_status: first.meter_status || "-",
        account_status: first.account_status || "-",
      };
    }
    return null;
  }, [energyList, accountNo]);

  if (authorized === null) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          ກຳລັງກວດສອບສິດການເຂົ້າເຖິງ...
        </span>
      </div>
    );
  }

  return (
    <div
      className="max-w-screen-2xl mx-auto px-3.5 sm:px-6 py-4 sm:py-5 space-y-3.5 sm:space-y-4"
      style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
    >
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ກວດສອບຂໍ້ມູນລະບົບ BS (Billing System)
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Form Card */}
      <div
        className="p-3.5 sm:p-5 rounded-2xl border shadow-xs transition-all"
        style={{
          background: "rgb(var(--card))",
          borderColor: "rgb(var(--border))",
        }}
      >
        <form onSubmit={handleSearch} className="space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Filter 1: Province */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>ແຂວງ</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={provinceId}
                  onChange={(e) => setProvinceId(e.target.value)}
                  disabled={loadingProvinces || loading}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    -- ເລືອກແຂວງ --
                  </option>
                  {provinces.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.province_name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Filter 2: Account No */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-500" />
                <span>ເລກບັນຊີ</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="ປ້ອນເລກບັນຊີຜູ້ໃຊ້ໄຟ..."
                  disabled={loading}
                  className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {accountNo && (
                  <button
                    type="button"
                    onClick={() => setAccountNo("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter 3: Start Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>ເລີ່ມປີ</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      ປີ {year}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Filter 4: End Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>ເຖິງປີ</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      ປີ {year}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-1">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ຣີເຊັດ</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>ກຳລັງຄົ້ນຫາ...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>ຄົ້ນຫາຂໍ້ມູນ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Customer Info Card if available */}
      {customerInfo && (
        <div
          className="relative overflow-hidden p-3.5 sm:p-5 rounded-2xl border shadow-xs transition-all"
          style={{
            background:
              "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.08) 100%), rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                    {customerInfo.customer_name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 shrink-0">
                    ເລກບັນຊີ: {customerInfo.account_no}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:flex sm:items-center gap-1.5 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>ສາຂາ: {customerInfo.barnch || "-"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>ໂທ: {customerInfo.tel || "-"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="break-words">ທີ່ຢູ່: {customerInfo.address || "-"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Content Section */}
      {hasSearched ? (
        <div
          className="rounded-2xl border shadow-xs overflow-hidden"
          style={{
            background: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          {/* Tab Switcher */}
          <div className="p-2 sm:px-5 sm:py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("energy")}
                className={`w-full sm:w-auto px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "energy"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                <Zap className="w-4 h-4 shrink-0" />
                <span className="truncate">ການຊົມໃຊ້ໄຟຟ້າ</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${activeTab === "energy"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  {energyList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("debt")}
                className={`w-full sm:w-auto px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "debt"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                <Receipt className="w-4 h-4 shrink-0" />
                <span className="truncate">ປະຫວັດໜີ້ສິນ ແລະ ຊຳລະ</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${activeTab === "debt"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  {debtList.length}
                </span>
              </button>
            </div>
          </div>

          {/* Tab 1 Content: Energy */}
          {activeTab === "energy" && (
            <div>
              {energyList.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">ບໍ່ພົບຂໍ້ມູນການຊົມໃຊ້ໄຟຟ້າ</p>
                </div>
              ) : (
                <EnergyConsumptionChart energyList={energyList} />
              )}
            </div>
          )}

          {/* Tab 2 Content: Debt Table */}
          {activeTab === "debt" && (
            <div>
              <DebtHistoryTable debtList={debtList} />
            </div>
          )}
        </div>
      ) : (
        /* Prompt before search */
        <div
          className="p-8 sm:p-10 text-center rounded-2xl border shadow-xs"
          style={{
            background: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            ກະລຸນາເລືອກເງື່ອນໄຂເພື່ອຄົ້ນຫາຂໍ້ມູນ
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            ເລືອກແຂວງ, ປ້ອນເລກບັນຊີຜູ້ຊົມໃຊ້ໄຟຟ້າ ແລະ ເລືອກຊ່ວງປີທີ່ຕ້ອງການກວດສອບ ແລ້ວກົດປຸ່ມ{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">&quot;ຄົ້ນຫາຂໍ້ມູນ&quot;</span>
          </p>
        </div>
      )}
    </div>
  );
}
