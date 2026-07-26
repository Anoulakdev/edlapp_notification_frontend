/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Button } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { createRepairDistrictSchema } from "@/schemas/repairdistrict";
import { toast } from "react-toastify";

interface AddRepairDistrictModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function AddRepairDistrictModal({
  open,
  onClose,
  onRefresh,
}: AddRepairDistrictModalProps) {
  const [branchId, setBranchId] = useState<string>("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setBranchId("");
      setName("");
      setCode("");
      setErrors({});

      const fetchBranches = async () => {
        try {
          setLoadingBranches(true);
          const res = await axiosInstance.get("/branchs/selectbranch");
          setBranches(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Failed to load branches:", err);
          toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສາຂາແຂວງໄດ້");
        } finally {
          setLoadingBranches(false);
        }
      };

      fetchBranches();
    }
  }, [open]);

  const handleSubmit = async () => {
    const result = createRepairDistrictSchema.safeParse({
      branchId: branchId ? Number(branchId) : 0,
      name,
      code: code ? code.trim() : undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await axiosInstance.post("/repairdistricts", {
        branchId: Number(branchId),
        name: name.trim(),
        code: code ? code.trim() : undefined,
      });

      toast.success("ເພີ່ມຂໍ້ມູນສູນສ້ອມແປງເມືອງສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to add repair district:", err);
      const errMsg =
        err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const branchOptions = [
    { value: "", label: loadingBranches ? "ກຳລັງໂຫຼດສາຂາ..." : "-- ເລືອກສາຂາແຂວງ --" },
    ...branches.map((b) => ({
      value: String(b.id),
      label: b.name,
    })),
  ];

  return (
    <Modal open={open} onClose={onClose} title="ເພີ່ມຂໍ້ມູນສູນສ້ອມແປງເມືອງ" size="md">
      <div
        className="space-y-4"
        style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
      >
        {errors.apiError && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {errors.apiError}
          </div>
        )}

        <div className="space-y-4">
          <Select
            label="ສາຂາແຂວງ *"
            options={branchOptions}
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            error={errors.branchId}
            disabled={loadingBranches}
          />

          <Input
            label="ຊື່ສູນສ້ອມແປງເມືອງ *"
            placeholder="ປ້ອນຊື່ສູນສ້ອມແປງເມືອງ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <Input
            label="ລະຫັດ"
            placeholder="ປ້ອນລະຫັດ (ຖ້າມີ)..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={errors.code}
          />
        </div>

        <div className="flex gap-3 pt-3 border-t border-theme">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={saving}
            className="flex-1"
          >
            ບັນທຶກ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
