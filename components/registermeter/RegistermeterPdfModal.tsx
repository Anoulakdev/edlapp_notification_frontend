"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/FormElements";
import { Download, Printer, RefreshCw, AlertTriangle, FileText } from "lucide-react";
import { RegisterMeter } from "@/schemas/registermeter";
import { axiosInstance } from "@/lib/axiosInstance";
import { ASSET_BASE_URL } from "@/lib/utils";
import { toast } from "react-toastify";

interface RegistermeterPdfModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: RegisterMeter | null;
}

export function RegistermeterPdfModal({
  open,
  onClose,
  selectedDoc,
}: RegistermeterPdfModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [docDetail, setDocDetail] = useState<RegisterMeter | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const urlToBase64 = async (url: string | null): Promise<string | null> => {
    if (!url) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Failed to load image for PDF:", e);
      return null;
    }
  };

  const generatePdf = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    setError("");

    try {
      // 1. Fetch full details from API
      let fullDoc: RegisterMeter = selectedDoc;
      try {
        const res = await axiosInstance.get(`/registermeters/${selectedDoc.id}`);
        if (res.data) {
          fullDoc = res.data;
          setDocDetail(res.data);
        }
      } catch (err) {
        console.warn("Using selectedDoc as fallback:", err);
      }

      // 2. Pre-fetch images to base64 to avoid CORS/network hang inside @react-pdf
      const billUrl = fullDoc.billNearImg
        ? `${ASSET_BASE_URL}/upload/registermeter/${fullDoc.billNearImg}`
        : null;
      const idcardUrl = fullDoc.idcardImg
        ? `${ASSET_BASE_URL}/upload/registermeter/${fullDoc.idcardImg}`
        : null;

      const [billBase64, idcardBase64] = await Promise.all([
        urlToBase64(billUrl),
        urlToBase64(idcardUrl),
      ]);

      // 3. Import @react-pdf/renderer and fonts dynamically
      const { pdf } = await import("@react-pdf/renderer");
      const { registerPdfFonts } = await import("@/lib/pdf/registerFonts");
      registerPdfFonts();

      const { RegistermeterDocPDF } = await import("./pdf/RegistermeterDocPDF");

      const docElement = (
        <RegistermeterDocPDF
          doc={fullDoc}
          billBase64={billBase64}
          idcardBase64={idcardBase64}
        />
      );

      // 4. Generate Blob & Object URL
      const blob = await pdf(docElement).toBlob();
      const url = URL.createObjectURL(blob);

      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err: any) {
      console.error("Failed to generate Registermeter PDF:", err);
      setError("ເກີດຂໍ້ຜິດພາດໃນການສ້າງເອກະສານ PDF");
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການສ້າງເອກະສານ PDF");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && selectedDoc) {
      generatePdf();
    } else {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
      setDocDetail(null);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedDoc?.id]);

  const handleDownload = () => {
    if (!pdfBlobUrl || !selectedDoc) return;
    const a = document.createElement("a");
    a.href = pdfBlobUrl;
    a.download = `registermeter_${selectedDoc.id}_${selectedDoc.fullName || "document"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    } else if (pdfBlobUrl) {
      window.open(pdfBlobUrl, "_blank")?.print();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      title={
        <div
          className="flex flex-wrap items-center justify-between gap-3 w-full pr-2"
          style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>ເບິ່ງຂໍ້ມູນ (PDF)</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  #{selectedDoc?.id}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {selectedDoc?.fullName} — {selectedDoc?.phone}
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={generatePdf}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs py-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">ໂຫຼດຄືນ</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              disabled={!pdfBlobUrl || loading}
              className="flex items-center gap-1.5 text-xs py-1.5 text-slate-700 dark:text-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ພິມ</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              disabled={!pdfBlobUrl || loading}
              className="flex items-center gap-1.5 text-xs py-1.5 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ດາວໂຫຼດ PDF</span>
            </Button>
          </div>
        </div>
      }
    >
      <div
        className="w-full flex flex-col items-center justify-center"
        style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
      >
        {loading ? (
          <div className="w-full h-[70vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-600 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              ກຳລັງສ້າງເອກະສານ PDF ແລະ ໂຫຼດຮູບພາບ...
            </p>
            <p className="text-xs text-slate-400">
              ໜ້າ 1: ຂໍ້ມູນລາຍລະອຽດ | ໜ້າ 2: ຮູບພາບຄັດຕິດ 2 ຮູບ
            </p>
          </div>
        ) : error ? (
          <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
            <Button variant="primary" size="sm" onClick={generatePdf}>
              ລອງໃໝ່ອີກຄັ້ງ
            </Button>
          </div>
        ) : pdfBlobUrl ? (
          <div className="w-full h-[76vh] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner">
            <iframe
              ref={iframeRef}
              src={`${pdfBlobUrl}#toolbar=1`}
              title={`PDF Preview #${selectedDoc?.id}`}
              className="w-full h-full border-none"
            />
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
