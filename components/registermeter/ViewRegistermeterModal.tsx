"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { AlertTriangle, FileText, MapPin, User, Clock, Phone, UserCheck } from "lucide-react";
import { loadLeaflet } from "@/lib/utils";
import { RegisterMeter } from "@/schemas/registermeter";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const transitPoints = [
  { name: "Paksan", lat: 18.385800, lng: 103.658500 },
  { name: "Thakhek", lat: 17.411500, lng: 104.806000 },
  { name: "Seno", lat: 16.698000, lng: 104.996000 }
];

const getWaypoints = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const minLat = Math.min(lat1, lat2);
  const maxLat = Math.max(lat1, lat2);
  const dist = getDistance(lat1, lng1, lat2, lng2);

  if (dist < 100) return [];

  const intermediate = transitPoints.filter(p => p.lat > minLat && p.lat < maxLat);
  if (lat1 > lat2) {
    intermediate.sort((a, b) => b.lat - a.lat);
  } else {
    intermediate.sort((a, b) => a.lat - b.lat);
  }
  return intermediate;
};

interface ViewRegistermeterModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: RegisterMeter | null;
}

export function ViewRegistermeterModal({ open, onClose, selectedDoc }: ViewRegistermeterModalProps) {
  const viewMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const userLocRef = useRef<{ lat: number; lng: number } | null>(null);

  const [hasUserLoc, setHasUserLoc] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const [docDetail, setDocDetail] = useState<RegisterMeter | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "assignment">("document");

  // Reset view map state on close
  useEffect(() => {
    if (!open) {
      setHasUserLoc(false);
      setHasRoute(false);
      userLocRef.current = null;
      userMarkerRef.current = null;
      routePolylineRef.current = null;
      setActiveTab("document");
    }
  }, [open]);

  // Invalidate size when activeTab changes back to "document"
  useEffect(() => {
    if (activeTab === "document" && viewMapRef.current) {
      setTimeout(() => {
        if (viewMapRef.current) {
          viewMapRef.current.invalidateSize();
        }
      }, 100);
    }
  }, [activeTab]);

  // Fetch details from findone API when open
  useEffect(() => {
    if (open && selectedDoc?.id) {
      const fetchDetail = async () => {
        setLoadingDetail(true);
        try {
          const res = await axiosInstance.get(`/registermeters/${selectedDoc.id}`);
          setDocDetail(res.data);
        } catch (err) {
          console.error("Failed to load register meter details:", err);
          toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນລະອຽດໄດ້");
        } finally {
          setLoadingDetail(false);
        }
      };
      fetchDetail();
    } else {
      setDocDetail(null);
      setLoadingDetail(false);
    }
  }, [open, selectedDoc?.id]);

  const displayDoc = docDetail || selectedDoc;

  const billUrl = displayDoc?.billNearImg
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/registermeter/${displayDoc.billNearImg}`
    : "";
  const idcardUrl = displayDoc?.idcardImg
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/registermeter/${displayDoc.idcardImg}`
    : "";
  const viewTitle = displayDoc?.fullName || "";

  const handleCenterTarget = () => {
    if (viewMapRef.current && displayDoc?.lat && displayDoc?.lng) {
      viewMapRef.current.setView([parseFloat(String(displayDoc.lat)), parseFloat(String(displayDoc.lng))], 16);
    }
  };

  const handleCenterUser = () => {
    if (viewMapRef.current && userLocRef.current) {
      viewMapRef.current.setView([userLocRef.current.lat, userLocRef.current.lng], 16);
    }
  };

  const handleFitRoute = () => {
    if (viewMapRef.current && routePolylineRef.current) {
      viewMapRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });
    }
  };

  // Load Leaflet and initialize map on view details open
  useEffect(() => {
    let mapInstance: any = null;
    let watchId: number | null = null;
    let mapActive = true;

    if (open && !loadingDetail && displayDoc?.lat && displayDoc?.lng) {
      const initialLat = parseFloat(String(displayDoc.lat));
      const initialLng = parseFloat(String(displayDoc.lng));

      if (!isNaN(initialLat) && !isNaN(initialLng)) {
        loadLeaflet().then((L) => {
          if (!mapActive) return;
          const container = document.getElementById("view-map-container");
          if (!container) return;

          mapInstance = L.map("view-map-container").setView([initialLat, initialLng], 16);
          viewMapRef.current = mapInstance;

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

          const targetMarker = L.marker([initialLat, initialLng], {
            icon: DefaultIcon
          }).addTo(mapInstance);
          targetMarker.bindPopup(`<b>ຈຸດແຈ້ງຂໍໝໍ້ນັບໄຟ: ${displayDoc.fullName}</b>`).openPopup();

          // Get user's current location and calculate route in real-time
          if (navigator.geolocation) {
            const startWatching = (highAccuracy: boolean) => {
              watchId = navigator.geolocation.watchPosition(
                (position) => {
                  const currentLat = position.coords.latitude;
                  const currentLng = position.coords.longitude;

                  userLocRef.current = { lat: currentLat, lng: currentLng };
                  setHasUserLoc(true);

                  const UserIcon = L.divIcon({
                    className: "custom-user-icon",
                    html: `
                      <div class="relative flex h-4 w-4">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-md"></span>
                      </div>
                    `,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                  });

                  if (userMarkerRef.current) {
                    userMarkerRef.current.setLatLng([currentLat, currentLng]);
                  } else {
                    userMarkerRef.current = L.marker([currentLat, currentLng], { icon: UserIcon }).addTo(mapInstance);
                    userMarkerRef.current.bindPopup("<b>ຕຳແໜ່ງປັດຈຸບັນຂອງທ່ານ</b>");
                  }

                  const waypoints = getWaypoints(currentLat, currentLng, initialLat, initialLng);
                  const waypointStrings = waypoints.map(w => `${w.lng},${w.lat}`).join(";");

                  const routeUrl = waypointStrings
                    ? `https://router.project-osrm.org/route/v1/driving/${currentLng},${currentLat};${waypointStrings};${initialLng},${initialLat}?overview=full&geometries=geojson`
                    : `https://router.project-osrm.org/route/v1/driving/${currentLng},${currentLat};${initialLng},${initialLat}?overview=full&geometries=geojson`;

                  fetch(routeUrl)
                    .then((res) => res.json())
                    .then((data) => {
                      if (!mapActive) return;
                      if (data.routes && data.routes[0]) {
                        const coords = data.routes[0].geometry.coordinates;
                        const latLngs = coords.map((coord: any) => [coord[1], coord[0]]);

                        if (routePolylineRef.current) {
                          mapInstance.removeLayer(routePolylineRef.current);
                        }

                        routePolylineRef.current = L.polyline(latLngs, {
                          color: "#3b82f6",
                          weight: 5,
                          opacity: 0.8,
                          lineJoin: "round"
                        }).addTo(mapInstance);

                        setHasRoute(true);
                      }
                    })
                    .catch((err) => {
                      if (mapActive) {
                        console.error("Error fetching route from OSRM:", err);
                      }
                    });
                },
                (error) => {
                  console.warn(`Geolocation error (highAccuracy=${highAccuracy}, code=${error.code}):`, error.message);
                  if (highAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
                    if (watchId !== null) {
                      navigator.geolocation.clearWatch(watchId);
                    }
                    startWatching(false);
                  }
                },
                {
                  enableHighAccuracy: highAccuracy,
                  timeout: highAccuracy ? 8000 : 15000,
                  maximumAge: 30000,
                }
              );
            };
            startWatching(true);
          }

          setTimeout(() => {
            if (mapInstance && mapActive) {
              mapInstance.invalidateSize();
            }
          }, 250);
        }).catch((err) => {
          console.error("Failed to load Leaflet in view details:", err);
        });
      }
    }

    return () => {
      mapActive = false;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (mapInstance) {
        mapInstance.remove();
      }
      viewMapRef.current = null;
      userMarkerRef.current = null;
      routePolylineRef.current = null;
    };
  }, [open, loadingDetail, displayDoc?.lat, displayDoc?.lng]);

  const getStatusBadgeClass = (statusId?: number) => {
    switch (statusId) {
      case 1:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case 2:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case 3:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case 4:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300";
    }
  };

  const modalTitle = (
    <div className="flex items-center justify-between w-full pr-4" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
        ລາຍລະອຽດຂໍໝໍ້ນັບໄຟໃໝ່ (ເລກທີ: {selectedDoc?.id || "-"})
      </span>
      {displayDoc?.meterStatus?.callcenter && (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeClass(displayDoc.meterStatusId)}`}>
          {displayDoc.meterStatus.callcenter}
        </span>
      )}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      size="2xl"
    >
      <div className="flex flex-col h-[75vh] max-h-[75vh]" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab("document")}
            className={`py-2 px-4 text-base font-bold border-b-2 transition-all ${activeTab === "document"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
          >
            ຂໍ້ມູນເອກະສານ
          </button>
          <button
            onClick={() => setActiveTab("assignment")}
            className={`py-2 px-4 text-base font-bold border-b-2 transition-all ${activeTab === "assignment"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
          >
            ຂໍ້ມູນການສົ່ງຕໍ່/ຮັບເອກະສານ
          </button>
        </div>

        {loadingDetail ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            ກຳລັງໂຫຼດຂໍ້ມູນ...
          </div>
        ) : (
          <>
            {/* Tab 1: Document Details */}
            <div className={activeTab === "document" ? "flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 overflow-hidden" : "hidden"}>
              {/* Left Side: General Fields (Scrollable) */}
              <div className="flex-1 lg:col-span-5 flex flex-col gap-5 overflow-y-auto pr-2 scrollbar-thin">
                {/* Name & Phone */}
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ຊື່ ແລະ ນາມສະກຸນ</span>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug break-all">
                        {displayDoc?.fullName}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ເບີໂທລະສັບ</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-350">{displayDoc?.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ເລກບັນຊີໃກ້ຄຽງ</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{displayDoc?.accountNear}</span>
                  </div>
                </div>

                {/* Classification Panel */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 font-medium">ຊ່องທາງຮັບແຈ້ງ</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {displayDoc?.sourcetype?.name || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Panel */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    ເຂດພື້ນທີ່ແຈ້ງ
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                      <span className="text-xs text-slate-400 mb-0.5">ແຂວງ</span>
                      <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                        {displayDoc?.province?.province_name || "-"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                      <span className="text-xs text-slate-400 mb-0.5">ເມືອງ</span>
                      <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                        {displayDoc?.district?.district_name || "-"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col col-span-2">
                      <span className="text-xs text-slate-400 mb-0.5">ບ້ານ</span>
                      <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                        {displayDoc?.village?.village_name || "-"}
                      </span>
                    </div>
                    {displayDoc?.lat !== undefined && displayDoc?.lat !== null && (
                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                        <span className="text-xs text-slate-400 mb-0.5">Latitude (ເສັ້ນຂະໜານ)</span>
                        <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                          {displayDoc.lat}
                        </span>
                      </div>
                    )}
                    {displayDoc?.lng !== undefined && displayDoc?.lng !== null && (
                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                        <span className="text-xs text-slate-400 mb-0.5">Longitude (ເສັ້ນແວງ)</span>
                        <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                          {displayDoc.lng}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Creator Information */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-slate-400">ຜູ້ສ້າງເອກະສານ</span>
                    <span className="text-sm font-semibold text-slate-750 dark:text-slate-350 truncate">
                      {loadingDetail && !docDetail ? (
                        <span className="text-slate-450 italic">ກຳລັງໂຫຼດ...</span>
                      ) : (
                        displayDoc?.createdName || "-"
                      )}
                    </span>
                    {displayDoc?.createdTel && (
                      <span className="text-xs text-slate-455 dark:text-slate-500 font-mono">
                        ເບີໂທ: {displayDoc.createdTel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Map & File Previews */}
              <div className="flex-1 lg:col-span-7 h-[70vh] lg:h-full flex flex-col gap-4 overflow-hidden">
                {/* Top: Map */}
                <div className="flex-[1.5] min-h-[250px] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/40 relative">
                  {displayDoc?.lat && displayDoc?.lng ? (
                    <>
                      <div id="view-map-container" className="w-full h-full z-10" />

                      {/* Floating Action Controls */}
                      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={handleCenterTarget}
                          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-250 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                          title="ຈຸດແຈ້ງຂໍໝໍ້ນັບໄຟ"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        {hasRoute && (
                          <button
                            type="button"
                            onClick={handleFitRoute}
                            className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-250 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                            title="ຂະຫຍາຍໃຫ້ເຫັນເສັ້ນທາງທັງໝົດ"
                          >
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
                            </svg>
                          </button>
                        )}
                        {hasUserLoc && (
                          <button
                            type="button"
                            onClick={handleCenterUser}
                            className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-250 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                            title="ຕຳແໜ່ງປັດຈຸບັນ"
                          >
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14 0a5 5 0 11-10 0 5 5 0 0110 0z" />
                              <circle cx="12" cy="12" r="2" fill="currentColor" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                      <MapPin className="w-10 h-10" />
                      <span className="text-sm">ບໍ່ມີຂໍ້ມູນຕຳແໜ່ງເທິງແຜນທີ່</span>
                    </div>
                  )}
                </div>

                {/* Bottom: File Previews */}
                <div className="flex-1 min-h-[150px] grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 h-full min-h-0">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">ຮູບໃບບິນໃກ້ຄຽງ</span>
                    <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/40 flex flex-col">
                      {billUrl ? (
                        <div className="w-full h-full overflow-auto flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-900">
                          <img
                            src={billUrl}
                            alt="Bill Near"
                            className="max-w-full h-auto max-h-full object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 p-4">
                          <FileText className="w-8 h-8 text-slate-350" />
                          <span className="text-xs">ບໍ່ມີຮູບໃບບິນ</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 h-full min-h-0">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">ຮູບສຳມະໂນຄົວ / ບັດ</span>
                    <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/40 flex flex-col">
                      {idcardUrl ? (
                        <div className="w-full h-full overflow-auto flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-900">
                          <img
                            src={idcardUrl}
                            alt="ID Card"
                            className="max-w-full h-auto max-h-full object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 p-4">
                          <FileText className="w-8 h-8 text-slate-350" />
                          <span className="text-xs">ບໍ່ມີຮູບສຳມະໂນຄົວ/ບັດ</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab 2: Assignment Info */}
            <div className={activeTab === "assignment" ? "flex-1 flex flex-col overflow-y-auto pr-2 scrollbar-thin" : "hidden"}>
              {displayDoc?.userAcceptMeters ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                  {/* Left Column: Call Center Assignment */}
                  <div className="group p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-slate-50/30 dark:from-blue-950/10 dark:to-slate-900/5 border border-blue-100/85 dark:border-blue-900/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">ຜູ້ຮັບເລື່ອງ ແລະ ສົ່ງຕໍ່ (Call Center)</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {displayDoc.userAcceptMeters.userCall?.employee
                            ? `${displayDoc.userAcceptMeters.userCall.employee.first_name} ${displayDoc.userAcceptMeters.userCall.employee.last_name}`
                            : "-"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-blue-100/50 dark:border-blue-900/20 pt-3">
                      {displayDoc.userAcceptMeters.userCall?.employee?.emp_code && (
                        <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                          <UserCheck className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">ລະຫັດພະນັກງານ</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{displayDoc.userAcceptMeters.userCall.employee.emp_code}</p>
                          </div>
                        </div>
                      )}
                      {displayDoc.userAcceptMeters.userCall?.employee?.tel && (
                        <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                          <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">ເບີໂທລະສັບ</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{displayDoc.userAcceptMeters.userCall.employee.tel}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/30 dark:border-blue-900/10">
                      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <div className="text-[12px] text-slate-555 dark:text-slate-400">
                        <span className="font-medium">ເວລາຮັບເລື່ອງ: </span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">
                          {moment(displayDoc.userAcceptMeters.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Province Assignment */}
                  {displayDoc.userAcceptMeters.userProvinceId && (
                    <div className="group p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-slate-50/30 dark:from-emerald-950/10 dark:to-slate-900/5 border border-emerald-100/85 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">ຜູ້ຮັບເອກະສານປະຈຳສາຂາແຂວງ</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                            {displayDoc.userAcceptMeters.userProvince?.employee
                              ? `${displayDoc.userAcceptMeters.userProvince.employee.first_name} ${displayDoc.userAcceptMeters.userProvince.employee.last_name}`
                              : "-"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-emerald-100/50 dark:border-emerald-900/20 pt-3">
                        {displayDoc.userAcceptMeters.userProvince?.employee?.emp_code && (
                          <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                            <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">ລະຫັດພະນັກງານ</p>
                              <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{displayDoc.userAcceptMeters.userProvince.employee.emp_code}</p>
                            </div>
                          </div>
                        )}
                        {displayDoc.userAcceptMeters.userProvince?.employee?.tel && (
                          <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                            <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">ເບີໂທລະສັບ</p>
                              <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{displayDoc.userAcceptMeters.userProvince.employee.tel}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/10">
                        <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <div className="text-[12px] text-slate-555 dark:text-slate-400">
                          <span className="font-medium">ເວລາຮັບເອກະສານ: </span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            {moment(displayDoc.userAcceptMeters.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 py-16 w-full">
                  <AlertTriangle className="w-12 h-12 text-slate-350 shrink-0" />
                  <span className="text-sm font-medium">ຍັງບໍ່ມີຂໍ້ມູນການຮັບວຽກ ຫຼື ສົ່ງຕໍ່</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
