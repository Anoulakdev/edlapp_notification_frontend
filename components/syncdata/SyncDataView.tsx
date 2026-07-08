"use client";

import { useState } from "react";
import { RefreshCw, Building2, Users, Briefcase, Database, MapPin } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";

const SYNC_ITEMS = [
  { id: "department", title: "Departments", endpoint: "/departments", icon: Building2 },
  { id: "division", title: "Divisions", endpoint: "/divisions", icon: Building2 },
  { id: "office", title: "Offices", endpoint: "/offices", icon: Building2 },
  { id: "unit", title: "Units", endpoint: "/units", icon: Building2 },
  { id: "positionGroup", title: "Position Groups", endpoint: "/positiongroups", icon: Briefcase },
  { id: "positionCode", title: "Position Codes", endpoint: "/positioncodes", icon: Briefcase },
  { id: "position", title: "Positions", endpoint: "/positions", icon: Briefcase },
  { id: "employee", title: "Employees", endpoint: "/employees/sync", icon: Users },
  { id: "province", title: "Provinces", endpoint: "/provinces", icon: MapPin },
  { id: "district", title: "Districts", endpoint: "/districts", icon: MapPin },
  { id: "village", title: "Villages", endpoint: "/villages", icon: MapPin },
];

export default function SyncDataView() {
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [overallProgress, setOverallProgress] = useState<number | null>(null);
  const [currentSyncItem, setCurrentSyncItem] = useState<string | null>(null);

  const handleSync = async (id: string, title: string, endpoint: string) => {
    setSyncing((prev) => ({ ...prev, [id]: true }));
    try {
      await axiosInstance.post(endpoint);
      toast.success(`Sync ຂໍ້ມູນ ${title} ສຳເລັດ`);
    } catch (error) {
      console.error(`Error syncing ${title}:`, error);
      toast.error(`ເກີດຂໍ້ຜິດພາດໃນການ Sync ${title}`);
    } finally {
      setSyncing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSyncAll = async () => {
    let hasError = false;
    setOverallProgress(0);

    for (let i = 0; i < SYNC_ITEMS.length; i++) {
      const item = SYNC_ITEMS[i];
      setCurrentSyncItem(item.title);
      setSyncing((prev) => ({ ...prev, [item.id]: true }));
      try {
        await axiosInstance.post(item.endpoint);
      } catch (error) {
        console.error(`Error syncing ${item.title}:`, error);
        hasError = true;
      } finally {
        setSyncing((prev) => ({ ...prev, [item.id]: false }));
      }
      setOverallProgress(Math.round(((i + 1) / SYNC_ITEMS.length) * 100));
    }

    setCurrentSyncItem(null);
    if (hasError) {
      toast.warning("Sync ສຳເລັດບາງສ່ວນ, มีບາງລາຍການຜິດພາດ");
    } else {
      toast.success("Sync ຂໍ້ມູນທັງໝົດສຳເລັດ");
    }

    setTimeout(() => {
      setOverallProgress(null);
    }, 2000);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-indeterminate {
          animation: indeterminate 1.5s infinite ease-in-out;
        }
      `}</style>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold flex items-center gap-3 mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            <Database className="w-8 h-8" style={{ color: "rgb(var(--brand))" }} />
            Sync ຂໍ້ມູນ
          </h1>
        </div>
        <button
          onClick={handleSyncAll}
          disabled={Object.values(syncing).some(Boolean)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-sm"
          style={{ background: "linear-gradient(135deg,rgb(16,185,129),rgb(5,150,105))" }}
        >
          <RefreshCw className={`w-4 h-4 ${Object.values(syncing).some(Boolean) ? 'animate-spin' : ''}`} />
          Sync ທັງໝົດ
        </button>
      </div>

      {/* Overall Progress Banner */}
      {overallProgress !== null && (
        <div className="mb-8 p-6 rounded-2xl shadow-sm transition-all" style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                ກຳລັງ Sync ຂໍ້ມູນທັງໝົດ...
              </p>
              <p className="text-sm mt-1" style={{ color: "rgb(var(--text-secondary))" }}>
                {currentSyncItem ? `ກຳລັງດຶງຂໍ້ມູນ: ${currentSyncItem}` : "ສຳເລັດແລ້ວ"}
              </p>
            </div>
            <span className="text-3xl font-black" style={{ color: "rgb(var(--brand))" }}>
              {overallProgress}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "rgb(var(--brand)/0.15)" }}>
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%`, background: "linear-gradient(90deg, rgb(16,185,129), rgb(5,150,105))" }}
            />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SYNC_ITEMS.map((item) => {
          const isSyncing = syncing[item.id];
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="relative overflow-hidden p-5 rounded-2xl flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-md"
              style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
            >
              {/* Indeterminate loading bar */}
              {isSyncing && (
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(var(--brand), 0.15)" }}>
                  <div
                    className="h-full rounded-r-full w-1/2 animate-indeterminate"
                    style={{ background: "rgb(var(--brand))" }}
                  />
                </div>
              )}

              <div className="flex items-start justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgb(var(--brand)/0.1)", color: "rgb(var(--brand))" }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <button
                  onClick={() => handleSync(item.id, item.title, item.endpoint)}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                  style={{
                    background: "rgb(var(--brand))",
                    color: "white"
                  }}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ກຳລັງ Sync...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sync
                    </>
                  )}
                </button>
              </div>
              <div>
                <h3 className="font-bold text-base" style={{ color: "rgb(var(--text-primary))" }}>
                  {item.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
