"use client";

import { useState, useEffect, useMemo } from "react";
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
  Users,
  FileSpreadsheet,
  FileType,
  Sparkles,
  Star,
  Award,
  TrendingUp,
  MessageSquare,
  UserCheck,
  Smile,
  Frown,
} from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import moment from "moment";

// Interface definitions
interface AgentEmployee {
  id: number;
  first_name?: string;
  last_name?: string;
  gender?: string;
  emp_code?: string;
}

interface AgentUser {
  id: number;
  username?: string;
  employee?: AgentEmployee | null;
}

interface ExternalUser {
  id: number;
  customerName?: string;
  name?: string;
  msisdn?: string;
  phone?: string;
}

interface Topic {
  id: number;
  name: string;
}

interface RatingDataItem {
  id: number;
  agentId: number;
  agent?: AgentUser | null;
  externalUserId: number;
  externalUser?: ExternalUser | null;
  topicId?: number | null;
  topic?: Topic | null;
  conversationId?: number | null;
  messageId?: number | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

interface RatingCountItem {
  agentId: number;
  agent?: AgentUser | null;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
  totalRatings: number;
  averageRating: number;
}

export function RatingReportManagement() {
  // Tab State: "data" (Tab 1: รายละเอียด) | "count" (Tab 2: สรุปตาม Agent)
  const [activeTab, setActiveTab] = useState<"data" | "count">("data");

  // Shared Date Filter States
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Search Filter State for live table filter
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Tab 1: Rating Data States (Paginated)
  const [ratingDataList, setRatingDataList] = useState<RatingDataItem[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Tab 2: Rating Count States (Array)
  const [ratingCountList, setRatingCountList] = useState<RatingCountItem[]>([]);

  // Status States
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loadingCount, setLoadingCount] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Set default dates on mount (Current month)
  useEffect(() => {
    const start = moment().startOf("month").format("YYYY-MM-DD");
    const end = moment().format("YYYY-MM-DD");
    setStartDate(start);
    setEndDate(end);
    fetchBothReports(start, end, 1, 10);
  }, []);

  // Fetch Tab 1 (Rating Data)
  const fetchRatingData = async (
    targetPage = page,
    targetLimit = limit,
    sDate = startDate,
    eDate = endDate
  ) => {
    if (!sDate || !eDate) return;
    setLoadingData(true);
    try {
      const res = await axiosInstance.get("/reports/ratingdata", {
        params: {
          page: targetPage,
          limit: targetLimit,
          startDate: sDate,
          endDate: eDate,
        },
      });

      if (res.data && typeof res.data === "object") {
        if (Array.isArray(res.data.data)) {
          setRatingDataList(res.data.data);
          setTotalData(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        } else if (Array.isArray(res.data)) {
          setRatingDataList(res.data);
          setTotalData(res.data.length);
          setTotalPages(1);
        } else {
          setRatingDataList([]);
          setTotalData(0);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error("Failed to fetch rating data report:", err);
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍງານລາຍລະອຽດການປະເມິນໄດ້");
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch Tab 2 (Rating Count)
  const fetchRatingCount = async (sDate = startDate, eDate = endDate) => {
    if (!sDate || !eDate) return;
    setLoadingCount(true);
    try {
      const res = await axiosInstance.get("/reports/ratingcount", {
        params: {
          startDate: sDate,
          endDate: eDate,
        },
      });

      if (Array.isArray(res.data)) {
        setRatingCountList(res.data);
      } else {
        setRatingCountList([]);
      }
    } catch (err) {
      console.error("Failed to fetch rating count report:", err);
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນສຫຼຸບຈຳນວນດາວໄດ້");
    } finally {
      setLoadingCount(false);
    }
  };

  // Helper to fetch both tabs
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
    fetchRatingData(targetPage, targetLimit, sDate, eDate);
    fetchRatingCount(sDate, eDate);
  };

  // Handle Quick Date Shortcuts
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
    setPage(1);
    fetchBothReports(startDate, endDate, 1, limit);
  };

  // Reset Click
  const handleReset = () => {
    const start = moment().startOf("month").format("YYYY-MM-DD");
    const end = moment().format("YYYY-MM-DD");
    setStartDate(start);
    setEndDate(end);
    setSearchTerm("");
    setPage(1);
    fetchBothReports(start, end, 1, limit);
  };

  // Page Navigation for Tab 1
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchRatingData(newPage, limit, startDate, endDate);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    fetchRatingData(1, newLimit, startDate, endDate);
  };

  // Filtered lists for live search input
  const filteredRatingData = useMemo(() => {
    if (!searchTerm.trim()) return ratingDataList;
    const term = searchTerm.toLowerCase();
    return ratingDataList.filter((item) => {
      const agentName =
        `${item.agent?.employee?.first_name || ""} ${item.agent?.employee?.last_name || ""}`.toLowerCase();
      const empCode = (item.agent?.employee?.emp_code || "").toLowerCase();
      const customerName =
        (item.externalUser?.customerName || item.externalUser?.name || "").toLowerCase();
      const phone = (item.externalUser?.msisdn || item.externalUser?.phone || "").toLowerCase();
      const topicName = (item.topic?.name || "").toLowerCase();
      const comment = (item.comment || "").toLowerCase();
      const ratingStr = String(item.rating);

      return (
        agentName.includes(term) ||
        empCode.includes(term) ||
        customerName.includes(term) ||
        phone.includes(term) ||
        topicName.includes(term) ||
        comment.includes(term) ||
        ratingStr.includes(term)
      );
    });
  }, [ratingDataList, searchTerm]);

  const filteredRatingCount = useMemo(() => {
    if (!searchTerm.trim()) return ratingCountList;
    const term = searchTerm.toLowerCase();
    return ratingCountList.filter((item) => {
      const agentName =
        `${item.agent?.employee?.first_name || ""} ${item.agent?.employee?.last_name || ""}`.toLowerCase();
      const empCode = (item.agent?.employee?.emp_code || "").toLowerCase();
      const agentIdStr = String(item.agentId);

      return agentName.includes(term) || empCode.includes(term) || agentIdStr.includes(term);
    });
  }, [ratingCountList, searchTerm]);

  // Overall Statistics Metrics
  const statsMetrics = useMemo(() => {
    const totalCount = ratingCountList.reduce((acc, curr) => acc + curr.totalRatings, 0);
    const total5Stars = ratingCountList.reduce((acc, curr) => acc + curr.rating5, 0);
    const totalSumScore = ratingCountList.reduce(
      (acc, curr) => acc + curr.averageRating * curr.totalRatings,
      0
    );
    const overallAvg = totalCount > 0 ? (totalSumScore / totalCount).toFixed(2) : "0.00";
    const fiveStarPercent = totalCount > 0 ? Math.round((total5Stars / totalCount) * 100) : 0;
    const agentEvaluatedCount = ratingCountList.length;

    return {
      totalCount,
      overallAvg,
      fiveStarPercent,
      agentEvaluatedCount,
    };
  }, [ratingCountList]);

  // Render Stars Helper
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"
              }`}
          />
        ))}
        <span className="ml-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
          ({rating})
        </span>
      </div>
    );
  };


  // Export Excel — Combined 2 Worksheets in 1 File
  const handleExportExcel = async () => {
    if (!startDate || !endDate) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນສົ່ງອອກ Excel");
      return;
    }

    const XLSX = await import("xlsx");

    let allData: RatingDataItem[] = [];
    let countData: RatingCountItem[] = [];

    try {
      const [resData, resCount] = await Promise.all([
        axiosInstance.get("/reports/ratingdata", {
          params: { page: 1, limit: 9999, startDate, endDate },
        }),
        axiosInstance.get("/reports/ratingcount", {
          params: { startDate, endDate },
        }),
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

    // Sheet 1: ລາຍລະອຽດການປະເມິນ (Details)
    if (allData.length > 0) {
      const dataRows = allData.map((d, index) => {
        const agentName =
          `${d.agent?.employee?.first_name || ""} ${d.agent?.employee?.last_name || ""}`.trim() ||
          "-";
        const empCode = d.agent?.employee?.emp_code || "";
        const customerName =
          d.externalUser?.customerName || d.externalUser?.name || "ບໍ່ລະບຸຊື່";
        const phone = d.externalUser?.msisdn || d.externalUser?.phone || "";

        return {
          "ລຳດັບ": index + 1,
          "ວັນທີປະເມີນ": d.createdAt ? moment(d.createdAt).format("DD/MM/YYYY HH:mm") : "",
          "ຜູ້ປະເມີນ": customerName + (phone ? ` (${phone})` : ""),
          "ພະນັກງານ": agentName + (empCode ? ` (${empCode})` : ""),
          "ຫົວຂໍ້": d.topic?.name || "-",
          "ຄະແນນ": `${d.rating} ດາວ`,
          "ຄຳຄິດເຫັນ": d.comment || "-",
        };
      });
      const worksheetData = XLSX.utils.json_to_sheet(dataRows);
      XLSX.utils.book_append_sheet(workbook, worksheetData, "ລາຍລະອຽດການປະເມິນ");
    }

    // Sheet 2: ສະຫຼຸບຈຳນວນດາວ (Summary)
    if (countData.length > 0) {
      const countRows = countData.map((c, index) => {
        const agentName =
          `${c.agent?.employee?.first_name || ""} ${c.agent?.employee?.last_name || ""}`.trim() ||
          `Agent #${c.agentId}`;
        const empCode = c.agent?.employee?.emp_code || "";

        return {
          "ລຳດັບ": index + 1,
          "ຊື່ພະນັກງານ": agentName + (empCode ? ` (${empCode})` : ""),
          "1 ດາວ": c.rating1,
          "2 ດາວ": c.rating2,
          "3 ດາວ": c.rating3,
          "4 ດາວ": c.rating4,
          "5 ດາວ": c.rating5,
          "ລວມທັງໝົດ": c.totalRatings,
          "ຄະແນນສະເລ່ຍ": c.averageRating,
        };
      });
      const worksheetCount = XLSX.utils.json_to_sheet(countRows);
      XLSX.utils.book_append_sheet(workbook, worksheetCount, "ສະຫຼຸບຈຳນວນດາວ");
    }

    XLSX.writeFile(workbook, `rating_report_${startDate}_to_${endDate}.xlsx`);
    toast.success("ສົ່ງອອກ Excel ສຳເລັດແລ້ວ");
  };

  // Export PDF — Combined 2 Sections/Tables in 1 File using @react-pdf/renderer with PhetsarathOT font
  const handleExportPDF = async () => {
    if (!startDate || !endDate) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນສົ່ງອອກ PDF");
      return;
    }

    let allData: RatingDataItem[] = [];
    let countData: RatingCountItem[] = [];

    try {
      const [resData, resCount] = await Promise.all([
        axiosInstance.get("/reports/ratingdata", {
          params: { page: 1, limit: 9999, startDate, endDate },
        }),
        axiosInstance.get("/reports/ratingcount", {
          params: { startDate, endDate },
        }),
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
      const { RatingReportPDF } = await import("./pdf/RatingReportPDF");
      const { generateAndDownloadPDF } = await import("@/lib/pdf/downloadPdf");

      await generateAndDownloadPDF(
        <RatingReportPDF
          data={allData}
          countData={countData}
          startDate={startDate}
          endDate={endDate}
        />,
        `rating_report_${startDate}_to_${endDate}.pdf`
      );

      toast.success("ສົ່ງອອກ PDF ສຳເລັດແລ້ວ");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF");
    }
  };


  const isLoading = loadingData || loadingCount;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 font-sans text-slate-800 dark:text-slate-100 space-y-6 print:bg-white print:p-0">
      {/* Main Search & Filter Control Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-slate-200/80 dark:border-gray-700/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-semibold text-base">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>ຕົວກອງຂໍ້ມູນລາຍງານການປະເມີນຄວາມພໍໃຈ</span>
          </div>

          {/* Quick Date Range Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-gray-500 font-medium mr-1">
              ທາງລັດ:
            </span>
            <button
              onClick={() => handleQuickDate("today")}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 text-slate-600 dark:text-gray-300 rounded-lg transition-colors"
            >
              ມື້ນີ້
            </button>
            <button
              onClick={() => handleQuickDate("7days")}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 text-slate-600 dark:text-gray-300 rounded-lg transition-colors"
            >
              7 ມື້ຜ່ານມາ
            </button>
            <button
              onClick={() => handleQuickDate("30days")}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 text-slate-600 dark:text-gray-300 rounded-lg transition-colors"
            >
              30 ມື້ຜ່ານມາ
            </button>
            <button
              onClick={() => handleQuickDate("month")}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 text-slate-600 dark:text-gray-300 rounded-lg transition-colors"
            >
              ເດືອນນີ້
            </button>
          </div>
        </div>

        {/* Date Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>ວັນທີເລີ່ມຕົ້ນ</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>ຫາວັນທີ</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-2 flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all duration-200 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>ດຶງລາຍງານ</span>
            </button>

            <button
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ລ້າງຄ່າ</span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-500/20 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-rose-500/20 transition-all"
            >
              <FileType className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation & Search Bar Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700/80 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50">
          {/* Tab Buttons */}
          <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-gray-700/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === "data"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>ລາຍລະອຽດການປະເມິນຄວາມພໍໃຈ</span>
              {totalData > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full font-bold">
                  {totalData}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("count")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === "count"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Award className="w-4 h-4" />
              <span>ສະຫຼຸບຈຳນວນດາວຕາມ Agent</span>
              {ratingCountList.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full font-bold">
                  {ratingCountList.length}
                </span>
              )}
            </button>
          </div>

          {/* Live Search Input */}
          <div className="relative min-w-[240px] sm:min-w-[300px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === "data"
                  ? "ຄົ້ນຫາ Agent, ຜູ້ຮັບບໍລິການ, ຄຳຄິດເຫັນ..."
                  : "ຄົ້ນຫາ Agent..."
              }
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* TAB 1: RATING DATA DETAILS TABLE */}
        {activeTab === "data" && (
          <div className="p-0">
            {loadingData ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-slate-600 dark:text-gray-400">
                  ກຳລັງໂຫຼດຂໍ້ມູນລາຍລະອຽດການປະເມິນ...
                </p>
              </div>
            ) : filteredRatingData.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <AlertCircle className="w-12 h-12 text-slate-300 dark:text-gray-600" />
                <p className="text-base font-semibold text-slate-700 dark:text-gray-300">
                  ບໍ່ພົບຂໍ້ມູນລາຍງານການປະເມິນ
                </p>
                <p className="text-xs text-slate-400 dark:text-gray-500">
                  ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ແລ້ວກົດປຸ່ມ &quot;ດຶງລາຍງານ&quot;
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 dark:bg-gray-700/50 border-b border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                      <th className="py-3.5 px-4 text-center w-12">#</th>
                      <th className="py-3.5 px-4">ວັນທີປະເມີນ</th>
                      <th className="py-3.5 px-4">ຜູ້ປະເມີນ</th>
                      <th className="py-3.5 px-4">ພະນັກງານ</th>
                      <th className="py-3.5 px-4">ຫົວຂໍ້</th>
                      <th className="py-3.5 px-4 text-center">ຄະແນນ</th>
                      <th className="py-3.5 px-4">ຄຳຄິດເຫັນ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-gray-700/70 text-sm">
                    {filteredRatingData.map((item, index) => {
                      const agentName =
                        `${item.agent?.employee?.first_name || ""} ${item.agent?.employee?.last_name || ""
                          }`.trim() || `Agent #${item.agentId}`;
                      const empCode = item.agent?.employee?.emp_code;
                      const customerName =
                        item.externalUser?.customerName ||
                        item.externalUser?.name ||
                        "ບໍ່ລະບຸຊື່";
                      const phone = item.externalUser?.msisdn || item.externalUser?.phone;

                      return (
                        <tr
                          key={item.id || index}
                          className="hover:bg-slate-50/80 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400 dark:text-gray-500">
                            {(page - 1) * limit + index + 1}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs font-medium text-slate-600 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {item.createdAt
                                  ? moment(item.createdAt).format("DD/MM/YYYY HH:mm")
                                  : "-"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-medium text-slate-800 dark:text-gray-200 text-xs sm:text-sm">
                              {customerName}
                            </div>
                            {phone && (
                              <div className="text-[11px] text-slate-400 dark:text-gray-400">
                                ໂທ: {phone}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm">
                              {agentName}
                            </div>
                            {empCode && (
                              <span className="text-[11px] text-slate-400 dark:text-gray-400 font-mono">
                                ລະຫັດ: {empCode}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-md text-xs font-medium">
                              {item.topic?.name || "-"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center">
                              {renderStars(item.rating)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs whitespace-nowrap">
                            <p className="text-xs text-slate-600 dark:text-gray-300 line-clamp-2">
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
            {ratingDataList.length > 0 && (
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
                    className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-bold"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-700 dark:text-slate-200 px-3">
                    ໜ້າ {page} ຈາກ {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages || loadingData}
                    className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-bold"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RATING COUNT SUMMARY TABLE */}
        {activeTab === "count" && (
          <div className="p-0">
            {loadingCount ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-sm font-medium text-slate-600 dark:text-gray-400">
                  ກຳລັງໂຫຼດຂໍ້ມູນສຫຼຸບຈຳນວນດາວ...
                </p>
              </div>
            ) : filteredRatingCount.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <AlertCircle className="w-12 h-12 text-slate-300 dark:text-gray-600" />
                <p className="text-base font-semibold text-slate-700 dark:text-gray-300">
                  ບໍ່ພົບຂໍ້ມູນສຫຼຸບການປະເມິນ
                </p>
                <p className="text-xs text-slate-400 dark:text-gray-500">
                  ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ແລ້ວກົດປຸ່ມ &quot;ດຶງລາຍງານ&quot;
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 dark:bg-gray-700/50 border-b border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                      <th className="py-3.5 px-4 text-center w-12">#</th>
                      <th className="py-3.5 px-4">ຊື່ພະນັກງານ</th>
                      <th className="py-3.5 px-3 text-center text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20">
                        1 ດາວ
                      </th>
                      <th className="py-3.5 px-3 text-center text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20">
                        2 ດາວ
                      </th>
                      <th className="py-3.5 px-3 text-center text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20">
                        3 ດາວ
                      </th>
                      <th className="py-3.5 px-3 text-center text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20">
                        4 ດາວ
                      </th>
                      <th className="py-3.5 px-3 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                        5 ດາວ
                      </th>
                      <th className="py-3.5 px-4 text-center font-bold">ລວມທັງໝົດ</th>
                      <th className="py-3.5 px-4 text-center">ຄະແນນສະເລ່ຍ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-gray-700/70 text-sm">
                    {filteredRatingCount.map((item, index) => {
                      const agentName =
                        `${item.agent?.employee?.first_name || ""} ${item.agent?.employee?.last_name || ""
                          }`.trim() || `Agent #${item.agentId}`;
                      const empCode = item.agent?.employee?.emp_code;
                      const gender = item.agent?.employee?.gender;

                      return (
                        <tr
                          key={item.agentId}
                          className="hover:bg-slate-50/80 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400 dark:text-gray-500">
                            {index + 1}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                              <span>{agentName}</span>
                              {gender && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-slate-500 font-normal">
                                  {gender}
                                </span>
                              )}
                            </div>
                            {empCode && (
                              <div className="text-xs text-slate-400 dark:text-gray-400 font-mono">
                                ລະຫັດ: {empCode}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/10">
                            {item.rating1}
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/10">
                            {item.rating2}
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-amber-600 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/10">
                            {item.rating3}
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/10">
                            {item.rating4}
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10">
                            {item.rating5}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-white">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-gray-700 rounded-lg text-xs">
                              {item.totalRatings}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 rounded-full font-bold text-xs">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{item.averageRating.toFixed(2)}</span>
                            </div>
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
    </div>
  );
}
