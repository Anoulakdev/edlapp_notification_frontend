"use client";

import { Modal } from "@/components/ui/Modal";
import { Calendar, Clock, MapPin, User, FileText } from "lucide-react";
import moment from "moment";
import { TurnoffDoc } from "@/schemas/turnoff";

interface ViewTurnoffModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: TurnoffDoc | null;
}

export function ViewTurnoffModal({ open, onClose, selectedDoc }: ViewTurnoffModalProps) {
  const viewUrl = selectedDoc?.turnoffFile
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/turnoff/${selectedDoc.turnoffFile}`
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

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">ເວລາ</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                  {selectedDoc ? `${selectedDoc.startTime} - ${selectedDoc.endTime}` : "-"}
                </span>
              </div>
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

          {/* Affected Villages */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              ບ້ານທີ່ຈະມອດໄຟ ({selectedDoc?.turnoffAddresses?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1 border border-slate-100 dark:border-slate-800/60 rounded-xl bg-slate-50/20 dark:bg-slate-950/10">
              {selectedDoc?.turnoffAddresses && selectedDoc.turnoffAddresses.length > 0 ? (
                selectedDoc.turnoffAddresses.map((addr, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20"
                  >
                    {addr.village?.village_name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-455 dark:text-slate-500 p-2 italic">
                  ບໍ່ມີຂໍ້ມູນບ້ານທີ່ຈະมອດໄຟ
                </span>
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
                  ລະຫັດພະນักງານ: {selectedDoc.createdBy.employee.emp_code}
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
