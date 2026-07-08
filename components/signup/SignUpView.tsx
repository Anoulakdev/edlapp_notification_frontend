"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Zap, ArrowRight, Check, Sparkles, Shield, Trophy } from "lucide-react";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

const Chrome = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" x2="12" y1="8" y2="8" /><line x1="3.95" x2="8.54" y1="6.06" y2="14" /><line x1="10.88" x2="15.46" y1="21.94" y2="14" /></svg>
);

import { signUpSchema } from "@/schemas/auth";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p), label: "One number or symbol" },
];

export default function SignUpView() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    const result = signUpSchema.safeParse({ firstName, lastName, email, password });
    if (!result.success) {
      const fieldErrors: { firstName?: string; lastName?: string; email?: string; password?: string } = {};
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
    // TODO: implement actual sign-up logic here
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1800);
  };

  const strengthScore = PASSWORD_RULES.filter(r => r.test(password)).length;
  const strengthColor = ["rgb(var(--danger))", "rgb(var(--warning))", "rgb(var(--warning))", "rgb(var(--success))"][strengthScore];

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
        .delay-500 { animation-delay: 500ms; }
      `}</style>

      {/* Floating Animated Orbs */}
      <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-gradient-to-br from-teal-400/10 to-indigo-400/20 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-400/20 to-pink-400/10 blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-gradient-to-tr from-emerald-400/10 to-teal-400/10 blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

      <div
        className="w-full max-w-[1000px] flex flex-row-reverse rounded-[2rem] overflow-hidden border shadow-2xl relative z-10 transition-all duration-500 hover:shadow-brand-glow/10"
        style={{
          background: "rgba(var(--card), 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(var(--border), 0.7)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.15), 0 0 40px -10px rgba(20, 184, 166, 0.05)",
        }}
      >
        {/* Visual Side (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden select-none">
          
          {/* Flowing Rich Mesh Gradient Background (Teal focused to distinguish from login) */}
          <div className="absolute inset-0 z-0 bg-gradient-to-bl from-teal-500 via-emerald-600 to-indigo-600 opacity-95 animate-gradient-bg" />
          
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 z-0 mix-blend-overlay opacity-25" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Cg/%3E%3C/svg%3E')" }} />
          
          {/* Decorative central light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3 justify-end">
            <span className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Admin<span className="text-white/80 font-light">OS</span>
            </span>
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-lg animate-float">
              <Zap className="w-5 h-5 text-white fill-white/10" strokeWidth={2.5} />
            </div>
          </div>

          {/* Main Visual Message */}
          <div className="relative z-10 text-white text-right my-auto pl-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-6 animate-float">
              <Sparkles className="w-3.5 h-3.5 text-teal-300 fill-teal-300/20" />
              <span>Join the Future Today</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-5 leading-[1.15] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-teal-100" style={{ fontFamily: "var(--font-display)" }}>
              Start building your next big idea.
            </h2>
            <p className="text-lg text-white/80 font-medium leading-relaxed max-w-sm ml-auto">
              Create a free account in seconds and unlock powerful data tracking tools for your growing business.
            </p>
          </div>

          {/* Floating Testimonial */}
          <div className="relative z-10 mt-auto flex flex-col items-end gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/15 w-max max-w-sm text-left shadow-xl animate-float-reverse">
              <p className="text-white text-sm font-semibold mb-3 leading-relaxed">
                &ldquo;AdminOS completely changed how our development team manages real-time telemetry.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-teal-300 bg-white/20 overflow-hidden shadow-inner flex items-center justify-center">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=sarah&backgroundColor=transparent" alt="avatar" className="w-full h-full object-cover scale-110" />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none">Sarah J.</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">CEO — NovaCorp</p>
                </div>
              </div>
            </div>
            
            {/* Micro badges */}
            <div className="flex items-center gap-3 text-xs text-white/60 font-semibold pr-1">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-teal-200" /> GDPR Protected</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-teal-200" /> #1 Dev Choice</span>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-transparent">
          <div className="w-full max-w-sm mx-auto">
            
            {/* Header */}
            <div className="mb-8 text-center lg:text-left animate-fade-in-up">
              <h1 className="text-4xl font-black mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-slate-300" style={{ fontFamily: "var(--font-display)" }}>
                Create account
              </h1>
              <p className="text-sm font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
                Sign up for free. No credit card required.
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up delay-100">
              
              {/* Names grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgb(var(--text-secondary))" }}>First Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-400 group-focus-within:text-teal-500 group-focus-within:scale-105 transition-all duration-300" />
                    </div>
                    <input type="text" placeholder="John" required value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
                      }}
                      className="block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm transition-all duration-300 outline-none bg-slate-500/5 focus:bg-transparent border shadow-inner"
                      style={{ borderColor: errors.firstName ? "rgb(var(--danger))" : "rgba(var(--border), 0.7)", color: "rgb(var(--text-primary))" }}
                      onFocus={(e) => {
                        if (!errors.firstName) {
                          e.target.style.borderColor = "rgb(20, 184, 166)";
                          e.target.style.boxShadow = "0 0 0 4px rgba(20, 184, 166, 0.15)";
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.firstName) {
                          e.target.style.borderColor = "rgba(var(--border), 0.7)";
                          e.target.style.boxShadow = "none";
                        }
                      }}
                    />
                  </div>
                  {errors.firstName && <p className="text-xs mt-1.5 font-semibold animate-slide-down" style={{ color: "rgb(var(--danger))" }}>{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgb(var(--text-secondary))" }}>Last Name</label>
                  <input type="text" placeholder="Doe" required value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: undefined }));
                    }}
                    className="block w-full px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 outline-none bg-slate-500/5 focus:bg-transparent border shadow-inner"
                    style={{ borderColor: errors.lastName ? "rgb(var(--danger))" : "rgba(var(--border), 0.7)", color: "rgb(var(--text-primary))" }}
                    onFocus={(e) => {
                      if (!errors.lastName) {
                        e.target.style.borderColor = "rgb(20, 184, 166)";
                        e.target.style.boxShadow = "0 0 0 4px rgba(20, 184, 166, 0.15)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.lastName) {
                        e.target.style.borderColor = "rgba(var(--border), 0.7)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                  {errors.lastName && <p className="text-xs mt-1.5 font-semibold animate-slide-down" style={{ color: "rgb(var(--danger))" }}>{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgb(var(--text-secondary))" }}>Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-teal-500 group-focus-within:scale-105 transition-all duration-300" />
                  </div>
                  <input type="email" placeholder="you@example.com" required value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className="block w-full pl-10.5 pr-3 py-2.5 rounded-xl text-sm transition-all duration-300 outline-none bg-slate-500/5 focus:bg-transparent border shadow-inner"
                    style={{ borderColor: errors.email ? "rgb(var(--danger))" : "rgba(var(--border), 0.7)", color: "rgb(var(--text-primary))" }}
                    onFocus={(e) => {
                      if (!errors.email) {
                        e.target.style.borderColor = "rgb(20, 184, 166)";
                        e.target.style.boxShadow = "0 0 0 4px rgba(20, 184, 166, 0.15)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.email) {
                        e.target.style.borderColor = "rgba(var(--border), 0.7)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                </div>
                {errors.email && <p className="text-xs mt-1.5 font-semibold animate-slide-down" style={{ color: "rgb(var(--danger))" }}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgb(var(--text-secondary))" }}>Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-teal-500 group-focus-within:scale-105 transition-all duration-300" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    required
                    className="block w-full pl-10.5 pr-10.5 py-2.5 rounded-xl text-sm transition-all duration-300 outline-none bg-slate-500/5 focus:bg-transparent border shadow-inner"
                    style={{ borderColor: errors.password ? "rgb(var(--danger))" : "rgba(var(--border), 0.7)", color: "rgb(var(--text-primary))" }}
                    onFocus={(e) => {
                      if (!errors.password) {
                        e.target.style.borderColor = "rgb(20, 184, 166)";
                        e.target.style.boxShadow = "0 0 0 4px rgba(20, 184, 166, 0.15)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.password) {
                        e.target.style.borderColor = "rgba(var(--border), 0.7)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1.5 font-semibold animate-slide-down" style={{ color: "rgb(var(--danger))" }}>{errors.password}</p>}

                {/* Strength Indicator */}
                {password && (
                  <div className="mt-3.5 animate-slide-down">
                    <div className="flex gap-1.5 mb-2.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-500"
                          style={{ background: i <= strengthScore ? strengthColor : "rgba(var(--border), 0.6)" }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 mt-2 bg-slate-500/5 rounded-xl p-3 border" style={{ borderColor: "rgba(var(--border), 0.5)" }}>
                      {PASSWORD_RULES.map(r => (
                        <div key={r.label} className="flex items-center gap-2.5">
                          <Check className="w-3.5 h-3.5 transition-all duration-300" strokeWidth={3} style={{ color: r.test(password) ? "rgb(var(--success))" : "rgba(var(--border), 0.7)" }} />
                          <span className="text-xs font-bold uppercase tracking-wider transition-colors duration-300" style={{ color: r.test(password) ? "rgb(var(--success))" : "rgb(var(--text-secondary))" }}>
                            {r.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Agreement checkbox */}
              <label className="flex items-start gap-3.5 cursor-pointer group mt-4 select-none">
                <div className="relative flex items-center justify-center w-5 h-5 shrink-0 mt-0.5">
                  <input type="checkbox" className="peer sr-only" checked={agreed} onChange={() => setAgreed(!agreed)} />
                  <div className="w-5 h-5 rounded border-2 transition-all duration-300 peer-checked:bg-teal-600 peer-checked:border-teal-600 group-hover:border-teal-500" style={{ borderColor: "rgba(var(--border), 0.8)" }} />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-300" viewBox="0 0 14 10" fill="none">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-xs leading-relaxed font-semibold" style={{ color: "rgb(var(--text-secondary))" }}>
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" onClick={(e) => e.preventDefault()} className="font-extrabold text-teal-600 dark:text-teal-400 hover:underline" style={{ color: "rgb(var(--brand))" }}>Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" onClick={(e) => e.preventDefault()} className="font-extrabold text-teal-600 dark:text-teal-400 hover:underline" style={{ color: "rgb(var(--brand))" }}>Privacy Policy</Link>.
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !agreed}
                className="relative overflow-hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 mt-4 cursor-pointer bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 hover:shadow-teal-500/25"
                style={{ boxShadow: agreed && !loading ? "0 8px 25px -5px rgba(20, 184, 166, 0.4)" : "none" }}
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                ) : (
                  <><span>Create Free Account</span> <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 flex items-center gap-3 animate-fade-in-up delay-200">
              <div className="flex-1 h-[1px]" style={{ background: "rgba(var(--border), 0.7)" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgb(var(--text-secondary))" }}>Or</span>
              <div className="flex-1 h-[1px]" style={{ background: "rgba(var(--border), 0.7)" }} />
            </div>

            {/* Socials */}
            <div className="mt-6 grid grid-cols-2 gap-4 animate-fade-in-up delay-300">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all duration-300 hover:bg-slate-500/5 active:scale-98 cursor-pointer shadow-sm hover:shadow-md" style={{ borderColor: "rgba(var(--border), 0.8)", color: "rgb(var(--text-primary))" }}>
                <Github className="w-4 h-4" /> <span>GitHub</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all duration-300 hover:bg-slate-500/5 active:scale-98 cursor-pointer shadow-sm hover:shadow-md" style={{ borderColor: "rgba(var(--border), 0.8)", color: "rgb(var(--text-primary))" }}>
                <Chrome className="w-4 h-4" /> <span>Google</span>
              </button>
            </div>

            {/* Sign in redirect */}
            <p className="mt-8 text-center text-sm font-semibold animate-fade-in-up delay-400" style={{ color: "rgb(var(--text-secondary))" }}>
              Already have an account?{" "}
              <Link href="/signin" className="font-extrabold text-teal-600 dark:text-teal-400 hover:underline hover:text-teal-500 transition-colors" style={{ color: "rgb(var(--brand))" }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
