import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Select, Button } from "@/components/ui/FormElements";
import { User, emptyForm } from "./UserManagement";
import { axiosInstance } from "@/lib/axiosInstance";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: (form: typeof emptyForm) => Promise<void>;
  selectedUser: User | null;
}

export function EditUserModal({ open, onClose, onEdit, selectedUser }: EditUserModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [districts, setDistricts] = useState<{ id: number; district_name: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Dynamic dropdown lists fetched internally
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [provinces, setProvinces] = useState<{ id: number; province_name: string; province_code: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (open) {
      const fetchMetadata = async () => {
        try {
          const [rolesRes, provincesRes, meRes] = await Promise.all([
            axiosInstance.get("/roles/selectrole"),
            axiosInstance.get("/provinces/selectprovince"),
            axiosInstance.get("/auth/me")
          ]);
          setRoles(rolesRes.data || []);
          setProvinces(provincesRes.data || []);
          setCurrentUser(meRes.data || null);
        } catch (err) {
          console.error("Failed to fetch metadata in EditUserModal:", err);
        }
      };
      fetchMetadata();
    }
  }, [open]);

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevSelectedUser, setPrevSelectedUser] = useState(selectedUser);

  if (open !== prevOpen || selectedUser !== prevSelectedUser) {
    setPrevOpen(open);
    setPrevSelectedUser(selectedUser);
    if (open && selectedUser) {
      setForm({
        username: selectedUser.raw?.username || "",
        roleId: selectedUser.raw?.roleId || 0,
        provinceId: currentUser?.roleId === 4 ? currentUser.provinceId : (currentUser?.roleId === 2 ? undefined : (selectedUser.raw?.provinceId || undefined)),
        districtId: currentUser?.roleId === 2 ? undefined : (selectedUser.raw?.districtId || undefined),
      });
      setSaving(false);
      setErrors({});
      setDistricts([]);
    }
  }

  // Handle auto province assignment based on logged-in user's roleId
  useEffect(() => {
    if (currentUser?.roleId === 4 && currentUser?.provinceId) {
      setForm((f) => ({
        ...f,
        provinceId: currentUser.provinceId,
      }));
    } else if (currentUser?.roleId === 2) {
      setForm((f) => ({
        ...f,
        provinceId: undefined,
        districtId: undefined,
      }));
    }
  }, [currentUser]);

  // Fetch districts when selected province changes
  useEffect(() => {
    const activeProvinceId = currentUser?.roleId === 4 ? currentUser?.provinceId : form.provinceId;

    if (!activeProvinceId) {
      setDistricts([]);
      setForm((f) => ({ ...f, districtId: undefined }));
      return;
    }

    const fetchDistrictsForProvince = async () => {
      try {
        setLoadingDistricts(true);
        // 1. Fetch province details by ID to get the province_code
        const provinceRes = await axiosInstance.get(`/provinces/${activeProvinceId}`);
        const provinceCode = provinceRes.data?.province_code;
        
        if (!provinceCode) {
          setDistricts([]);
          return;
        }

        // 2. Fetch districts by provinceCode
        const districtsRes = await axiosInstance.get(`/districts/selectdistrict?provinceCode=${provinceCode}`);
        setDistricts(districtsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch districts:", err);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistrictsForProvince();
  }, [form.provinceId, currentUser]);

  const handleEdit = async () => {
    if (!selectedUser) return;

    const fieldErrors: Record<string, string> = {};
    if (!form.roleId) {
      fieldErrors.roleId = "Role is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await onEdit(form);
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to update user";
      setErrors({ apiError: errMsg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ແກ້ໄຂຜູ້ໃຊ້ງານ">
      <div className="space-y-4 text-sm" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {errors.apiError && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {errors.apiError}
          </div>
        )}

        {/* Read-only Employee Info Card */}
        {selectedUser && (
          <div className="flex items-start gap-4 p-4 rounded-2xl border" style={{ background: "rgb(var(--bg))", borderColor: "rgb(var(--border))" }}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
              style={{ background: selectedUser.empimg ? "transparent" : `rgb(${selectedUser.avatarColor})` }}
            >
              {selectedUser.empimg ? (
                <img src={selectedUser.empimg} alt="profile" className="w-full h-full object-cover object-top" />
              ) : (
                selectedUser.avatar
              )}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="font-semibold truncate text-slate-800 dark:text-slate-200">
                {selectedUser.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                <div>ລະຫັດພະນັກງານ: <span className="font-medium text-slate-700 dark:text-slate-350">{selectedUser.empCode}</span></div>
                <div>ເບີໂທ: <span className="font-medium text-slate-700 dark:text-slate-350">{selectedUser.tel || "-"}</span></div>
                {selectedUser.department && (
                  <div>ຝ່າຍ: <span className="font-medium text-slate-700 dark:text-slate-350">{selectedUser.department}</span></div>
                )}
                {selectedUser.division && (
                  <div>ພະແນກ: <span className="font-medium text-slate-700 dark:text-slate-350">{selectedUser.division}</span></div>
                )}
                {selectedUser.position && (
                  <div>ຕຳແໜ່ງ: <span className="font-medium text-slate-700 dark:text-slate-350">{selectedUser.position}</span></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <Select
          label="ສິດຜູ້ໃຊ້ *"
          value={form.roleId.toString()}
          onChange={(e) => {
            setForm((f) => ({ ...f, roleId: Number(e.target.value) }));
            if (errors.roleId) setErrors((prev) => ({ ...prev, roleId: "" }));
          }}
          options={[
            { value: "0", label: "ເລືອກສິດຜູ້ໃຊ້" },
            ...roles.map((r) => ({ value: r.id.toString(), label: r.name })),
          ]}
          error={errors.roleId}
        />

        {/* Dynamic Province & District selection visibility based on logged-in user's role */}
        {currentUser?.roleId === 4 && (
          <div>
            <Select
              label="ເມືອງ"
              value={form.districtId?.toString() || ""}
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({ ...f, districtId: val ? Number(val) : undefined }));
              }}
              disabled={loadingDistricts}
              options={[
                { value: "", label: loadingDistricts ? "ກຳລັງໂຫຼດ..." : "ເລືອກເມືອງ (ທັງໝົດ)" },
                ...districts.map((d) => ({ value: d.id.toString(), label: d.district_name })),
              ]}
            />
          </div>
        )}

        {currentUser?.roleId === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="ແຂວງ"
              value={form.provinceId?.toString() || ""}
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({
                  ...f,
                  provinceId: val ? Number(val) : undefined,
                  districtId: undefined,
                }));
              }}
              options={[
                { value: "", label: "ເລືອກແຂວງ (ທັງໝົດ)" },
                ...provinces.map((p) => ({ value: p.id.toString(), label: p.province_name })),
              ]}
            />
            <Select
              label="ເມືອງ"
              value={form.districtId?.toString() || ""}
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({ ...f, districtId: val ? Number(val) : undefined }));
              }}
              disabled={!form.provinceId || loadingDistricts}
              options={[
                { value: "", label: loadingDistricts ? "ກຳລັງໂຫຼດ..." : "ເລືອກເມືອງ (ທັງໝົດ)" },
                ...districts.map((d) => ({ value: d.id.toString(), label: d.district_name })),
              ]}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button
            variant="primary"
            onClick={handleEdit}
            loading={saving}
            className="flex-1"
          >
            ອັບເດດ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
