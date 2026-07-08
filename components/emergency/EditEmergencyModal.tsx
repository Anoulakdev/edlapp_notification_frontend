import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Button, Textarea } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { editEmergencySchema } from "@/schemas/emergency";
import { toast } from "react-toastify";
import { loadLeaflet } from "@/lib/utils";


interface EditEmergencyModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: { id: number; title: string } | null;
  onRefresh: () => void;
}

export function EditEmergencyModal({ open, onClose, selectedDoc, onRefresh }: EditEmergencyModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emergencyDate, setEmergencyDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (currentFileName) {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      setPreviewUrl(`${baseUrl}/upload/emergency/${currentFileName}`);
    } else {
      setPreviewUrl("");
    }
  }, [file, currentFileName]);

  const [loadingDoc, setLoadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load document details on open
  useEffect(() => {
    if (open && selectedDoc) {
      const fetchDocDetails = async () => {
        try {
          setLoadingDoc(true);
          const res = await axiosInstance.get(`/emergencydocs/${selectedDoc.id}`);
          const doc = res.data;

          setTitle(doc.title || "");
          setDescription(doc.description || "");
          setEmergencyDate(doc.emergencyDate ? doc.emergencyDate.split("T")[0] : "");
          setStartTime(doc.startTime || "");
          setEndTime(doc.endTime || "");
          setLat(doc.lat !== undefined && doc.lat !== null ? String(doc.lat) : "");
          setLng(doc.lng !== undefined && doc.lng !== null ? String(doc.lng) : "");
          setCurrentFileName(doc.emergencyImg || "");
          setFile(null);
          setErrors({});
        } catch (err) {
          console.error("Failed to load emergency doc details:", err);
          setErrors({ apiError: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນເອກະສານໄດ້" });
        } finally {
          setLoadingDoc(false);
        }
      };
      fetchDocDetails();
    }
  }, [open, selectedDoc]);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Leaflet and initialize map on open & loaded details
  useEffect(() => {
    let mapInstance: any = null;

    if (open && !loadingDoc) {
      const defaultLat = 17.974855;
      const defaultLng = 102.630867;
      const initialLat = lat ? parseFloat(lat) : defaultLat;
      const initialLng = lng ? parseFloat(lng) : defaultLng;

      // If lat/lng are empty, pre-populate them
      if (!lat) setLat(defaultLat.toFixed(6));
      if (!lng) setLng(defaultLng.toFixed(6));

      loadLeaflet().then((L) => {
        const container = document.getElementById("map-edit-container");
        if (!container) return;

        // Create map with zoom level 16
        mapInstance = L.map("map-edit-container").setView([initialLat, initialLng], 16);
        mapRef.current = mapInstance;

        // Use Google Hybrid (Satellite + Roads/Labels)
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

        // Add draggable marker
        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
          icon: DefaultIcon
        }).addTo(mapInstance);
        markerRef.current = marker;

        // Drag marker event
        marker.on("dragend", (e: any) => {
          const position = marker.getLatLng();
          setLat(position.lat.toFixed(6));
          setLng(position.lng.toFixed(6));
        });

        // Click map event
        mapInstance.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setLat(lat.toFixed(6));
          setLng(lng.toFixed(6));
        });

        // Fix leaflet layout rendering inside hidden modal elements
        setTimeout(() => {
          if (mapInstance) {
            mapInstance.invalidateSize();
          }
        }, 250);
      }).catch((err) => {
        console.error("Failed to load Leaflet:", err);
      });
    }

    return () => {
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



  const handleEdit = async () => {
    if (!selectedDoc) return;

    const result = editEmergencySchema.safeParse({
      title,
      description,
      emergencyDate,
      startTime,
      endTime,
      lat: lat === "" ? undefined : lat,
      lng: lng === "" ? undefined : lng,
      file,
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
      // Update Document Details
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("emergencyDate", new Date(emergencyDate).toISOString());
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      if (lat !== "") {
        formData.append("lat", lat);
      } else {
        formData.append("lat", "");
      }
      if (lng !== "") {
        formData.append("lng", lng);
      } else {
        formData.append("lng", "");
      }
      if (file) {
        formData.append("emergencyImg", file);
      }

      await axiosInstance.put(`/emergencydocs/${selectedDoc.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("ແກ້ໄຂຂໍ້ມູນແຈ້ງການມອດໄຟສຸກເສີນສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to update emergency document:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ແກ້ໄຂຂໍ້ມູນແຈ້ງການມອດໄຟສຸກເສີນ" size="xl">
      {loadingDoc ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
        </div>
      ) : (
        <div className="space-y-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
          {errors.apiError && (
            <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">
              {errors.apiError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Fields Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input
                    label="ຫົວຂໍ້ *"
                    placeholder="ຫົວຂໍ້ແຈ້ງການມອດໄຟສຸກເສີນ"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={errors.title}
                  />
                </div>


                <div className="col-span-2">
                  <Textarea
                    label="ລາຍລະອຽດ"
                    placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Input
                  label="Latitude (ເສັ້ນຂະໜານ)"
                  placeholder="17.9654"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  error={errors.lat}
                />

                <Input
                  label="Longitude (ເສັ້ນແວງ)"
                  placeholder="102.6321"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  error={errors.lng}
                />

                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary mb-1.5 block">
                    ເລືອກສະຖານທີ່ເທິງແຜນທີ່ (ຄລິກ ຫຼື ລາກຈຸດເພື່ອປ່ຽນຕຳແໜ່ງ)
                  </label>
                  <div className="relative w-full h-[350px] rounded-xl border border-theme overflow-hidden z-10">
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

            {/* Image Upload and Preview Column */}
            <div className="lg:col-span-5 flex flex-col space-y-4 h-full min-h-[400px] lg:min-h-0 border-t lg:border-t-0 lg:border-l border-theme pt-6 lg:pt-0 lg:pl-6">
              <div>
                <Input
                  type="date"
                  label="ວັນທີ *"
                  value={emergencyDate}
                  onChange={(e) => setEmergencyDate(e.target.value)}
                  error={errors.emergencyDate}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  label="ເວລາເລີ່ມຕົ້ນ"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  error={errors.startTime}
                />

                <Input
                  type="time"
                  label="ເວລາສິ້ນສຸດ"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  error={errors.endTime}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
                  ຮູບພາບແຈ້ງເຫດ (ປ່ຽນຮູບພາບໃໝ່)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border rounded-xl text-sm bg-theme-bg border-theme focus:outline-none"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary mb-2">
                  ເບິ່ງຕົວຢ່າງຮູບພາບ
                </label>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-full flex-1 max-h-[300px] object-contain rounded-xl border border-theme bg-slate-50 dark:bg-slate-900"
                    alt="Preview"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-theme rounded-xl p-6 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 min-h-[200px]">
                    <svg
                      className="w-12 h-12 mb-3 text-slate-350"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">ບໍ່ມີຮູບພາບ ຫຼື ຍັງບໍ່ໄດ້ເລືອກຮູບພາບ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-theme">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              ຍົກເລີກ
            </Button>
            <Button variant="primary" onClick={handleEdit} loading={saving} className="flex-1">
              ອັບເດດ
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
