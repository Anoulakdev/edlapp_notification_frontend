"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, Textarea, Select, Checkbox } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { ProblemDoc } from "@/schemas/problemdoc";
import {
  Mic,
  Image as ImageIcon,
  X,
  Square,
  Wrench,
  Search,
  Truck,
  FileText,
} from "lucide-react";
import moment from "moment";

interface SelectedEquipmentState {
  checked: boolean;
  amount: number | string;
  comment: string;
}

interface EquipmentItem {
  id: number;
  name: string;
  unit?: string;
  branchId?: number;
  branch?: {
    id: number;
    name: string;
  };
}

interface TypeRepairItem {
  id: number;
  name: string;
}

interface VoltageItem {
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

  // Type of Repair, Voltage & Car Repair states
  const [typeRepairId, setTypeRepairId] = useState("");
  const [voltageId, setVoltageId] = useState("");
  const [carRepair, setCarRepair] = useState(false);
  const [typeRepairs, setTypeRepairs] = useState<TypeRepairItem[]>([]);
  const [voltages, setVoltages] = useState<VoltageItem[]>([]);

  // Equipment states
  const [selectedEquipments, setSelectedEquipments] = useState<
    Record<number, SelectedEquipmentState>
  >({});
  const [equipmentsList, setEquipmentsList] = useState<EquipmentItem[]>([]);
  const [equipmentSearch, setEquipmentSearch] = useState("");
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

  // Fetch master data for equipments, type repairs, and voltages when modal opens
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const fetchMasterData = async () => {
      setLoadingMasterData(true);
      try {
        const [resEquips, resTypeRepairs, resVoltages] = await Promise.all([
          axiosInstance.get("/equipments/selectequipment"),
          axiosInstance.get("/typerepairs/selecttyperepair"),
          axiosInstance.get("/voltages/selectvoltage"),
        ]);
        if (isMounted) {
          setEquipmentsList(Array.isArray(resEquips.data) ? resEquips.data : []);
          setTypeRepairs(Array.isArray(resTypeRepairs.data) ? resTypeRepairs.data : []);
          setVoltages(Array.isArray(resVoltages.data) ? resVoltages.data : []);
        }
      } catch (err) {
        console.error("Failed to load master data for repair:", err);
      } finally {
        if (isMounted) setLoadingMasterData(false);
      }
    };

    fetchMasterData();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Merge master equipments with any existing equipments on the problemdoc
  const displayEquipments = useMemo(() => {
    const list = [...equipmentsList];
    if (selectedDoc?.problemAssigns?.problemEquipments) {
      selectedDoc.problemAssigns.problemEquipments.forEach((pe) => {
        const eqId = Number(pe.equipmentId || (pe as any).equipment?.id);
        if (eqId && !list.some((e) => e.id === eqId)) {
          list.push({
            id: eqId,
            name: (pe as any).equipment?.name || `ອຸປະກອນ #${eqId}`,
            unit: (pe as any).equipment?.unit || "",
          });
        }
      });
    }
    return list;
  }, [equipmentsList, selectedDoc]);

  // Filtered equipments based on search
  const filteredEquipments = useMemo(() => {
    if (!equipmentSearch.trim()) return displayEquipments;
    const term = equipmentSearch.toLowerCase();
    return displayEquipments.filter(
      (eq) =>
        eq.name.toLowerCase().includes(term) ||
        (eq.unit && eq.unit.toLowerCase().includes(term))
    );
  }, [displayEquipments, equipmentSearch]);

  // Checked equipments list
  const checkedEquipments = useMemo(() => {
    return Object.entries(selectedEquipments)
      .filter(([_, item]) => item.checked)
      .map(([eqId, item]) => ({
        equipmentId: Number(eqId),
        amount: item.amount === "" ? 0 : Number(item.amount),
        comment: item.comment?.trim() || undefined,
      }));
  }, [selectedEquipments]);

  // Pre-fill existing data when modal opens
  useEffect(() => {
    if (open) {
      setError("");
      setEquipmentSearch("");
      setCommentText(selectedDoc?.problemAssigns?.commentText || "");
      setTypeRepairId(
        selectedDoc?.problemAssigns?.typeRepairId
          ? String(selectedDoc.problemAssigns.typeRepairId)
          : ""
      );
      setVoltageId(
        selectedDoc?.problemAssigns?.voltageId
          ? String(selectedDoc.problemAssigns.voltageId)
          : ""
      );
      setCarRepair(Boolean(selectedDoc?.problemAssigns?.carRepair));
      setImgFile(null);
      setAudioFile(null);
      setImgPreview((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return "";
      });
      setRecordingState("idle");
      cleanupRecording();

      // Pre-fill existing equipments if available
      const initialSelected: Record<number, SelectedEquipmentState> = {};
      if (
        selectedDoc?.problemAssigns?.problemEquipments &&
        selectedDoc.problemAssigns.problemEquipments.length > 0
      ) {
        selectedDoc.problemAssigns.problemEquipments.forEach((pe) => {
          const eqId = Number(pe.equipmentId || (pe as any).equipment?.id);
          if (eqId) {
            initialSelected[eqId] = {
              checked: true,
              amount: pe.amount || 1,
              comment: pe.comment || "",
            };
          }
        });
      }
      setSelectedEquipments(initialSelected);
    } else {
      setImgPreview((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return "";
      });
      setRecordingState("idle");
      cleanupRecording();
    }
  }, [open, selectedDoc, cleanupRecording]);

  const handleToggleEquipment = (eqId: number) => {
    setSelectedEquipments((prev) => {
      const current = prev[eqId];
      const isNowChecked = !current?.checked;
      return {
        ...prev,
        [eqId]: {
          checked: isNowChecked,
          amount:
            current?.amount !== undefined && current?.amount !== ""
              ? current.amount
              : 1,
          comment: current?.comment ?? "",
        },
      };
    });
  };

  const handleAmountChange = (eqId: number, val: string) => {
    setSelectedEquipments((prev) => ({
      ...prev,
      [eqId]: {
        checked: prev[eqId]?.checked ?? true,
        amount: val,
        comment: prev[eqId]?.comment ?? "",
      },
    }));
  };

  const handleCommentChange = (eqId: number, val: string) => {
    setSelectedEquipments((prev) => ({
      ...prev,
      [eqId]: {
        checked: prev[eqId]?.checked ?? true,
        amount: prev[eqId]?.amount ?? 1,
        comment: val,
      },
    }));
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
      const nextUrl = URL.createObjectURL(file);
      setImgPreview((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return nextUrl;
      });
    }
  };

  const removeImg = () => {
    setImgFile(null);
    setImgPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return "";
    });
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
    if (
      !trimmedText &&
      !imgFile &&
      !audioFile &&
      checkedEquipments.length === 0 &&
      !typeRepairId &&
      !voltageId &&
      !carRepair
    ) {
      setError(
        "ກະລຸນາປ້ອນຂໍ້ມູນການສ້ອມແປງ (ປະເພດສ້ອມແປງ, ແຮງດັນ, ລົດສ້ອມແປງ, ຂໍ້ຄວາມ, ຮູບພາບ, ໄຟລ໌ສຽງ ຫຼື ອຸປະກອນສ້ອມແປງ)"
      );
      return;
    }

    // Validation for checked equipments
    for (let i = 0; i < checkedEquipments.length; i++) {
      const eq = checkedEquipments[i];
      if (!eq.amount || Number(eq.amount) < 1) {
        const foundEq = displayEquipments.find((e) => e.id === eq.equipmentId);
        const msg = `ກະລຸນາໃສ່ຈຳນວນທີ່ຖືກຕ້ອງ (ຢ່າງນ້ອຍ 1) ສຳລັບ ${foundEq?.name || "ອຸປະກອນ"}`;
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

      // carRepair: send true if checked, false if not checked
      formData.append("carRepair", carRepair ? "true" : "false");

      if (typeRepairId) formData.append("typeRepairId", typeRepairId);
      if (voltageId) formData.append("voltageId", voltageId);
      if (trimmedText) formData.append("commentText", trimmedText);
      if (imgFile) formData.append("commentImg", imgFile);
      if (audioFile) formData.append("commentAudio", audioFile);

      const hadExistingEquipments =
        (selectedDoc?.problemAssigns?.problemEquipments?.length || 0) > 0;
      if (checkedEquipments.length > 0 || hadExistingEquipments) {
        formData.append("problemEquipments", JSON.stringify(checkedEquipments));
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
          <div className="space-y-3.5">
            {/* Doc Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  ແຈ້ງຊ່ວຍເຫຼືອເລກທີ:{" "}
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    #{selectedDoc?.id}
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {selectedDoc?.createdAt ? moment(selectedDoc.createdAt).format("DD/MM/YYYY HH:mm") : "-"}
                </span>
              </div>
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

            {/* Type Repair & Voltage Selection */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="ປະເພດສ້ອມແປງ"
                  value={typeRepairId}
                  disabled={loadingMasterData}
                  onChange={(e) => setTypeRepairId(e.target.value)}
                  options={[
                    {
                      value: "",
                      label: loadingMasterData
                        ? "-- ກຳລັງໂຫຼດ... --"
                        : "-- ເລືອກປະເພດສ້ອມແປງ --",
                    },
                    ...typeRepairs.map((tr) => ({
                      value: String(tr.id),
                      label: tr.name,
                    })),
                  ]}
                />

                <Select
                  label="ແຮງດັນ"
                  value={voltageId}
                  disabled={loadingMasterData}
                  onChange={(e) => setVoltageId(e.target.value)}
                  options={[
                    {
                      value: "",
                      label: loadingMasterData
                        ? "-- ກຳລັງໂຫຼດ... --"
                        : "-- ເລືອກແຮງດັນ --",
                    },
                    ...voltages.map((v) => ({
                      value: String(v.id),
                      label: v.name,
                    })),
                  ]}
                />
              </div>

              {/* carRepair Checkbox Card */}
              <div
                onClick={() => setCarRepair(!carRepair)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${carRepair
                  ? "bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 shadow-xs"
                  : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/80"
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${carRepair
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-xs font-semibold block transition-colors ${carRepair
                        ? "text-blue-900 dark:text-blue-200 font-bold"
                        : "text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      ນຳໃຊ້ລົດອູ່ສ້ອມແປງ
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      {carRepair
                        ? "ເລືອກນຳໃຊ້ລົດອູ່ສ້ອມແປງໃນວຽກນີ້"
                        : "ໝາຍຕິກຫາກມີການນຳໃຊ້ລົດອູ່ສ້ອມແປງ"}
                    </span>
                  </div>
                </div>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={carRepair}
                    onChange={(e) => setCarRepair(e.target.checked)}
                  />
                </div>
              </div>
            </div>

            {/* Comment Text */}
            <Textarea
              label="ຂໍ້ຄວາມອະທິບາຍ"
              rows={2}
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
          </div>

          {/* Right Column: ອຸປະກອນສ້ອມແປງ (Repair Equipment) */}
          <div className="space-y-3 flex flex-col h-full lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-5">
            <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  ອຸປະກອນສ້ອມແປງ
                </label>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  ເລືອກແລ້ວ {checkedEquipments.length} ລາຍການ
                </span>
              </div>

              {/* Search Filter Input */}
              <div className="relative w-44 sm:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={equipmentSearch}
                  onChange={(e) => setEquipmentSearch(e.target.value)}
                  placeholder="ຄົ້ນຫາອຸປະກອນ..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Equipment Table Container */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-xs flex-1 flex flex-col">
              <div className="max-h-[460px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950/90 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 z-10">
                    <tr className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-12 text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={
                              filteredEquipments.length > 0 &&
                              filteredEquipments.every(
                                (eq) => selectedEquipments[eq.id]?.checked
                              )
                            }
                            onChange={(e) => {
                              const isCheckAll = e.target.checked;
                              setSelectedEquipments((prev) => {
                                const updated = { ...prev };
                                filteredEquipments.forEach((eq) => {
                                  updated[eq.id] = {
                                    checked: isCheckAll,
                                    amount: updated[eq.id]?.amount ?? 1,
                                    comment: updated[eq.id]?.comment ?? "",
                                  };
                                });
                                return updated;
                              });
                            }}
                          />
                        </div>
                      </th>
                      <th className="py-2.5 px-3 min-w-[140px]">
                        ຊື່ອຸປະກອນ
                      </th>
                      <th className="py-2.5 px-2 w-20 text-center">
                        ຫົວໜ່ວຍ
                      </th>
                      <th className="py-2.5 px-2 w-24 text-center">
                        ຈຳນວນ
                      </th>
                      <th className="py-2.5 px-3 min-w-[130px]">
                        ໝາຍເຫດ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {loadingMasterData ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          ກຳລັງໂຫຼດຂໍ້ມູນອຸປະກອນ...
                        </td>
                      </tr>
                    ) : filteredEquipments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          {equipmentSearch ? "ບໍ່ພົບອຸປະກອນທີ່ຄົ້ນຫາ" : "ບໍ່ມີລາຍການອຸປະກອນ"}
                        </td>
                      </tr>
                    ) : (
                      filteredEquipments.map((eq) => {
                        const state = selectedEquipments[eq.id];
                        const isChecked = Boolean(state?.checked);
                        const amount = state?.amount !== undefined ? state.amount : 1;
                        const comment = state?.comment ?? "";

                        return (
                          <tr
                            key={eq.id}
                            className={`transition-colors border-b border-slate-100 dark:border-slate-800/60 ${
                              isChecked
                                ? "bg-amber-50/60 dark:bg-amber-950/20"
                                : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  checked={isChecked}
                                  onChange={() => handleToggleEquipment(eq.id)}
                                />
                              </div>
                            </td>

                            {/* Equipment Name */}
                            <td className="py-2 px-3">
                              <span
                                onClick={() => handleToggleEquipment(eq.id)}
                                className={`font-semibold cursor-pointer select-none text-xs ${
                                  isChecked
                                    ? "text-amber-950 dark:text-amber-200"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {eq.name}
                              </span>
                            </td>

                            {/* Unit */}
                            <td className="py-2 px-2 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                {eq.unit || "-"}
                              </span>
                            </td>

                            {/* Amount Input */}
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min={1}
                                disabled={!isChecked}
                                value={isChecked ? amount : ""}
                                placeholder={isChecked ? "1" : "-"}
                                onChange={(e) =>
                                  handleAmountChange(eq.id, e.target.value)
                                }
                                className={`w-full text-center py-1 px-1.5 rounded-lg text-xs font-semibold transition-all outline-none ${
                                  isChecked
                                    ? "bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                                    : "bg-slate-100/60 dark:bg-slate-900/50 border border-transparent text-slate-400 cursor-not-allowed select-none"
                                }`}
                              />
                            </td>

                            {/* Comment Input */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                disabled={!isChecked}
                                value={isChecked ? comment : ""}
                                placeholder={isChecked ? "ໃສ່ໝາຍເຫດ..." : "-"}
                                onChange={(e) =>
                                  handleCommentChange(eq.id, e.target.value)
                                }
                                className={`w-full py-1 px-2.5 rounded-lg text-xs transition-all outline-none ${
                                  isChecked
                                    ? "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500"
                                    : "bg-slate-100/60 dark:bg-slate-900/50 border border-transparent text-slate-400 cursor-not-allowed select-none"
                                }`}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & Buttons */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose} disabled={saving} className="flex-1">
              ຍົກເລີກ
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={saving}
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
