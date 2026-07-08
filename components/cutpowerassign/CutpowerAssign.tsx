"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, Button, Checkbox } from "@/components/ui/FormElements";
import { Search, MapPin, ArrowLeft, Calendar } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { decryptId } from "@/lib/crypto";
import moment from "moment";

export function CutpowerAssign() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("id");

  // Dropdown States
  const [provinces, setProvinces] = useState<{ id: number; province_name: string; province_code: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; district_name: string; district_code: string }[]>([]);
  const [villages, setVillages] = useState<{ id: number; village_name: string }[]>([]);

  const [provinceId, setProvinceId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [selectedVillages, setSelectedVillages] = useState<number[]>([]);
  const [originalProvinceId, setOriginalProvinceId] = useState<string>("");
  const [originalDistrictId, setOriginalDistrictId] = useState<string>("");
  const [originalVillages, setOriginalVillages] = useState<number[]>([]);
  const [villageSearch, setVillageSearch] = useState("");

  const [docTitle, setDocTitle] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [docCutpowerDate, setDocCutpowerDate] = useState("");
  const [allKnownVillages, setAllKnownVillages] = useState<{ id: number; village_name: string }[]>([]);

  const [loadingDoc, setLoadingDoc] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [error, setError] = useState("");

  // User Role & Province States for role-based assignment
  const [currentUserRoleId, setCurrentUserRoleId] = useState<number | null>(null);
  const [currentUserProvinceId, setCurrentUserProvinceId] = useState<number | null>(null);
  const [currentUserDistrictId, setCurrentUserDistrictId] = useState<number | null>(null);

  // Fetch Current Logged-in User Profile on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        setCurrentUserRoleId(res.data?.roleId || null);
        setCurrentUserProvinceId(res.data?.provinceId || null);
        setCurrentUserDistrictId(res.data?.districtId || null);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Automatically override provinceId and districtId based on role
  useEffect(() => {
    if (currentUserRoleId === 4 && currentUserProvinceId) {
      setProvinceId(currentUserProvinceId.toString());
    } else if (currentUserRoleId === 5 && currentUserProvinceId && currentUserDistrictId) {
      setProvinceId(currentUserProvinceId.toString());
      setDistrictId(currentUserDistrictId.toString());
    }
  }, [currentUserRoleId, currentUserProvinceId, currentUserDistrictId, loadingDoc]);

  // Fetch Provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axiosInstance.get("/provinces/selectprovince");
        setProvinces(res.data || []);
      } catch (err) {
        console.error("Failed to load provinces:", err);
      }
    };
    fetchProvinces();
  }, []);

  // Load document full details on load
  useEffect(() => {
    if (!docId) {
      setLoadingDoc(false);
      setError("ບໍ່ພົບລະຫັດເອກະສານ");
      return;
    }

    const fetchDocDetails = async () => {
      try {
        setLoadingDoc(true);
        setError("");

        const decryptedId = decryptId(docId);
        if (!decryptedId) {
          setError("ລະຫັດເອກະສານບໍ່ຖືກຕ້ອງ");
          setLoadingDoc(false);
          return;
        }

        const res = await axiosInstance.get(`/cutpowerdocs/${decryptedId}`);
        const doc = res.data;

        setDocTitle(doc.title || "");
        setDocDesc(doc.description || "");
        setDocCutpowerDate(doc.cutpowerDate || "");
        const initialProvince = doc.provinceId ? doc.provinceId.toString() : "";
        const initialDistrict = doc.districtId ? doc.districtId.toString() : "";
        const mappedVillageIds =
          doc.cutpowerAddresses?.map((addr: any) => addr.village?.id).filter(Boolean) || [];

        setProvinceId(initialProvince);
        setDistrictId(initialDistrict);
        setSelectedVillages(mappedVillageIds);

        setOriginalProvinceId(initialProvince);
        setOriginalDistrictId(initialDistrict);
        setOriginalVillages(mappedVillageIds);
        setVillageSearch("");

        const mappedVillages =
          doc.cutpowerAddresses?.map((addr: any) => addr.village).filter(Boolean) || [];
        setAllKnownVillages(mappedVillages);
      } catch (err) {
        console.error("Failed to load cutpower doc details:", err);
        setError("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນເອກະສານໄດ້");
      } finally {
        setLoadingDoc(false);
      }
    };
    fetchDocDetails();
  }, [docId]);

  // Load districts when provinceId changes
  useEffect(() => {
    if (!provinceId || provinces.length === 0) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const selectedProv = provinces.find((p) => p.id === Number(provinceId));
        if (!selectedProv) return;

        const res = await axiosInstance.get(`/districts/selectdistrict?provinceCode=${selectedProv.province_code}`);
        setDistricts(res.data || []);
      } catch (err) {
        console.error("Failed to load districts:", err);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [provinceId, provinces]);

  // Load villages when districtId changes
  useEffect(() => {
    if (!districtId || districts.length === 0) {
      setVillages([]);
      return;
    }

    const fetchVillages = async () => {
      try {
        setLoadingVillages(true);
        const selectedDist = districts.find((d) => d.id === Number(districtId));
        if (!selectedDist) return;

        const res = await axiosInstance.get(`/villages/selectvillage?districtCode=${selectedDist.district_code}`);
        setVillages(res.data || []);
      } catch (err) {
        console.error("Failed to load villages:", err);
      } finally {
        setLoadingVillages(false);
      }
    };
    fetchVillages();
  }, [districtId, districts]);

  // Sync villages into allKnownVillages so names are never lost
  useEffect(() => {
    if (villages.length > 0) {
      setAllKnownVillages((prev) => {
        const merged = [...prev];
        villages.forEach((v) => {
          if (!merged.some((x) => x.id === v.id)) {
            merged.push(v);
          }
        });
        return merged;
      });
    }
  }, [villages]);

  // Village Filter Logic
  const filteredVillages = villages.filter((v) =>
    v.village_name.toLowerCase().includes(villageSearch.toLowerCase())
  );

  const handleProvinceChange = (newProvinceId: string) => {
    setProvinceId(newProvinceId);
    if (newProvinceId !== originalProvinceId) {
      setDistrictId("");
      setSelectedVillages([]);
    } else {
      setDistrictId(originalDistrictId);
      setSelectedVillages(originalVillages);
    }
  };

  const handleDistrictChange = (newDistrictId: string) => {
    setDistrictId(newDistrictId);
    if (newDistrictId !== originalDistrictId) {
      setSelectedVillages([]);
    } else {
      if (provinceId === originalProvinceId) {
        setSelectedVillages(originalVillages);
      } else {
        setSelectedVillages([]);
      }
    }
  };

  const handleSave = async () => {
    if (!docId) return;
    if (selectedVillages.length === 0) {
      setError("ກະລຸນາເລືອກຢ່າງໜ້ອຍ 1 ບ້ານ");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const decryptedId = decryptId(docId);
      if (!decryptedId) {
        setError("ລະຫັດເອກະສານບໍ່ຖືກຕ້ອງ");
        setSaving(false);
        return;
      }

      await axiosInstance.put(`/cutpowerdocs/updateaddress/${decryptedId}`, {
        provinceId: provinceId ? Number(provinceId) : null,
        districtId: districtId ? Number(districtId) : null,
        villageId: selectedVillages,
      });

      toast.success("ກຳນົດບ້ານແຈ້ງການຕັດໄຟສຳເລັດ");
      router.push("/cutpower");
    } catch (err: any) {
      console.error("Failed to update cutpower villages:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/cutpower");
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      {/* Header Back Button */}
      <button
        onClick={handleBack}
        className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-brand/20 bg-brand/5 dark:bg-brand/10 hover:bg-brand/10 dark:hover:bg-brand/20 text-brand transition-all duration-200 shadow-sm hover:shadow-md text-xs font-bold mb-6 w-fit"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>ກັບຄືນ</span>
      </button>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>
          ກຳນົດບ້ານແຈ້ງການຕັດໄຟ
        </h1>
      </div>


      {loadingDoc ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Doc details preview and selected list */}
            <div className="lg:col-span-5 space-y-6">
              {/* Doc details preview card */}
              {docTitle && (
                <div
                  className="p-5 rounded-2xl border space-y-3"
                  style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 break-all whitespace-normal mt-0.5">
                        {docTitle}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-4 border-t border-theme">
                    {/* Date card */}
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/80">
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-semibold leading-none mb-1">ວັນທີ</span>
                        <span className="text-xs font-bold text-slate-750 dark:text-slate-200 leading-tight">
                          {docCutpowerDate ? moment(docCutpowerDate).format("DD/MM/YYYY") : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Location and Villages summary */}
              <div
                className="p-5 rounded-2xl border space-y-4"
                style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
              >
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  ບ້ານທີ່ຖືກເລືອກ ({selectedVillages.length} ບ້ານ)
                </h3>

                {/* Selected Location */}
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-theme pb-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">ແຂວງ:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350 truncate block">
                      {provinces.find((p) => p.id === Number(provinceId))?.province_name || "ຍັງບໍ່ໄດ້ເລືອກແຂວງ"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">ເມືອງ:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350 truncate block">
                      {districts.find((d) => d.id === Number(districtId))?.district_name || "ຍັງບໍ່ໄດ້ເລືອກເມືອງ"}
                    </span>
                  </div>
                </div>

                {/* Selected Villages List */}
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {selectedVillages.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      ຍັງບໍ່ມີບ້ານທີ່ຖືກເລືອກ
                    </div>
                  ) : (
                    selectedVillages.map((id) => {
                      const village = allKnownVillages.find((v) => v.id === id);
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-theme text-xs font-medium"
                        >
                          <span className="text-slate-700 dark:text-slate-350 truncate mr-2">
                            {village?.village_name || `ບ້ານ (ID: ${id})`}
                          </span>
                          <button
                            onClick={() => setSelectedVillages((prev) => prev.filter((x) => x !== id))}
                            className="text-red-500 hover:text-red-650 transition-colors text-xs font-semibold px-1.5 py-0.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0"
                          >
                            ລົບ
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Selection Card */}
            <div className="lg:col-span-7">
              <div
                className="p-6 rounded-2xl border space-y-6"
                style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentUserRoleId !== 4 && currentUserRoleId !== 5 && (
                    <Select
                      label="ແຂວງ *"
                      value={provinceId}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      options={[
                        { value: "", label: "ເລືອກແຂວງ" },
                        ...provinces.map((p) => ({ value: p.id.toString(), label: p.province_name })),
                      ]}
                    />
                  )}

                  {currentUserRoleId !== 5 && (
                    <div className={currentUserRoleId === 4 ? "md:col-span-2" : ""}>
                      <Select
                        label="ເມືອງ *"
                        value={districtId}
                        disabled={!provinceId || loadingDistricts}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        options={[
                          { value: "", label: loadingDistricts ? "ກຳລັງໂຫຼດເມືອງ..." : "ເລືອກເມືອງ" },
                          ...districts.map((d) => ({ value: d.id.toString(), label: d.district_name })),
                        ]}
                      />
                    </div>
                  )}

                  {districtId && (
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
                        ບ້ານທີ່ແຈ້ງການຕັດໄຟ * {selectedVillages.length > 0 && `(ເລືອກແລ້ວ ${selectedVillages.length} ບ້ານ)`}
                      </label>

                      {/* Village Filter Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="ຄົ້ນຫາບ້ານ..."
                          value={villageSearch}
                          onChange={(e) => setVillageSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border bg-theme-bg border-theme outline-none"
                        />
                      </div>

                      {/* Select All Checkbox */}
                      {filteredVillages.length > 0 && (
                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-theme">
                          <Checkbox
                            label="ເລືອກທັງໝົດ"
                            checked={
                              filteredVillages.length > 0 &&
                              filteredVillages.every((v) => selectedVillages.includes(v.id))
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedVillages((prev) => {
                                  const toAdd = filteredVillages
                                    .filter((v) => !prev.includes(v.id))
                                    .map((v) => v.id);
                                  return [...prev, ...toAdd];
                                });
                              } else {
                                setSelectedVillages((prev) => {
                                  const filteredIds = filteredVillages.map((v) => v.id);
                                  return prev.filter((id) => !filteredIds.includes(id));
                                });
                              }
                            }}
                          />
                        </div>
                      )}

                      {/* Villages List Scroll Box */}
                      <div className="max-h-72 overflow-y-auto border border-theme rounded-xl p-4 space-y-2.5 bg-theme-bg scrollbar-thin">
                        {loadingVillages ? (
                          <div className="text-center py-8 text-sm text-slate-400 animate-pulse">
                            ກຳລັງໂຫຼດບ້ານ...
                          </div>
                        ) : filteredVillages.length === 0 ? (
                          <div className="text-center py-8 text-sm text-slate-400">
                            ບໍ່ພົບຂໍ້ມູນບ້ານ
                          </div>
                        ) : (
                          filteredVillages.map((village) => (
                            <Checkbox
                              key={village.id}
                              label={village.village_name}
                              checked={selectedVillages.includes(village.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVillages((prev) => [...prev, village.id]);
                                } else {
                                  setSelectedVillages((prev) => prev.filter((id) => id !== village.id));
                                }
                              }}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-theme">
                  <Button variant="secondary" onClick={handleBack} className="flex-1">
                    ຍົກເລີກ
                  </Button>
                  <Button variant="primary" onClick={handleSave} loading={saving} className="flex-1">
                    ບັນທຶກຂໍ້ມູນ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

