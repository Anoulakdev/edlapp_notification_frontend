"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Calendar, Clock, MapPin, User, FileText } from "lucide-react";
import moment from "moment";
import { loadLeaflet, ASSET_BASE_URL } from "@/lib/utils";
import { EmergencyDoc } from "@/schemas/emergency";

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

interface ViewEmergencyModalProps {
  open: boolean;
  onClose: () => void;
  selectedDoc: EmergencyDoc | null;
}

export function ViewEmergencyModal({ open, onClose, selectedDoc }: ViewEmergencyModalProps) {
  const viewMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const userLocRef = useRef<{ lat: number; lng: number } | null>(null);

  const [hasUserLoc, setHasUserLoc] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);

  const viewUrl = selectedDoc?.emergencyImg
    ? `${ASSET_BASE_URL}/upload/emergency/${selectedDoc.emergencyImg}`
    : "";
  const viewTitle = selectedDoc?.title || "";

  // Reset view map state on close
  useEffect(() => {
    if (!open) {
      setHasUserLoc(false);
      setHasRoute(false);
      userLocRef.current = null;
      userMarkerRef.current = null;
      routePolylineRef.current = null;
    }
  }, [open]);

  const handleCenterTarget = () => {
    if (viewMapRef.current && selectedDoc?.lat && selectedDoc?.lng) {
      viewMapRef.current.setView([parseFloat(String(selectedDoc.lat)), parseFloat(String(selectedDoc.lng))], 16);
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

    if (open && selectedDoc?.lat && selectedDoc?.lng) {
      const initialLat = parseFloat(String(selectedDoc.lat));
      const initialLng = parseFloat(String(selectedDoc.lng));

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
          targetMarker.bindPopup("<b>ຈຸດເກີດເຫດມອດໄຟສຸກເສີນ</b>").openPopup();

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
          console.error("Failed to load Leaflet for view map:", err);
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
    };
  }, [open, selectedDoc]);

  return (
    <Modal open={open} onClose={onClose} title={`ເບິ່ງຂໍ້ມູນ: ແຈ້ງການມອດໄຟສຸກເສີນ`} size="2xl">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-[75vh] max-h-[75vh] overflow-hidden" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        {/* Left Side: Data info */}
        <div className="flex-1 lg:col-span-5 flex flex-col gap-5 overflow-y-auto pr-2 scrollbar-thin">

          {/* Title & Description */}
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-snug break-all">
              {selectedDoc?.title}
            </h3>
            {selectedDoc?.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                {selectedDoc.description}
              </p>
            )}
          </div>

          {/* Date & Time Panel */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">ວັນທີມອດໄຟສຸກເສີນ</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                  {selectedDoc ? moment(selectedDoc.emergencyDate).format("DD/MM/YYYY") : "-"}
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">ເວລາ</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                  {selectedDoc?.startTime && selectedDoc?.endTime ? `${selectedDoc.startTime} - ${selectedDoc.endTime}` : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Location Panel */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              ເຂດພື້ນທີ່ມອດໄຟສຸກເສີນ
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                <span className="text-xs text-slate-400 mb-0.5">ແຂວງ</span>
                <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                  {selectedDoc?.province?.province_name || "-"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                <span className="text-xs text-slate-400 mb-0.5">ເມືອງ</span>
                <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                  {selectedDoc?.district?.district_name || "-"}
                </span>
              </div>
              {selectedDoc?.lat !== undefined && selectedDoc?.lat !== null && (
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                  <span className="text-xs text-slate-400 mb-0.5">Latitude (ເສັ້ນຂະໜານ)</span>
                  <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                    {selectedDoc.lat}
                  </span>
                </div>
              )}
              {selectedDoc?.lng !== undefined && selectedDoc?.lng !== null && (
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
                  <span className="text-xs text-slate-400 mb-0.5">Longitude (ເສັ້ນແວງ)</span>
                  <span className="text-sm font-bold text-slate-750 dark:text-slate-300">
                    {selectedDoc.lng}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Affected Villages */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              ບ້ານທີ່ແຈ້ງການມອດໄຟສຸກເສີນ ({selectedDoc?.emergencyAddresses?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1 border border-slate-100 dark:border-slate-800/60 rounded-xl bg-slate-50/20 dark:bg-slate-950/10">
              {selectedDoc?.emergencyAddresses && selectedDoc.emergencyAddresses.length > 0 ? (
                selectedDoc.emergencyAddresses.map((addr, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20"
                  >
                    {addr.village?.village_name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-455 dark:text-slate-500 p-2 italic">
                  ບໍ່ມີຂໍ້ມູນບ້ານທີ່ແຈ້ງການມອດໄຟສຸກເສີນ
                </span>
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
                {selectedDoc?.createdBy?.employee
                  ? `${selectedDoc.createdBy.employee.first_name} ${selectedDoc.createdBy.employee.last_name}`
                  : selectedDoc?.createdBy?.username || "-"}
              </span>
              {selectedDoc?.createdBy?.employee?.emp_code && (
                <span className="text-xs text-slate-450 dark:text-slate-500">
                  ລະຫັດພະນັກງານ: {selectedDoc.createdBy.employee.emp_code}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Map & File Preview */}
        <div className="flex-1 lg:col-span-7 h-[70vh] lg:h-full flex flex-col gap-4 overflow-hidden">
          {/* Top: Map */}
          <div className="flex-[1.5] min-h-[250px] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/40 relative">
            {selectedDoc?.lat && selectedDoc?.lng ? (
              <>
                <div id="view-map-container" className="w-full h-full z-10" />

                {/* Floating Action Controls */}
                <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
                  {/* Fit Route Button */}
                  {hasRoute && (
                    <button
                      type="button"
                      onClick={handleFitRoute}
                      className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                      title="ເບິ່ງເສັ້ນທາງທັງໝົດ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </button>
                  )}
                  {/* Center on Outage Button */}
                  <button
                    type="button"
                    onClick={handleCenterTarget}
                    className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-250 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                    title="ຈຸດເກີດເຫດ"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  {/* Center on User Location Button */}
                  {hasUserLoc && (
                    <button
                      type="button"
                      onClick={handleCenterUser}
                      className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
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

          {/* Bottom: File Preview */}
          <div className="flex-1 min-h-[150px] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/40 flex flex-col">
            {viewUrl ? (
              <div className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
                <img
                  src={viewUrl}
                  alt={viewTitle}
                  className="max-w-full h-auto max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <FileText className="w-10 h-10" />
                <span className="text-sm">ບໍ່ພົບຮູບພາບ</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
