"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Zap, CheckCircle2, Lock, Shield, Sparkles, AlertCircle } from "lucide-react";

export default function ResetPasswordView() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-6rem)] py-12 px-4 sm:px-6 overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
      
      {/* Background Embedded Styles */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background-size: 200% 200%;
          animation: gradientShift 10s ease infinite;
        }
        @keyframes floatUpDown {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: floatUpDown 5s ease-in-out infinite;
        }
        @keyframes floatUpDownReverse {
          0% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float-reverse {
          animation: floatUpDownReverse 6s ease-in-out infinite;
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
        .delay-400 { animation-delay: 400ms; }
      `}</style>

      {/* Floating Animated Orbs */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-400/20 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-gradient-to-tr from-pink-400/10 to-purple-400/10 blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-400/10 to-teal-400/10 blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

      <div 
        className="w-full max-w-[1000px] flex rounded-[2rem] overflow-hidden border shadow-2xl relative z-10 transition-all duration-500 hover:shadow-brand-glow/10"
        style={{
          background: "rgba(var(--card), 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(var(--border), 0.7)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.15), 0 0 40px -10px rgba(139, 92, 246, 0.05)",
        }}
      >
        {/* Visual Side */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden select-none">
          
          {/* Flowing Rich Mesh Gradient Background (Purple/Indigo theme) */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 opacity-95 animate-gradient-bg" />
          
          {/* Grid overlay */}
          <div className="absolute inset-0 z-0 mix-blend-overlay opacity-25" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Cg/%3E%3C/svg%3E')" }} />
          
          {/* Decorative light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/20 rounded-full blur-3xl pointer-events-none" />
          
          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-lg animate-float">
              <Zap className="w-5 h-5 text-white fill-white/10" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Admin<span className="text-white/80 font-light">OS</span>
            </span>
          </div>

          {/* Main Visual Message */}
          <div className="relative z-10 text-white my-auto pr-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-6 animate-float">
              <Shield className="w-3.5 h-3.5 text-purple-300 fill-purple-300/20" />
              <span>Advanced Account Security</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-5 leading-[1.15] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-100" style={{ fontFamily: "var(--font-display)" }}>
              Secure and recover your account.
            </h2>
            <p className="text-lg text-white/80 font-medium leading-relaxed max-w-md">
              We&apos;ll help you securely reset your credentials and get you back to managing your workspace in no time.
            </p>
          </div>
          
          {/* Security Badge */}
          <div className="relative z-10 mt-auto flex">
             <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/15 w-max max-w-sm flex items-start gap-4 text-left shadow-xl animate-float-reverse">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Enterprise Recovery</h3>
                  <p className="text-white/70 text-xs leading-normal">
                    Your password reset request is encrypted end-to-end to protect against unauthorized access.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-transparent">
          <div className="w-full max-w-sm mx-auto">
            {!success ? (
              <>
                {/* Header */}
                <div className="mb-10 text-center lg:text-left animate-fade-in-up">
                  <h1 className="text-4xl font-black mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-slate-300" style={{ fontFamily: "var(--font-display)" }}>
                    Reset Password
                  </h1>
                  <p className="text-sm font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
                    Enter your email address and we&apos;ll send you a secure link to reset your password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up delay-100">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "rgb(var(--text-secondary))" }}>
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-purple-500 group-focus-within:scale-105 transition-all duration-300" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-11 pr-3 py-3 rounded-xl text-sm transition-all duration-300 outline-none bg-slate-500/5 focus:bg-transparent border shadow-inner"
                        style={{ border: "1.5px solid rgba(var(--border), 0.7)", color: "rgb(var(--text-primary))" }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "rgb(139, 92, 246)";
                          e.target.style.boxShadow = "0 0 0 4px rgba(139, 92, 246, 0.15)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "rgba(var(--border), 0.7)";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="relative overflow-hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 shadow-lg cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/25"
                    style={{
                      boxShadow: email && !loading ? "0 8px 25px -5px rgba(139, 92, 246, 0.4)" : "none",
                    }}
                  >
                    {loading ? (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <>
                        <span>Send Secure Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="text-center animate-fade-in-up">
                <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  {/* Decorative glowing circles */}
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 animate-ping" />
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 relative z-10 shadow-inner">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-black mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-slate-300" style={{ fontFamily: "var(--font-display)" }}>
                  Check your inbox
                </h1>
                
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 rounded-2xl p-4.5 mb-8 text-left inline-flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">Link Sent Successfully</p>
                    <p className="text-sm font-medium leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>
                      We&apos;ve sent a password recovery link to <span className="font-extrabold" style={{ color: "rgb(var(--text-primary))" }}>{email}</span>. Please click the link inside to set up your new credentials.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { setSuccess(false); setEmail(""); }}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 border hover:bg-slate-500/5 active:scale-98 cursor-pointer shadow-sm hover:shadow-md"
                  style={{ borderColor: "rgba(var(--border), 0.8)", color: "rgb(var(--text-primary))" }}
                >
                  Try another email address
                </button>
              </div>
            )}

            {/* Back to Login link */}
            <div className="mt-8 text-center animate-fade-in-up delay-200">
              <Link href="/signin" className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 hover:underline transition-colors" style={{ color: "rgb(var(--brand))" }}>
                ← Back to Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
