"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, Textarea } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { ProblemDoc } from "@/schemas/problemdoc";
import {
  Mic,
  Image as ImageIcon,
  X,
  Square,
  Wrench,
  Plus,
  Trash2,
  PackageCheck,
} from "lucide-react";
import moment from "moment";

interface EquipmentRow {
  id: string;
  typeEquipmentId: string;
  equipmentId: string;
  amount: number | string;
  typeUnitId: string;
  comment: string;
}

interface TypeEquipmentItem {
  id: number;
  name: string;
  code?: string;
}

interface EquipmentItem {
  id: number;
  name: string;
  typeEquipmentId?: number;
  typeEquipment?: { id: number; name: string };
}

interface TypeUnitItem {
  id: number;
  name: string;
}

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

  // Equipment states
  const [equipments, setEquipments] = useState<EquipmentRow[]>([]);
  const [typeEquipments, setTypeEquipments] = useState<TypeEquipmentItem[]>([]);
  const [equipmentsList, setEquipmentsList] = useState<EquipmentItem[]>([]);
  const [typeUnits, setTypeUnits] = useState<TypeUnitItem[]>([]);
  const [loadingMasterData, setLoadingMasterData] = useState(false);

  const imgInputRef = useRef<HTMLInputElement>(null);
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
      try {
        mediaRecorderRef.current.stop();
      } catch (_) { }
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, []);

  // Fetch master data for equipments when modal opens
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const fetchMasterData = async () => {
      setLoadingMasterData(true);
      try {
        const [resTypes, resEquips, resUnits] = await Promise.all([
          axiosInstance.get("/typeequipments/selecttypeequipment"),
          axiosInstance.get("/equipments/selectequipment"),
          axiosInstance.get("/typeunits/selecttypeunit"),
        ]);
        if (isMounted) {
          setTypeEquipments(Array.isArray(resTypes.data) ? resTypes.data : []);
          setEquipmentsList(Array.isArray(resEquips.data) ? resEquips.data : []);
          setTypeUnits(Array.isArray(resUnits.data) ? resUnits.data : []);
        }
      } catch (err) {
        console.error("Failed to load master data for equipment:", err);
      } finally {
        if (isMounted) setLoadingMasterData(false);
      }
    };

    fetchMasterData();

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setError("");
      setCommentText(selectedDoc?.problemAssigns?.commentText || "");
      setImgFile(null);
      setAudioFile(null);
      setImgPreview("");
      setRecordingState("idle");
      cleanupRecording();

      // Pre-fill existing equipments if available
      if (
        selectedDoc?.problemAssigns?.problemEquipments &&
        selectedDoc.problemAssigns.problemEquipments.length > 0
      ) {
        setEquipments(
          selectedDoc.problemAssigns.problemEquipments.map((pe) => ({
            id: Math.random().toString(36).substring(2, 9),
            typeEquipmentId: String(pe.typeEquipmentId || pe.typeEquipment?.id || ""),
            equipmentId: String(pe.equipmentId || pe.equipment?.id || ""),
            amount: pe.amount || 1,
            typeUnitId: String(pe.typeUnitId || pe.typeUnit?.id || ""),
            comment: pe.comment || "",
          }))
        );
      } else {
        setEquipments([]);
      }
    } else {
      setRecordingState("idle");
      cleanupRecording();
    }
  }, [open, selectedDoc, cleanupRecording]);

  const handleAddEquipment = () => {
    setEquipments((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        typeEquipmentId: "",
        equipmentId: "",
        amount: 1,
        typeUnitId: "",
        comment: "",
      },
    ]);
  };

  const handleRemoveEquipment = (id: string) => {
    setEquipments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEquipmentChange = (
    id: string,
    field: keyof EquipmentRow,
    value: string | number
  ) => {
    setEquipments((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "typeEquipmentId") {
          updated.equipmentId = "";
        }
        return updated;
      })
    );
  };

  // Native Browser MediaRecorder
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

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

        const ext = actualMime.includes("ogg")
          ? ".opus"
          : actualMime.includes("mp4")
            ? ".m4a"
            : ".opus";
        const file = new File(
          [blob],
          `voice-${moment().format("YYYYMMDD-HHmmss")}${ext}`,
          { type: actualMime }
        );

        setRecordingState("idle");
        setAudioFile(file);
      };

      mediaRecorder.start();

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
    if (recordingState === "recording") {
      stopRecording();
      return;
    }

    const trimmedText = commentText.trim();
    if (!trimmedText && !imgFile && !audioFile && equipments.length === 0) {
      setError(
        "ກະລຸນາປ້ອນຂໍ້ມູນຢ່າງນ້ອຍ 1 ຢ່າງ (ຂໍ້ຄວາມ, ຮູບພາບ, ໄຟລ໌ສຽງ ຫຼື ອຸປະກອນສ້ອມແປງ)"
      );
      return;
    }

    // Validation for equipment rows
    for (let i = 0; i < equipments.length; i++) {
      const eq = equipments[i];
      if (!eq.typeEquipmentId) {
        const msg = `ກະລຸນາເລືອກໝວດໝູ່ອຸປະກອນ ສຳລັບລາຍການທີ ${i + 1}`;
        setError(msg);
        toast.error(msg);
        return;
      }
      if (!eq.equipmentId) {
        const msg = `ກະລຸນາເລືອກອຸປະກອນ ສຳລັບລາຍການທີ ${i + 1}`;
        setError(msg);
        toast.error(msg);
        return;
      }
      if (!eq.amount || Number(eq.amount) < 1) {
        const msg = `ກະລຸນາໃສ່ຈຳນວນທີ່ຖືກຕ້ອງ (ຢ່າງນ້ອຍ 1) ສຳລັບລາຍການທີ ${i + 1}`;
        setError(msg);
        toast.error(msg);
        return;
      }
      if (!eq.typeUnitId) {
        const msg = `ກະລຸນາເລືອກຫົວໜ່ວຍ ສຳລັບລາຍການທີ ${i + 1}`;
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("problemstatusId", "4");
      if (trimmedText) formData.append("commentText", trimmedText);
      if (imgFile) formData.append("commentImg", imgFile);
      if (audioFile) formData.append("commentAudio", audioFile);

      const hadExistingEquipments =
        (selectedDoc?.problemAssigns?.problemEquipments?.length || 0) > 0;
      if (equipments.length > 0 || hadExistingEquipments) {
        const payload = equipments.map((item) => ({
          typeEquipmentId: Number(item.typeEquipmentId),
          equipmentId: Number(item.equipmentId),
          amount: Number(item.amount) || 1,
          typeUnitId: Number(item.typeUnitId),
          comment: item.comment?.trim() || undefined,
        }));
        formData.append("problemEquipments", JSON.stringify(payload));
      }

      await axiosInstance.put(`/problemdocs/repair/${selectedDoc.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("ບັນທຶກແກ້ໄຂວຽກສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກແກ້ໄຂວຽກ";
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
    <Modal open={open} onClose={handleClose} title="ແກ້ໄຂວຽກ" size="xl">
      <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {error && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Left Column: General Repair Progress Details */}
          <div className="space-y-4">
            {/* Doc Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                ແຈ້ງຊ່ວຍເຫຼືອເລກທີ:{" "}
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  #{selectedDoc?.id}
                </span>
              </p>
              <p>
                ຜູ້ແຈ້ງ:{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedDoc?.fullName || "-"}
                </span>{" "}
                ({selectedDoc?.tel || "-"})
              </p>
              <p>
                ປະເພດບັນຫາ:{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedDoc?.problemtype?.name || "-"}
                </span>
              </p>
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
              <input
                type="file"
                ref={imgInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imgPreview ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img
                    src={imgPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImg}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>ເລືອກຮູບພາບປະກອບ</span>
                </button>
              )}
            </div>

            {/* Comment Audio Recording */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                ໄຟລ໌ສຽງ
              </label>

              {recordingState === "recording" ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping shrink-0" />
                    <span>ກຳລັງອັດສຽງ (</span>
                    <span ref={timerDisplayRef} className="font-mono tabular-nums">
                      00:00
                    </span>
                    <span>)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>ຢຸດອັດສຽງ</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                    >
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
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {audioFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {(audioFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAudio}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                >
                  <Mic className="w-4 h-4 text-blue-500" />
                  <span>ກົດເພື່ອບັນທຶກສຽງ</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40">
              * ກະລຸນາໃສ່ຂໍ້ມູນຢ່າງນ້ອຍ 1 ຢ່າງ (ຂໍ້ຄວາມ, ຮູບພາບ, ໄຟລ໌ສຽງ ຫຼື ອຸປະກອນສ້ອມແປງ)
            </p>
          </div>

          {/* Right Column: ອຸປະກອນສ້ອມແປງ (Repair Equipment) */}
          <div className="space-y-3 flex flex-col h-full lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  ອຸປະກອນສ້ອມແປງ
                </label>
                {equipments.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {equipments.length} ລາຍການ
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={loadingMasterData}
                onClick={handleAddEquipment}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ເພີ່ມອຸປະກອນ</span>
              </button>
            </div>

            {equipments.length === 0 ? (
              <div
                onClick={handleAddEquipment}
                className="cursor-pointer border border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 rounded-xl p-4 text-center text-xs text-slate-400 hover:text-amber-600 transition-all flex items-center justify-center gap-3 bg-slate-50/60 dark:bg-slate-900/30 group py-6"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 block text-xs">
                    {loadingMasterData
                      ? "ກຳລັງໂຫຼດຂໍ້ມູນອຸປະກອນ..."
                      : "ບໍ່ທັນມີລາຍການອຸປະກອນທີ່ນຳໃຊ້"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ກົດທີ່ນີ້ ຫຼື ກົດປຸ່ມ &quot;+ ເພີ່ມອຸປະກອນ&quot; ດ້ານເທິງຖ້າມີການນຳໃຊ້ອຸປະກອນ
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {equipments.map((item, index) => {
                    const filteredEquips = item.typeEquipmentId
                      ? equipmentsList.filter(
                        (eq) =>
                          !eq.typeEquipmentId ||
                          String(eq.typeEquipmentId) === String(item.typeEquipmentId) ||
                          String(eq.typeEquipment?.id) === String(item.typeEquipmentId)
                      )
                      : equipmentsList;

                    return (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400/50 dark:hover:border-amber-500/40 transition-colors space-y-1.5 shadow-xs"
                      >
                        {/* Row 1: Item #, Category, Equipment, Delete */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {index + 1}
                          </span>

                          {/* Type Equipment */}
                          <div className="flex-1 min-w-0">
                            <select
                              value={item.typeEquipmentId}
                              onChange={(e) =>
                                handleEquipmentChange(
                                  item.id,
                                  "typeEquipmentId",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer truncate"
                              title="ໝວດໝູ່ອຸປະກອນ"
                            >
                              <option value="">-- ເລືອກໝວດໝູ່ --</option>
                              {typeEquipments.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Equipment */}
                          <div className="flex-1 min-w-0">
                            <select
                              value={item.equipmentId}
                              disabled={!item.typeEquipmentId}
                              onChange={(e) =>
                                handleEquipmentChange(
                                  item.id,
                                  "equipmentId",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed truncate"
                              title="ອຸປະກອນ"
                            >
                              <option value="">-- ເລືອກອຸປະກອນ --</option>
                              {filteredEquips.map((eq) => (
                                <option key={eq.id} value={eq.id}>
                                  {eq.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveEquipment(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                            title="ລຶບລາຍການນີ້"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Row 2: Amount, Unit, Note/Comment */}
                        <div className="flex items-center gap-1.5 pl-[26px]">
                          {/* Amount */}
                          <div className="w-20 sm:w-24 shrink-0 flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 focus-within:ring-1 focus-within:ring-amber-500">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0 mr-1 select-none">
                              ຈ/ນ:
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={item.amount}
                              onChange={(e) =>
                                handleEquipmentChange(
                                  item.id,
                                  "amount",
                                  e.target.value
                                )
                              }
                              className="w-full text-xs bg-transparent text-right font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                              placeholder="1"
                            />
                          </div>

                          {/* Unit */}
                          <div className="w-24 sm:w-28 shrink-0">
                            <select
                              value={item.typeUnitId}
                              onChange={(e) =>
                                handleEquipmentChange(
                                  item.id,
                                  "typeUnitId",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer truncate"
                              title="ຫົວໜ່ວຍ"
                            >
                              <option value="">-- ຫົວໜ່ວຍ --</option>
                              {typeUnits.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Comment / Note */}
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={item.comment}
                              onChange={(e) =>
                                handleEquipmentChange(
                                  item.id,
                                  "comment",
                                  e.target.value
                                )
                              }
                              className="w-full px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              placeholder="ໝາຍເຫດ (ຖ້າມີ)..."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>

        {/* Footer info & Buttons */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              ຍົກເລີກ
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={saving}
              disabled={
                !commentText.trim() &&
                !imgFile &&
                !audioFile &&
                equipments.length === 0
              }
              className="flex-1"
            >
              ບັນທຶກແກ້ໄຂວຽກ
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
});
