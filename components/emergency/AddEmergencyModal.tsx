import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Button, Textarea } from "@/components/ui/FormElements";
import { axiosInstance } from "@/lib/axiosInstance";
import { createEmergencySchema } from "@/schemas/emergency";
import { toast } from "react-toastify";
import { loadLeaflet } from "@/lib/utils";


interface AddEmergencyModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function AddEmergencyModal({ open, onClose, onRefresh }: AddEmergencyModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emergencyDate, setEmergencyDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl("");
    }
  }, [file]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Reset fields when modal toggled
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setEmergencyDate("");
      setStartTime("");
      setEndTime("");
      // Default to Vientiane coordinates
      setLat("17.974855");
      setLng("102.630867");
      setFile(null);
      setErrors({});

      // Request user's current location
      if (navigator.geolocation) {
        const getLoc = (highAccuracy: boolean) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const currentLat = position.coords.latitude.toFixed(6);
              const currentLng = position.coords.longitude.toFixed(6);
              setLat(currentLat);
              setLng(currentLng);
            },
            (error) => {
              console.warn(`Geolocation error (highAccuracy=${highAccuracy}, code=${error.code}):`, error.message);
              if (highAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
                getLoc(false);
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
      }
    }
  }, [open]);

  // Load Leaflet and initialize map on open
  useEffect(() => {
    let mapInstance: any = null;

    if (open) {
      const defaultLat = 17.974855;
      const defaultLng = 102.630867;
      const initialLat = lat ? parseFloat(lat) : defaultLat;
      const initialLng = lng ? parseFloat(lng) : defaultLng;

      loadLeaflet().then((L) => {
        const container = document.getElementById("map-container");
        if (!container) return;

        // Create map with zoom level 16
        mapInstance = L.map("map-container").setView([initialLat, initialLng], 16);
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
  }, [open]);

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



  const handleAdd = async () => {
    const result = createEmergencySchema.safeParse({
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
      // Create Document (multipart/form-data upload)
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("emergencyDate", new Date(emergencyDate).toISOString());
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      if (lat !== "") {
        formData.append("lat", lat);
      }
      if (lng !== "") {
        formData.append("lng", lng);
      }
      if (file) {
        formData.append("emergencyImg", file);
      }

      await axiosInstance.post("/emergencydocs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("ເພີ່ມຂໍ້ມູນແຈ້ງການມອດໄຟສຸກເສີນສຳເລັດ");
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to add emergency document:", err);
      const errMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ";
      setErrors({ apiError: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="ເພີ່ມຂໍ້ມູນແຈ້ງການມອດໄຟສຸກເສີນ" size="xl">
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
                  placeholder="ລายລະອຽດເພີ່ມເຕີມ..."
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
                    id="map-container"
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
                ຮູບພາບແຈ້ງເຫດ *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border rounded-xl text-sm bg-theme-bg border-theme focus:outline-none"
              />
              {errors.file && <span className="text-xs text-danger">{errors.file}</span>}
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
          <Button variant="primary" onClick={handleAdd} loading={saving} className="flex-1">
            ບັນທຶກ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
