"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button, Select } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { ProblemDoc } from "@/schemas/problemdoc";

interface AssignProblemdocModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: ProblemDoc | null;
  onRefresh: () => void;
}

export function AssignProblemdocModal({ open, onClose, selectedDoc, onRefresh }: AssignProblemdocModalProps) {
  const [branchId, setBranchId] = useState("");
  const [repairDistrictId, setRepairDistrictId] = useState("");

  const [branches, setBranches] = useState<{ id: number; name: string; code: string }[]>([]);
  const [repairDistricts, setRepairDistricts] = useState<{ id: number; name: string; code: string }[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load initial branch dropdown on open
  useEffect(() => {
    if (open) {
      setError("");

      if (selectedDoc) {
        setBranchId(selectedDoc.branchId ? String(selectedDoc.branchId) : "");
        setRepairDistrictId(selectedDoc.repairDistrictId ? String(selectedDoc.repairDistrictId) : "");
      } else {
        setBranchId("");
        setRepairDistrictId("");
      }

      const fetchBranches = async () => {
        try {
          const res = await axiosInstance.get("/branchs/selectbranch");
          setBranches(res.data || []);
        } catch (err) {
          console.error("Failed to load branches for assign modal:", err);
        }
      };
      fetchBranches();
    }
  }, [open, selectedDoc]);

  // Load repair districts when branchId changes
  useEffect(() => {
    if (!open) return;
    if (!branchId) {
      setRepairDistricts([]);
      setRepairDistrictId("");
      return;
    }

    const fetchRepairDistricts = async () => {
      try {
        const res = await axiosInstance.get(`/repairdistricts/selectrepairdistrict?branchId=${branchId}`);
        setRepairDistricts(res.data || []);
      } catch (err) {
        console.error("Failed to load repair districts:", err);
        setRepairDistricts([]);
      }
    };

    fetchRepairDistricts();
  }, [open, branchId]);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setBranchId(val);
    setRepairDistrictId(""); // reset repair district when branch changes
  };

  const handleAssign = async () => {
    if (!selectedDoc) return;

    if (!branchId) {
      setError("ກະລຸນາເລືອກສາຂາແຂວງ");
      return;
    }

    if (!repairDistrictId) {
      setError("ກະລຸນາເລືອກສູນສ້ອມແປງເມືອງ");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isAlreadyAssigned = Boolean(selectedDoc.branchId || selectedDoc.repairDistrictId || selectedDoc.problemstatusId === 2);

      if (isAlreadyAssigned) {
        await axiosInstance.put(`/problemdocs/updateassign/${selectedDoc.id}`, {
          branchId: Number(branchId),
          repairDistrictId: Number(repairDistrictId),
        });
      } else {
        await axiosInstance.post("/problemdocs/assign", {
          problemId: Number(selectedDoc.id),
          problemstatusId: 2,
          branchId: Number(branchId),
          repairDistrictId: Number(repairDistrictId),
        });
      }

      toast.success("ມອບໝາຍງານສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to assign problem doc:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການມອບໝາຍງານ";
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
      title="ມອບໝາຍງານ"
      size="md"
    >
      <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {error && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        {/* Selected Doc Summary Info */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            ແຈ້ງຊ່ວຍເຫຼືອເລກທີ: <span className="font-mono text-blue-600 dark:text-blue-400">#{selectedDoc?.id}</span>
          </p>
          <p>ຜູ້ແຈ້ງ: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDoc?.fullName || "-"}</span> ({selectedDoc?.tel || "-"})</p>
          <p>ປະເພດບັນຫາ: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDoc?.problemtype?.name || "-"}</span></p>
          <p>ທີ່ຢູ່: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDoc?.village?.village_name || "-"}, {selectedDoc?.district?.district_name || "-"}, {selectedDoc?.province?.province_name || "-"}</span></p>
        </div>

        {/* Branch Selection */}
        <Select
          label="ສາຂາແຂວງ *"
          value={branchId}
          onChange={handleBranchChange}
          options={[
            { value: "", label: "-- ເລືອກສາຂາແຂວງ --" },
            ...branches.map((b) => ({ value: String(b.id), label: `${b.name}` })),
          ]}
        />

        {/* Repair District Selection */}
        <Select
          label="ສູນສ້ອມແປງເມືອງ *"
          value={repairDistrictId}
          disabled={!branchId}
          onChange={(e) => setRepairDistrictId(e.target.value)}
          options={[
            { value: "", label: branchId ? "-- ເລືອກສູນສ້ອມແປງ --" : "-- ກະລຸນາເລືອກສາຂາແຂວງກ່ອນ --" },
            ...repairDistricts.map((rd) => ({ value: String(rd.id), label: `${rd.name}` })),
          ]}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button variant="primary" onClick={handleAssign} loading={saving} className="flex-1">
            ຢືນຢັນການມອບໝາຍ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
