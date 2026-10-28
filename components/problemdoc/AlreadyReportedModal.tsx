"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, Select } from "@/components/ui/FormElements";
import {
  MapPinCheckInside,
  MapPin,
  Phone,
  AlertCircle,
  Navigation,
  Clock,
  Link2,
} from "lucide-react";
import { ProblemDoc } from "@/schemas/problemdoc";
import { axiosInstance } from "@/lib/axiosInstance";
import moment from "moment";

interface AlreadyReportedModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (parentProblemId?: number) => Promise<void>;
  selectedDoc: ProblemDoc | null;
}

export function AlreadyReportedModal({
  open,
  onClose,
  onConfirm,
  selectedDoc,
}: AlreadyReportedModalProps) {
  const [parentProblemId, setParentProblemId] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load parent problem candidates when modal opens
  useEffect(() => {
    if (!open) {
      setParentProblemId("");
      setError("");
      setCandidates([]);
      return;
    }

    const nearbyList: any[] = (selectedDoc as any)?.nearbyProblems || [];

    const loadCandidates = async () => {
      setLoading(true);
      try {
        // Fetch active documents with problemstatusId = 2 (assigned) and 3 (in-progress)
        const [resStatus2, resStatus3] = await Promise.allSettled([
          axiosInstance.get("/problemdocs", {
            params: { problemstatusId: 2, parentProblemId: 0, page: 1, limit: 100 },
          }),
          axiosInstance.get("/problemdocs", {
            params: { problemstatusId: 3, parentProblemId: 0, page: 1, limit: 100 },
          }),
        ]);

        const docs2: any[] =
          resStatus2.status === "fulfilled"
            ? resStatus2.value.data?.data || (Array.isArray(resStatus2.value.data) ? resStatus2.value.data : [])
            : [];
        const docs3: any[] =
          resStatus3.status === "fulfilled"
            ? resStatus3.value.data?.data || (Array.isArray(resStatus3.value.data) ? resStatus3.value.data : [])
            : [];

        const allDocs = [...docs2, ...docs3];

        const candidateMap = new Map<number, any>();

        // 1. Nearby items with status 2 or 3 first
        nearbyList
          .filter(
            (n) =>
              n.id !== selectedDoc?.id &&
              !n.parentProblemId &&
              (n.problemstatusId === 2 || n.problemstatusId === 3)
          )
          .forEach((n) => {
            candidateMap.set(n.id, {
              ...n,
              isNearby: true,
            });
          });

        // 2. Add other items with status 2 or 3 (exclude current)
        allDocs
          .filter(
            (d: any) =>
              d.id !== selectedDoc?.id &&
              !d.parentProblemId &&
              (d.problemstatusId === 2 || d.problemstatusId === 3)
          )
          .forEach((d) => {
            if (!candidateMap.has(d.id)) {
              candidateMap.set(d.id, {
                ...d,
                isNearby: false,
              });
            }
          });

        const list = Array.from(candidateMap.values());
        setCandidates(list);

        const validNearby = list.filter((c) => c.isNearby);

        // Auto-select: existing parentProblemId or the first nearby item with status 2 or 3
        if (selectedDoc?.parentProblemId) {
          setParentProblemId(String(selectedDoc.parentProblemId));
        } else if (validNearby.length > 0) {
          setParentProblemId(String(validNearby[0].id));
        }
      } catch (err) {
        console.error("Failed to load parent candidates:", err);
        const validNearby = nearbyList
          .filter(
            (n) =>
              n.id !== selectedDoc?.id &&
              (n.problemstatusId === 2 || n.problemstatusId === 3)
          )
          .map((n) => ({ ...n, isNearby: true }));
        setCandidates(validNearby);
        if (validNearby.length > 0) {
          setParentProblemId(String(validNearby[0].id));
        }
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [open, selectedDoc]);

  // Formatted dropdown options
  const selectOptions = useMemo(() => {
    if (loading) {
      return [{ value: "", label: "-- ກຳລັງໂຫຼດລາຍການຈຸດແຈ້ງບັນຫາຫຼັກ... --" }];
    }
    if (candidates.length === 0) {
      return [{ value: "", label: "-- ບໍ່ພົບຈຸດແຈ້ງບັນຫາຫຼັກ --" }];
    }

    const options: { value: string; label: string }[] = [
      { value: "", label: "-- ກະລຸນາເລືອກຈຸດແຈ້ງບັນຫາຫຼັກ --" },
    ];

    const nearby = candidates.filter((c) => c.isNearby);
    const others = candidates.filter((c) => !c.isNearby);

    const getStatusBadgeText = (c: any) => {
      if (c.problemstatus?.callcenter) return ` [${c.problemstatus.callcenter}]`;
      if (c.problemstatusId === 2) return " [ມອບໝາຍແລ້ວ]";
      if (c.problemstatusId === 3) return " [ກຳລັງສ້ອມແປງ]";
      return "";
    };

    if (nearby.length > 0) {
      nearby.forEach((c) => {
        const dist = c.distance !== undefined ? `[ໃກ້ຄຽງ ~${c.distance}m] ` : "[ໃກ້ຄຽງ] ";
        const pType = c.problemtype?.name ? ` (${c.problemtype.name})` : "";
        const vill = c.village?.village_name ? ` - ບ້ານ ${c.village.village_name}` : "";
        const statusTxt = getStatusBadgeText(c);
        options.push({
          value: String(c.id),
          label: `${dist}#${c.id} ${c.fullName || "ບໍ່ລະບຸຊື່"}${pType}${vill}${statusTxt}`,
        });
      });
    }

    if (others.length > 0) {
      others.forEach((c) => {
        const pType = c.problemtype?.name ? ` (${c.problemtype.name})` : "";
        const vill = c.village?.village_name ? ` - ບ້ານ ${c.village.village_name}` : "";
        const statusTxt = getStatusBadgeText(c);
        options.push({
          value: String(c.id),
          label: `#${c.id} ${c.fullName || "ບໍ່ລະບຸຊື່"}${pType}${vill}${statusTxt}`,
        });
      });
    }

    return options;
  }, [candidates, loading]);

  const selectedParent = useMemo(
    () => candidates.find((c) => String(c.id) === String(parentProblemId)),
    [candidates, parentProblemId]
  );

  const handleConfirm = async () => {
    if (!parentProblemId) {
      setError("ກະລຸນາເລືອກຈຸດແຈ້ງບັນຫາຫຼັກ");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onConfirm(Number(parentProblemId));
      onClose();
    } catch (err) {
      console.error("Failed to mark problem doc as already reported:", err);
    } finally {
      setSaving(false);
    }
  };

  const locationText = [
    selectedDoc?.village?.village_name,
    selectedDoc?.district?.district_name,
    selectedDoc?.province?.province_name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Modal open={open} onClose={onClose} title="ຢືນຢັນ: ຈຸດນີ້ໄດ້ຖືກແຈ້ງແລ້ວ" size="md">
      <div className="space-y-4 text-xs" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {/* Error Alert */}
        {error && (
          <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Document Summary Card */}
        <div
          className="p-3.5 rounded-2xl relative overflow-hidden transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)",
            border: "1px solid rgba(147, 51, 234, 0.2)",
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-600 text-white shadow-sm shadow-purple-600/30">
                <MapPinCheckInside className="w-3.5 h-3.5" />
                ລາຍການທີ່ຈະຜູກ (ຊໍ້າຊ້ອນ)
              </span>
              <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                #{selectedDoc?.id}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {selectedDoc?.createdAt ? moment(selectedDoc.createdAt).format("DD/MM/YYYY HH:mm") : "-"}
            </span>
          </div>

          <div className="pt-2.5 flex flex-col gap-1">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{selectedDoc?.fullName || "-"}</span>
              {selectedDoc?.problemtype?.name && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                  {selectedDoc.problemtype.name}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 mt-1">
              {selectedDoc?.tel && (
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-purple-500" />
                  {selectedDoc.tel}
                </span>
              )}
              {locationText && (
                <span className="flex items-center gap-1 truncate max-w-xs">
                  <MapPin className="w-3 h-3 text-purple-500 shrink-0" />
                  <span className="truncate">{locationText}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Select Dropdown */}
        <div className="space-y-1">
          <Select
            label="ເລືອກຈຸດແຈ້ງບັນຫາຫຼັກທີ່ກົງກັນ *"
            value={parentProblemId}
            disabled={loading}
            onChange={(e) => {
              setParentProblemId(e.target.value);
              if (e.target.value) setError("");
            }}
            options={selectOptions}
          />
        </div>

        {/* Selected Parent Preview Card */}
        {selectedParent && (
          <div
            className="p-3.5 rounded-xl border transition-all animate-fade-in space-y-2"
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(147, 51, 234, 0.04) 100%)",
              borderColor: "rgba(99, 102, 241, 0.25)",
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-indigo-500/10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                  ຈຸດຫຼັກ
                </span>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                  #{selectedParent.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${selectedParent.problemstatusId === 2
                    ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                    }`}
                >
                  {selectedParent.problemstatus?.callcenter ||
                    (selectedParent.problemstatusId === 2 ? "ມອບໝາຍແລ້ວ" : "ກຳລັງສ້ອມແປງ")}
                </span>
              </div>
              {selectedParent.distance !== undefined && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  <Navigation className="w-3 h-3" />
                  ຫ່າງກັນ ~{selectedParent.distance} ແມັດ
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  {selectedParent.fullName || "-"}
                </span>
                {selectedParent.problemtype?.name && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold">
                    {selectedParent.problemtype.name}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedParent.tel && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-indigo-500" />
                    {selectedParent.tel}
                  </span>
                )}
                {selectedParent.village?.village_name && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-500" />
                    ບ້ານ {selectedParent.village.village_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving} className="flex-1">
            ຍົກເລີກ
          </Button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || !parentProblemId}
            className="flex-1 inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-purple-500/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>ກຳລັງບັນທຶກ...</span>
              </>
            ) : (
              <>
                <MapPinCheckInside className="w-4 h-4" />
                <span>ຢືນຢັນການຜູກຈຸດແຈ້ງແລ້ວ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
