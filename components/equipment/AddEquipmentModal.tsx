/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Button } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { createEquipmentSchema } from "@/schemas/equipment";
import { toast } from "react-toastify";

interface AddEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function AddEquipmentModal({
  open,
  onClose,
  onRefresh,
}: AddEquipmentModalProps) {
  const [typeEquipmentId, setTypeEquipmentId] = useState<string>("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingTypeEquipments, setLoadingTypeEquipments] = useState(false);
  const [typeEquipments, setTypeEquipments] = useState<{ id: number; name: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setTypeEquipmentId("");
      setName("");
      setErrors({});

      const fetchTypeEquipments = async () => {
        try {
          setLoadingTypeEquipments(true);
          const res = await axiosInstance.get("/typeequipments/selecttypeequipment");
          setTypeEquipments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Failed to load type equipments:", err);
          toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໝວດໝູ່ອຸປະກອນໄດ້");
        } finally {
          setLoadingTypeEquipments(false);
        }
      };

      fetchTypeEquipments();
    }
  }, [open]);

  const handleSubmit = async () => {
    const result = createEquipmentSchema.safeParse({
      typeEquipmentId: typeEquipmentId ? Number(typeEquipmentId) : 0,
      name,
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
      await axiosInstance.post("/equipments", {
        typeEquipmentId: Number(typeEquipmentId),
        name: name.trim(),
      });

      toast.success("ເພີ່ມຂໍ້ມູນອຸປະກອນສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to add equipment:", err);
      const errMsg =
        err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const typeEquipmentOptions = [
    {
      value: "",
      label: loadingTypeEquipments
        ? "ກຳລັງໂຫຼດໝວດໝູ່ອຸປະກອນ..."
        : "-- ເລືອກໝວດໝູ່ອຸປະກອນ --",
    },
    ...typeEquipments.map((t) => ({
      value: String(t.id),
      label: t.name,
    })),
  ];

  return (
    <Modal open={open} onClose={onClose} title="ເພີ່ມຂໍ້ມູນອຸປະກອນ" size="md">
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
            label="ໝວດໝູ່ອຸປະກອນ *"
            options={typeEquipmentOptions}
            value={typeEquipmentId}
            onChange={(e) => setTypeEquipmentId(e.target.value)}
            error={errors.typeEquipmentId}
            disabled={loadingTypeEquipments}
          />

          <Input
            label="ຊື່ອຸປະກອນ *"
            placeholder="ປ້ອນຊື່ອຸປະກອນ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
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
