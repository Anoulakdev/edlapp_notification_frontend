"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, Textarea } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { ProblemDoc } from "@/schemas/problemdoc";
import { Mic, Image as ImageIcon, X, Square } from "lucide-react";
import moment from "moment";

interface RepairProblemdocModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: ProblemDoc | null;
  onRefresh: () => void;
}

export const RepairProblemdocModal = memo(function RepairProblemdocModal({
  open,
  onClose,
  selectedDoc,
  onRefresh,
}: RepairProblemdocModalProps) {
  const [commentText, setCommentText] = useState("");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState("");
  const [recordingState, setRecordingState] = useState<"idle" | "recording">("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const imgInputRef = useRef<HTMLInputElement>(null);
  // DOM ref for timer display — avoids setState every second
  const timerDisplayRef = useRef<HTMLSpanElement>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);
  const mimeTypeRef = useRef("");

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    secondsRef.current = 0;
    if (timerDisplayRef.current) timerDisplayRef.current.textContent = "00:00";
  };

  const cleanupRecording = useCallback(() => {
    stopTimer();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, []);

  useEffect(() => {
    if (open) {
      setError("");
      setCommentText("");
      setImgFile(null);
      setAudioFile(null);
      setImgPreview("");
      setRecordingState("idle");
      cleanupRecording();
    } else {
      setRecordingState("idle");
      cleanupRecording();
    }
  }, [open, selectedDoc, cleanupRecording]);

  // Native Browser MediaRecorder — encodes Opus via browser's native C++ engine
  // No WASM/JavaScript encoder glue → No Array.map stack overflow
  // Chrome: audio/webm;codecs=opus (Opus codec, iOS 15.4+ compatible)
  // Safari: audio/mp4 (AAC, all iOS versions compatible)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      // Prefer Opus codec (iOS 15.4+ compatible via WebM container)
      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
        mimeType = "audio/ogg;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      }
      mimeTypeRef.current = mimeType;

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        const actualMime = mimeTypeRef.current || mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob([...audioChunksRef.current], { type: actualMime });
        audioChunksRef.current = [];

        // Determine extension by codec
        const ext = actualMime.includes("ogg") ? ".opus"
          : actualMime.includes("mp4") ? ".m4a"
          : ".opus";
        const file = new File([blob], `voice-${moment().format("YYYYMMDD-HHmmss")}${ext}`, { type: actualMime });

        setRecordingState("idle");
        setAudioFile(file);
      };

      mediaRecorder.start();

      // Update timer via DOM ref — NOT React state
      secondsRef.current = 0;
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        const m = String(Math.floor(secondsRef.current / 60)).padStart(2, "0");
        const s = String(secondsRef.current % 60).padStart(2, "0");
        if (timerDisplayRef.current) timerDisplayRef.current.textContent = `${m}:${s}`;
      }, 1000);

      setRecordingState("recording");
    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error("ກະລຸນາອະນຸຍາດການນຳໃຊ້ໄມໂຄຣໂຟນ (Microphone)");
    }
  };

  const stopRecording = () => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        audioChunksRef.current = [];
        setRecordingState("idle");
      };
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }
    stopTimer();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImgFile(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const removeImg = () => {
    setImgFile(null);
    setImgPreview("");
    if (imgInputRef.current) imgInputRef.current.value = "";
  };

  const removeAudio = () => setAudioFile(null);

  const handleSubmit = async () => {
    if (!selectedDoc) return;
    if (recordingState === "recording") { stopRecording(); return; }

    const trimmedText = commentText.trim();
    if (!trimmedText && !imgFile && !audioFile) {
      setError("ກະລຸນາປ້ອນຂໍ້ມູນຢ່າງນ້ອຍ 1 ຢ່າງ (ຂໍ້ຄວາມ, ຮູບພາບ ຫຼື ໄຟລ໌ສຽງ)");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("problemstatusId", "4");
      if (trimmedText) formData.append("commentText", trimmedText);
      if (imgFile) formData.append("commentImg", imgFile);
      if (audioFile) formData.append("commentAudio", audioFile);

      await axiosInstance.put(`/problemdocs/repair/${selectedDoc.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("ບັນທຶກແກ້ໄຂວຽກສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກແກ້ໄຂວຽກ";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setRecordingState("idle");
    cleanupRecording();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="ແກ້ໄຂວຽກ" size="md">
      <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {error && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        {/* Doc Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            ແຈ້ງຊ່ວຍເຫຼືອເລກທີ: <span className="font-mono text-blue-600 dark:text-blue-400">#{selectedDoc?.id}</span>
          </p>
          <p>ຜູ້ແຈ້ງ: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDoc?.fullName || "-"}</span> ({selectedDoc?.tel || "-"})</p>
          <p>ປະເພດບັນຫາ: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDoc?.problemtype?.name || "-"}</span></p>
        </div>

        {/* Comment Text */}
        <Textarea
          label="ຂໍ້ຄວາມອະທິບາຍ"
          rows={3}
          placeholder="ໃສ່ຂໍ້ຄວາມອະທິບາຍຄວາມຄືບໜ້າການສ້ອມແປງ..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />

        {/* Comment Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
            ຮູບພາບປະກອບ
          </label>
          <input type="file" ref={imgInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
          {imgPreview ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={removeImg} className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 shadow">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => imgInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <span>ເລືອກຮູບພາບປະກອບ</span>
            </button>
          )}
        </div>

        {/* Comment Audio Recording — Blue Theme, Native MediaRecorder */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
            ໄຟລ໌ສຽງ
          </label>

          {recordingState === "recording" ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping shrink-0" />
                <span>ກຳລັງອັດສຽງ (</span>
                <span ref={timerDisplayRef} className="font-mono tabular-nums">00:00</span>
                <span>)</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={stopRecording} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1">
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>ຢຸດອັດສຽງ</span>
                </button>
                <button type="button" onClick={cancelRecording} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : audioFile ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs">
              <div className="flex items-center gap-2.5 truncate pr-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{audioFile.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{(audioFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button type="button" onClick={removeAudio} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={startRecording} className="w-full flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
              <Mic className="w-4 h-4 text-blue-500" />
              <span>ກົດເພື່ອບັນທຶກສຽງ</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40">
          * ກະລຸນາໃສ່ຂໍ້ມູນຢ່າງນ້ອຍ 1 ຢ່າງ (ຂໍ້ຄວາມ, ຮູບພາບ ຫຼື ໄຟລ໌ສຽງ)
        </p>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">ຍົກເລີກ</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={saving}
            disabled={!commentText.trim() && !imgFile && !audioFile}
            className="flex-1"
          >
            ບັນທຶກແກ້ໄຂວຽກ
          </Button>
        </div>
      </div>
    </Modal>
  );
});
