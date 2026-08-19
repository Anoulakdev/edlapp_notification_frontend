"use client";

import { useState } from "react";
import {
  X,
  CreditCard,
  User,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Receipt,
  Building2,
  FileText,
  DollarSign,
  ShieldCheck,
  Zap,
  Printer,
  Sparkles,
  ExternalLink,
  Hash,
  Landmark,
  Tag,
  Layers,
  RotateCcw,
  Info,
  CheckCheck,
  Share2,
  ArrowRight,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { PaymentItem } from "@/schemas/payment";
import moment from "moment";
import { toast } from "react-toastify";

interface PaymentDetailModalProps {
  open: boolean;
  onClose: () => void;
  item: PaymentItem | null;
}

export function PaymentDetailModal({
  open,
  onClose,
  item,
}: PaymentDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!open || !item) return null;

  const copyToClipboard = (text: string | number, fieldName: string) => {
    if (text === null || text === undefined || text === "") return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    toast.success(`ຄັດລອກ ${fieldName} ແລ້ວ`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatMoney = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || val === "") return "0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? "0" : num.toLocaleString("en-US");
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    const m = moment(dateStr);
    return m.isValid() ? m.format("DD/MM/YYYY HH:mm:ss") : dateStr;
  };

  const isSuccess = item.status === "SUCCESS";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
      style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[36px] shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Luxury Deep Navy Gradient */}
        <div className="relative px-6 sm:px-8 pt-7 pb-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white overflow-hidden shrink-0 border-b border-indigo-500/20">
          {/* Ambient Glow Elements */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar (Title & Actions) */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-cyan-300 border border-white/15 shadow-inner shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  ລາຍລະອຽດການຊຳລະເງິນ (Payment Receipt)
                </h3>
                <div className="flex items-center gap-2 text-xs text-indigo-200/80 mt-0.5 font-mono">
                  <span>Tx ID: #{item.transaction_id || "-"}</span>
                  {item.payment_id && (
                    <span className="opacity-70">| ID: #{item.payment_id}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center text-white shrink-0 border border-white/15"
              title="ປິດ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Hero Receipt Card (Floating Header Card) */}
          <div className="mt-5 p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 relative z-10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                  ຍອດເງິນທີ່ຊຳລະແລ້ວ (PAID AMOUNT)
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isSuccess
                      ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 shadow-xs"
                      : "bg-amber-500/30 text-amber-200 border border-amber-400/40 shadow-xs"
                  }`}
                >
                  {isSuccess ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-amber-300" />
                  )}
                  {item.status || "SUCCESS"}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline gap-2 mt-1">
                <span>{formatMoney(item.paid_amount)}</span>
                <span className="text-sm font-bold text-cyan-200">
                  ກີບ
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/15">
              <span className="text-xs text-indigo-100/90">
                ຍອດບິນທັງໝົດ:{" "}
                <strong className="text-white font-bold">
                  {formatMoney(item.bill_amount)} ກີບ
                </strong>
              </span>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-white shadow-xs">
                <CreditCard className="w-4 h-4 text-cyan-300" />
                <span>ຊ່ອງທາງ: {item.provider_code || "BCEL One"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 scrollbar-thin bg-slate-50/50 dark:bg-slate-900/50">
          {/* Card 1: 👤 ຂໍ້ມູນບັນຊີໄຟຟ້າ & ຜູ້ຊົມໃຊ້ (Combined Account & Customer Card) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                1. ຂໍ້ມູນບັນຊີໄຟຟ້າ & ຜູ້ຊົມໃຊ້ (Electricity Account & Customer)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column: Account No, Account Name, Province & User ID */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block mb-1">
                    ເລກບັນຊີ & ຊື່ເຈົ້າຂອງບັນຊີໄຟຟ້າ
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      {item.account_no || "-"}
                    </span>
                    {item.account_no && (
                      <button
                        onClick={() => copyToClipboard(item.account_no, "ເລກບັນຊີ")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors shrink-0"
                        title="Copy Account No"
                      >
                        {copiedField === "ເລກບັນຊີ" ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {item.account_name || "-"}
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Paid & Phone */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block mb-1">
                    ຜູ້ດຳເນີນການຊຳລະ & ເບີໂທລະສັບ
                  </span>
                  <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{item.customer_paid || "-"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.customer_phone || "ບໍ່ມີເບີໂທ"}</span>
                  </div>
                  {item.customer_phone && (
                    <button
                      onClick={() => copyToClipboard(item.customer_phone, "ເບີໂທ")}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      title="Copy Phone"
                    >
                      {copiedField === "ເບີໂທ" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 🧾 ຂໍ້ມູນໃບບິນໄຟຟ້າ & ງວດຊຳລະ (Combined Bill Card) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                2. ລາຍລະອຽດໃບບິນໄຟຟ້າ & ງວດຊຳລະ (Bill & Invoice Details)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Box: Bill ID & Bill Month */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block mb-1">
                    ເລກບິນ & ງວດເດືອນບິນ
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {item.bill_id ? `Bill #${item.bill_id}` : "-"}
                      </span>
                      {item.bill_month && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-black bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">
                          ເດືອນ {item.bill_month}
                        </span>
                      )}
                    </div>
                    {item.bill_id && (
                      <button
                        onClick={() => copyToClipboard(item.bill_id, "ເລກບິນ")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        title="Copy Bill ID"
                      >
                        {copiedField === "ເລກບິນ" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Box: Comparison of Bill Amount vs Paid Amount */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block mb-1">
                    ມູນຄ່າບິນ & ຍອດຊຳລະຕົວຈິງ
                  </span>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>ຍອດບິນທັງໝົດ:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatMoney(item.bill_amount)} ກີບ</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    <span>ຍອດທີ່ຊຳລະແລ້ວ:</span>
                    <span className="text-sm font-black">{formatMoney(item.paid_amount)} ກີບ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 🏦 ລາຍລະອຽດທະນາຄານ & ເກດເວ (Combined Banking & Gateway Tech Refs) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                <Landmark className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                3. ຂໍ້ມູນທຸລະກຳ & ທະນາຄານ (Bank & {item.provider_code || "BCEL"} Gateway Technical Details)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Box: Bank References (Bank Tx ID, Ticket, FCC Ref) */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  ລະຫັດອ້າງອີງທະນາຄານ (Bank References)
                </span>

                {/* Bank Tx ID */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Bank Tx ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{item.bank_transaction_id || "-"}</span>
                    {item.bank_transaction_id && (
                      <button
                        onClick={() => copyToClipboard(item.bank_transaction_id, "Bank Tx ID")}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {copiedField === "Bank Tx ID" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Bank Ticket */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Bank Ticket:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{item.bank_ticket || "-"}</span>
                    {item.bank_ticket && (
                      <button
                        onClick={() => copyToClipboard(item.bank_ticket, "Bank Ticket")}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {copiedField === "Bank Ticket" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Bank FCC Ref */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">FCC Reference:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{item.bank_fccref || "-"}</span>
                    {item.bank_fccref && (
                      <button
                        onClick={() => copyToClipboard(item.bank_fccref, "Bank FCC Ref")}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {copiedField === "Bank FCC Ref" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Box: Terminal & Merchant Technical Info */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  ລະບົບເກດເວ & ເທີມີນອນ (Gateway & Terminal)
                </span>

                {/* EDL Transaction ID */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">EDL Tx ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{item.transaction_id || "-"}</span>
                    {item.transaction_id && (
                      <button
                        onClick={() => copyToClipboard(item.transaction_id, "EDL Tx ID")}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {copiedField === "EDL Tx ID" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Terminal ID */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Terminal ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{item.terminal_id || "-"}</span>
                </div>

                {/* MCID & MCC */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">MCID / MCC:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {item.mcid || "-"} {item.mcc ? `(${item.mcc})` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: ⏱️ ບັນທຶກເວລາ & ສະຖານະລະບົບ (Combined Timeline Flow) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                4. ບັນທຶກເວລາ & ສະຖານະລະບົບ (Timestamps & Lifecycle)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1: Created At */}
              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block mb-1">
                  1. ເວລາສ້າງລາຍການ (Created At)
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {formatDate(item.created_at)}
                </span>
              </div>

              {/* Step 2: Paid At (Highlighted) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                  2. ເວລາຊຳລະສຳເລັດ (Paid At)
                </span>
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  {item.paid_at || formatDate(item.created_at)}
                </span>
              </div>

              {/* Step 3: Expired At */}
              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block mb-1">
                  3. ເວລາໝົດອາຍຸ (Expired At)
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {formatDate(item.expired_at)}
                </span>
              </div>
            </div>

            {/* Retry details note */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>ຈຳນວນຄັ້ງ Retry: <strong className="text-slate-800 dark:text-slate-200 font-mono">{item.retry_count || 0}</strong> ຄັ້ງ</span>
                {item.next_retry_at && (
                  <span className="text-slate-400 font-normal">
                    (ພະຍາຍາມຄັ້ງຕໍ່ໄປ: {formatDate(item.next_retry_at)})
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">Payment ID: #{item.payment_id || "-"}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">ທຸລະກຳໄດ້ຮັບການຢືນຢັນຈາກ {item.provider_code || "BCEL"} Payment Gateway</span>
            <span className="sm:hidden">ຢືນຢັນຈາກ {item.provider_code || "BCEL"}</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition-all shadow-2xs"
          >
            ປິດ
          </button>
        </div>
      </div>
    </div>
  );
}
