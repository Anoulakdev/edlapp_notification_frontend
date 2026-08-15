"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  FileText,
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Home,
  FileSpreadsheet,
  FileType,
  Sparkles,
  Layers,
  Component,
  AlertTriangle,
  Timer,
} from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import moment from "moment";

interface Province {
  id: number;
  province_name: string;
  province_code: string;
}

interface District {
  id: number;
  district_name: string;
  district_code: string;
}

interface Village {
  id: number;
  village_name: string;
}

interface ProblemType {
  id: number;
  name: string;
}

interface ProblemStatus {
  id: number;
  callcenter: string;
  edlapp?: string;
}

interface SourceType {
  id: number;
  name: string;
}

interface ProblemReportItem {
  id: number;
  fullName: string;
  tel: string;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  problemImg?: string | null;
  provinceId: number;
  province?: Province | null;
  districtId: number;
  district?: District | null;
  villageId: number;
  village?: Village | null;
  problemtypeId: number;
  problemtype?: ProblemType | null;
  problemstatusId: number;
  problemstatus?: ProblemStatus | null;
  sourcetypeId: number;
  sourcetype?: SourceType | null;
  branch?: { id: number; name: string } | null;
  repairDistrict?: { id: number; name: string } | null;
  totalTime?: number | null;
  createdAt: string;
  updatedAt: string;
}

export function ProblemReportManagement() {
  // Filter States
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [provinceId, setProvinceId] = useState<string>("all");
  const [districtId, setDistrictId] = useState<string>("all");
  const [villageId, setVillageId] = useState<string>("all");
  const [problemtypeId, setProblemtypeId] = useState<string>("all");
  const [problemstatusId, setProblemstatusId] = useState<string>("all");
  const [sourcetypeId, setSourcetypeId] = useState<string>("all");

  // Dropdown Options States
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [problemStatuses, setProblemStatuses] = useState<ProblemStatus[]>([]);
  const [sourceTypes, setSourceTypes] = useState<SourceType[]>([]);

  // Report Data States
  const [reportData, setReportData] = useState<ProblemReportItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Status States
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // User Role, Province & District States for role-based filters
  const [currentUserRoleId, setCurrentUserRoleId] = useState<number | null>(null);
  const [currentUserProvinceId, setCurrentUserProvinceId] = useState<number | null>(null);
  const [currentUserDistrictId, setCurrentUserDistrictId] = useState<number | null>(null);

  const effectiveProvinceId = useMemo(() => {
    if (currentUserRoleId === 5 || currentUserRoleId === 6) {
      return currentUserProvinceId ? String(currentUserProvinceId) : "";
    }
    return provinceId;
  }, [currentUserRoleId, currentUserProvinceId, provinceId]);

  const effectiveDistrictId = useMemo(() => {
    if (currentUserRoleId === 6 && currentUserDistrictId) {
      return String(currentUserDistrictId);
    }
    return districtId;
  }, [currentUserRoleId, currentUserDistrictId, districtId]);

  // Compute summary stats
  const stats = useMemo(() => {
    const totalDocs = total;
    const uniqueVillages = new Set(reportData.map((d) => d.villageId)).size;
    let totalUseTimeMinutes = 0;
    reportData.forEach((doc) => {
      if (doc.totalTime) {
        totalUseTimeMinutes += Number(doc.totalTime);
      }
    });
    const hours = Math.floor(totalUseTimeMinutes / 60);
    const mins = totalUseTimeMinutes % 60;
    const formattedDuration =
      hours > 0 ? `${hours} ຊົ່ວໂມງ ${mins} ນາທີ` : `${mins} ນາທີ`;

    return { totalDocs, uniqueVillages, totalUseTimeMinutes, formattedDuration };
  }, [reportData, total]);

  // Fetch Current Logged-in User Profile on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        setCurrentUserRoleId(res.data?.roleId || null);
        setCurrentUserProvinceId(res.data?.provinceId || null);
        setCurrentUserDistrictId(res.data?.districtId || null);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // 1. Fetch Provinces, ProblemTypes, ProblemStatuses, SourceTypes on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [provRes, pTypesRes, pStatusRes, sTypesRes] = await Promise.all([
          axiosInstance.get("/provinces/selectprovince"),
          axiosInstance.get("/problemtypes/selectproblemtype"),
          axiosInstance.get("/problemstatus/selectstatus"),
          axiosInstance.get("/sourcetypes/selectsource"),
        ]);
        setProvinces(provRes.data || []);
        setProblemTypes(
          Array.isArray(pTypesRes.data)
            ? pTypesRes.data
            : pTypesRes.data?.data || []
        );
        setProblemStatuses(
          Array.isArray(pStatusRes.data)
            ? pStatusRes.data
            : pStatusRes.data?.data || []
        );
        setSourceTypes(
          Array.isArray(sTypesRes.data)
            ? sTypesRes.data
            : sTypesRes.data?.data || []
        );
      } catch (err) {
        console.error("Failed to load initial dropdowns:", err);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Fetch Districts list when effectiveProvinceId changes
  useEffect(() => {
    if (!effectiveProvinceId || effectiveProvinceId === "all" || provinces.length === 0) {
      setDistricts([]);
      setDistrictId("all");
      setVillages([]);
      setVillageId("all");
      return;
    }
    const selectedProv = provinces.find((p) => String(p.id) === effectiveProvinceId);
    if (!selectedProv) {
      setDistricts([]);
      setDistrictId("all");
      setVillages([]);
      setVillageId("all");
      return;
    }

    const fetchDistricts = async () => {
      try {
        const res = await axiosInstance.get(
          `/districts/selectdistrict?provinceCode=${selectedProv.province_code}`
        );
        if (Array.isArray(res.data)) {
          setDistricts(res.data);
        } else {
          setDistricts([]);
        }
      } catch (err) {
        console.error("Failed to load districts:", err);
        setDistricts([]);
      }
      setDistrictId("all");
      setVillages([]);
      setVillageId("all");
    };

    fetchDistricts();
  }, [effectiveProvinceId, provinces]);

  // 3. Fetch Villages list when effectiveDistrictId changes
  useEffect(() => {
    if (!effectiveDistrictId || effectiveDistrictId === "all" || districts.length === 0) {
      setVillages([]);
      setVillageId("all");
      return;
    }
    const selectedDist = districts.find((d) => String(d.id) === effectiveDistrictId);
    if (!selectedDist) {
      setVillages([]);
      setVillageId("all");
      return;
    }

    const fetchVillages = async () => {
      try {
        const res = await axiosInstance.get(
          `/villages/selectvillage?districtCode=${selectedDist.district_code}`
        );
        if (Array.isArray(res.data)) {
          setVillages(res.data);
        } else {
          setVillages([]);
        }
      } catch (err) {
        console.error("Failed to load villages:", err);
        setVillages([]);
      }
      setVillageId("all");
    };

    fetchVillages();
  }, [effectiveDistrictId, districts]);

  // 4. Fetch Problem Report Data
  const fetchReportData = async (
    targetPage = page,
    targetLimit = limit,
    overrideStart = startDate,
    overrideEnd = endDate
  ) => {
    if (!overrideStart || !overrideEnd) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນດຶງລາຍງານ");
      return;
    }

    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: targetPage,
        limit: targetLimit,
        startDate: overrideStart,
        endDate: overrideEnd,
      };
      if (effectiveProvinceId && effectiveProvinceId !== "all") {
        params.provinceId = Number(effectiveProvinceId);
      }
      if (effectiveDistrictId && effectiveDistrictId !== "all") {
        params.districtId = Number(effectiveDistrictId);
      }
      if (villageId && villageId !== "all") {
        params.villageId = Number(villageId);
      }
      if (problemtypeId && problemtypeId !== "all") {
        params.problemtypeId = Number(problemtypeId);
      }
      if (problemstatusId && problemstatusId !== "all") {
        params.problemstatusId = Number(problemstatusId);
      }
      if (sourcetypeId && sourcetypeId !== "all") {
        params.sourcetypeId = Number(sourcetypeId);
      }

      const res = await axiosInstance.get("/reports/problem", { params });

      if (res.data && typeof res.data === "object") {
        if (Array.isArray(res.data.data)) {
          setReportData(res.data.data);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        } else if (Array.isArray(res.data)) {
          setReportData(res.data);
          setTotal(res.data.length);
          setTotalPages(1);
        } else {
          setReportData([]);
          setTotal(0);
          setTotalPages(1);
        }
      } else {
        setReportData([]);
        setTotal(0);
        setTotalPages(1);
      }
      setHasSearched(true);
    } catch (err) {
      console.error("Failed to fetch problem report:", err);
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍງານໄດ້");
    } finally {
      setLoading(false);
    }
  };

  // Quick Date Shortcut Handler
  const handleQuickDate = (type: "today" | "7days" | "30days" | "month") => {
    let s = "";
    let e = moment().format("YYYY-MM-DD");

    if (type === "today") {
      s = moment().format("YYYY-MM-DD");
    } else if (type === "7days") {
      s = moment().subtract(6, "days").format("YYYY-MM-DD");
    } else if (type === "30days") {
      s = moment().subtract(29, "days").format("YYYY-MM-DD");
    } else if (type === "month") {
      s = moment().startOf("month").format("YYYY-MM-DD");
      e = moment().endOf("month").format("YYYY-MM-DD");
    }

    setStartDate(s);
    setEndDate(e);
    setPage(1);
    fetchReportData(1, limit, s, e);
  };

  const handleSearch = () => {
    setPage(1);
    fetchReportData(1, limit);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setProvinceId("all");
    setDistrictId("all");
    setVillageId("all");
    setProblemtypeId("all");
    setProblemstatusId("all");
    setSourcetypeId("all");
    setReportData([]);
    setTotal(0);
    setPage(1);
    setHasSearched(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    if (hasSearched) {
      fetchReportData(newPage, limit);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    if (hasSearched) {
      fetchReportData(1, newLimit);
    }
  };

  // Export to Excel (.xlsx) using SheetJS 'xlsx' library dynamically
  const handleExportExcel = async () => {
    if (reportData.length === 0) {
      toast.warning("ບໍ່ມີຂໍ້ມູນລາຍງານເພື່ອສົ່ງອອກ");
      return;
    }

    const XLSX = await import("xlsx");

    const exportRows = reportData.map((d, index) => {
      return {
        "ລຳດັບ": index + 1,
        "ວັນທີແຈ້ງ": d.createdAt ? moment(d.createdAt).format("DD/MM/YYYY HH:mm") : "-",
        "ຊື່ ແລະ ນາມສະກຸນ": d.fullName || "",
        "ເບີໂທ": d.tel || "",
        "ປະເພດບັນຫາ": d.problemtype?.name || "-",
        "ຊ່ອງທາງ": d.sourcetype?.name || "-",
        "ສະຖານະ": d.problemstatus?.callcenter || "-",
        "ເວລາທີ່ໃຊ້ (ນາທີ)": d.totalTime ?? "-",
        "ແຂວງ": d.province?.province_name || "-",
        "ເມືອງ": d.district?.district_name || "-",
        "ບ້ານ": d.village?.village_name || "-",
        "ສາຂາແຂວງ": d.branch?.name || "-",
        "ສູນສ້ອມແປງເມືອງ": d.repairDistrict?.name || "-",
        "ລາຍລະອຽດ": d.description || "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Problem Report");

    const keys = Object.keys(exportRows[0] || {});
    worksheet["!cols"] = keys.map((key) => {
      let maxLen = Math.max(key.length * 2, 16);
      exportRows.forEach((row) => {
        const valStr = String((row as any)[key] ?? "");
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      return { wch: Math.min(maxLen, 60) };
    });

    XLSX.writeFile(workbook, `problem_report_${startDate}_to_${endDate}.xlsx`);
    toast.success("ສົ່ງອອກຂໍ້ມູນ Excel (.xlsx) ສຳເລັດແລ້ວ");
  };

  // Export to PDF (.pdf) using @react-pdf/renderer with PhetsarathOT font
  const handleExportPDF = async () => {
    if (!startDate || !endDate) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນສົ່ງອອກ PDF");
      return;
    }

    let allData: ProblemReportItem[] = [];
    try {
      const params: Record<string, any> = {
        page: 1,
        limit: 9999,
        startDate,
        endDate,
      };
      if (effectiveProvinceId && effectiveProvinceId !== "all") params.provinceId = Number(effectiveProvinceId);
      if (effectiveDistrictId && effectiveDistrictId !== "all") params.districtId = Number(effectiveDistrictId);
      if (villageId && villageId !== "all") params.villageId = Number(villageId);
      if (problemtypeId && problemtypeId !== "all") params.problemtypeId = Number(problemtypeId);
      if (problemstatusId && problemstatusId !== "all") params.problemstatusId = Number(problemstatusId);
      if (sourcetypeId && sourcetypeId !== "all") params.sourcetypeId = Number(sourcetypeId);

      const res = await axiosInstance.get("/reports/problem", { params });
      if (res.data && Array.isArray(res.data.data)) {
        allData = res.data.data;
      } else if (Array.isArray(res.data)) {
        allData = res.data;
      }
    } catch {
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນທັງໝົດໄດ້");
      return;
    }

    if (allData.length === 0) {
      toast.warning("ບໍ່ມີຂໍ້ມູນລາຍງານເພື່ອສົ່ງອອກ");
      return;
    }

    const filterProvince =
      effectiveProvinceId && effectiveProvinceId !== "all"
        ? provinces.find((p) => String(p.id) === effectiveProvinceId)?.province_name ?? "ທຸກແຂວງ"
        : "ທຸກແຂວງ";
    const filterDistrict =
      effectiveDistrictId && effectiveDistrictId !== "all"
        ? districts.find((d) => String(d.id) === effectiveDistrictId)?.district_name ?? "ທຸກເມືອງ"
        : "ທຸກເມືອງ";
    const filterVillage =
      villageId !== "all"
        ? villages.find((v) => String(v.id) === villageId)?.village_name ?? "ທຸກບ້ານ"
        : "ທຸກບ້ານ";
    try {
      const { ProblemReportPDF } = await import("./pdf/ProblemReportPDF");
      const { generateAndDownloadPDF } = await import("@/lib/pdf/downloadPdf");

      await generateAndDownloadPDF(
        <ProblemReportPDF
          data={allData}
          startDate={startDate}
          endDate={endDate}
          provinceName={filterProvince}
          districtName={filterDistrict}
          villageName={filterVillage}
        />,
        `problem_report_${startDate}_to_${endDate}.pdf`
      );

      toast.success("ສົ່ງອອກ PDF (.pdf) ສຳເລັດແລ້ວ");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF");
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 font-sans text-slate-800 dark:text-slate-100 space-y-6 print:bg-white print:p-0" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      {/* Filter Card */}
      <div className="bg-white dark:bg-slate-900 p-5 md:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-5 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                ຕົວກອງຂໍ້ມູນລາຍງານການແຈ້ງບັນຫາ
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ເພື່ອດຶງລາຍງານ
              </p>
            </div>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">ທາງລັດ:</span>
            <button
              type="button"
              onClick={() => handleQuickDate("today")}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all cursor-pointer"
            >
              ມື້ນີ້
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate("7days")}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all cursor-pointer"
            >
              7 ມື້ຜ່ານມາ
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate("30days")}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all cursor-pointer"
            >
              30 ມື້ຜ່ານມາ
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate("month")}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all cursor-pointer"
            >
              ເດືອນນີ້
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ວັນທີເລີ່ມຕົ້ນ</span>
              <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 h-[42px] text-xs bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 font-semibold transition-all"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ຫາວັນທີ</span>
              <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 h-[42px] text-xs bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 font-semibold transition-all"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Problem Status Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ສະຖານະ</span>
            </label>
            <div className="relative">
              <select
                value={problemstatusId}
                onChange={(e) => setProblemstatusId(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
              >
                <option value="all">-- ທຸກສະຖານະ (All Statuses) --</option>
                {problemStatuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.callcenter}
                  </option>
                ))}
              </select>
              <Component className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Source Type Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ຊ່ອງທາງ</span>
            </label>
            <div className="relative">
              <select
                value={sourcetypeId}
                onChange={(e) => setSourcetypeId(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
              >
                <option value="all">-- ທຸກຊ່ອງທາງ (All Channels) --</option>
                {sourceTypes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Problem Type Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ປະເພດບັນຫາ</span>
            </label>
            <div className="relative">
              <select
                value={problemtypeId}
                onChange={(e) => setProblemtypeId(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
              >
                <option value="all">-- ທຸກປະເພດບັນຫາ (All Types) --</option>
                {problemTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
              <AlertTriangle className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Province Select - Hidden for roleId 5 and 6 */}
          {currentUserRoleId !== 5 && currentUserRoleId !== 6 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
                <span>ແຂວງ</span>
              </label>
              <div className="relative">
                <select
                  value={provinceId}
                  onChange={(e) => setProvinceId(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
                >
                  <option value="all">-- ທຸກແຂວງ (All Provinces) --</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.province_name}
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* District Select - Hidden for roleId 6 */}
          {currentUserRoleId !== 6 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
                <span>ເມືອງ</span>
              </label>
              <div className="relative">
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  disabled={(!effectiveProvinceId || effectiveProvinceId === "all") || districts.length === 0}
                  className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">-- ທຸກເມືອງ (All Districts) --</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.district_name}
                    </option>
                  ))}
                </select>
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Village Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ບ້ານ</span>
            </label>
            <div className="relative">
              <select
                value={villageId}
                onChange={(e) => setVillageId(e.target.value)}
                disabled={(!effectiveDistrictId || effectiveDistrictId === "all") || villages.length === 0}
                className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">-- ທຸກບ້ານ (All Villages) --</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.village_name}
                  </option>
                ))}
              </select>
              <Home className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ລ້າງຕົວກອງ</span>
          </button>
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>ຄົ້ນຫາ / ດຶງລາຍງານ</span>
          </button>
        </div>
      </div>

      {/* Initial Empty State (Before Search) */}
      {!hasSearched && (
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 md:p-14 text-center select-none shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6 transition-all">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25 border border-white/20">
            <FileText className="w-12 h-12 text-white drop-shadow-md" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="relative z-10 space-y-2 max-w-lg mx-auto">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ກະລຸນາເລືອກຕົວກອງເພື່ອດຶງຂໍ້ມູນລາຍງານການແຈ້ງບັນຫາ
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              ກະລຸນາເລືອກ <span className="font-bold text-blue-600 dark:text-blue-400">"ວັນທີເລີ່ມຕົ້ນ"</span> ແລະ <span className="font-bold text-blue-600 dark:text-blue-400">"ຫາວັນທີ"</span> ໃນຊ່ອງຕົວກອງດ້ານເທິງ ແລ້ວກົດປຸ່ມ <span className="font-bold text-indigo-600 dark:text-indigo-400">"ຄົ້ນຫາ / ດຶງລາຍງານ"</span> ເພື່ອສະແດງຂໍ້ມູນລາຍງານ
            </p>
          </div>
        </div>
      )}

      {/* Search Results Content */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3">
            {/* Card 1: Total Docs */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-blue-500/40 transition-all">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ເອກະສານແຈ້ງບັນຫາທັງໝົດ
                </p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                  {stats.totalDocs.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-400">ລາຍການ</span>
                </p>
              </div>
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Total Duration / useTime */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-amber-500/40 transition-all">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ເວລາທີ່ໃຊ້ລວມ
                </p>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  {stats.formattedDuration}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  ({stats.totalUseTimeMinutes.toLocaleString()} ນາທີ)
                </p>
              </div>
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Timer className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Villages Count */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-purple-500/40 transition-all">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ບ້ານທີ່ມີການແຈ້ງບັນຫາ
                </p>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  {stats.uniqueVillages.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-400">ບ້ານ</span>
                </p>
              </div>
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none overflow-hidden">
            {/* Table Title Bar & Export Action Buttons */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-6 bg-blue-600 rounded-full" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ລາຍການການແຈ້ງບັນຫາ
                </h3>
                <span className="text-xs px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full font-bold">
                  {total} ລາຍການ
                </span>
              </div>

              {/* Save Excel & Save PDF Action Buttons */}
              {reportData.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 transition-all shadow-xs cursor-pointer"
                    title="ສົ່ງອອກ Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    <span>ສົ່ງອອກ Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-bold rounded-xl border border-red-200/80 dark:border-red-900/50 transition-all shadow-xs cursor-pointer"
                    title="ສົ່ງອອກ PDF (.pdf)"
                  >
                    <FileType className="w-4 h-4 text-red-500" />
                    <span>ສົ່ງອອກ PDF (.pdf)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Table Element */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 select-none">
                    <th className="py-4 px-4 w-12 text-center">#</th>
                    <th className="py-4 px-4 min-w-[120px]">ວັນທີແຈ້ງ</th>
                    <th className="py-4 px-4 min-w-[180px]">ຊື່ ແລະ ນາມສະກຸນ</th>
                    <th className="py-4 px-4 min-w-[110px]">ເບີໂທ</th>
                    <th className="py-4 px-4 min-w-[130px]">ປະເພດບັນຫາ</th>
                    <th className="py-4 px-4 min-w-[110px]">ຊ່ອງທາງ</th>
                    <th className="py-4 px-4 min-w-[130px]">ສະຖານະ</th>
                    <th className="py-4 px-4 min-w-[120px]">ເວລາທີ່ໃຊ້</th>
                    <th className="py-4 px-4 min-w-[110px]">ແຂວງ</th>
                    <th className="py-4 px-4 min-w-[110px]">ເມືອງ</th>
                    <th className="py-4 px-4 min-w-[120px]">ບ້ານ</th>
                    <th className="py-4 px-4 min-w-[140px]">ສາຂາແຂວງ</th>
                    <th className="py-4 px-4 min-w-[150px]">ສູນສ້ອມແປງເມືອງ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="py-16 text-center text-slate-400">
                        <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-blue-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          ກຳລັງໂຫຼດຂໍ້ມູນລາຍງານ...
                        </span>
                      </td>
                    </tr>
                  ) : reportData.length > 0 ? (
                    reportData.map((item, idx) => {
                      const rowNum = (page - 1) * limit + idx + 1;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                          {/* # */}
                          <td className="py-4 px-4 text-center font-bold text-slate-400 group-hover:text-blue-600">
                            {rowNum}
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>
                                {item.createdAt ? moment(item.createdAt).format("DD/MM/YYYY HH:mm") : "-"}
                              </span>
                            </div>
                          </td>

                          {/* Full Name */}
                          <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {item.fullName || "-"}
                          </td>

                          {/* Phone */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {item.tel || "-"}
                          </td>

                          {/* Problem Type */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/50">
                              {item.problemtype?.name || "-"}
                            </span>
                          </td>

                          {/* SourceType */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {(() => {
                              let badgeClass =
                                "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300";
                              if (item.sourcetypeId === 1) {
                                badgeClass =
                                  "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
                              } else if (item.sourcetypeId === 3) {
                                badgeClass =
                                  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                              }
                              return (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                                  {item.sourcetype?.name || "-"}
                                </span>
                              );
                            })()}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {(() => {
                              let badgeClass =
                                "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300";
                              if (item.problemstatusId === 1) {
                                badgeClass =
                                  "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
                              } else if (item.problemstatusId === 2) {
                                badgeClass =
                                  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
                              } else if (item.problemstatusId === 3) {
                                badgeClass =
                                  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                              } else if (item.problemstatusId === 4) {
                                badgeClass =
                                  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
                              } else if (item.problemstatusId === 5) {
                                badgeClass =
                                  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
                              }
                              return (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                                  {item.problemstatus?.callcenter || "-"}
                                </span>
                              );
                            })()}
                          </td>

                          {/* totalTime (นาที) */}
                          <td className="py-4 px-4 bg-amber-50/20 dark:bg-amber-950/5">
                            {item.totalTime !== null && item.totalTime !== undefined && Number(item.totalTime) > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50 shadow-2xs">
                                <Timer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>{item.totalTime} ນາທີ</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">-</span>
                            )}
                          </td>

                          {/* Province */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {item.province?.province_name || "-"}
                          </td>

                          {/* District */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {item.district?.district_name || "-"}
                          </td>

                          {/* Village */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {item.village?.village_name || "-"}
                          </td>

                          {/* Branch */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {item.branch?.name || "-"}
                          </td>

                          {/* Repair District */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {item.repairDistrict?.name || "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={13} className="py-16 text-center text-slate-400">
                        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                          ບໍ່ພົບຂໍ້ມູນລາຍງານຕາມຕົວກອງນີ້
                        </p>
                        <p className="text-xs mt-1 text-slate-400">
                          ລອງປ່ຽນຊ່ວງວັນທີ ຫຼື ເລືອກແຂວງ/ເມືອງ/ບ້ານ ໃໝ່
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            {reportData.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
                  <span>ສະແດງ</span>
                  <select
                    value={limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>ລາຍການຕໍ່ໜ້າ (ທັງໝົດ {total} ລາຍການ)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || loading}
                    className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-bold cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-700 dark:text-slate-200 px-3">
                    ໜ້າ {page} ຈາກ {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages || loading}
                    className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-bold cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
