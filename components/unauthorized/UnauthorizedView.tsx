"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define default routes for navigation
const ROLE_DEFAULT_PAGES: Record<number, string> = {
  1: "/dashboard",
  2: "/users",
  3: "/turnoff",
  4: "/users",
};

export default function UnauthorizedView() {
  const [defaultPage, setDefaultPage] = useState("/");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Check cached roleId first for immediate fallback
    const cachedRoleId = typeof window !== "undefined" ? localStorage.getItem("userRoleId") : null;
    if (cachedRoleId) {
      const role = parseInt(cachedRoleId, 10);
      if (ROLE_DEFAULT_PAGES[role]) {
        setDefaultPage(ROLE_DEFAULT_PAGES[role]);
      }
      setLoading(false);
    }

    // 2. Fetch server-side role to double check
    const fetchUserRole = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const role = data?.roleId;
          if (role && ROLE_DEFAULT_PAGES[role]) {
            setDefaultPage(ROLE_DEFAULT_PAGES[role]);
            localStorage.setItem("userRoleId", String(role));
          }
        }
      } catch (err) {
        console.error("Failed to revalidate role on unauthorized page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("userRoleId");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    router.push("/signin");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] px-4 sm:px-6 relative overflow-hidden" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      {/* Embedded High-Fidelity Styles */}
      <style>{`
        @keyframes float1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -60px) scale(1.15); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float2 {
          0% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-50px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1.1); }
        }
        @keyframes float3 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(60px, 30px) scale(1.08); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes borderPulse {
          0% { border-color: rgba(239, 68, 68, 0.25); box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.1), 0 0 30px rgba(239, 68, 68, 0.04); }
          50% { border-color: rgba(239, 68, 68, 0.45); box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.12), 0 0 50px rgba(239, 68, 68, 0.12); }
          100% { border-color: rgba(239, 68, 68, 0.25); box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.1), 0 0 30px rgba(239, 68, 68, 0.04); }
        }
        @keyframes textGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes iconAlert {
          0%, 80%, 100% { transform: rotate(0deg) scale(1); }
          85% { transform: rotate(-14deg) scale(1.08); }
          90% { transform: rotate(12deg) scale(1.08); }
          95% { transform: rotate(-8deg) scale(1.04); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes radarPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .animate-float-1 { animation: float1 22s ease-in-out infinite; }
        .animate-float-2 { animation: float2 26s ease-in-out infinite; }
        .animate-float-3 { animation: float3 24s ease-in-out infinite; }
        .animate-border-pulse { animation: borderPulse 5s ease-in-out infinite; }
        .animate-text-glow {
          background-size: 200% auto;
          animation: textGlow 8s ease infinite;
        }
        .animate-icon-alert { animation: iconAlert 4s cubic-bezier(0.25, 0.8, 0.25, 1) infinite; }
        .animate-fade-in-up { opacity: 0; animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-radar { animation: radarPulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>

      {/* Grid pattern overlay (consistent with corporate brand grid layout) */}
      <div className="absolute inset-0 mix-blend-overlay opacity-15 pointer-events-none select-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M20 0L20 40M0 20L40 20\" fill=\"none\" stroke=\"%2364748b\" stroke-width=\"0.5\" stroke-opacity=\"0.3\"/%3E%3C/svg%3E')" }} />

      {/* Beautiful Mesh Background Orbs */}
      <div className="absolute top-1/6 left-1/5 w-80 h-80 rounded-full bg-red-500/15 blur-[120px] pointer-events-none animate-float-1" />
      <div className="absolute bottom-1/5 right-1/4 w-96 h-96 rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none animate-float-2" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none animate-float-3" />

      {/* Main Glassmorphic Card */}
      <div
        className="w-full max-w-lg p-8 sm:p-12 rounded-[2.5rem] border text-center relative z-10 transition-all duration-300 bg-white/75 dark:bg-slate-900/60 backdrop-blur-[24px] animate-border-pulse"
        style={{
          borderColor: "rgba(var(--border), 0.7)",
        }}
      >
        {/* Animated Security Live Badge */}
        <div className="absolute top-6 right-8 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/5 dark:bg-slate-400/5 border border-slate-500/10 text-[10px] font-semibold text-slate-500 dark:text-slate-400 select-none animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span>SECURE SYSTEM</span>
        </div>

        {/* Animated Warning Shield Container */}
        <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center animate-fade-in-up delay-100">
          {/* Double pulsing glow rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/10 to-rose-500/10 animate-ping duration-1500" />
          <div className="absolute -inset-4 rounded-full bg-red-600/5 animate-pulse duration-2500" />
          
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/35 relative z-10 animate-icon-alert">
            <ShieldAlert className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Content Section */}
        <h1 className="text-3xl font-black mb-4 tracking-tight bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent py-1 leading-normal animate-text-glow animate-fade-in-up delay-200">
          ປະຕິເສດການເຂົ້າເຖິງ
        </h1>
        <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-10 leading-relaxed animate-fade-in-up delay-200">
          ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້
        </p>

        {/* Micro-interaction Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <Link
            href={loading ? "#" : defaultPage}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 active:translate-y-0 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 shadow-lg hover:shadow-blue-500/30 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>ກັບຄືນໜ້າຫຼັກ</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:bg-slate-500/5 hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ອອກຈາກລະບົບ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
