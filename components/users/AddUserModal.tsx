import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Button } from "@/components/ui/FormElements";
import { User, emptyForm } from "./UserManagement";
import { axiosInstance } from "@/lib/axiosInstance";
import { createUserSchema } from "@/schemas/user";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (form: typeof emptyForm) => Promise<void>;
}

export function AddUserModal({ open, onClose, onAdd }: AddUserModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [districts, setDistricts] = useState<{ id: number; district_name: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [repairDistricts, setRepairDistricts] = useState<{ id: number; name: string }[]>([]);
  const [loadingRepairDistricts, setLoadingRepairDistricts] = useState(false);

  // Dynamic dropdown lists fetched internally
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [provinces, setProvinces] = useState<{ id: number; province_name: string; province_code: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // External lookup states
  const [searching, setSearching] = useState(false);
  const [externalEmployee, setExternalEmployee] = useState<any | null>(null);

  const trimmedUsername = form.username.trim();

  useEffect(() => {
    if (open) {
      const fetchMetadata = async () => {
        try {
          const [rolesRes, provincesRes, branchesRes, meRes] = await Promise.all([
            axiosInstance.get("/roles/selectrole"),
            axiosInstance.get("/provinces/selectprovince"),
            axiosInstance.get("/branchs/selectbranch"),
            axiosInstance.get("/auth/me")
          ]);
          setRoles(rolesRes.data || []);
          setProvinces(provincesRes.data || []);
          setBranches(branchesRes.data || []);
          setCurrentUser(meRes.data || null);
        } catch (err) {
          console.error("Failed to fetch metadata in AddUserModal:", err);
        }
      };
      fetchMetadata();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (!trimmedUsername) {
      setExternalEmployee(null);
      setSearching(false);
      return;
    }

    // Optimization: If we already have the matching employee loaded, do not search again
    if (externalEmployee && externalEmployee.emp_code === trimmedUsername) {
      setSearching(false);
      return;
    }

    setSearching(true);
    let active = true;

    const delayDebounceFn = setTimeout(() => {
      const fetchExternalEmployee = async () => {
        try {
          const response = await fetch(`/api/employees?search=${trimmedUsername}`);
          if (response.ok) {
            const data = await response.json();
            if (!active) return;

            const matched = data?.find((emp: any) => emp.emp_code === trimmedUsername);
            setExternalEmployee(matched || null);
          } else {
            if (active) setExternalEmployee(null);
          }
        } catch (err) {
          console.error("Failed to fetch external employee details:", err);
          if (active) setExternalEmployee(null);
        } finally {
          if (active) setSearching(false);
        }
      };
      fetchExternalEmployee();
    }, 500);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [trimmedUsername, open, externalEmployee]);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm({
        ...emptyForm,
      });
      setSaving(false);
      setErrors({});
      setDistricts([]);
      setRepairDistricts([]);
      setExternalEmployee(null);
      setSearching(false);
    }
  }

  // Fetch districts when selected province changes
  useEffect(() => {
    const activeProvinceId = form.provinceId;

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
  }, [form.provinceId]);

  // Fetch repair districts when selected branch changes
  useEffect(() => {
    const activeBranchId = form.branchId;

    const fetchRepairDistrictsForBranch = async () => {
      try {
        setLoadingRepairDistricts(true);
        const repairRes = await axiosInstance.get("/repairdistricts/selectrepairdistrict", {
          params: activeBranchId ? { branchId: activeBranchId } : undefined,
        });
        setRepairDistricts(repairRes.data || []);
      } catch (err) {
        console.error("Failed to fetch repair districts:", err);
        setRepairDistricts([]);
      } finally {
        setLoadingRepairDistricts(false);
      }
    };

    fetchRepairDistrictsForBranch();
  }, [form.branchId]);

  const handleAdd = async () => {
    const result = createUserSchema.safeParse({
      username: form.username,
      roleId: form.roleId,
      provinceId: form.provinceId,
      districtId: form.districtId,
      branchId: form.branchId,
      repairDistrictId: form.repairDistrictId,
      searching,
      externalEmployee,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await onAdd(form);
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to add user";
      setErrors({ apiError: errMsg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ເພີ່ມຜູ້ໃຊ້ງານ">
      <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {errors.apiError && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {errors.apiError}
          </div>
        )}
        <Input
          label="ລະຫັດພະນັກງານ *"
          placeholder="ຕົວຢ່າງ: 00000"
          value={form.username}
          onChange={(e) => {
            setForm((f) => ({ ...f, username: e.target.value }));
            if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
          }}
          error={errors.username}
        />

        {/* External Employee Info Card */}
        {searching && (
          <div className="flex items-center justify-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin mr-2" />
            <span className="text-xs text-slate-500">ກຳລັງຄົ້ນຫາຂໍ້ມູນຈາກລະບົບ HRM...</span>
          </div>
        )}

        {!searching && externalEmployee && (
          <div className="flex items-start gap-4 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
              {externalEmployee.image ? (
                <img src={externalEmployee.image} alt="profile" className="w-full h-full object-cover object-top" />
              ) : (
                externalEmployee.first_name_la?.[0] || "E"
              )}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {externalEmployee.first_name_la} {externalEmployee.last_name_la}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                <div>ເບີໂທ: <span className="font-medium text-slate-700 dark:text-slate-350">{externalEmployee.phone || "-"}</span></div>
                <div>ອີເມວ: <span className="font-medium text-slate-700 dark:text-slate-350">{externalEmployee.email || "-"}</span></div>
              </div>
            </div>
          </div>
        )}

        {!searching && form.username.trim() && !externalEmployee && (
          <div className="p-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
            ບໍ່ພົບຂໍ້ມູນພະນັກງານໃນລະບົບ HRM
          </div>
        )}
        <Select
          label="ສິດຜູ້ໃຊ້ *"
          value={form.roleId.toString()}
          onChange={(e) => {
            const selectedRole = Number(e.target.value);
            setForm((f) => {
              let updatedProvince = f.provinceId;
              let updatedDistrict = f.districtId;
              let updatedBranch = f.branchId;
              let updatedRepairDistrict = f.repairDistrictId;

              if (selectedRole === 5) {
                updatedDistrict = undefined;
                updatedRepairDistrict = undefined;
              } else if (selectedRole !== 6) {
                updatedProvince = undefined;
                updatedDistrict = undefined;
                updatedBranch = undefined;
                updatedRepairDistrict = undefined;
              }

              return {
                ...f,
                roleId: selectedRole,
                provinceId: updatedProvince,
                districtId: updatedDistrict,
                branchId: updatedBranch,
                repairDistrictId: updatedRepairDistrict,
              };
            });
            if (errors.roleId) setErrors((prev) => ({ ...prev, roleId: "" }));
          }}
          options={[
            { value: "0", label: "ເລືອກສິດຜູ້ໃຊ້" },
            ...roles.map((r) => ({ value: r.id.toString(), label: r.name })),
          ]}
          error={errors.roleId}
        />

        {/* Dynamic Province, District, Branch & RepairDistrict selection visibility for roleId 1 and 2 */}
        {(currentUser?.roleId === 1 || currentUser?.roleId === 2) && (
          <div className="space-y-4">
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
                disabled={form.roleId !== 5 && form.roleId !== 6}
                options={[
                  { value: "", label: "ເລືອກແຂວງ" },
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
                disabled={form.roleId !== 6 || !form.provinceId || loadingDistricts}
                options={[
                  { value: "", label: loadingDistricts ? "ກຳລັງໂຫຼດ..." : "ເລືອກເມືອງ" },
                  ...districts.map((d) => ({ value: d.id.toString(), label: d.district_name })),
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="ສາຂາແຂວງ"
                value={form.branchId?.toString() || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({
                    ...f,
                    branchId: val ? Number(val) : undefined,
                    repairDistrictId: undefined,
                  }));
                }}
                disabled={form.roleId !== 5 && form.roleId !== 6}
                options={[
                  { value: "", label: "ເລືອກສາຂາແຂວງ" },
                  ...branches.map((b) => ({ value: b.id.toString(), label: b.name })),
                ]}
              />
              <Select
                label="ສູນສ້ອມແປງເມືອງ"
                value={form.repairDistrictId?.toString() || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({ ...f, repairDistrictId: val ? Number(val) : undefined }));
                }}
                disabled={form.roleId !== 6 || !form.branchId || loadingRepairDistricts}
                options={[
                  { value: "", label: loadingRepairDistricts ? "ກຳລັງໂຫຼດ..." : "ເລືອກສູນສ້ອມແປງເມືອງ" },
                  ...repairDistricts.map((rd) => ({ value: rd.id.toString(), label: rd.name })),
                ]}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            loading={saving}
            className="flex-1"
          >
            ເພີ່ມ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
