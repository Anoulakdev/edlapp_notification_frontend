"use client";

import { ChevronDown, User, LogOut, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserProfile {
  username: string;
  employee: {
    first_name: string;
    last_name: string;
    email: string | null;
    empimg: string | null;
  };
}

const getAvatarGradient = (username: string) => {
  const colors = [
    "from-blue-600 to-indigo-600 text-white",
    "from-purple-600 to-pink-600 text-white",
    "from-pink-600 to-rose-600 text-white",
    "from-emerald-600 to-teal-600 text-white",
    "from-amber-600 to-orange-600 text-white",
    "from-cyan-600 to-blue-600 text-white",
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
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
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

  return (
    <div className="relative" data-profile-button style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setProfileOpen(!profileOpen);
        }}
        aria-label="Profile menu"
        aria-expanded={profileOpen}
        className={cn(
          "flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg transition-all duration-200 hover:shadow-md group border cursor-pointer",
          profileOpen
            ? "bg-slate-200 dark:bg-slate-700 border-slate-200 dark:border-slate-700"
            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
        )}
      >
        <div
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shadow-sm transition-all overflow-hidden shrink-0",
            userData?.employee?.empimg ? "" : `bg-gradient-to-tr ${getAvatarGradient(userData?.username || "A")}`
          )}
        >
          {userData?.employee?.empimg ? (
            <img src={userData.employee.empimg} alt="profile" className="w-full h-full object-cover object-top" />
          ) : (
            userData ? userData.username.charAt(0).toUpperCase() : "A"
          )}
        </div>
        <div className="hidden lg:block text-left">
          <div
            className={cn(
              "text-xs font-semibold leading-none mb-0.5",
              profileOpen ? "text-slate-800 dark:text-slate-100" : "text-slate-700 dark:text-slate-200"
            )}
          >
            {userData ? `${userData.employee.first_name} ${userData.employee.last_name}` : "Loading..."}
          </div>
          <div
            className={cn(
              "text-xs leading-none",
              profileOpen ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"
            )}
          >
            {userData ? userData.username : "..."}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 hidden lg:block transition-transform duration-300",
            profileOpen ? "text-slate-800 dark:text-slate-100 rotate-180" : "text-slate-500 dark:text-slate-400 rotate-0"
          )}
        />
      </button>

      {/* Profile Dropdown Menu */}
      {profileOpen && (
        <div
          className="absolute right-0 mt-3 w-56 rounded-xl shadow-xl overflow-hidden border z-50 backdrop-blur-sm"
          style={{
            background: "rgb(var(--card))",
            border: "1px solid rgb(var(--border))",
            boxShadow: "0 4px 32px rgba(0, 0, 0, 0.12)",
            animation: "slideDown 200ms ease-out",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b"
            style={{
              background:
                "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
              borderColor: "rgb(var(--border))",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shadow-md overflow-hidden shrink-0",
                  userData?.employee?.empimg ? "" : `bg-gradient-to-tr ${getAvatarGradient(userData?.username || "A")}`
                )}
              >
                {userData?.employee?.empimg ? (
                  <img src={userData.employee.empimg} alt="profile" className="w-full h-full object-cover object-top" />
                ) : (
                  userData ? userData.username.charAt(0).toUpperCase() : "A"
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {userData ? `${userData.employee.first_name} ${userData.employee.last_name}` : "Loading..."}
                </div>
                <div className="text-xs text-white text-opacity-80">
                  {userData ? userData.username : "..."}
                </div>
              </div>
            </div>
          </div>

          <div className="py-2">
            {/* Profile Option */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 group/item"
              style={{ color: "rgb(var(--text-secondary))" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgb(var(--bg))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              onClick={() => {
                setProfileOpen(false);
                router.push("/profile");
              }}
            >
              <User
                className="w-4 h-4 transition-transform group-hover/item:scale-110"
                strokeWidth={2}
              />
              <span className="font-medium">ໂປຣໄຟລ໌</span>
            </button>

            {/* Change Password Option */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 group/item"
              style={{ color: "rgb(var(--text-secondary))" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgb(var(--bg))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              onClick={() => {
                setProfileOpen(false);
                router.push("/changepassword");
              }}
            >
              <KeyRound
                className="w-4 h-4 transition-transform group-hover/item:scale-110"
                strokeWidth={2}
              />
              <span className="font-medium">ປ່ຽນລະຫັດຜ່ານ</span>
            </button>

            {/* Divider */}
            <div
              className="h-px my-2"
              style={{ background: "rgb(var(--border))" }}
            />

            {/* Logout Option */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 group/item"
              style={{ color: "rgb(var(--danger))" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgb(var(--danger) / 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
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
            >
              <LogOut
                className="w-4 h-4 transition-transform group-hover/item:scale-110"
                strokeWidth={2}
              />
              <span className="font-medium">ອອກຈາກລະບົບ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
