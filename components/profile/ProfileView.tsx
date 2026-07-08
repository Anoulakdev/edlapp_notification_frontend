"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Loader2, Building, Info } from "lucide-react";

export default function ProfileView() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const basePath = process.env.NODE_ENV === "production" ? "/meeting_notice" : "";
        const res = await fetch(`${basePath}/api/auth/me`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const firstName = user?.employee?.first_name || user?.username || "";
  const lastName = user?.employee?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "ບໍ່ມີຊື່";
  const initial = firstName.charAt(0).toUpperCase() || "U";
  const empimg = user?.employee?.empimg;
  const empCode = user?.employee?.emp_code || user?.username || "-";
  const gender = user?.employee?.gender || "-";
  const tel = user?.employee?.tel || "-";
  const email = user?.employee?.email || "-";
  const posName = user?.employee?.position?.pos_name || "-";
  const deptName = user?.employee?.department?.department_name || "-";
  const divName = user?.employee?.division?.division_name || "-";
  const officeName = user?.employee?.office?.office_name || "-";
  const unitName = user?.employee?.unit?.unit_name || "-";

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          ໂປຣຟາຍ
        </h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgb(var(--brand))" }} />
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            ກຳລັງໂຫຼດຂໍ້ມູນ...
          </p>
        </div>
      ) : (
        <>
          {/* Main Profile Card */}
          <div
            className="rounded-2xl border p-8 mb-6 shadow-sm"
            style={{
              background: "rgb(var(--card))",
              borderColor: "rgb(var(--border))",
            }}
          >
            {/* Profile Header Section */}
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 pb-10 border-b"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold text-white shadow-sm overflow-hidden"
                  style={{ background: "rgb(var(--brand))" }}
                >
                  {empimg ? (
                    <img src={empimg} alt="profile" className="w-full h-full object-cover object-top" />
                  ) : (
                    initial
                  )}
                </div>
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "rgb(var(--text-primary))" }}
                  >
                    {fullName}
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    ລະຫັດພະນັກງານ: {empCode}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    ສະຖານະ: {user?.employee?.status === "A" ? "ນຳໃຊ້ງານ (Active)" : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  ຊື່ ແລະ ນາມສະກຸນ
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgb(var(--bg))",
                    color: "rgb(var(--text-primary))",
                  }}
                >
                  <User className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  {fullName}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  ເພດ
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgb(var(--bg))",
                    color: "rgb(var(--text-primary))",
                  }}
                >
                  <User className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  {gender === "Male" ? "ຊາຍ" : gender === "Female" ? "ຍິງ" : gender}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  ອີເມວ
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgb(var(--bg))",
                    color: "rgb(var(--text-primary))",
                  }}
                >
                  <Mail className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  {email}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  ເບີໂທລະສັບ
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgb(var(--bg))",
                    color: "rgb(var(--text-primary))",
                  }}
                >
                  <Phone className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  {tel}
                </div>
              </div>

              {/* Emp Code */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  ລະຫັດພະນັກງານ
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgb(var(--bg))",
                    color: "rgb(var(--text-primary))",
                  }}
                >
                  <Info className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  {empCode}
                </div>
              </div>

              {/* Position */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  ຕຳແໜ່ງ
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-primary))" }}
                >
                  <Building className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  {posName}
                </div>
              </div>

              {/* Department */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  ຝ່າຍ
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-primary))" }}
                >
                  <Building className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  {deptName}
                </div>
              </div>

              {/* Division */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  ພະແນກ
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-primary))" }}
                >
                  <Building className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  {divName}
                </div>
              </div>

              {/* Office */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  ຫ້ອງການ
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-primary))" }}
                >
                  <Building className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  {officeName}
                </div>
              </div>

              {/* Unit */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  ໜ່ວຍງານ
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-primary))" }}
                >
                  <Building className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                  {unitName}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
