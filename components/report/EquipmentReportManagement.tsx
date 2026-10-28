"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  FileType,
  Component,
  Layers,
  Zap,
  Wrench,
  Building2,
  Box,
  Hash,
  MapPin,
  Home,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import moment from "moment";
import { EquipmentDataItem, EquipmentCountItem } from "./pdf/EquipmentReportPDF";

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

interface VoltageOption {
  id: number;
  name: string;
}

interface TypeRepairOption {
  id: number;
  name: string;
}

export function EquipmentReportManagement() {
  // Tab State: "data" (Tab 1: ລາຍລະອຽດການໃຊ້ອຸປະກອນ) | "count" (Tab 2: ສະຫຼຸບຕາມອຸປະກອນ)
  const [activeTab, setActiveTab] = useState<"data" | "count">("data");

  // Date Filters (empty initially, just like ProblemReportManagement)
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Filter States
  const [provinceId, setProvinceId] = useState<string>("all");
  const [districtId, setDistrictId] = useState<string>("all");
  const [villageId, setVillageId] = useState<string>("all");
  const [problemtypeId, setProblemtypeId] = useState<string>("all");
  const [problemstatusId, setProblemstatusId] = useState<string>("all");
  const [sourcetypeId, setSourcetypeId] = useState<string>("all");
  const [voltageId, setVoltageId] = useState<string>("all");
  const [typeRepairId, setTypeRepairId] = useState<string>("all");

  // Dropdown Options
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [problemStatuses, setProblemStatuses] = useState<ProblemStatus[]>([]);
  const [sourceTypes, setSourceTypes] = useState<SourceType[]>([]);
  const [voltages, setVoltages] = useState<VoltageOption[]>([]);
  const [typeRepairs, setTypeRepairs] = useState<TypeRepairOption[]>([]);

  // Tab 1: Equipment Data States (Paginated)
  const [equipmentDataList, setEquipmentDataList] = useState<EquipmentDataItem[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Tab 2: Equipment Count States (Array)
  const [equipmentCountList, setEquipmentCountList] = useState<EquipmentCountItem[]>([]);

  // Status States
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loadingCount, setLoadingCount] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // User Role & Location for role-based auto-filtering
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

  // Load Current User Info on mount
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

  // Load Initial Dropdowns on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [provRes, ptRes, psRes, stRes, vRes, trRes] = await Promise.allSettled([
          axiosInstance.get("/provinces/selectprovince"),
          axiosInstance.get("/problemtypes/selectproblemtype"),
          axiosInstance.get("/problemstatus/selectstatus"),
          axiosInstance.get("/sourcetypes/selectsource"),
          axiosInstance.get("/voltages/selectvoltage"),
          axiosInstance.get("/typerepairs/selecttyperepair"),
        ]);

        if (provRes.status === "fulfilled" && Array.isArray(provRes.value.data)) {
          setProvinces(provRes.value.data);
        }
        if (ptRes.status === "fulfilled") {
          const d = ptRes.value.data;
          setProblemTypes(Array.isArray(d) ? d : d?.data || []);
        }
        if (psRes.status === "fulfilled") {
          const d = psRes.value.data;
          setProblemStatuses(Array.isArray(d) ? d : d?.data || []);
        }
        if (stRes.status === "fulfilled") {
          const d = stRes.value.data;
          setSourceTypes(Array.isArray(d) ? d : d?.data || []);
        }
        if (vRes.status === "fulfilled") {
          const d = vRes.value.data;
          setVoltages(Array.isArray(d) ? d : d?.data || []);
        }
        if (trRes.status === "fulfilled") {
          const d = trRes.value.data;
          setTypeRepairs(Array.isArray(d) ? d : d?.data || []);
        }
      } catch (err) {
        console.error("Failed to load initial dropdowns:", err);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch Districts when effectiveProvinceId changes
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

  // Fetch Villages when effectiveDistrictId changes
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

  // Helper to build query parameters
  const buildQueryParams = useCallback(
    (extraParams: Record<string, any> = {}) => {
      const effectiveStart =
        extraParams.startDate !== undefined ? extraParams.startDate : startDate;
      const effectiveEnd =
        extraParams.endDate !== undefined ? extraParams.endDate : endDate;

      const params: Record<string, any> = {};

      if (effectiveStart) params.startDate = effectiveStart;
      if (effectiveEnd) params.endDate = effectiveEnd;

      if (effectiveProvinceId && effectiveProvinceId !== "all") {
        params.provinceId = Number(effectiveProvinceId);
      }
      if (effectiveDistrictId && effectiveDistrictId !== "all") {
        params.districtId = Number(effectiveDistrictId);
      }
      if (villageId && villageId !== "all") params.villageId = Number(villageId);
      if (problemtypeId && problemtypeId !== "all") params.problemtypeId = Number(problemtypeId);
      if (problemstatusId && problemstatusId !== "all") params.problemstatusId = Number(problemstatusId);
      if (sourcetypeId && sourcetypeId !== "all") params.sourcetypeId = Number(sourcetypeId);
      if (voltageId && voltageId !== "all") params.voltageId = Number(voltageId);
      if (typeRepairId && typeRepairId !== "all") params.typeRepairId = Number(typeRepairId);

      // Merge remaining extraParams (such as page, limit, etc.)
      for (const [key, val] of Object.entries(extraParams)) {
        if (key !== "startDate" && key !== "endDate") {
          params[key] = val;
        }
      }

      return params;
    },
    [
      startDate,
      endDate,
      effectiveProvinceId,
      effectiveDistrictId,
      villageId,
      problemtypeId,
      problemstatusId,
      sourcetypeId,
      voltageId,
      typeRepairId,
    ]
  );

  // Fetch Tab 1 (Equipment Data)
  const fetchEquipmentData = async (
    targetPage = page,
    targetLimit = limit,
    sDate = startDate,
    eDate = endDate
  ) => {
    if (!sDate || !eDate) return;
    setLoadingData(true);
    try {
      const params = buildQueryParams({
        page: targetPage,
        limit: targetLimit,
        startDate: sDate,
        endDate: eDate,
      });

      const res = await axiosInstance.get("/reports/equipmentdata", { params });

      if (res.data && typeof res.data === "object") {
        if (Array.isArray(res.data.data)) {
          setEquipmentDataList(res.data.data);
          setTotalData(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        } else if (Array.isArray(res.data)) {
          setEquipmentDataList(res.data);
          setTotalData(res.data.length);
          setTotalPages(1);
        } else {
          setEquipmentDataList([]);
          setTotalData(0);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error("Failed to fetch equipment data report:", err);
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍງານລາຍລະອຽດການໃຊ້ອຸປະກອນໄດ້");
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch Tab 2 (Equipment Count)
  const fetchEquipmentCount = async (sDate = startDate, eDate = endDate) => {
    if (!sDate || !eDate) return;
    setLoadingCount(true);
    try {
      const params = buildQueryParams({
        startDate: sDate,
        endDate: eDate,
      });

      const res = await axiosInstance.get("/reports/equipmentcount", { params });

      if (Array.isArray(res.data)) {
        setEquipmentCountList(res.data);
      } else {
        setEquipmentCountList([]);
      }
    } catch (err) {
      console.error("Failed to fetch equipment count report:", err);
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນສະຫຼຸບການໃຊ້ອຸປະກອນໄດ້");
    } finally {
      setLoadingCount(false);
    }
  };

  // Helper to fetch both reports
  const fetchBothReports = (
    sDate = startDate,
    eDate = endDate,
    targetPage = page,
    targetLimit = limit
  ) => {
    if (!sDate || !eDate) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນດຶງລາຍງານ");
      return;
    }
    setHasSearched(true);
    fetchEquipmentData(targetPage, targetLimit, sDate, eDate);
    fetchEquipmentCount(sDate, eDate);
  };

  // Quick Date Range Shortcuts
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
    fetchBothReports(s, e, 1, limit);
  };

  // Search Click
  const handleSearch = () => {
    if (!startDate || !endDate) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນດຶງລາຍງານ");
      return;
    }
    setPage(1);
    fetchBothReports(startDate, endDate, 1, limit);
  };

  // Reset Click — Clears all filters and returns to initial unsearched state
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setProvinceId("all");
    setDistrictId("all");
    setVillageId("all");
    setProblemtypeId("all");
    setProblemstatusId("all");
    setSourcetypeId("all");
    setVoltageId("all");
    setTypeRepairId("all");
    setEquipmentDataList([]);
    setEquipmentCountList([]);
    setTotalData(0);
    setPage(1);
    setHasSearched(false);
  };

  // Pagination Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    if (hasSearched) {
      fetchEquipmentData(newPage, limit, startDate, endDate);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    if (hasSearched) {
      fetchEquipmentData(1, newLimit, startDate, endDate);
    }
  };

  // Table data references
  const filteredEquipmentData = equipmentDataList;
  const filteredEquipmentCount = equipmentCountList;

  // Export Excel
  const handleExportExcel = async () => {
    if (isExportingExcel || isExportingPdf) return;
    if (!startDate || !endDate) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນສົ່ງອອກ Excel");
      return;
    }

    setIsExportingExcel(true);
    try {
      const XLSX = await import("xlsx");
      let allData: EquipmentDataItem[] = [];
      let countData: EquipmentCountItem[] = [];

      try {
        const params = buildQueryParams({ startDate, endDate });
        const [resData, resCount] = await Promise.all([
          axiosInstance.get("/reports/equipmentdata", {
            params: { ...params, page: 1, limit: 99999 },
          }),
          axiosInstance.get("/reports/equipmentcount", { params }),
        ]);

        if (resData.data && Array.isArray(resData.data.data)) {
          allData = resData.data.data;
        } else if (Array.isArray(resData.data)) {
          allData = resData.data;
        }

        if (Array.isArray(resCount.data)) {
          countData = resCount.data;
        }
      } catch {
        toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນທັງໝົດໄດ້");
        return;
      }

      if (allData.length === 0 && countData.length === 0) {
        toast.warning("ບໍ່ມີຂໍ້ມູນລາຍງານເພື່ອສົ່ງອອກ");
        return;
      }

      const workbook = XLSX.utils.book_new();

      // Prepare Sheet 1: ລາຍລະອຽດການໃຊ້ອຸປະກອນ (10 columns matching Table 1)
      let worksheetData: any = null;
      if (allData.length > 0) {
        const dataRows = allData.map((d, index) => {
          const dateStr = d.createdAt
            ? moment(d.createdAt).format("DD/MM/YYYY HH:mm")
            : "-";

          return {
            "ລຳດັບ": index + 1,
            "ວັນທີ": dateStr,
            "ຊື່ອຸປະກອນ": d.equipmentName || "-",
            "ຈຳນວນ": `${d.amount} ${d.unit || ""}`,
            "ຜູ້ແຈ້ງ":
              [d.customerName, d.customerTel ? `(ໂທ: ${d.customerTel})` : ""]
                .filter(Boolean)
                .join(" ") || "-",
            "ປະເພດບັນຫາ": d.problemtype || "-",
            "ສາຂາ / ສູນເມືອງ":
              [d.branch, d.repairDistrict].filter(Boolean).join(" / ") || "-",
            "ສະຖານທີ່":
              [
                d.village,
                d.district,
                d.province ? `ແຂວງ ${d.province}` : "",
              ]
                .filter(Boolean)
                .join(", ") || "-",
            "ປະເພດສ້ອມແປງ / ແຮງດັນ":
              [d.typeRepair, d.voltage].filter(Boolean).join(" / ") || "-",
            "ໝາຍເຫດ": d.comment || "-",
          };
        });

        worksheetData = XLSX.utils.json_to_sheet(dataRows);
        worksheetData["!cols"] = [
          { wch: 8 },  // ລຳດັບ
          { wch: 18 }, // ວັນທີ
          { wch: 25 }, // ຊື່ອຸປະກອນ
          { wch: 14 }, // ຈຳນວນ
          { wch: 25 }, // ຜູ້ແຈ້ງ
          { wch: 20 }, // ປະເພດບັນຫາ
          { wch: 24 }, // ສາຂາ / ສູນເມືອງ
          { wch: 28 }, // ສະຖານທີ່
          { wch: 24 }, // ປະເພດສ້ອມແປງ / ແຮງດັນ
          { wch: 30 }, // ໝາຍເຫດ
        ];
      }

      // Prepare Sheet 2: ສະຫຼຸບຕາມອຸປະກອນ (6 columns matching Table 2)
      let worksheetCount: any = null;
      if (countData.length > 0) {
        const countRows = countData.map((c, index) => ({
          "ລຳດັບ": index + 1,
          "ຊື່ອຸປະກອນ": c.equipmentName || "-",
          "ຫົວໜ່ວຍ": c.unit || "-",
          "ສາຂາ": c.branchName || "-",
          "ຈຳນວນຄັ້ງທີ່ໃຊ້": c.timesUsed || 0,
          "ຈຳນວນນຳໃຊ້ລວມ": c.totalAmount || 0,
        }));

        worksheetCount = XLSX.utils.json_to_sheet(countRows);
        worksheetCount["!cols"] = [
          { wch: 8 },  // ລຳດັບ
          { wch: 30 }, // ຊື່ອຸປະກອນ
          { wch: 12 }, // ຫົວໜ່ວຍ
          { wch: 24 }, // ສາຂາ
          { wch: 18 }, // ຈຳນວນຄັ້ງທີ່ໃຊ້
          { wch: 18 }, // ຈຳນວນນຳໃຊ້ລວມ
        ];
      }

      // Append sheets in order depending on activeTab
      if (activeTab === "count") {
        if (worksheetCount) XLSX.utils.book_append_sheet(workbook, worksheetCount, "ສະຫຼຸບຕາມອຸປະກອນ");
        if (worksheetData) XLSX.utils.book_append_sheet(workbook, worksheetData, "ລາຍລະອຽດການໃຊ້ອຸປະກອນ");
      } else {
        if (worksheetData) XLSX.utils.book_append_sheet(workbook, worksheetData, "ລາຍລະອຽດການໃຊ້ອຸປະກອນ");
        if (worksheetCount) XLSX.utils.book_append_sheet(workbook, worksheetCount, "ສະຫຼຸບຕາມອຸປະກອນ");
      }

      const filename =
        activeTab === "count"
          ? `equipment_summary_report_${startDate}_to_${endDate}.xlsx`
          : `equipment_detail_report_${startDate}_to_${endDate}.xlsx`;

      XLSX.writeFile(workbook, filename);
      toast.success("ສົ່ງອອກ Excel (.xlsx) ສຳເລັດແລ້ວ");
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (isExportingPdf || isExportingExcel) return;
    if (!startDate || !endDate) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນສົ່ງອອກ PDF");
      return;
    }

    setIsExportingPdf(true);
    let allData: EquipmentDataItem[] = [];
    let countData: EquipmentCountItem[] = [];

    try {
      try {
        const params = buildQueryParams({ startDate, endDate });
        const [resData, resCount] = await Promise.all([
          axiosInstance.get("/reports/equipmentdata", {
            params: { ...params, page: 1, limit: 99999 },
          }),
          axiosInstance.get("/reports/equipmentcount", { params }),
        ]);

        if (resData.data && Array.isArray(resData.data.data)) {
          allData = resData.data.data;
        } else if (Array.isArray(resData.data)) {
          allData = resData.data;
        }

        if (Array.isArray(resCount.data)) {
          countData = resCount.data;
        }
      } catch {
        toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນທັງໝົດໄດ້");
        return;
      }

      if (allData.length === 0 && countData.length === 0) {
        toast.warning("ບໍ່ມີຂໍ້ມູນລາຍງານເພື່ອສົ່ງອອກ");
        return;
      }

      try {
        const { EquipmentReportPDF } = await import("./pdf/EquipmentReportPDF");
        const { generateAndDownloadPDF } = await import("@/lib/pdf/downloadPdf");

        const filename =
          activeTab === "count"
            ? `equipment_summary_report_${startDate}_to_${endDate}.pdf`
            : `equipment_detail_report_${startDate}_to_${endDate}.pdf`;

        await generateAndDownloadPDF(
          <EquipmentReportPDF
            data={allData}
            countData={countData}
            activeTab={activeTab}
            startDate={startDate}
            endDate={endDate}
          />,
          filename
        );

        toast.success("ສົ່ງອອກ PDF (.pdf) ສຳເລັດແລ້ວ");
      } catch (err) {
        console.error("Error generating PDF:", err);
        toast.error("ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF");
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  const isLoading = loadingData || loadingCount;

  return (
    <div
      className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 font-sans text-slate-800 dark:text-slate-100 space-y-3.5 print:bg-white print:p-0"
      style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
    >
      {/* Filter Card — Exactly matching ProblemReportManagement structure */}
      <div className="bg-white dark:bg-slate-900 p-5 md:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-5 print:hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                ຕົວກອງຂໍ້ມູນລາຍງານອຸປະກອນ
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

        {/* Filters Grid — 5 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
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

          {/* Problem Status */}
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
                <option value="all">-- ທຸກສະຖານະ --</option>
                {problemStatuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.callcenter || s.edlapp || `Status #${s.id}`}
                  </option>
                ))}
              </select>
              <Component className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Source Type */}
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
                <option value="all">-- ທຸກຊ່ອງທາງ --</option>
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

          {/* Problem Type */}
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
                <option value="all">-- ທຸກປະເພດບັນຫາ --</option>
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
                  <option value="all">-- ທຸກແຂວງ --</option>
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
                  disabled={
                    (!effectiveProvinceId || effectiveProvinceId === "all") ||
                    districts.length === 0
                  }
                  className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">-- ທຸກເມືອງ --</option>
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
                disabled={
                  (!effectiveDistrictId || effectiveDistrictId === "all") ||
                  villages.length === 0
                }
                className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">-- ທຸກບ້ານ --</option>
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

          {/* Voltage Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ແຮງດັນ</span>
            </label>
            <div className="relative">
              <select
                value={voltageId}
                onChange={(e) => setVoltageId(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
              >
                <option value="all">-- ທຸກແຮງດັນ --</option>
                {voltages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              <Zap className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Type Repair Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ປະເພດສ້ອມແປງ</span>
            </label>
            <div className="relative">
              <select
                value={typeRepairId}
                onChange={(e) => setTypeRepairId(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
              >
                <option value="all">-- ທຸກປະເພດສ້ອມແປງ --</option>
                {typeRepairs.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {tr.name}
                  </option>
                ))}
              </select>
              <Wrench className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
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
            disabled={isLoading}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>ຄົ້ນຫາ / ດຶງລາຍງານ</span>
          </button>
        </div>
      </div>

      {/* Initial Empty State (Before Search) — Matches ProblemReportManagement */}
      {!hasSearched && (
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 md:p-14 text-center select-none shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6 transition-all">
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25 border border-white/20">
            <Box className="w-12 h-12 text-white drop-shadow-md" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="relative z-10 space-y-2 max-w-lg mx-auto">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ກະລຸນາເລືອກຕົວກອງເພື່ອດຶງຂໍ້ມູນລາຍງານອຸປະກອນ
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              ກະລຸນາເລືອກ{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                &quot;ວັນທີເລີ່ມຕົ້ນ&quot;
              </span>{" "}
              ແລະ{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                &quot;ຫາວັນທີ&quot;
              </span>{" "}
              ໃນຊ່ອງຕົວກອງດ້ານເທິງ ແລ້ວກົດປຸ່ມ{" "}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                &quot;ຄົ້ນຫາ / ດຶງລາຍງານ&quot;
              </span>{" "}
              ເພື່ອສະແດງຂໍ້ມູນລາຍງານ
            </p>
          </div>
        </div>
      )}

      {/* Search Results Content — Only shown after search is performed */}
      {hasSearched && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none overflow-hidden">
          {/* Tabs Navigation & Search Bar Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* Tab Buttons */}
            <div className="w-full lg:w-auto overflow-x-auto scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-slate-200/70 dark:bg-slate-800 p-1 sm:p-1.5 rounded-2xl min-w-max">
                <button
                  onClick={() => setActiveTab("data")}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "data"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>ລາຍລະອຽດການໃຊ້ອຸປະກອນ</span>
                  {totalData > 0 && (
                    <span className="ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full font-bold">
                      {totalData}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("count")}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === "count"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <Box className="w-4 h-4 shrink-0" />
                  <span>ສະຫຼຸບຈຳນວນຕາມອຸປະກອນ</span>
                  {equipmentCountList.length > 0 && (
                    <span className="ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full font-bold">
                      {equipmentCountList.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Save Excel & Save PDF Action Buttons */}
            {(totalData > 0 || equipmentCountList.length > 0) && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={isExportingExcel || isExportingPdf}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="ສົ່ງອອກ Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>{isExportingExcel ? "ກຳລັງສົ່ງອອກ Excel..." : "ສົ່ງອອກ Excel (.xlsx)"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isExportingPdf || isExportingExcel}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-bold rounded-xl border border-red-200/80 dark:border-red-900/50 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="ສົ່ງອອກ PDF (.pdf)"
                >
                  <FileType className="w-4 h-4 text-red-500" />
                  <span>{isExportingPdf ? "ກຳລັງສ້າງ PDF..." : "ສົ່ງອອກ PDF (.pdf)"}</span>
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: EQUIPMENT DATA DETAILS TABLE */}
          {activeTab === "data" && (
            <div className="p-0">
              {loadingData ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    ກຳລັງໂຫຼດຂໍ້ມູນລາຍລະອຽດການໃຊ້ອຸປະກອນ...
                  </p>
                </div>
              ) : filteredEquipmentData.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    ບໍ່ພົບຂໍ້ມູນການໃຊ້ອຸປະກອນ
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ແລ້ວກົດປຸ່ມ &quot;ຄົ້ນຫາ / ດຶງລາຍງານ&quot;
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        <th className="py-3.5 px-4 text-center w-12">#</th>
                        <th className="py-3.5 px-4">ວັນທີ</th>
                        <th className="py-3.5 px-4">ຊື່ອຸປະກອນ</th>
                        <th className="py-3.5 px-4 text-center">ຈຳນວນ</th>
                        <th className="py-3.5 px-4">ຜູ້ແຈ້ງ</th>
                        <th className="py-3.5 px-4">ປະເພດບັນຫາ</th>
                        <th className="py-3.5 px-4">ສາຂາ / ສູນເມືອງ</th>
                        <th className="py-3.5 px-4">ສະຖານທີ່</th>
                        <th className="py-3.5 px-4">ປະເພດສ້ອມແປງ / ແຮງດັນ</th>
                        <th className="py-3.5 px-4">ໝາຍເຫດ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-sm">
                      {filteredEquipmentData.map((item, index) => {
                        const dateStr = item.createdAt
                          ? moment(item.createdAt).format("DD/MM/YYYY HH:mm")
                          : "-";

                        return (
                          <tr
                            key={item.id || index}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                              {(page - 1) * limit + index + 1}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap text-xs font-medium text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{dateStr}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm">
                                {item.equipmentName || "-"}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                {item.amount} {item.unit || ""}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-medium text-slate-800 dark:text-gray-200 text-xs">
                                {item.customerName || "-"}
                              </div>
                              {item.customerTel && (
                                <div className="text-[11px] text-slate-400">
                                  ໂທ: {item.customerTel}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="text-xs font-medium text-slate-800 dark:text-gray-200">
                                {item.problemtype || "-"}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              <div className="font-medium text-slate-800 dark:text-gray-200">
                                {item.branch || "-"}
                              </div>
                              {item.repairDistrict && (
                                <div className="text-[11px] text-slate-400">
                                  {item.repairDistrict}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                              <div>{[item.village, item.district].filter(Boolean).join(", ") || "-"}</div>
                              {item.province && (
                                <div className="text-[11px] text-slate-400">
                                  ແຂວງ {item.province}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                              <div className="font-medium text-slate-800 dark:text-gray-200">
                                {item.typeRepair || "-"}
                              </div>
                              {item.voltage && (
                                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                                  {item.voltage}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 max-w-xs whitespace-nowrap">
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                {item.comment || "-"}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Bar */}
              {equipmentDataList.length > 0 && (
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
                    <span>ລາຍການຕໍ່ໜ້າ (ທັງໝົດ {totalData} ລາຍການ)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1 || loadingData}
                      className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-bold cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="font-bold text-slate-700 dark:text-slate-200 px-2">
                      ໜ້າ {page} ຈາກ {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages || loadingData}
                      className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-bold cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EQUIPMENT COUNT SUMMARY TABLE */}
          {activeTab === "count" && (
            <div className="p-0">
              {loadingCount ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    ກຳລັງໂຫຼດຂໍ້ມູນສະຫຼຸບການໃຊ້ອຸປະກອນ...
                  </p>
                </div>
              ) : filteredEquipmentCount.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    ບໍ່ພົບຂໍ້ມູນສະຫຼຸບການໃຊ້ອຸປະກອນ
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ແລ້ວກົດປຸ່ມ &quot;ຄົ້ນຫາ / ດຶງລາຍງານ&quot;
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        <th className="py-3.5 px-4 text-center w-14">#</th>
                        <th className="py-3.5 px-4">ຊື່ອຸປະກອນ</th>
                        <th className="py-3.5 px-4 text-center w-28">ຫົວໜ່ວຍ</th>
                        <th className="py-3.5 px-4 w-44">ສາຂາ</th>
                        <th className="py-3.5 px-4 text-center w-36">ຈຳນວນຄັ້ງທີ່ໃຊ້</th>
                        <th className="py-3.5 px-4 text-center w-40">ຈຳນວນນຳໃຊ້ລວມ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-sm">
                      {filteredEquipmentCount.map((item, index) => {
                        return (
                          <tr
                            key={item.equipmentId || index}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                              {index + 1}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                <Box className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>{item.equipmentName || "-"}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                                {item.unit || "-"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                              {item.branchName || "-"}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                                {Number(item.timesUsed || 0).toLocaleString()} ຄັ້ງ
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-lg text-xs font-bold shadow-xs">
                                {Number(item.totalAmount || 0).toLocaleString()} {item.unit || ""}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
