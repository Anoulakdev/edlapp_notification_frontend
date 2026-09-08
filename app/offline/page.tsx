"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, ArrowLeft, Zap, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== "undefined" ? navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically reload or redirect when connection is restored
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setTimeout(() => {
        setIsRetrying(false);
      }, 1200);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
      style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
    >
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 max-w-md w-full rounded-3xl p-8 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-blue-500/5 text-center">
        {/* Top Logo / Brand Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Electricite du Laos</span>
        </div>

        {/* Offline Icon Container with Pulse effect */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-red-500/10 dark:bg-red-500/20 animate-ping opacity-60" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/15 to-red-500/15 dark:from-amber-500/25 dark:to-red-500/25 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-500 dark:text-red-400 shadow-inner">
            <WifiOff className="w-10 h-10" />
          </div>
        </div>

        {/* Status Text */}
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
          {isOnline ? "ກັບມາເຊື່ອມຕໍ່ແລ້ວ!" : "ບໍ່ມີການເຊື່ອມຕໍ່ອິນເຕີເນັດ"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          {isOnline
            ? "ກຳລັງໂຫຼດລະບົບຄືນໃໝ່ອັດຕະໂນມັດ..."
            : "ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ເຄືອຂ່າຍ Wi-Fi ຫຼື ຂໍ້ມູນມືຖື (Cellular) ຂອງທ່ານ ແລ້ວລອງໃໝ່ອີກຄັ້ງ"}
        </p>

        {/* Connection status badge */}
        <div className="flex items-center justify-center gap-2 mb-8 py-2 px-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span
            className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
          />
          <span>{isOnline ? "ກວດພົບສັນຍານອິນເຕີເນັດ" : "ສະຖານະ: Offline"}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-600/25 disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            <span>{isRetrying ? "ກຳລັງກວດສອບ..." : "ລອງໃໝ່ອີກຄັ້ງ"}</span>
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ກັບໄປໜ້າຫຼັກ</span>
          </Link>
        </div>

        {/* PWA Notice footer */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>EDL Contact Center Progressive Web App</span>
        </div>
      </div>
    </div>
  );
}
