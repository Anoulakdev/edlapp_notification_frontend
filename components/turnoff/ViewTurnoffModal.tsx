"use client";

import { Modal } from "@/components/ui/Modal";
import { Calendar, Clock, MapPin, User, FileText, Users, Home } from "lucide-react";
import moment from "moment";
import { TurnoffDoc } from "@/schemas/turnoff";
import { ASSET_BASE_URL } from "@/lib/utils";

interface ViewTurnoffModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: TurnoffDoc | null;
}

export function ViewTurnoffModal({ open, onClose, selectedDoc }: ViewTurnoffModalProps) {
  const viewUrl = selectedDoc?.turnoffFile
    ? `${ASSET_BASE_URL}/upload/turnoff/${selectedDoc.turnoffFile}`
    : "";
  const viewTitle = selectedDoc?.title || "";

  return (
    <Modal open={open} onClose={onClose} title={`ເບິ່ງເອກະສານ: ແຈ້ງການມອດໄຟ`} size="2xl">

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-[75vh] max-h-[75vh] overflow-hidden" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {/* Left Side: Data info */}
        <div className="flex-1 lg:col-span-5 flex flex-col gap-5 overflow-y-auto pr-2 scrollbar-thin">

          {/* Title & Description */}
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-snug break-all">
              {selectedDoc?.title}
            </h3>
            {selectedDoc?.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                {selectedDoc.description}
              </p>
            )}
          </div>

          {/* Date & Time Panel */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">ວັນທີມອດໄຟ</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                  {selectedDoc ? (
                    moment(selectedDoc.startDate).format("DD/MM/YYYY") === moment(selectedDoc.endDate).format("DD/MM/YYYY")
                      ? moment(selectedDoc.startDate).format("DD/MM/YYYY")
                      : `${moment(selectedDoc.startDate).format("DD/MM/YYYY")} - ${moment(selectedDoc.endDate).format("DD/MM/YYYY")}`
                  ) : "-"}
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-3 min-w-0">
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-slate-400 font-medium">ເວລາ</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350 truncate">
                    {selectedDoc ? `${selectedDoc.startTime} - ${selectedDoc.endTime}` : "-"}
                  </span>
                </div>
              </div>
              {selectedDoc?.useTime !== undefined && selectedDoc?.useTime !== null && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/20 shrink-0 shadow-2xs">
                  ໃຊ້ເວລາ {selectedDoc.useTime} ນາທີ
                </span>
              )}
            </div>
          </div>

          {/* Location Panel */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              ເຂດພື້ນທີ່ມອດໄຟ
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                <span className="text-xs text-slate-400 mb-0.5">ແຂວງ</span>
                <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                  {selectedDoc?.province?.province_name || "-"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                <span className="text-xs text-slate-400 mb-0.5">ເມືອງ</span>
                <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                  {selectedDoc?.district?.district_name || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Affected Villages Header & Chips */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-500 animate-pulse" />
                <span>ບ້ານທີ່ຈະມອດໄຟ</span>
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20">
                {selectedDoc?.turnoffAddresses?.length || 0} ບ້ານ
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 shadow-inner scrollbar-thin">
              {selectedDoc?.turnoffAddresses && selectedDoc.turnoffAddresses.length > 0 ? (
                selectedDoc.turnoffAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{addr.village?.village_name}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-cyan-500/15 text-blue-700 dark:text-blue-300 border border-blue-400/30 shadow-2xs group-hover:scale-105 transition-transform">
                      <Users className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{addr.userCount !== undefined && addr.userCount !== null ? addr.userCount : 0} ທ່ານ</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-500 italic flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 opacity-40 text-blue-500" />
                  <span>ບໍ່ມີຂໍ້ມູນບ້ານທີ່ຈະມອດໄຟ</span>
                </div>
              )}
            </div>
          </div>

          {/* Creator Information */}
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-400">ຜູ້ສ້າງເອກະສານ</span>
              <span className="text-sm font-semibold text-slate-750 dark:text-slate-350 truncate">
                {selectedDoc?.createdBy?.employee
                  ? `${selectedDoc.createdBy.employee.first_name} ${selectedDoc.createdBy.employee.last_name}`
                  : selectedDoc?.createdBy?.username || "-"}
              </span>
              {selectedDoc?.createdBy?.employee?.emp_code && (
                <span className="text-xs text-slate-450 dark:text-slate-500">
                  ລະຫັດພະນັກງານ: {selectedDoc.createdBy.employee.emp_code}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: PDF Preview */}
        <div className="flex-1 lg:col-span-7 h-[40vh] lg:h-full flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/40">
          {viewUrl ? (
            viewUrl.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={viewUrl}
                className="w-full h-full border-none"
                title={viewTitle}
              />
            ) : (
              <div className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
                <img
                  src={viewUrl}
                  alt={viewTitle}
                  className="max-w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-sm"
                />
              </div>
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <FileText className="w-10 h-10" />
              <span className="text-sm">ບໍ່ພົບໄຟລ໌ເອກະສານ</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
