"use client";

import { ChevronDown, User, LogOut, KeyRound, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn, getImageUrl } from "@/lib/utils";

interface UserProfile {
  username: string;
  role?: {
    id: number;
    name: string;
  } | null;
  employee: {
    first_name: string;
    last_name: string;
    email: string | null;
    empimg: string | null;
  };
}

const getAvatarGradient = (username: string) => {
  const colors = [
    "from-blue-600 via-indigo-600 to-purple-600 text-white",
    "from-purple-600 via-pink-600 to-rose-600 text-white",
    "from-emerald-600 via-teal-600 to-cyan-600 text-white",
    "from-amber-500 via-orange-600 to-red-600 text-white",
    "from-cyan-600 via-blue-600 to-indigo-600 text-white",
  ];
  if (!username) return colors[0];
  let sum = 0;
  for (let i = 0; i < username.length; i++) {
    sum += username.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

export function ProfileDropdown() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
          setImageError(false);
        } else if (res.status === 401) {
          router.push("/signin");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    fetchProfile();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const profileButton = document.querySelector("[data-profile-button]");
      if (profileButton && !profileButton.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [profileOpen]);

  const avatarUrl = getImageUrl(userData?.employee?.empimg);
  const showImage = avatarUrl && !imageError;

  return (
    <div className="relative select-none" data-profile-button style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      {/* Navbar Profile Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setProfileOpen(!profileOpen);
        }}
        aria-label="Profile menu"
        aria-expanded={profileOpen}
        className={cn(
          "flex items-center gap-2.5 p-1.5 rounded-2xl transition-all duration-300 border cursor-pointer group shadow-sm hover:shadow-md backdrop-blur-md active:scale-98",
          profileOpen
            ? "bg-blue-50/90 dark:bg-slate-800/90 border-blue-400/50 dark:border-blue-500/50 ring-2 ring-blue-500/20"
            : "bg-slate-100/80 dark:bg-slate-850/80 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-800/80"
        )}
      >
        {/* Avatar with Glow Ring */}
        <div className="relative">
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-inner transition-transform duration-300 group-hover:scale-105 overflow-hidden shrink-0 ring-2 ring-white/40 dark:ring-slate-700/50",
              showImage ? "" : `bg-gradient-to-br ${getAvatarGradient(userData?.username || "A")}`
            )}
          >
            {showImage ? (
              <img
                src={avatarUrl}
                alt="profile"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              userData ? userData.username.charAt(0).toUpperCase() : "A"
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
        </div>

        {/* User Info Details */}
        <div className="hidden lg:flex flex-col text-left pr-1">
          <span
            className={cn(
              "text-xs font-bold leading-tight truncate max-w-[140px] tracking-tight mb-0.5",
              profileOpen ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-100"
            )}
          >
            {userData ? `${userData.employee.first_name} ${userData.employee.last_name}` : "Loading..."}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] leading-tight font-extrabold truncate max-w-[105px] tracking-wide bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent"
            >
              {userData ? `${userData.username}` : "..."}
            </span>
            {userData?.role?.name && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 text-blue-600 dark:text-blue-300 border border-blue-400/30 shrink-0 shadow-2xs">
                {userData.role.name}
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 hidden lg:block transition-transform duration-300 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200",
            profileOpen ? "rotate-180 text-blue-500 dark:text-blue-400" : "rotate-0"
          )}
        />
      </button>

      {/* Profile Dropdown Menu Card */}
      {profileOpen && (
        <div
          className="absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800/80"
          style={{
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.2), 0 0 20px 0 rgba(59, 130, 246, 0.1)",
          }}
        >
          {/* Header Banner */}
          <div className="p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
            {/* Ambient Lighting Accent */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              <div
                className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black shadow-lg overflow-hidden shrink-0 ring-2 ring-white/30",
                  showImage ? "" : `bg-gradient-to-br ${getAvatarGradient(userData?.username || "A")}`
                )}
              >
                {showImage ? (
                  <img
                    src={avatarUrl}
                    alt="profile"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  userData ? userData.username.charAt(0).toUpperCase() : "A"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-white truncate tracking-tight">
                  {userData ? `${userData.employee.first_name} ${userData.employee.last_name}` : "Loading..."}
                </h4>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-xs text-white/80 font-medium truncate">
                    {userData?.username || "..."}
                  </span>
                  {userData?.role?.name && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-white/20 text-white border border-white/30 backdrop-blur-md shrink-0 shadow-sm">
                      {userData.role.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items List */}
          <div className="p-2 space-y-1">
            {/* Profile Option */}
            <button
              onClick={() => {
                setProfileOpen(false);
                router.push("/profile");
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group/item"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover/item:bg-blue-500 group-hover/item:text-white flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                <User className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <span>ໂປຣໄຟລ໌</span>
            </button>

            {/* Change Password Option */}
            <button
              onClick={() => {
                setProfileOpen(false);
                router.push("/changepassword");
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group/item"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover/item:bg-blue-500 group-hover/item:text-white flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                <KeyRound className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <span>ປ່ຽນລະຫັດຜ່ານ</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            {/* Logout Option */}
            <button
              onClick={async () => {
                setProfileOpen(false);
                localStorage.removeItem("userRoleId");
                localStorage.removeItem("chat_selected_topic");
                localStorage.removeItem("chat_selected_conversation");
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                } catch (error) {
                  console.error("Logout error:", error);
                }
                router.push("/signin");
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all duration-200 group/item"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 group-hover/item:bg-rose-500 group-hover/item:text-white flex items-center justify-center text-rose-500 transition-colors">
                <LogOut className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <span>ອອກຈາກລະບົບ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
