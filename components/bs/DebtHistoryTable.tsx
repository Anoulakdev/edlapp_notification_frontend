"use client";

import { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  RotateCcw,
} from "lucide-react";
import moment from "moment";
import { BsDebtItem } from "@/schemas/bs";

interface DebtHistoryTableProps {
  debtList: BsDebtItem[];
  className?: string;
}

export function DebtHistoryTable({ debtList, className }: DebtHistoryTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "pay" | "bill">("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  // Helper to parse numbers safely without losing digits due to commas
  const parseNumber = (val: any): number => {
    if (val === null || val === undefined || val === "") return 0;
    if (typeof val === "number") return isNaN(val) ? 0 : val;
    const clean = String(val).replace(/,/g, "").trim();
    const num = Number(clean);
    return isNaN(num) ? 0 : num;
  };

  // Helper format money
  const formatMoney = (val: number | string | undefined | null) => {
    if (val === null || val === undefined || val === "") return "0";
    const num = typeof val === "number" ? val : parseNumber(val);
    return isNaN(num) ? "0" : num.toLocaleString("en-US");
  };

  // Helper to extract outstanding from item (handles both outstanding and outstaning without 'd')
  const getOutstanding = (item: BsDebtItem): number => {
    const raw =
      item.outstanding !== undefined && item.outstanding !== null
        ? item.outstanding
        : (item as any).outstaning !== undefined && (item as any).outstaning !== null
          ? (item as any).outstaning
          : (item as any).out_standing;
    return parseNumber(raw);
  };

  // Helper format date & time
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return { date: "-", time: "" };
    const m = moment(dateStr);
    if (!m.isValid()) return { date: dateStr, time: "" };
    return {
      date: m.format("DD/MM/YYYY"),
      time: m.format("HH:mm:ss"),
    };
  };

  // Counts for filter tabs
  const counts = useMemo(() => {
    let paidCount = 0;
    let billCount = 0;

    debtList.forEach((item) => {
      const isPay = item.account_type === "ຈ່າຍ" || item.payment_type === "CR";
      if (isPay) {
        paidCount += 1;
      } else {
        billCount += 1;
      }
    });

    return {
      total: debtList.length,
      paidCount,
      billCount,
    };
  }, [debtList]);

  // Filtered Debt List
  const filteredList = useMemo(() => {
    if (!debtList || debtList.length === 0) return [];

    let list = debtList;

    // Filter by type
    if (typeFilter === "pay") {
      list = list.filter(
        (item) => item.account_type === "ຈ່າຍ" || item.payment_type === "CR"
      );
    } else if (typeFilter === "bill") {
      list = list.filter(
        (item) => item.account_type !== "ຈ່າຍ" && item.payment_type !== "CR"
      );
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((item) => {
        const payNo = String(item.payment_no || "").toLowerCase();
        const masterId = String(item.master_id || "").toLowerCase();
        const accType = String(item.account_type || "").toLowerCase();
        const payType = String(item.payment_type || "").toLowerCase();
        const masterBillId = String(item.master_bill_id ?? "").toLowerCase();

        return (
          payNo.includes(q) ||
          masterId.includes(q) ||
          accType.includes(q) ||
          payType.includes(q) ||
          masterBillId.includes(q)
        );
      });
    }

    return list;
  }, [debtList, typeFilter, search]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const pagedItems = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, pageIndex, pageSize]);

  return (
    <div className={className || "space-y-4"}>
      {/* Controls Header: Search & Filter Tabs */}
      <div className="p-3.5 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Segmented Filter Control */}
        <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setTypeFilter("all");
              setPageIndex(0);
            }}
            className={`flex-1 md:flex-none px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${typeFilter === "all"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm shadow-black/5"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
          >
            <span>ທັງໝົດ</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black ${typeFilter === "all"
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
            >
              {counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTypeFilter("pay");
              setPageIndex(0);
            }}
            className={`flex-1 md:flex-none px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${typeFilter === "pay"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-black/5"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
          >
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">ລາຍການຊຳລະ</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black ${typeFilter === "pay"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
            >
              {counts.paidCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTypeFilter("bill");
              setPageIndex(0);
            }}
            className={`flex-1 md:flex-none px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${typeFilter === "bill"
              ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm shadow-black/5"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">ລາຍການອອກບິນ</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black ${typeFilter === "bill"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
            >
              {counts.billCount}
            </span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(0);
            }}
            placeholder="ຄົ້ນຫາເລກທີໃບຮັບ, Master ID, ປະເພດ..."
            className="w-full pl-9 pr-9 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPageIndex(0);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-xs transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Table / List View */}
      {filteredList.length === 0 ? (
        <div className="py-16 sm:py-20 text-center text-slate-400 space-y-3 px-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-3xl bg-slate-100 dark:bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
            <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {search.trim() || typeFilter !== "all"
                ? "ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບເງື່ອນໄຂການຄົ້ນຫາ"
                : "ບໍ່ພົບຂໍ້ມູນປະຫວັດໜີ້ສິນ ແລະ ການຊຳລະ"}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search.trim()
                ? "ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ກົດປຸ່ມຣີເຊັດຕົວກັ່ນຕອງເພື່ອສະແດງຂໍ້ມູນທັງໝົດ"
                : "ບໍ່ມີລາຍການປະຫວັດໜີ້ສິນໃນຊ່ວງເວລາທີ່ເລືອກ"}
            </p>
          </div>
          {(search.trim() || typeFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setPageIndex(0);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ລ້າງຕົວກັ່ນຕອງ</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card List (md:hidden) */}
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
            {pagedItems.map((item, idx) => {
              const isPay =
                item.account_type === "ຈ່າຍ" || item.payment_type === "CR";
              const amount = parseNumber(item.actual_amt ?? item.bill_amount ?? 0);
              const outst = getOutstanding(item);
              const { date, time } = formatDateTime(
                item.payment_date || item.bill_date
              );

              return (
                <div
                  key={
                    item.payment_id ||
                    item.master_id ||
                    item.payment_no ||
                    idx
                  }
                  className={`p-3.5 space-y-2.5 transition-colors ${isPay
                    ? "bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05]"
                    : "bg-blue-500/[0.02] hover:bg-blue-500/[0.05]"
                    }`}
                >
                  {/* Header: Index, Date/Time, and Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono font-bold text-[10px] inline-flex items-center justify-center">
                        {pageIndex * pageSize + idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span>{date}</span>
                        {time && (
                          <span className="text-[10px] font-normal text-slate-400">
                            {time}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-2xs ${isPay
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25"
                        }`}
                    >
                      {isPay ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-500" />
                      )}
                      <span>
                        {item.account_type || (isPay ? "ຈ່າຍ" : "ອອກບິນ")}
                      </span>
                    </span>
                  </div>

                  {/* Middle row: IDs */}
                  <div className="flex items-center justify-between text-[11px] gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-slate-400 shrink-0">ເລກທີ:</span>
                      <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 truncate">
                        {item.payment_no || item.master_id || "-"}
                      </span>
                    </div>
                    {item.master_bill_id && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                        <span>Bill ID:</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {item.master_bill_id}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom row: Financial summary card */}
                  <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">ຈຳນວນເງິນ</span>
                      <div
                        className={`font-black text-xs sm:text-sm tabular-nums ${isPay
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-900 dark:text-slate-100"
                          }`}
                      >
                        {formatMoney(amount)}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">
                          ກີບ
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">ໜີ້ຍັງເຫຼືອ</span>
                      {outst > 0 ? (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/20 tabular-nums">
                          {formatMoney(outst)} ກີບ
                        </span>
                      ) : outst < 0 ? (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/20 tabular-nums">
                          {formatMoney(outst)} ກີບ
                        </span>
                      ) : (
                        <span className="font-bold text-slate-400 dark:text-slate-500 text-xs tabular-nums">
                          0 ກີບ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 text-center w-14">#</th>
                  <th className="py-3.5 px-4">ວັນທີ & ເວລາ</th>
                  <th className="py-3.5 px-4">ປະເພດລາຍການ</th>
                  <th className="py-3.5 px-4">ເລກທີໃບຮັບ / Master ID</th>
                  <th className="py-3.5 px-4 text-right">ຈຳນວນເງິນ (ກີບ)</th>
                  <th className="py-3.5 px-4 text-right">ໜີ້ຍັງເຫຼືອ (ກີບ)</th>
                  <th className="py-3.5 px-4 font-mono text-center">Master Bill ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {pagedItems.map((item, idx) => {
                  const isPay =
                    item.account_type === "ຈ່າຍ" || item.payment_type === "CR";
                  const amount = parseNumber(item.actual_amt ?? item.bill_amount ?? 0);
                  const outst = getOutstanding(item);
                  const { date, time } = formatDateTime(
                    item.payment_date || item.bill_date
                  );

                  return (
                    <tr
                      key={
                        item.payment_id ||
                        item.master_id ||
                        item.payment_no ||
                        idx
                      }
                      className={`transition-colors ${isPay
                        ? "hover:bg-emerald-500/[0.04] dark:hover:bg-emerald-500/[0.06]"
                        : "hover:bg-blue-500/[0.04] dark:hover:bg-blue-500/[0.06]"
                        }`}
                    >
                      {/* Index */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono font-bold text-[11px] inline-flex items-center justify-center">
                          {pageIndex * pageSize + idx + 1}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {date}
                        </div>
                        {time && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{time}</span>
                          </div>
                        )}
                      </td>

                      {/* Account Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-2xs ${isPay
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25"
                            }`}
                        >
                          {isPay ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          <span>
                            {item.account_type || (isPay ? "ຈ່າຍ" : "ອອກບິນ")}
                          </span>
                        </span>
                      </td>

                      {/* Payment No / Master ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80">
                          {item.payment_no || item.master_id || "-"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className={`font-black text-sm tabular-nums ${isPay
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-900 dark:text-slate-100"
                            }`}
                        >
                          {formatMoney(amount)}
                          <span className="text-[11px] font-normal text-slate-400 ml-1">
                            ກີບ
                          </span>
                        </div>
                      </td>

                      {/* Outstanding Debt */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {outst > 0 ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs border border-rose-500/20 tabular-nums">
                            {formatMoney(outst)} ກີບ
                          </span>
                        ) : outst < 0 ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs border border-rose-500/20 tabular-nums">
                            {formatMoney(outst)} ກີບ
                          </span>
                        ) : (
                          <span className="font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                            0 ກີບ
                          </span>
                        )}
                      </td>

                      {/* Master Bill ID */}
                      <td className="py-3.5 px-4 font-mono text-center text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.master_bill_id ?? "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modern Pagination Footer */}
      {filteredList.length > 0 && (
        <div className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs font-semibold text-slate-500">
          {/* Counter text */}
          <div className="text-center sm:text-left text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs">
            ສະແດງ{" "}
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {pageIndex * pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {Math.min((pageIndex + 1) * pageSize, filteredList.length)}
            </span>{" "}
            ຈາກທັງໝົດ{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {filteredList.length.toLocaleString()}
            </span>{" "}
            ລາຍການ
          </div>

          {/* Pagination Controls */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            {/* Page size select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">ສະແດງ</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageIndex(0);
                }}
                className="px-2 py-1.5 sm:px-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-[11px] text-slate-400">/ ໜ້າ</span>
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                {pageIndex + 1} / {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                disabled={pageIndex >= totalPages - 1}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
