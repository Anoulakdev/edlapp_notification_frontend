"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { axiosInstance, rawBackendUrl } from "@/lib/axiosInstance";
import {
  Users,
  Radio,
  Activity,
  Calendar,
  MapPin,
  Building2,
  FileX,
  AlertTriangle,
  Zap,
  Gauge,
  Layers,
  ChevronDown,
} from "lucide-react";
import { DocChartCard, MonthlyItem } from "./DocChartCard";

interface Province {
  id: number;
  province_name: string;
  province_code: string;
}

interface District {
  id: number;
  district_name: string;
  district_code: string;
  provinceCode: string;
}

interface DashAllResponse {
  year: number;
  turnoffDoc: MonthlyItem[];
  emergencyDoc: MonthlyItem[];
  cutpowerDoc: MonthlyItem[];
  registerMeter: MonthlyItem[];
}

export function DashboardView() {
  // Current user state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Privileged roles allowed to see user metrics: 1, 2, 3, 4
  const isPrivilegedUser = useMemo(() => {
    return !!(currentUser?.roleId && [1, 2, 3, 4].includes(Number(currentUser.roleId)));
  }, [currentUser?.roleId]);

  // Top metric states
  const [userOnlineCount, setUserOnlineCount] = useState<number | null>(null);
  const [userAllCount, setUserAllCount] = useState<number | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  // Filter states
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("all");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("all");

  // Metadata dropdown lists
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);

  // DashAll charts state
  const [dashData, setDashData] = useState<DashAllResponse | null>(null);
  const [loadingCharts, setLoadingCharts] = useState<boolean>(true);

  // Socket ref for real-time online count
  const socketRef = useRef<Socket | null>(null);

  // Generate last 10 years array: [currentYear, currentYear - 1, ..., currentYear - 9]
  const yearsList = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  }, [currentYear]);

  // 1. Fetch Current User Profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        if (res.data) {
          setCurrentUser(res.data);
          // If role 5 or 6 has fixed provinceId, set it
          if (res.data.provinceId) {
            setSelectedProvinceId(String(res.data.provinceId));
          }
          if (res.data.roleId === 6 && res.data.districtId) {
            setSelectedDistrictId(String(res.data.districtId));
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };
    fetchUser();
  }, []);

  // 2. Fetch User Online and User All Metrics (Only for Roles 1, 2, 3, 4)
  const fetchUserMetrics = useCallback(async () => {
    if (!currentUser?.roleId || ![1, 2, 3, 4].includes(Number(currentUser.roleId))) {
      return;
    }
    try {
      setLoadingMetrics(true);
      const [onlineRes, allRes] = await Promise.all([
        axiosInstance.get("/dashboards/useronline").catch((err) => {
          console.error("Failed to fetch useronline:", err);
          return { data: { useronline: 0 } };
        }),
        axiosInstance.get("/dashboards/userall").catch((err) => {
          console.error("Failed to fetch userall:", err);
          return { data: { userall: 0 } };
        }),
      ]);

      if (onlineRes?.data?.useronline !== undefined) {
        setUserOnlineCount(Number(onlineRes.data.useronline));
      }
      if (allRes?.data?.userall !== undefined) {
        setUserAllCount(Number(allRes.data.userall));
      }
    } catch (err) {
      console.error("Failed to fetch user metrics:", err);
    } finally {
      setLoadingMetrics(false);
    }
  }, [currentUser?.roleId]);

  useEffect(() => {
    if (isPrivilegedUser) {
      fetchUserMetrics();
    }
  }, [isPrivilegedUser, fetchUserMetrics]);

  // 3. Realtime Socket.IO Connection for Live Online Count (Only for Roles 1, 2, 3, 4)
  useEffect(() => {
    if (!isPrivilegedUser) return;

    const socketUrl =
      typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? window.location.origin
        : rawBackendUrl;

    const socket = io(`${socketUrl}/users`, {
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      // Ask gateway for initial count
      socket.emit("getUserOnlineCount", (res: any) => {
        if (res?.count !== undefined) {
          setUserOnlineCount(Number(res.count));
        }
      });
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // Listen to count broadcast events
    socket.on("userOnlineCountUpdated", (data: { count: number; total?: number }) => {
      if (data?.count !== undefined) {
        setUserOnlineCount(Number(data.count));
      }
    });

    socket.on("userOnlineUpdated", (data: { count: number; total?: number }) => {
      if (data?.count !== undefined) {
        setUserOnlineCount(Number(data.count));
      }
    });

    // Heartbeat fallback polling every 45 seconds
    const interval = setInterval(() => {
      axiosInstance
        .get("/dashboards/useronline")
        .then((res) => {
          if (res?.data?.useronline !== undefined) {
            setUserOnlineCount(Number(res.data.useronline));
          }
        })
        .catch(() => { });
    }, 30000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [isPrivilegedUser]);

  // 4. Fetch Provinces List
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axiosInstance.get("/provinces/selectprovince");
        if (Array.isArray(res.data)) {
          setProvinces(res.data);
        }
      } catch (err) {
        console.error("Failed to load provinces:", err);
      }
    };
    fetchProvinces();
  }, []);

  // 5. Fetch Districts when Province changes
  useEffect(() => {
    if (!selectedProvinceId || selectedProvinceId === "all" || provinces.length === 0) {
      setDistricts([]);
      if (currentUser?.roleId !== 6) {
        setSelectedDistrictId("all");
      }
      return;
    }

    const selectedProv = provinces.find((p) => String(p.id) === selectedProvinceId);
    if (!selectedProv) {
      setDistricts([]);
      setSelectedDistrictId("all");
      return;
    }

    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const res = await axiosInstance.get(
          `/districts/selectdistrict?provinceCode=${selectedProv.province_code}`
        );
        if (Array.isArray(res.data)) {
          setDistricts(res.data);
          // If currentUser is role 6 and has districtId, keep it selected
          if (currentUser?.roleId === 6 && currentUser?.districtId) {
            setSelectedDistrictId(String(currentUser.districtId));
          }
        } else {
          setDistricts([]);
        }
      } catch (err) {
        console.error("Failed to load districts:", err);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [selectedProvinceId, provinces, currentUser]);

  // 6. Fetch DashAll Chart Data
  const fetchDashAll = useCallback(async () => {
    try {
      setLoadingCharts(true);
      const params: Record<string, any> = {
        year: selectedYear,
      };

      if (selectedProvinceId && selectedProvinceId !== "all") {
        params.provinceId = Number(selectedProvinceId);
      }
      if (selectedDistrictId && selectedDistrictId !== "all") {
        params.districtId = Number(selectedDistrictId);
      }

      const res = await axiosInstance.get("/dashboards/dashall", { params });
      if (res.data) {
        setDashData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashall data:", err);
    } finally {
      setLoadingCharts(false);
    }
  }, [selectedYear, selectedProvinceId, selectedDistrictId]);

  useEffect(() => {
    fetchDashAll();
  }, [fetchDashAll]);

  // Determine if province/district selector should be disabled
  const isProvinceLocked =
    currentUser?.roleId === 5 || currentUser?.roleId === 6;
  const isDistrictLocked = currentUser?.roleId === 6;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6">
      {/* Top Banner & Header */}
      <div className="mb-4">
        <h1
          className="text-2xl md:text-3xl font-extrabold text-[rgb(var(--text-primary))]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ພາບລວມລະບົບ & ສະຖິຕິການບໍລິການ
        </h1>
      </div>

      {/* Metric Cards Row: UserOnline (Prominent) vs UserAll (Secondary) - Visible only for Roles 1, 2, 3, 4 */}
      {isPrivilegedUser && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* CARD 1: User Online (REAL-TIME) - Modern Vibrant Colorful */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-500/10 via-[rgb(var(--card))] to-teal-500/10 dark:from-emerald-950/40 dark:via-[rgb(var(--card))] dark:to-teal-950/20 border border-emerald-500/30 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/15 hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between">
            {/* Ambient Glowing Orbs */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-emerald-400/25 to-teal-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header: Icon + Title + Live Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/10 group-hover:scale-105 transition-transform duration-200">
                    <Radio className="w-6 h-6 animate-pulse" strokeWidth={2.4} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Real-time Status
                    </span>
                    <h3
                      className="text-base font-extrabold text-[rgb(var(--text-primary))]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      ຜູ້ກຳລັງອອນລາຍຕົວຈິງ
                    </h3>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide shadow-xs backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>ONLINE LIVE</span>
                </div>
              </div>

              {/* Metric Number Display */}
              <div className="flex items-baseline gap-2.5 my-2">
                <span
                  className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-emerald-300 dark:via-teal-200 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-xs"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {loadingMetrics ? (
                    <span className="inline-block animate-pulse text-[rgb(var(--text-secondary))]">...</span>
                  ) : (
                    (userOnlineCount ?? 0).toLocaleString()
                  )}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-500/25 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  ທ່ານ
                </span>
              </div>
            </div>

            {/* Bottom Info Strip */}
            <div className="relative z-10 mt-3 pt-3 border-t border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                ກຳລັງເຄື່ອນໄຫວໃນລະບົບ
              </span>
              <span className="font-bold text-emerald-800 dark:text-emerald-200">
                {userAllCount && userOnlineCount !== null
                  ? `${((userOnlineCount / (userAllCount || 1)) * 100).toFixed(1)}% ຂອງທັງໝົດ`
                  : "ກຳລັງເຊື່ອມຕໍ່..."}
              </span>
            </div>
          </div>

          {/* CARD 2: User All - Modern Vibrant Colorful */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-blue-500/10 via-[rgb(var(--card))] to-indigo-500/10 dark:from-blue-950/40 dark:via-[rgb(var(--card))] dark:to-indigo-950/20 border border-blue-500/30 dark:border-blue-500/40 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/15 hover:border-blue-500/50 transition-all duration-300 group flex flex-col justify-between">
            {/* Ambient Glowing Orbs */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-blue-400/25 to-indigo-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header: Icon + Title + Scope Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10 group-hover:scale-105 transition-transform duration-200">
                    <Users className="w-6 h-6" strokeWidth={2.4} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                      Total Registered
                    </span>
                    <h3
                      className="text-base font-extrabold text-[rgb(var(--text-primary))]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      ຜູ້ໃຊ້ງານທັງໝົດໃນລະບົບ
                    </h3>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-bold tracking-wide shadow-xs backdrop-blur-md">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>TOTAL USERS</span>
                </div>
              </div>

              {/* Metric Number Display */}
              <div className="flex items-baseline gap-2.5 my-2">
                <span
                  className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-300 dark:via-indigo-200 dark:to-cyan-300 bg-clip-text text-transparent drop-shadow-xs"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {loadingMetrics ? (
                    <span className="inline-block animate-pulse text-[rgb(var(--text-secondary))]">...</span>
                  ) : (
                    (userAllCount ?? 0).toLocaleString()
                  )}
                </span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-500/15 dark:bg-blue-500/25 px-2.5 py-1 rounded-lg border border-blue-500/30">
                  ທ່ານ
                </span>
              </div>
            </div>

            {/* Bottom Info Strip */}
            <div className="relative z-10 mt-3 pt-3 border-t border-blue-500/20 dark:border-blue-500/30 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                ບັນຊີທີ່ລົງທະບຽນທັງໝົດ
              </span>
              <span className="font-bold text-blue-800 dark:text-blue-200">
                ລວມທຸກສະຖານະ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FILTER CARD (CARD SELECT): Year (10 years back, default current year), Province, District */}
      <div className="rounded-3xl p-5 md:p-6 bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-sm mb-4">
        {/* 3 Select Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. SELECT YEAR: 10 years back, default current year */}
          <div>
            <label className="block text-xs font-semibold text-[rgb(var(--text-secondary))] mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>ເລືອກປີ *</span>
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full h-11 px-3.5 pr-10 appearance-none rounded-2xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] text-sm font-semibold text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    ປີ {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[rgb(var(--text-secondary))] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. SELECT PROVINCE (provinceId) */}
          <div>
            <label className="block text-xs font-semibold text-[rgb(var(--text-secondary))] mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>ເລືອກແຂວງ</span>
            </label>
            <div className="relative">
              <select
                value={selectedProvinceId}
                disabled={isProvinceLocked}
                onChange={(e) => {
                  setSelectedProvinceId(e.target.value);
                  setSelectedDistrictId("all");
                }}
                className={`w-full h-11 px-3.5 pr-10 appearance-none rounded-2xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] text-sm font-medium text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${isProvinceLocked ? "opacity-60 cursor-not-allowed bg-[rgb(var(--border))]/20" : "cursor-pointer"
                  }`}
              >
                {!isProvinceLocked && <option value="all">-- ທຸກແຂວງ --</option>}
                {provinces.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.province_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[rgb(var(--text-secondary))] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. SELECT DISTRICT (districtId) */}
          <div>
            <label className="block text-xs font-semibold text-[rgb(var(--text-secondary))] mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-500" />
              <span>ເລືອກເມືອງ</span>
            </label>
            <div className="relative">
              <select
                value={selectedDistrictId}
                disabled={isDistrictLocked || selectedProvinceId === "all" || loadingDistricts}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className={`w-full h-11 px-3.5 pr-10 appearance-none rounded-2xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] text-sm font-medium text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${isDistrictLocked || selectedProvinceId === "all" || loadingDistricts
                  ? "opacity-60 cursor-not-allowed bg-[rgb(var(--border))]/20"
                  : "cursor-pointer"
                  }`}
              >
                {!isDistrictLocked && (
                  <option value="all">
                    {loadingDistricts
                      ? "ກຳລັງໂຫຼດລາຍຊື່ເມືອງ..."
                      : selectedProvinceId === "all"
                        ? "-- ກະລຸນາເລືອກແຂວງກ່ອນ --"
                        : "-- ທຸກເມືອງໃນແຂວງນີ້ --"}
                  </option>
                )}
                {districts.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.district_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[rgb(var(--text-secondary))] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 BEAUTIFUL CHARTS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* CHART 1: TurnoffDoc (ແຈ້ງການມອດໄຟ) - Amber/Orange Theme */}
        <DocChartCard
          title="ແຈ້ງການມອດໄຟຕາມແຜນ"
          subtitle="ສະຖິຕິການມອດໄຟຕາມແຜນປະຈຳປີ"
          items={dashData?.turnoffDoc || []}
          colorTheme="amber"
          icon={FileX}
          loading={loadingCharts}
          year={selectedYear}
        />

        {/* CHART 2: EmergencyDoc (ແຈ້ງການມອດໄຟສຸກເສີນ) - Rose/Red Theme */}
        <DocChartCard
          title="ແຈ້ງການມອດໄຟສຸກເສີນ"
          subtitle="ສະຖິຕິການມອດໄຟສຸກເສີນປະຈຳປີ"
          items={dashData?.emergencyDoc || []}
          colorTheme="rose"
          icon={AlertTriangle}
          loading={loadingCharts}
          year={selectedYear}
        />

        {/* CHART 3: CutpowerDoc (ແຈ້ງການຕັດໄຟ) - Purple Theme */}
        <DocChartCard
          title="ແຈ້ງການຕັດໄຟ"
          subtitle="ສະຖິຕິການຕັດໄຟປະຈຳປີ"
          items={dashData?.cutpowerDoc || []}
          colorTheme="purple"
          icon={Zap}
          loading={loadingCharts}
          year={selectedYear}
        />

        {/* CHART 4: RegisterMeter (ຄຳຮ້ອງຂໍຕິດຕັ້ງໝໍ້ນັບໄຟ) - Cyan Theme */}
        <DocChartCard
          title="ຄຳຮ້ອງຂໍຕິດຕັ້ງໝໍ້ນັບໄຟໃໝ່"
          subtitle="ສະຖິຕິຄຳຮ້ອງຂໍຕິດຕັ້ງໝໍ້ນັບໄຟໃໝ່ປະຈຳປີ"
          items={dashData?.registerMeter || []}
          colorTheme="cyan"
          icon={Gauge}
          loading={loadingCharts}
          year={selectedYear}
        />
      </div>
    </div>
  );
}
