"use client";

import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, Bolt, ArrowRight, Shield, Bell, Activity, CheckCircle2 } from "lucide-react";
import { signInSchema } from "@/schemas/auth";
import axios from "axios";

export default function SignInView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [checking, setChecking] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const roleId = data?.roleId;
          if (roleId === 1) {
            window.location.href = "/dashboard";
          } else if (roleId === 2) {
            window.location.href = "/users";
          } else if (roleId === 3) {
            window.location.href = "/turnoff";
          } else if (roleId === 4) {
            window.location.href = "/users";
          } else if (roleId === 5) {
            window.location.href = "/turnoff";
          } else {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
            } catch (err) {
              console.error("Logout error in checkAuth:", err);
            }
            setChecking(false);
          }
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error("Failed to check auth:", err);
        setChecking(false);
      }
    };
    checkAuth();

    // Check remembered username on mount
    if (typeof window !== "undefined") {
      const savedUsername = localStorage.getItem("rememberedUsername");
      if (savedUsername) {
        setUsername(savedUsername);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    const result = signInSchema.safeParse({ username, password });
    if (!result.success) {
      const fieldErrors: { username?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/login", { username, password });
      if (res.data.success) {
        // Save or remove remembered username based on checkbox state
        if (typeof window !== "undefined") {
          if (rememberMe) {
            localStorage.setItem("rememberedUsername", username);
          } else {
            localStorage.removeItem("rememberedUsername");
          }
        }

        const roleId = res.data.user?.roleId;
        if (roleId === 1) {
          window.location.href = "/dashboard";
        } else if (roleId === 2) {
          window.location.href = "/users";
        } else if (roleId === 3) {
          window.location.href = "/turnoff";
        } else if (roleId === 4) {
          window.location.href = "/users";
        } else if (roleId === 5) {
          window.location.href = "/turnoff";
        } else {
          try {
            await fetch("/api/auth/logout", { method: "POST" });
          } catch (err) {
            console.error("Logout error:", err);
          }
          setGeneralError("ບັນຊີຂອງທ່ານບໍ່ມີສິດເຂົ້າໃຊ້ງານລະບົບເວັບໄຊ້, ກະລຸນາເຂົ້າໃຊ້ງານຜ່ານແອັບພລິເຄຊັນເທິງມືຖື");
        }
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ຫາລະບົບ";
      setGeneralError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">ກຳລັງກວດສອບສິດການເຂົ້າໃຊ້...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lao-font-container relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 overflow-hidden login-page-bg">

      {/* Background Embedded Styles */}
      <style>{`
        .lao-font-container, .lao-font-container * {
          font-family: 'Noto Sans Lao', sans-serif !important;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
        }
        @keyframes floatUpDown {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: floatUpDown 6s ease-in-out infinite;
        }
        @keyframes floatUpDownReverse {
          0% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float-reverse {
          animation: floatUpDownReverse 7s ease-in-out infinite;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        @keyframes cardGlowShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-card-bg {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.85) 0%, 
            rgba(239, 246, 255, 0.9) 30%, 
            rgba(245, 243, 255, 0.9) 70%,
            rgba(255, 255, 255, 0.85) 100%
          );
          background-size: 300% 300%;
          animation: cardGlowShift 8s ease infinite;
        }
        .dark .animate-card-bg {
          background: linear-gradient(135deg, 
            rgba(15, 23, 42, 0.85) 0%, 
            rgba(23, 37, 84, 0.75) 30%, 
            rgba(8, 47, 73, 0.8) 70%,
            rgba(15, 23, 42, 0.85) 100%
          );
          background-size: 300% 300%;
          animation: cardGlowShift 8s ease infinite;
        }
        
        /* New Custom Background Styles */
        @keyframes flowBackground {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .login-page-bg {
          background: linear-gradient(-45deg, #e0f2fe, #e0e7ff, #fae8ff, #f0fdfa);
          background-size: 400% 400%;
          animation: flowBackground 15s ease infinite;
        }
        .dark .login-page-bg {
          background: linear-gradient(-45deg, #090d16, #0c1020, #1a0b2e, #06181e);
          background-size: 400% 400%;
          animation: flowBackground 15s ease infinite;
        }
        
        @keyframes float-orb-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float-orb-2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float-orb-3 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-10px, -30px) scale(1.05); }
          66% { transform: translate(25px, 15px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-float-orb-1 {
          animation: float-orb-1 25s ease-in-out infinite;
        }
        .animate-float-orb-2 {
          animation: float-orb-2 30s ease-in-out infinite;
        }
        .animate-float-orb-3 {
          animation: float-orb-3 28s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Animated Orbs */}
      <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-[100px] animate-float-orb-1 pointer-events-none" />
      <div className="absolute -bottom-[15%] -right-[15%] w-[65%] h-[65%] rounded-full bg-gradient-to-tr from-cyan-400/20 to-indigo-500/20 blur-[130px] animate-float-orb-2 pointer-events-none" />
      <div className="absolute top-[25%] left-[20%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-violet-500/15 to-pink-500/15 blur-[95px] animate-float-orb-3 pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.04) 1px, transparent 0),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.04) 1px, transparent 0)
          `,
          backgroundSize: '32px 32px, 32px 32px'
        }}
      />

      <div
        className="w-full max-w-[1000px] flex rounded-[2rem] overflow-hidden border shadow-2xl relative z-10 transition-all duration-500 animate-card-bg"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(var(--border), 0.7)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.15), 0 0 40px -10px rgba(29, 78, 216, 0.05)",
        }}
      >
        {/* Visual Side (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden select-none">

          {/* Flowing Rich Mesh Gradient Background (EDL Electric Blue / Cyan) */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 opacity-95 animate-gradient-bg" />

          {/* Subtle Grid overlay for power grid theme */}
          <div className="absolute inset-0 z-0 mix-blend-overlay opacity-15" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M15 0L15 30M0 15L30 15\" fill=\"none\" stroke=\"%23ffffff\" stroke-width=\"1\" stroke-opacity=\"0.3\"/%3E%3C/svg%3E')" }} />

          {/* Decorative soft glowing light in the center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Logo - EDL Corporate style */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 animate-float shrink-0 flex items-center justify-center">
              <img src="/icon.png" alt="EDL Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-2xl font-black text-white tracking-tight leading-tight whitespace-nowrap">
                EDL
              </span>
              <span className="text-xs font-semibold text-cyan-100/80 tracking-wider uppercase mt-0.5 whitespace-nowrap">
                Electricite du Laos
              </span>
            </div>
          </div>

          {/* Middle Main Content */}
          <div className="relative z-10 text-white my-auto pr-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-6 animate-float">
              <Bell className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300/20" />
              <span>ລະບົບແຈ້ງເຕືອນສະຖານະໄຟຟ້າ (Electricity Status Notification)</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-5 leading-normal tracking-tight text-white py-1">
              ບໍລິການສົ່ງແຈ້ງເຕືອນມອດໄຟ, ມອດໄຟສຸກເສີນ ແລະ ອື່ນໆ
            </h2>
            <p className="text-sm text-white/80 font-medium leading-relaxed max-w-sm">
              ລະບົບຈັດການເອກະສານແຈ້ງການຕ່າງໆ ແລະ ສົ່ງແຈ້ງເຕືອນແບບທັນເຫດການ ໄປຍັງແອັບພລິເຄຊັນໂທລະສັບມືຖືຂອງຜູ້ໃຊ້ບໍລິການ.

            </p>
          </div>

          {/* Bottom Stats and Badges */}
          <div className="relative z-10 mt-auto flex flex-col gap-4">
            {/* Micro-badges */}
            <div className="flex items-center gap-4 text-xs text-white/60 font-semibold pl-1">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-cyan-300" /> ຄວາມປອດໄພສູງ</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-cyan-300" /> ລາຍງານ Real-time</span>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-transparent relative">

          {/* Decorative glowing gradient behind the form */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-r-[2rem] z-0">
            <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/10 via-cyan-400/5 to-transparent blur-3xl animate-pulse duration-10000" />
            <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-400/10 via-indigo-500/5 to-transparent blur-3xl animate-pulse duration-7000" />
          </div>

          <div className="w-full max-w-sm mx-auto relative z-10">
            {/* Form Header */}
            <div className="mb-10 text-center lg:text-left animate-fade-in-up delay-100">
              <h1 className="text-3xl font-black mb-3 tracking-tight text-blue-800 dark:text-cyan-400 py-1 leading-normal">
                ເຂົ້າສູ່ລະບົບ
              </h1>
              <p className="text-sm font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
                ປ້ອນຂໍ້ມູນຜູ້ໃຊ້ຂອງທ່ານເພື່ອເຂົ້າສູ່ລະບົບ
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up delay-200">

              {/* Username Input */}
              <div>
                <label htmlFor="signin-username" className="block text-xs font-bold uppercase tracking-wider mb-2.5 transition-colors" style={{ color: "rgb(var(--text-secondary))" }}>
                  ຊື່ຜູ້ໃຊ້
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-500 group-focus-within:scale-105 transition-all duration-300" />
                  </div>
                  <input
                    id="signin-username"
                    type="text"
                    required
                    placeholder="ປ້ອນຊື່ຜູ້ໃຊ້ຂອງທ່ານ"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                    }}
                    className="block w-full pl-11 pr-3 py-3 rounded-xl text-sm transition-all duration-300 outline-none bg-slate-500/5 focus:bg-transparent border shadow-inner"
                    style={{
                      borderColor: errors.username ? "rgb(var(--danger))" : "rgba(var(--border), 0.7)",
                      color: "rgb(var(--text-primary))",
                    }}
                    onFocus={(e) => {
                      if (!errors.username) {
                        e.target.style.borderColor = "rgb(29, 78, 216)";
                        e.target.style.boxShadow = "0 0 0 4px rgba(29, 78, 216, 0.15)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.username) {
                        e.target.style.borderColor = "rgba(var(--border), 0.7)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                </div>
                {errors.username && <p className="text-xs mt-1.5 font-semibold animate-slide-down" style={{ color: "rgb(var(--danger))" }}>{errors.username}</p>}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label htmlFor="signin-password" className="text-xs font-bold uppercase tracking-wider transition-colors" style={{ color: "rgb(var(--text-secondary))" }}>
                    ລະຫັດຜ່ານ
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-500 group-focus-within:scale-105 transition-all duration-300" />
                  </div>
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className="block w-full pl-11 pr-11 py-3 rounded-xl text-sm transition-all duration-300 outline-none bg-slate-500/5 focus:bg-transparent border shadow-inner"
                    style={{
                      borderColor: errors.password ? "rgb(var(--danger))" : "rgba(var(--border), 0.7)",
                      color: "rgb(var(--text-primary))",
                    }}
                    onFocus={(e) => {
                      if (!errors.password) {
                        e.target.style.borderColor = "rgb(29, 78, 216)";
                        e.target.style.boxShadow = "0 0 0 4px rgba(29, 78, 216, 0.15)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.password) {
                        e.target.style.borderColor = "rgba(var(--border), 0.7)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1.5 font-semibold animate-slide-down" style={{ color: "rgb(var(--danger))" }}>{errors.password}</p>}
              </div>

              {/* Remember Me Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-3 cursor-pointer group w-max select-none">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="w-5 h-5 rounded border-2 transition-all duration-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 group-hover:border-blue-500" style={{ borderColor: "rgba(var(--border), 0.8)" }} />
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-300" viewBox="0 0 14 10" fill="none">
                      <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold transition-colors duration-300 group-hover:text-[rgb(var(--text-primary))]" style={{ color: "rgb(var(--text-secondary))" }}>
                    ຈົດຈຳຊື່ຜູ້ໃຊ້ໃນອຸປະກອນນີ້
                  </span>
                </label>
              </div>

              {/* General Error Display */}
              {generalError && (
                <div className="p-3.5 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-500 animate-slide-down">
                  {generalError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 shadow-lg cursor-pointer bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 hover:shadow-blue-500/25"
                style={{
                  boxShadow: "0 8px 25px -5px rgba(29, 78, 216, 0.4)",
                }}
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <>
                    <span>ເຂົ້າສູ່ລະບົບ</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
