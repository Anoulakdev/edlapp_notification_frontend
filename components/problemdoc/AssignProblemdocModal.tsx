"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, Select } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { ProblemDoc } from "@/schemas/problemdoc";
import {
  MapPin,
  Phone,
  Clock,
  AlertCircle,
  FileText,
  Send,
} from "lucide-react";
import moment from "moment";

interface AssignProblemdocModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: ProblemDoc | null;
  onRefresh: () => void;
}

interface RepairDistrictItem {
  id: number;
  name: string;
  code?: string;
  branch?: {
    id: number;
    name: string;
  };
}

export function AssignProblemdocModal({
  open,
  onClose,
  selectedDoc,
  onRefresh,
}: AssignProblemdocModalProps) {
  const [repairDistrictId, setRepairDistrictId] = useState("");
  const [repairDistricts, setRepairDistricts] = useState<RepairDistrictItem[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAlreadyAssigned = useMemo(() => {
    return Boolean(
      selectedDoc?.branchId ||
      selectedDoc?.repairDistrictId ||
      selectedDoc?.problemstatusId === 2
    );
  }, [selectedDoc]);

  // Load repair districts when modal opens
  useEffect(() => {
    if (!open) {
      setRepairDistrictId("");
      setError("");
      return;
    }

    setError("");
    const initialRepairDistrictId = selectedDoc?.repairDistrictId
      ? String(selectedDoc.repairDistrictId)
      : "";
    setRepairDistrictId(initialRepairDistrictId);

    const fetchRepairDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await axiosInstance.get("/repairdistricts/selectrepairdistrict");
        setRepairDistricts(res.data || []);
      } catch (err) {
        console.error("Failed to load repair districts:", err);
        setRepairDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchRepairDistricts();
  }, [open, selectedDoc]);

  const selectedRd = useMemo(
    () => repairDistricts.find((rd) => String(rd.id) === String(repairDistrictId)),
    [repairDistricts, repairDistrictId]
  );

  const locationText = [
    selectedDoc?.village?.village_name ? `ບ້ານ ${selectedDoc.village.village_name}` : "",
    selectedDoc?.district?.district_name ? `ເມືອງ ${selectedDoc.district.district_name}` : "",
    selectedDoc?.province?.province_name ? `ແຂວງ ${selectedDoc.province.province_name}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const handleAssign = async () => {
    if (!selectedDoc) return;

    if (!repairDistrictId) {
      setError("ກະລຸນາເລືອກສູນສ້ອມແປງເມືອງ");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const branchIdToSave =
        selectedRd?.branch?.id || selectedDoc.branchId || undefined;

      if (isAlreadyAssigned) {
        await axiosInstance.put(`/problemdocs/updateassign/${selectedDoc.id}`, {
          branchId: branchIdToSave ? Number(branchIdToSave) : undefined,
          repairDistrictId: Number(repairDistrictId),
        });
      } else {
        await axiosInstance.post("/problemdocs/assign", {
          problemId: Number(selectedDoc.id),
          problemstatusId: 2,
          branchId: branchIdToSave ? Number(branchIdToSave) : undefined,
          repairDistrictId: Number(repairDistrictId),
        });
      }

      toast.success(isAlreadyAssigned ? "ປັບປ່ຽນການມອບໝາຍງານສຳເລັດ" : "ມອບໝາຍງານສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to assign problem doc:", err);
      const errMsg =
        err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການມອບໝາຍງານ";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAlreadyAssigned ? "ປັບປ່ຽນການມອບໝາຍງານ" : "ມອບໝາຍງານສ້ອມແປງ"}
      size="md"
    >
      <div className="space-y-4 text-xs" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {/* Error Alert */}
        {error && (
          <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Selected Doc Summary Card */}
        <div
          className="p-3.5 rounded-2xl relative overflow-hidden transition-all"
          style={{
            background:
              "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          {/* Card Top: Tag + Doc ID + Time */}
          <div className="flex items-center justify-between pb-2 border-b border-blue-500/10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-sm shadow-blue-600/30">
                <FileText className="w-3.5 h-3.5" />
                ເອກະສານແຈ້ງບັນຫາ
              </span>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                #{selectedDoc?.id}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {selectedDoc?.createdAt
                ? moment(selectedDoc.createdAt).format("DD/MM/YYYY HH:mm")
                : "-"}
            </span>
          </div>

          {/* Card Body: Name, Type, Phone, Location */}
          <div className="pt-2.5 flex flex-col gap-1.5">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{selectedDoc?.fullName || "ບໍ່ລະບຸຊື່"}</span>
              {selectedDoc?.problemtype?.name && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  {selectedDoc.problemtype.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
              {selectedDoc?.tel && (
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-blue-500" />
                  {selectedDoc.tel}
                </span>
              )}
              {locationText && (
                <span className="flex items-center gap-1 truncate max-w-xs">
                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="truncate">{locationText}</span>
                </span>
              )}
            </div>

            {selectedDoc?.description && (
              <div className="mt-1 p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-350 line-clamp-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  ລາຍລະອຽດ:{" "}
                </span>
                {selectedDoc.description}
              </div>
            )}

            {/* Current assignment if already set */}
            {selectedDoc?.repairDistrict?.name && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                <span className="font-medium">ສູນສ້ອມແປງປັດຈຸບັນ:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 font-semibold">
                  {selectedDoc.repairDistrict.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Repair District Selection Dropdown */}
        <div className="space-y-1">
          <Select
            label="ເລືອກສູນສ້ອມແປງເມືອງ *"
            value={repairDistrictId}
            disabled={loadingDistricts}
            onChange={(e) => {
              setRepairDistrictId(e.target.value);
              if (e.target.value) setError("");
            }}
            options={[
              {
                value: "",
                label: loadingDistricts
                  ? "-- ກຳລັງໂຫຼດລາຍການສູນສ້ອມແປງ... --"
                  : repairDistricts.length === 0
                    ? "-- ບໍ່ມີຂໍ້ມູນສູນສ້ອມແປງ --"
                    : "-- ກະລຸນາເລືອກສູນສ້ອມແປງເມືອງ --",
              },
              ...repairDistricts.map((rd) => ({
                value: String(rd.id),
                label: rd.branch?.name
                  ? `${rd.name}`
                  : rd.name,
              })),
            ]}
          />
        </div>


        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            ຍົກເລີກ
          </Button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={saving || !repairDistrictId}
            className="flex-1 inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {saving ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                <span>ກຳລັງມອບໝາຍ...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {isAlreadyAssigned
                    ? "ບັນທຶກການມອບໝາຍ"
                    : "ຢືນຢັນການມອບໝາຍງານ"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
