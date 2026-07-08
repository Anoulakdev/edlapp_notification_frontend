"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { loadLeaflet } from "@/lib/utils";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (lat: number, lng: number) => void;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
}: LocationPickerModalProps) {
  const [lat, setLat] = useState("17.974855");
  const [lng, setLng] = useState("102.630867");
  const [gettingLocation, setGettingLocation] = useState(false);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let mapInstance: any = null;

    if (isOpen) {
      // Default Vientiane coordinates fallback
      const defaultLat = 17.974855;
      const defaultLng = 102.630867;

      const initMap = (initialLat: number, initialLng: number) => {
        setLat(initialLat.toFixed(6));
        setLng(initialLng.toFixed(6));

        loadLeaflet().then((L) => {
          const container = document.getElementById("picker-map-container");
          if (!container) return;

          // Create Leaflet Map instance centered on initial coords
          mapInstance = L.map("picker-map-container").setView([initialLat, initialLng], 16);
          mapRef.current = mapInstance;

          // Use Google Hybrid tiles (satellite imagery + labels)
          L.tileLayer("https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
            attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
          }).addTo(mapInstance);

          // Marker icons
          const DefaultIcon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });

          // Draggable Marker
          const marker = L.marker([initialLat, initialLng], {
            draggable: true,
            icon: DefaultIcon,
          }).addTo(mapInstance);
          markerRef.current = marker;

          // Dragend event listener
          marker.on("dragend", (e: any) => {
            const position = marker.getLatLng();
            setLat(position.lat.toFixed(6));
            setLng(position.lng.toFixed(6));
          });

          // Click map event listener
          mapInstance.on("click", (e: any) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            setLat(lat.toFixed(6));
            setLng(lng.toFixed(6));
          });

          // Fix leaflet rendering size issue inside modal
          setTimeout(() => {
            if (mapInstance) {
              mapInstance.invalidateSize();
            }
          }, 250);
        }).catch((err) => {
          console.error("Failed to load Leaflet in LocationPickerModal:", err);
        });
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            initMap(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.warn("Failed to get geolocation on init, fallback to default:", error.message);
            initMap(defaultLat, defaultLng);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        initMap(defaultLat, defaultLng);
      }
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isOpen]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          
          setLat(currentLat.toFixed(6));
          setLng(currentLng.toFixed(6));
          
          if (mapRef.current && markerRef.current) {
            markerRef.current.setLatLng([currentLat, currentLng]);
            mapRef.current.setView([currentLat, currentLng], 16);
          }
          setGettingLocation(false);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          alert("ບໍ່ສາມາດດຶງຂໍ້ມູນຕຳແໜ່ງໄດ້: " + error.message);
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert("ບຣາວເຊີຂອງທ່ານບໍ່ຮອງຮັບການດຶງຂໍ້ມູນຕຳແໜ່ງ Geolocation");
    }
  };

  const handleConfirm = () => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onSelectLocation(parsedLat, parsedLng);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            ເລືອກສະຖານທີ່ເທິງແຜນທີ່
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container Body */}
        <div className="relative flex-1 min-h-[500px]">
          <div id="picker-map-container" className="w-full h-[500px] z-10" />
          
          {/* GPS Pin Button */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation}
            className="absolute bottom-4 right-4 z-[1000] p-2.5 bg-white hover:bg-slate-50 text-blue-500 rounded-full shadow-lg border border-slate-200 transition-all flex items-center justify-center disabled:opacity-50"
            title="ຕຳແໜ່ງປັດຈຸບັນ"
          >
            {gettingLocation ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : (
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
            )}
          </button>
        </div>

        {/* Info panel and Actions Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3.5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              Lat: <span className="text-slate-700 font-mono">{lat}</span>
            </span>
            <span className="flex items-center gap-1.5">
              Lng: <span className="text-slate-700 font-mono">{lng}</span>
            </span>
          </div>

          <div className="flex justify-end gap-2 text-sm font-bold">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
            >
              ຍົກເລີກ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-sm"
            >
              ສົ່ງພິກັດ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
