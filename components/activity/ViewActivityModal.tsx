"use client";

import { Modal } from "@/components/ui/Modal";
import {
  Calendar,
  MapPin,
  User,
  ExternalLink,
  Clock,
  Sparkles,
  FileText,
} from "lucide-react";
import moment from "moment";
import { Activity } from "@/schemas/activity";
import { ASSET_BASE_URL } from "@/lib/utils";

interface ViewActivityModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: Activity | null;
}

export function ViewActivityModal({
  open,
  onClose,
  selectedDoc,
}: ViewActivityModalProps) {
  if (!selectedDoc) return null;

  const viewUrl = selectedDoc.actFile
    ? `${ASSET_BASE_URL}/upload/activity/${selectedDoc.actFile}`
    : "";

  const isImageFile = /\.(jpg|jpeg|png|webp|gif)$/i.test(selectedDoc.actFile || "");
  const isPdfFile = /\.pdf$/i.test(selectedDoc.actFile || "");

  const formattedStart = selectedDoc.startDate
    ? moment(selectedDoc.startDate).format("DD/MM/YYYY")
    : "-";
  const formattedEnd = selectedDoc.endDate
    ? moment(selectedDoc.endDate).format("DD/MM/YYYY")
    : "-";
  const isSameDay = formattedStart === formattedEnd;

  const creatorName =
    selectedDoc.createdBy?.employee
      ? `${selectedDoc.createdBy.employee.first_name || ""} ${selectedDoc.createdBy.employee.last_name || ""}`.trim()
      : "-";

  return (
    <Modal open={open} onClose={onClose} title="ລາຍລະອຽດກິດຈະກຳ" size="xl">
      <div
        className="max-h-[82vh] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin space-y-6"
        style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
      >
        {/* 1. ຮູບຂຶ້ນກ່ອນ (Hero Image / Media Banner) */}
        {viewUrl && (
          <div className="relative w-full rounded-2xl overflow-hidden border border-theme bg-slate-100 dark:bg-slate-900 shadow-md group">
            {isImageFile ? (
              <div className="relative w-full bg-slate-950 flex items-center justify-center min-h-[240px] max-h-[460px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={viewUrl}
                  alt={selectedDoc.title}
                  className="w-full h-auto max-h-[460px] object-contain mx-auto"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-lg hover:scale-105"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ເປີດຮູບຂະໜາດເຕັມ</span>
                  </a>
                </div>
              </div>
            ) : isPdfFile ? (
              <div className="w-full h-[450px] relative">
                <iframe
                  src={`${viewUrl}#toolbar=0`}
                  className="w-full h-full border-none"
                  title="PDF Document"
                />
                <div className="absolute top-3 right-3">
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-lg hover:scale-105"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ເປີດໄຟລ໌ເຕັມ</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-brand" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-sm">
                    {selectedDoc.actFile}
                  </span>
                </div>
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand text-white hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>ເປີດໄຟລ໌</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* 2. ກຳນົດເວລາ ແລະ ສະຖານທີ່ */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-brand/10 text-brand">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ກິດຈະກຳ</span>
          </span>

          {/* ກຳນົດເວລາ */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-normal">ກຳນົດເວລາ:</span>
            <span>{isSameDay ? formattedStart : `${formattedStart} - ${formattedEnd}`}</span>
          </div>

          {/* ສະຖານທີ່ */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-normal">ສະຖານທີ່:</span>
            <span className="break-words">{selectedDoc.location || "-"}</span>
          </div>
        </div>

        {/* 3. ຫົວຂໍ້ກິດຈະກຳ */}
        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-snug tracking-tight">
            {selectedDoc.title}
          </h1>
          <div className="h-1 w-20 bg-brand rounded-full" />
        </div>

        {/* 4. ເນື້ອໃນກິດຈະກຳ */}
        <div className="rounded-2xl p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-900/40 border border-theme/80 shadow-xs">
          <div
            className="text-sm sm:text-base text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed font-normal text-justify"
            style={{ textAlign: "justify", textJustify: "inter-word" }}
          >
            {selectedDoc.content || "ບໍ່ມີລາຍລະອຽດເນື້ອໃນ"}
          </div>
        </div>

        {/* 5. ຜູ້ສ້າງ */}
        <div className="pt-4 border-t border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0 border border-brand/20 shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                ຜູ້ສ້າງ / ຜູ້ລົງຂ່າວ
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {creatorName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>ວັນທີສ້າງ: {moment(selectedDoc.createdAt).format("DD/MM/YYYY HH:mm")}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
