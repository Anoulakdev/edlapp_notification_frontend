"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Search,
  Calendar,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  Receipt,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Building,
  RotateCcw,
  X,
  Hash,
  Clock,
  ArrowUpDown,
  SlidersHorizontal,
  FileSpreadsheet,
  FileType,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import moment from "moment";
import { ButtonTooltip, TableTooltip } from "@/lib/Tooltip";
import { PaymentItem, PaymentApiResponse } from "@/schemas/payment";
import { PaymentDetailModal } from "./PaymentDetailModal";

const PAGE_SIZE_OPTIONS = [8, 10, 20, 50, 100];

export function PaymentManagement() {
  const router = useRouter();
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paymentDateFrom, setPaymentDateFrom] = useState("");
  const [paymentDateTo, setPaymentDateTo] = useState("");
  const [activeDateQuick, setActiveDateQuick] = useState<"today" | "thisMonth" | "all">("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  // Detail Modal State
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);

  // Export Loading States
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Authenticate user & role check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        if ([5].includes(res.data?.roleId)) {
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

  // Fetch payments from backend
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: pageIndex + 1,
        pageSize: pageSize,
      };

      if (debouncedSearch.trim()) {
        params.accountNo = debouncedSearch.trim();
      }

      if (paymentDateFrom) {
        params.paymentDateFrom = paymentDateFrom;
      }

      if (paymentDateTo) {
        params.paymentDateTo = paymentDateTo;
      }

      const res = await axiosInstance.get<PaymentApiResponse>("/payments", {
        params,
      });

      if (res.data) {
        setItems(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);
        setTotalAmount(
          res.data.totalAmount ??
          res.data.items?.reduce(
            (acc, curr) => acc + (Number(curr.paid_amount) || 0),
            0
          ) ??
          0
        );
      }
    } catch (err: any) {
      console.error("Failed to load payments:", err);
      toast.error(
        err?.response?.data?.message || "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນການຊຳລະເງິນໄດ້"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, debouncedSearch, paymentDateFrom, paymentDateTo]);

  useEffect(() => {
    if (authorized) {
      fetchPayments();
    }
  }, [authorized, fetchPayments]);

  const openDetail = (item: PaymentItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setPaymentDateFrom("");
    setPaymentDateTo("");
    setActiveDateQuick("all");
    setPageIndex(0);
  };

  const setQuickDate = (type: "today" | "thisMonth" | "all") => {
    setActiveDateQuick(type);
    setPageIndex(0);
    if (type === "today") {
      const today = moment().format("YYYY-MM-DD");
      setPaymentDateFrom(today);
      setPaymentDateTo(today);
    } else if (type === "thisMonth") {
      const start = moment().startOf("month").format("YYYY-MM-DD");
      const end = moment().endOf("month").format("YYYY-MM-DD");
      setPaymentDateFrom(start);
      setPaymentDateTo(end);
    } else {
      setPaymentDateFrom("");
      setPaymentDateTo("");
    }
  };

  const formatMoney = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || val === "") return "0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? "0" : num.toLocaleString("en-US");
  };

  // Helper to fetch all records matching active filters for export
  const fetchAllExportData = async (): Promise<PaymentItem[]> => {
    try {
      const params: Record<string, any> = {
        page: 1,
        pageSize: 9999,
      };
      if (debouncedSearch.trim()) params.accountNo = debouncedSearch.trim();
      if (paymentDateFrom) params.paymentDateFrom = paymentDateFrom;
      if (paymentDateTo) params.paymentDateTo = paymentDateTo;

      const res = await axiosInstance.get<PaymentApiResponse>("/payments", {
        params,
      });

      if (res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
        return res.data.items;
      }
      return items;
    } catch {
      return items;
    }
  };

  // Export to Excel (.xlsx) using SheetJS 'xlsx' library
  const handleExportExcel = async () => {
    if (items.length === 0) {
      toast.warning("ບໍ່ມີຂໍ້ມູນການຊຳລະເງິນເພື່ອສົ່ງອອກ");
      return;
    }

    try {
      setExportingExcel(true);
      const dataToExport = await fetchAllExportData();

      if (dataToExport.length === 0) {
        toast.warning("ບໍ່ມີຂໍ້ມູນການຊຳລະເງິນເພື່ອສົ່ງອອກ");
        return;
      }

      const XLSX = await import("xlsx");

      const exportRows = dataToExport.map((d, index) => {
        return {
          "ລຳດັບ": index + 1,
          "ວັນທີ & ເວລາຊຳລະ":
            d.paid_at ||
            (d.created_at
              ? moment(d.created_at).format("DD/MM/YYYY HH:mm:ss")
              : "-"),
          "ເລກບັນຊີຜູ້ໃຊ້ໄຟ": d.account_no || "-",
          "ຊື່ເຈົ້າຂອງບັນຊີ": d.account_name || "-",
          "ຜູ້ດຳເນີນການຊຳລະ": d.customer_paid || "-",
          "ເບີໂທຜູ້ຊຳລະ": d.customer_phone || "-",
          "ງວດເດືອນບິນ": d.bill_month || "-",
          "ເລກບິນ (Bill ID)": d.bill_id ? String(d.bill_id) : "-",
          "ຍອດບິນ (ກີບ)": Number(d.bill_amount) || 0,
          "ຍອດຊຳລະ (ກີບ)": Number(d.paid_amount) || 0,
          "ຊ່ອງທາງ": d.provider_code || "BCEL",
          "Bank Transaction ID": d.bank_transaction_id
            ? String(d.bank_transaction_id)
            : "-",
          "Bank Ticket": d.bank_ticket || d.bank_fccref || "-",
          "EDL Transaction ID": d.transaction_id || "-",
          "ສະຖານະ": d.status || "SUCCESS",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payment Transactions");

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

      const fileDateSuffix =
        paymentDateFrom || paymentDateTo
          ? `${paymentDateFrom || "all"}_to_${paymentDateTo || "now"}`
          : moment().format("YYYYMMDD_HHmmss");

      XLSX.writeFile(workbook, `payment_report_${fileDateSuffix}.xlsx`);
      toast.success(
        `ສົ່ງອອກ Excel (.xlsx) ສຳເລັດແລ້ວ — ${dataToExport.length} ລາຍການ`
      );
    } catch (err) {
      console.error("Failed to export Excel:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ Excel");
    } finally {
      setExportingExcel(false);
    }
  };

  // Export to PDF (.pdf) using @react-pdf/renderer
  const handleExportPDF = async () => {
    if (items.length === 0) {
      toast.warning("ບໍ່ມີຂໍ້ມູນການຊຳລະເງິນເພື່ອສົ່ງອອກ");
      return;
    }

    try {
      setExportingPdf(true);
      const dataToExport = await fetchAllExportData();

      if (dataToExport.length === 0) {
        toast.warning("ບໍ່ມີຂໍ້ມູນການຊຳລະເງິນເພື່ອສົ່ງອອກ");
        return;
      }

      const { PaymentReportPDF } = await import("./pdf/PaymentReportPDF");
      const { generateAndDownloadPDF } = await import("@/lib/pdf/downloadPdf");

      const fileDateSuffix =
        paymentDateFrom || paymentDateTo
          ? `${paymentDateFrom || "all"}_to_${paymentDateTo || "now"}`
          : moment().format("YYYYMMDD_HHmmss");

      await generateAndDownloadPDF(
        <PaymentReportPDF
          data={dataToExport}
          startDate={paymentDateFrom}
          endDate={paymentDateTo}
          accountNo={debouncedSearch}
          totalAmount={totalAmount}
        />,
        `payment_report_${fileDateSuffix}.pdf`
      );

      toast.success(
        `ສົ່ງອອກ PDF (.pdf) ສຳເລັດແລ້ວ — ${dataToExport.length} ລາຍການ`
      );
    } catch (err) {
      console.error("Failed to export PDF:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ PDF");
    } finally {
      setExportingPdf(false);
    }
  };

  // Summary stats
  const totalAmountSum = useMemo(() => {
    return items.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0);
  }, [items]);

  // Columns definition
  const columns = useMemo<ColumnDef<PaymentItem>[]>(
    () => [
      {
        id: "index",
        header: "ລຳດັບ",
        cell: ({ row }) => (
          <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 inline-flex items-center justify-center font-bold text-xs border border-slate-200/60 dark:border-slate-700/50 shadow-2xs">
            {row.index + 1 + pageIndex * pageSize}
          </span>
        ),
      },
      {
        accessorKey: "account_no",
        header: "ເລກບັນຊີ / ເຈົ້າຂອງບັນຊີ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="py-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {doc.account_no || "-"}
                </span>
              </div>
              <TableTooltip text={doc.account_name || "-"}>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[210px] mt-0.5">
                  {doc.account_name || "-"}
                </div>
              </TableTooltip>
            </div>
          );
        },
      },
      {
        accessorKey: "transaction_id",
        header: "ລະຫັດທຸລະກຳ / ບິນ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="py-1 flex flex-col items-start gap-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50">
                {doc.transaction_id || "-"}
              </span>
              {doc.bill_id && (
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 pl-0.5">
                  Bill #{doc.bill_id}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "bank_transaction_id",
        header: "Bank Tx ID",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="py-1">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block">
                {doc.bank_transaction_id || "-"}
              </span>
              {doc.bank_ticket && (
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 block truncate max-w-[120px]">
                  {doc.bank_ticket}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "bill_month",
        header: "ບິນເດືອນ",
        cell: ({ row }) => {
          const doc = row.original;
          return doc.bill_month ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50 shadow-2xs">
              {doc.bill_month}
            </span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">-</span>
          );
        },
      },
      {
        accessorKey: "paid_amount",
        header: "ຍອດຊຳລະ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="py-1">
              <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
                <span>{formatMoney(doc.paid_amount)}</span>
                <span className="text-[11px] font-semibold text-emerald-600/70 dark:text-emerald-400/70">
                  ກີບ
                </span>
              </div>
              {doc.bill_amount && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  ຍອດບິນ: {formatMoney(doc.bill_amount)}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "customer_paid",
        header: "ຜູ້ຊຳລະ / ເບີໂທ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="py-1">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[160px]">
                  {doc.customer_paid || "-"}
                </span>
              </div>
              {doc.customer_phone ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 mt-1">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{doc.customer_phone}</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 mt-1 block">-</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "provider_code",
        header: "ຊ່ອງທາງ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500/10 to-blue-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-2xs">
              <CreditCard className="w-3.5 h-3.5" />
              <span>{doc.provider_code || "BCEL"}</span>
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "ສະຖານະ",
        cell: ({ row }) => {
          const doc = row.original;
          const isSuccess = doc.status === "SUCCESS";
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${isSuccess
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                }`}
            >
              {isSuccess ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {doc.status || "SUCCESS"}
            </span>
          );
        },
      },
      {
        accessorKey: "paid_at",
        header: "ວັນທີຊຳລະ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-600 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {doc.paid_at ||
                  (doc.created_at
                    ? moment(doc.created_at).format("DD/MM/YYYY HH:mm")
                    : "-")}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "#",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="flex items-center gap-1.5 shrink-0">
              <ButtonTooltip text="ເບິ່ງລາຍລະອຽດ">
                <button
                  onClick={() => openDetail(doc)}
                  className="p-2 rounded-xl text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 transition-all shadow-2xs"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </ButtonTooltip>
            </div>
          );
        },
      },
    ],
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const generatePagination = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pageIndex <= 2) {
        pages.push(0, 1, 2, 3, "...", totalPages - 1);
      } else if (pageIndex >= totalPages - 3) {
        pages.push(
          0,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1
        );
      } else {
        pages.push(
          0,
          "...",
          pageIndex - 1,
          pageIndex,
          pageIndex + 1,
          "...",
          totalPages - 1
        );
      }
    }
    return pages;
  };

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

  const startRecord = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endRecord = Math.min((pageIndex + 1) * pageSize, totalCount);

  return (
    <div
      className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8 space-y-6"
      style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
    >
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                color: "rgb(var(--text-primary))",
                fontFamily: "var(--font-display)",
              }}
            >
              ລາຍການຊຳລະເງິນ
            </h1>
          </div>
        </div>

        {/* Save Excel & Save PDF Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exportingExcel || items.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 transition-all shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer"
            title="ສົ່ງອອກ Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>{exportingExcel ? "ກຳລັງສົ່ງອອກ..." : "ສົ່ງອອກ Excel (.xlsx)"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exportingPdf || items.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-bold rounded-2xl border border-red-200/80 dark:border-red-900/50 transition-all shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer"
            title="ສົ່ງອອກ PDF (.pdf)"
          >
            <FileType className="w-4 h-4 text-red-500" />
            <span>{exportingPdf ? "ກຳລັງສົ່ງອອກ..." : "ສົ່ງອອກ PDF (.pdf)"}</span>
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Card 1: ທຸລະກຳທັງໝົດ */}
        <div
          className="group relative overflow-hidden p-5 sm:p-6 rounded-[26px] sm:rounded-[28px] border shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
          style={{
            background: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          {/* Ambient Glow Gradient */}
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

          {/* Background Watermark Icon */}
          <Receipt className="absolute -right-3 -bottom-3 w-28 h-28 text-blue-500/[0.04] dark:text-blue-400/[0.05] -rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-0 transition-all duration-500" />

          <div className="flex items-center gap-4 sm:gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/25 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  ທຸລະກຳທັງໝົດ
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight flex items-baseline gap-2">
                <span>{totalCount.toLocaleString()}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  ລາຍການ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: ຍອດລວມເປັນເງິນທັງໝົດ */}
        <div
          className="group relative overflow-hidden p-5 sm:p-6 rounded-[26px] sm:rounded-[28px] border shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
          style={{
            background: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          {/* Ambient Glow Gradient */}
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

          {/* Background Watermark Icon */}
          <DollarSign className="absolute -right-3 -bottom-3 w-28 h-28 text-emerald-500/[0.04] dark:text-emerald-400/[0.05] -rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-0 transition-all duration-500" />

          <div className="flex items-center gap-4 sm:gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  ຍອດລວມເປັນເງິນທັງໝົດ
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight flex items-baseline gap-2">
                <span>{formatMoney(totalAmount)}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ກີບ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div
        className="rounded-3xl overflow-hidden shadow-sm border"
        style={{
          background: "rgb(var(--card))",
          borderColor: "rgb(var(--border))",
        }}
      >
        {/* Toolbar & Filters */}
        <div
          className="p-5 sm:p-6 border-b flex flex-col gap-4"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input - accountNo */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາເລກບັນຊີ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setDebouncedSearch(search);
                    setPageIndex(0);
                  }
                }}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                style={{
                  fontFamily: "inherit",
                  background: "rgb(var(--bg))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--text-primary))",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgb(var(--brand))")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgb(var(--border))")
                }
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                    setPageIndex(0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Date Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                ທາງລັດ:
              </span>
              <button
                onClick={() => setQuickDate("today")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeDateQuick === "today" && (paymentDateFrom || paymentDateTo)
                  ? "bg-brand text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
              >
                ມື້ນີ້
              </button>
              <button
                onClick={() => setQuickDate("thisMonth")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeDateQuick === "thisMonth" && (paymentDateFrom || paymentDateTo)
                  ? "bg-brand text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
              >
                ເດືອນນີ້
              </button>
              <button
                onClick={() => setQuickDate("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${!paymentDateFrom && !paymentDateTo
                  ? "bg-brand text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
              >
                ທັງໝົດ
              </button>

              {(search || paymentDateFrom || paymentDateTo) && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all ml-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  ລ້າງຕົວກັ່ນຕອງ
                </button>
              )}
            </div>
          </div>

          {/* Date Pickers & Page Size */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  ວັນທີເລີ່ມຕົ້ນ:
                </span>
                <input
                  type="date"
                  value={paymentDateFrom}
                  onChange={(e) => {
                    setPaymentDateFrom(e.target.value);
                    setActiveDateQuick("all");
                    setPageIndex(0);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                  style={{
                    background: "rgb(var(--bg))",
                    border: "1px solid rgb(var(--border))",
                    color: "rgb(var(--text-primary))",
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  ຫາວັນທີ:
                </span>
                <input
                  type="date"
                  value={paymentDateTo}
                  onChange={(e) => {
                    setPaymentDateTo(e.target.value);
                    setActiveDateQuick("all");
                    setPageIndex(0);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                  style={{
                    background: "rgb(var(--bg))",
                    border: "1px solid rgb(var(--border))",
                    color: "rgb(var(--text-primary))",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ສະແດງ:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageIndex(0);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold outline-none cursor-pointer transition-all"
                style={{
                  background: "rgb(var(--bg))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--text-primary))",
                }}
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} ລາຍການ / ໜ້າ
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[950px]">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-slate-200/80 dark:border-slate-800"
                  style={{ background: "rgb(var(--bg))" }}
                >
                  {headerGroup.headers.map((header) => {
                    const widthClass =
                      header.id === "index"
                        ? "w-[4%] min-w-[50px]"
                        : header.id === "account_no"
                          ? "w-[16%] min-w-[160px]"
                          : header.id === "transaction_id"
                            ? "w-[13%] min-w-[125px]"
                            : header.id === "bank_transaction_id"
                              ? "w-[12%] min-w-[115px]"
                              : header.id === "bill_month"
                                ? "w-[9%] min-w-[90px]"
                                : header.id === "paid_amount"
                                  ? "w-[12%] min-w-[115px]"
                                  : header.id === "customer_paid"
                                    ? "w-[13%] min-w-[125px]"
                                    : header.id === "provider_code"
                                      ? "w-[7%] min-w-[80px]"
                                      : header.id === "status"
                                        ? "w-[7%] min-w-[85px]"
                                        : header.id === "paid_at"
                                          ? "w-[10%] min-w-[115px]"
                                          : header.id === "actions"
                                            ? "w-[4%] min-w-[45px]"
                                            : "";
                    return (
                      <th
                        key={header.id}
                        className={`text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${widthClass}`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        ກຳລັງໂຫຼດຂໍ້ມູນການຊຳລະເງິນ...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-20 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-3.5 max-w-sm mx-auto">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-inner">
                        <FileText className="w-7 h-7 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                          ບໍ່ພົບຂໍ້ມູນການຊຳລະເງິນ
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          ບໍ່ມີລາຍການທຸລະກຳທີ່ກົງກັບເງື່ອນໄຂ ຫຼື ຊ່ວງວັນທີທີ່ເລືອກ
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const widthClass =
                        cell.column.id === "index"
                          ? "w-[4%] min-w-[50px]"
                          : cell.column.id === "account_no"
                            ? "w-[16%] min-w-[160px]"
                            : cell.column.id === "transaction_id"
                              ? "w-[13%] min-w-[125px]"
                              : cell.column.id === "bank_transaction_id"
                                ? "w-[12%] min-w-[115px]"
                                : cell.column.id === "bill_month"
                                  ? "w-[9%] min-w-[90px]"
                                  : cell.column.id === "paid_amount"
                                    ? "w-[12%] min-w-[115px]"
                                    : cell.column.id === "customer_paid"
                                      ? "w-[13%] min-w-[125px]"
                                      : cell.column.id === "provider_code"
                                        ? "w-[7%] min-w-[80px]"
                                        : cell.column.id === "status"
                                          ? "w-[7%] min-w-[85px]"
                                          : cell.column.id === "paid_at"
                                            ? "w-[10%] min-w-[115px]"
                                            : cell.column.id === "actions"
                                              ? "w-[4%] min-w-[45px]"
                                              : "";
                      return (
                        <td key={cell.id} className={`px-6 py-4 ${widthClass}`}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination layout */}
        {totalPages > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ສະແດງ <strong>{startRecord}</strong> - <strong>{endRecord}</strong> ຈາກທັງໝົດ{" "}
              <strong>{totalCount.toLocaleString()}</strong> ລາຍການ
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
                className="w-8.5 h-8.5 flex items-center justify-center rounded-xl border bg-theme-bg border-theme text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-2xs"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {generatePagination().map((page, idx) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-xs font-bold text-slate-400"
                    >
                      ...
                    </span>
                  );
                }
                const i = page as number;
                return (
                  <button
                    key={i}
                    onClick={() => setPageIndex(i)}
                    className="w-8.5 h-8.5 flex items-center justify-center rounded-xl text-xs font-bold transition-all shadow-2xs"
                    style={{
                      background:
                        pageIndex === i ? "rgb(var(--brand))" : "transparent",
                      border: "1px solid rgb(var(--border))",
                      color:
                        pageIndex === i
                          ? "white"
                          : "rgb(var(--text-secondary))",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setPageIndex((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={pageIndex >= totalPages - 1}
                className="w-8.5 h-8.5 flex items-center justify-center rounded-xl border bg-theme-bg border-theme text-slate-500 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-2xs"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <PaymentDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        item={selectedItem}
      />
    </div>
  );
}
