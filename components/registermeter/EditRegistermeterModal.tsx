"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Button, Select } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { editRegistermeterSchema } from "@/schemas/registermeter";
import { toast } from "react-toastify";
import { loadLeaflet, ASSET_BASE_URL } from "@/lib/utils";

interface EditRegistermeterModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: { id: number; fullName: string } | null;
  onRefresh: () => void;
}

export function EditRegistermeterModal({ open, onClose, selectedDoc, onRefresh }: EditRegistermeterModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountNear, setAccountNear] = useState("");

  // Location States
  const [provinces, setProvinces] = useState<{ id: number; province_name: string; province_code: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; district_name: string; district_code: string }[]>([]);
  const [villages, setVillages] = useState<{ id: number; village_name: string }[]>([]);

  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [villageId, setVillageId] = useState("");

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Files
  const [billFile, setBillFile] = useState<File | null>(null);
  const [currentBillFileName, setCurrentBillFileName] = useState("");
  const [billPreviewUrl, setBillPreviewUrl] = useState("");

  const [idcardFile, setIdcardFile] = useState<File | null>(null);
  const [currentIdcardFileName, setCurrentIdcardFileName] = useState("");
  const [idcardPreviewUrl, setIdcardPreviewUrl] = useState("");

  const [loadingDoc, setLoadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Fetch initial dropdown lists on open
  useEffect(() => {
    if (open) {
      const fetchInitialData = async () => {
        try {
          const provRes = await axiosInstance.get("/provinces/selectprovince");
          setProvinces(provRes.data || []);
        } catch (err) {
          console.error("Failed to load initial lists:", err);
        }
      };
      fetchInitialData();
    }
  }, [open]);

  // Load document details
  useEffect(() => {
    if (open && selectedDoc) {
      const fetchDocDetails = async () => {
        try {
          setLoadingDoc(true);
          const res = await axiosInstance.get(`/registermeters/${selectedDoc.id}`);
          const doc = res.data;

          setFullName(doc.fullName || "");
          setPhone(doc.phone || "");
          setAccountNear(doc.accountNear || "");
          setProvinceId(doc.provinceId ? String(doc.provinceId) : "");
          setDistrictId(doc.districtId ? String(doc.districtId) : "");
          setVillageId(doc.villageId ? String(doc.villageId) : "");
          setLat(doc.lat !== undefined && doc.lat !== null ? String(doc.lat) : "");
          setLng(doc.lng !== undefined && doc.lng !== null ? String(doc.lng) : "");
          setCurrentBillFileName(doc.billNearImg || "");
          setCurrentIdcardFileName(doc.idcardImg || "");
          setBillFile(null);
          setIdcardFile(null);
          setErrors({});
        } catch (err) {
          console.error("Failed to load register meter details:", err);
          setErrors({ apiError: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້" });
        } finally {
          setLoadingDoc(false);
        }
      };
      fetchDocDetails();
    }
  }, [open, selectedDoc]);

  // Load districts when provinceId changes
  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      setVillages([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        if (provinces.length === 0) return;
        const selectedProv = provinces.find((p) => p.id === Number(provinceId));
        if (!selectedProv) return;
        const res = await axiosInstance.get(`/districts/selectdistrict?provinceCode=${selectedProv.province_code}`);
        setDistricts(res.data || []);
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    };
    fetchDistricts();
  }, [provinceId, provinces]);

  // Load villages when districtId changes
  useEffect(() => {
    if (!districtId) {
      setVillages([]);
      return;
    }

    const fetchVillages = async () => {
      try {
        if (districts.length === 0) return;
        const selectedDist = districts.find((d) => d.id === Number(districtId));
        if (!selectedDist) return;
        const res = await axiosInstance.get(`/villages/selectvillage?districtCode=${selectedDist.district_code}`);
        setVillages(res.data || []);
      } catch (err) {
        console.error("Failed to load villages:", err);
      }
    };
    fetchVillages();
  }, [districtId, districts]);

  // Sync bill image preview URL
  useEffect(() => {
    if (billFile) {
      const objectUrl = URL.createObjectURL(billFile);
      setBillPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (currentBillFileName) {
      setBillPreviewUrl(`${ASSET_BASE_URL}/upload/registermeter/${currentBillFileName}`);
    } else {
      setBillPreviewUrl("");
    }
  }, [billFile, currentBillFileName]);

  // Sync idcard image preview URL
  useEffect(() => {
    if (idcardFile) {
      const objectUrl = URL.createObjectURL(idcardFile);
      setIdcardPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (currentIdcardFileName) {
      setIdcardPreviewUrl(`${ASSET_BASE_URL}/upload/registermeter/${currentIdcardFileName}`);
    } else {
      setIdcardPreviewUrl("");
    }
  }, [idcardFile, currentIdcardFileName]);

  // Load Leaflet and initialize map on open & loaded details
  useEffect(() => {
    let mapInstance: any = null;
    let active = true;

    if (open && !loadingDoc) {
      const defaultLat = 17.974855;
      const defaultLng = 102.630867;
      const initialLat = lat ? parseFloat(lat) : defaultLat;
      const initialLng = lng ? parseFloat(lng) : defaultLng;

      loadLeaflet().then((L) => {
        if (!active) return;
        const container = document.getElementById("map-edit-container");
        if (!container) return;

        mapInstance = L.map("map-edit-container").setView([initialLat, initialLng], 16);
        mapRef.current = mapInstance;

        L.tileLayer("https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
        }).addTo(mapInstance);

        const DefaultIcon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
          icon: DefaultIcon
        }).addTo(mapInstance);
        markerRef.current = marker;

        marker.on("dragend", (e: any) => {
          const position = marker.getLatLng();
          setLat(position.lat.toFixed(6));
          setLng(position.lng.toFixed(6));
        });

        mapInstance.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setLat(lat.toFixed(6));
          setLng(lng.toFixed(6));
        });

        setTimeout(() => {
          if (mapInstance && active) {
            mapInstance.invalidateSize();
          }
        }, 250);
      }).catch((err) => {
        console.error("Failed to load Leaflet:", err);
      });
    }

    return () => {
      active = false;
      if (mapInstance) {
        mapInstance.remove();
      }
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [open, loadingDoc]);

  // Sync manual inputs to map marker/view
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      const currentLatLng = markerRef.current.getLatLng();
      if (Math.abs(currentLatLng.lat - parsedLat) > 0.00001 || Math.abs(currentLatLng.lng - parsedLng) > 0.00001) {
        markerRef.current.setLatLng([parsedLat, parsedLng]);
        mapRef.current.panTo([parsedLat, parsedLng]);
      }
    }
  }, [lat, lng]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      const getLoc = (highAccuracy: boolean) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentLat = position.coords.latitude.toFixed(6);
            const currentLng = position.coords.longitude.toFixed(6);
            setLat(currentLat);
            setLng(currentLng);
            if (mapRef.current) {
              mapRef.current.setView([parseFloat(currentLat), parseFloat(currentLng)], 16);
            }
            toast.success("ດຶງຂໍ້ມູນຕຳແໜ່ງປັດຈຸບັນສຳເລັດ");
          },
          (error) => {
            console.warn(`Geolocation error (highAccuracy=${highAccuracy}, code=${error.code}):`, error.message);
            if (highAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
              getLoc(false);
            } else {
              toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນຕຳແໜ່ງປັດຈຸບັນໄດ້");
            }
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout: highAccuracy ? 8000 : 15000,
            maximumAge: 30000,
          }
        );
      };
      getLoc(true);
    } else {
      toast.error("ບຣາວເຊີຂອງທ່ານບໍ່ຮອງຮັບ Geolocation");
    }
  };

  const handleSave = async () => {
    if (!selectedDoc) return;

    const result = editRegistermeterSchema.safeParse({
      fullName,
      phone,
      accountNear,
      provinceId: provinceId || undefined,
      districtId: districtId || undefined,
      villageId: villageId || undefined,
      lat,
      lng,
      billNearImg: billFile,
      idcardImg: idcardFile,
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
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("phone", phone);
      formData.append("accountNear", accountNear);
      formData.append("provinceId", provinceId);
      formData.append("districtId", districtId);
      formData.append("villageId", villageId);
      formData.append("lat", lat);
      formData.append("lng", lng);

      if (billFile) {
        formData.append("billNearImg", billFile);
      }
      if (idcardFile) {
        formData.append("idcardImg", idcardFile);
      }

      await axiosInstance.put(`/registermeters/${selectedDoc.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("ແກ້ໄຂຂໍ້ມູນຂໍໝໍ້ນັບໄຟສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to update register meter:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleProvinceChange = (val: string) => {
    setProvinceId(val);
    setDistrictId("");
    setVillageId("");
  };

  const handleDistrictChange = (val: string) => {
    setDistrictId(val);
    setVillageId("");
  };

  return (
    <Modal open={open} onClose={onClose} title="ແກ້ໄຂຂໍ້ມູນຂໍໝໍ້ນັບໄຟໃໝ່" size="2xl">
      <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {errors.apiError && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
            {errors.apiError}
          </div>
        )}

        {loadingDoc ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            ກຳລັງໂຫຼດຂໍ້ມູນ...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Fields Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <Input
                    label="ຊື່ ແລະ ນາມສະກຸນ *"
                    placeholder="ຊື່ ແລະ ນາມສະກຸນ"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={errors.fullName}
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    label="ເບີໂທລະສັບ *"
                    placeholder="ເບີໂທລະສັບ"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    label="ເລກບັນຊີໃກ້ຄຽງ *"
                    placeholder="ເລກບັນຊີໃກ້ຄຽງ"
                    value={accountNear}
                    onChange={(e) => setAccountNear(e.target.value)}
                    error={errors.accountNear}
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    label="Latitude (ເສັ້ນຂະໜານ) *"
                    placeholder="17.9654"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    error={errors.lat}
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    label="Longitude (ເສັ້ນແວງ) *"
                    placeholder="102.6321"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    error={errors.lng}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary mb-1.5 block">
                    ເລືອກສະຖານທີ່ເທິງແຜນທີ່ (ຄລິກ ຫຼື ລາກຈຸດເພື່ອປ່ຽນຕຳແໜ່ງ)
                  </label>
                  <div className="relative w-full h-[320px] rounded-xl border border-theme overflow-hidden z-10">
                    <div
                      id="map-edit-container"
                      className="w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="absolute bottom-4 right-4 z-[1000] p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                      title="ຕຳແໜ່ງປັດຈຸບັນ"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3v2m0 14v2m9-9h-2M5 12H3m14 0a5 5 0 11-10 0 5 5 0 0110 0z"
                        />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Image & Cascading Dropdowns Column */}
            <div className="lg:col-span-5 flex flex-col space-y-4 h-full min-h-[400px] lg:min-h-0 border-t lg:border-t-0 lg:border-l border-theme pt-6 lg:pt-0 lg:pl-6">
              <div>
                <Select
                  label="ແຂວງ *"
                  value={provinceId}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  error={errors.provinceId}
                  options={[
                    { value: "", label: "ເລືອກແຂວງ" },
                    ...provinces.map((p) => ({ value: p.id.toString(), label: p.province_name })),
                  ]}
                />
              </div>

              <div>
                <Select
                  label="ເມືອງ *"
                  value={districtId}
                  disabled={!provinceId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  error={errors.districtId}
                  options={[
                    { value: "", label: "ເລືອກເມືອງ" },
                    ...districts.map((d) => ({ value: d.id.toString(), label: d.district_name })),
                  ]}
                />
              </div>

              <div>
                <Select
                  label="ບ້ານ *"
                  value={villageId}
                  disabled={!districtId}
                  onChange={(e) => setVillageId(e.target.value)}
                  error={errors.villageId}
                  options={[
                    { value: "", label: "ເລືອກບ້ານ" },
                    ...villages.map((v) => ({ value: v.id.toString(), label: v.village_name })),
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1 flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
                    ຮູບໃບບິນໃກ້ຄຽງ
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                    className="w-full px-2 py-1.5 border rounded-xl text-xs bg-theme-bg border-theme focus:outline-none"
                  />
                  {billPreviewUrl ? (
                    <img
                      src={billPreviewUrl}
                      className="w-full h-[180px] object-contain rounded-xl border border-theme bg-slate-50 dark:bg-slate-900 mt-1"
                      alt="Bill Preview"
                    />
                  ) : (
                    <div className="w-full h-[180px] flex items-center justify-center border border-dashed border-theme rounded-xl text-[10px] text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 mt-1">
                      ບໍ່ມີຮູບພາບ
                    </div>
                  )}
                </div>

                <div className="col-span-1 flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
                    ຮູບສຳມະໂນຄົວ/ບັດ
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIdcardFile(e.target.files?.[0] || null)}
                    className="w-full px-2 py-1.5 border rounded-xl text-xs bg-theme-bg border-theme focus:outline-none"
                  />
                  {idcardPreviewUrl ? (
                    <img
                      src={idcardPreviewUrl}
                      className="w-full h-[180px] object-contain rounded-xl border border-theme bg-slate-50 dark:bg-slate-900 mt-1"
                      alt="ID Card Preview"
                    />
                  ) : (
                    <div className="w-full h-[180px] flex items-center justify-center border border-dashed border-theme rounded-xl text-[10px] text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 mt-1">
                      ບໍ່ມີຮູບພາບ
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-3 border-t border-theme">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            ຍົກເລີກ
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={loadingDoc} className="flex-1">
            ບັນທຶກ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
