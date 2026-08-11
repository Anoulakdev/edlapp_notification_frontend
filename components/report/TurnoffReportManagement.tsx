"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  FileX,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Building2,
  FileSpreadsheet,
  FileType,
  Timer,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import moment from "moment";

interface Province {
  id: number;
  province_name: string;
  province_code: string;
}

interface District {
  id: number;
  district_name: string;
  district_code: string;
}

interface TurnoffAddress {
  id: number;
  villageId: number;
  userCount?: number | null;
  village?: {
    id: number;
    village_name: string;
  };
}

interface TurnoffDocReportItem {
  id: number;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  useTime?: number | null;
  turnoffFile?: string | null;
  provinceId?: number | null;
  province?: Province | null;
  districtId?: number | null;
  district?: District | null;
  createdAt: string;
  updatedAt: string;
  turnoffAddresses?: TurnoffAddress[];
}

export function TurnoffReportManagement() {
  // Filter States
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [provinceId, setProvinceId] = useState<string>("all");
  const [districtId, setDistrictId] = useState<string>("all");

  // Dropdown Options States
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  // Report Data States
  const [reportData, setReportData] = useState<TurnoffDocReportItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Status States
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // User Role, Province & District States for role-based filters
  const [currentUserRoleId, setCurrentUserRoleId] = useState<number | null>(null);
  const [currentUserProvinceId, setCurrentUserProvinceId] = useState<number | null>(null);
  const [currentUserDistrictId, setCurrentUserDistrictId] = useState<number | null>(null);

  const effectiveProvinceId = useMemo(() => {
    if (currentUserRoleId === 5 || currentUserRoleId === 6) {
      return currentUserProvinceId ? String(currentUserProvinceId) : "";
    }
    return provinceId;
  }, [currentUserRoleId, currentUserProvinceId, provinceId]);

  const effectiveDistrictId = useMemo(() => {
    if (currentUserRoleId === 6 && currentUserDistrictId) {
      return String(currentUserDistrictId);
    }
    return districtId;
  }, [currentUserRoleId, currentUserDistrictId, districtId]);

  // Fetch Current Logged-in User Profile on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        setCurrentUserRoleId(res.data?.roleId || null);
        setCurrentUserProvinceId(res.data?.provinceId || null);
        setCurrentUserDistrictId(res.data?.districtId || null);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // 1. Fetch Provinces list on mount
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

  // 2. Fetch Districts list when effectiveProvinceId changes
  useEffect(() => {
    if (!effectiveProvinceId || effectiveProvinceId === "all" || provinces.length === 0) {
      setDistricts([]);
      setDistrictId("all");
      return;
    }
    const selectedProv = provinces.find((p) => String(p.id) === effectiveProvinceId);
    if (!selectedProv) {
      setDistricts([]);
      setDistrictId("all");
      return;
    }

    const fetchDistricts = async () => {
      try {
        const res = await axiosInstance.get(
          `/districts/selectdistrict?provinceCode=${selectedProv.province_code}`
        );
        if (Array.isArray(res.data)) {
          setDistricts(res.data);
        } else {
          setDistricts([]);
        }
      } catch (err) {
        console.error("Failed to load districts:", err);
        setDistricts([]);
      }
      setDistrictId("all");
    };

    fetchDistricts();
  }, [effectiveProvinceId, provinces]);

  // 3. Fetch Turnoff Report Data
  const fetchReportData = async (
    targetPage = page,
    targetLimit = limit,
    overrideStart = startDate,
    overrideEnd = endDate
  ) => {
    if (!overrideStart || !overrideEnd) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນດຶງລາຍງານ");
      return;
    }

    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: targetPage,
        limit: targetLimit,
        startDate: overrideStart,
        endDate: overrideEnd,
      };
      if (effectiveProvinceId && effectiveProvinceId !== "all") {
        params.provinceId = Number(effectiveProvinceId);
      }
      if (effectiveDistrictId && effectiveDistrictId !== "all") {
        params.districtId = Number(effectiveDistrictId);
      }

      const res = await axiosInstance.get("/reports/turnoff", { params });

      if (res.data && typeof res.data === "object") {
        if (Array.isArray(res.data.data)) {
          setReportData(res.data.data);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        } else if (Array.isArray(res.data)) {
          setReportData(res.data);
          setTotal(res.data.length);
          setTotalPages(1);
        } else {
          setReportData([]);
          setTotal(0);
          setTotalPages(1);
        }
      } else {
        setReportData([]);
        setTotal(0);
        setTotalPages(1);
      }
      setHasSearched(true);
    } catch (err) {
      console.error("Failed to fetch turnoff report:", err);
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍງານໄດ້");
    } finally {
      setLoading(false);
    }
  };

  // Quick Date Shortcut Handler
  const handleQuickDate = (type: "today" | "7days" | "30days" | "month") => {
    let s = "";
    let e = moment().format("YYYY-MM-DD");

    if (type === "today") {
      s = moment().format("YYYY-MM-DD");
    } else if (type === "7days") {
      s = moment().subtract(6, "days").format("YYYY-MM-DD");
    } else if (type === "30days") {
      s = moment().subtract(29, "days").format("YYYY-MM-DD");
    } else if (type === "month") {
      s = moment().startOf("month").format("YYYY-MM-DD");
      e = moment().endOf("month").format("YYYY-MM-DD");
    }

    setStartDate(s);
    setEndDate(e);
    setPage(1);
    fetchReportData(1, limit, s, e);
  };

  // Handle Search Click
  const handleSearch = () => {
    setPage(1);
    fetchReportData(1, limit);
  };

  // Handle Reset Filters
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setProvinceId("all");
    setDistrictId("all");
    setReportData([]);
    setTotal(0);
    setPage(1);
    setHasSearched(false);
  };

  // Export to Excel (.xlsx) using SheetJS 'xlsx' library
  const handleExportExcel = async () => {
    if (reportData.length === 0) {
      toast.warning("ບໍ່ມີຂໍ້ມູນລາຍງານເພື່ອສົ່ງອອກ");
      return;
    }

    const XLSX = await import("xlsx");

    const exportRows = reportData.map((d, index) => {
      const villagesWithUsers =
        d.turnoffAddresses
          ?.map(
            (a) =>
              `${a.village?.village_name || `Village #${a.villageId}`}${a.userCount ? ` (${a.userCount} ທ່ານ)` : ""
              }`
          )
          .join(", ") || "-";

      const totalUsers =
        d.turnoffAddresses?.reduce(
          (acc, a) => acc + (Number(a.userCount) || 0),
          0
        ) || 0;

      return {
        "ລຳດັບ": index + 1,
        "ຫົວຂໍ້": d.title || "",
        "ລາຍລະອຽດ": d.description || "",
        "ວັນທີເລີ່ມຕົ້ນ": d.startDate ? moment(d.startDate).format("DD/MM/YYYY") : "",
        "ຫາວັນທີ": d.endDate ? moment(d.endDate).format("DD/MM/YYYY") : "",
        "ເວລາ (Start - End)": `${d.startTime || "--:--"} - ${d.endTime || "--:--"}`,
        "ເວລາທີ່ໃຊ້ (ນາທີ)": d.useTime !== null && d.useTime !== undefined ? d.useTime : "-",
        "ແຂວງ": d.province?.province_name || "-",
        "ເມືອງ": d.district?.district_name || "-",
        "ບ້ານທີ່ຈະມອດໄຟ": villagesWithUsers,
        "ຜູ້ໃຊ້ໄຟທີ່ໄດ້ຮັບການແຈ້ງເຕືອນ": totalUsers,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Power Turnoff Report");

    // Calculate dynamic column widths for all columns
    const keys = Object.keys(exportRows[0] || {});
    worksheet["!cols"] = keys.map((key) => {
      let maxLen = Math.max(key.length * 2, 16);
      exportRows.forEach((row) => {
        const valStr = String((row as any)[key] ?? "");
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      return { wch: Math.min(maxLen, 60) };
    });

    XLSX.writeFile(workbook, `turnoff_report_${startDate}_to_${endDate}.xlsx`);
    toast.success("ສົ່ງອອກຂໍ້ມູນ Excel (.xlsx) ສຳເລັດແລ້ວ");
  };

  // Export to PDF (.pdf) — Full professional layout with smart multi-language font rendering.
  // Lao script (U+0E80–U+0EFF) → NotoSansLao. Everything else (digits, Latin, symbols) → helvetica.
  const handleExportPDF = async () => {
    if (!startDate || !endDate) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນສົ່ງອອກ PDF");
      return;
    }

    const [{ default: jsPDF }, { default: autoTable }, { notoSansLaoBase64 }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
      import("@/lib/notoSansLaoBase64"),
    ]);

    // ── 1. Fetch ALL records (no pagination limit) ──────────────────────────
    let allData: TurnoffDocReportItem[] = [];
    try {
      // toast.info("ກຳລັງດຶງຂໍ້ມູນທັງໝົດເພື່ອ Export PDF...", { autoClose: 2500 });
      const params: Record<string, any> = {
        page: 1,
        limit: 9999,
        startDate,
        endDate,
      };
      if (effectiveProvinceId && effectiveProvinceId !== "all") params.provinceId = Number(effectiveProvinceId);
      if (effectiveDistrictId && effectiveDistrictId !== "all") params.districtId = Number(effectiveDistrictId);

      const res = await axiosInstance.get("/reports/turnoff", { params });
      if (res.data && Array.isArray(res.data.data)) {
        allData = res.data.data;
      } else if (Array.isArray(res.data)) {
        allData = res.data;
      }
    } catch {
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນທັງໝົດໄດ້");
      return;
    }

    if (allData.length === 0) {
      toast.warning("ບໍ່ມີຂໍ້ມູນລາຍງານເພື່ອສົ່ງອອກ");
      return;
    }

    // ── 2. Compute summary stats ────────────────────────────────────────────
    let sumVillages = 0;
    let sumUsers = 0;
    let sumMinutes = 0;
    allData.forEach((d) => {
      if (d.useTime) sumMinutes += Number(d.useTime);
      if (d.turnoffAddresses) {
        sumVillages += d.turnoffAddresses.length;
        d.turnoffAddresses.forEach((a) => { sumUsers += Number(a.userCount) || 0; });
      }
    });
    const sumHours = Math.floor(sumMinutes / 60);
    const sumMins = sumMinutes % 60;

    // ── 3. Initialise jsPDF (A4 Landscape) ──────────────────────────────────
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();   // 297 mm
    const pageH = doc.internal.pageSize.getHeight();  // 210 mm
    const marginL = 5;
    const marginR = 5;
    const contentW = pageW - marginL - marginR;
    const printedAt = moment().format("DD/MM/YYYY HH:mm:ss");

    // Register Lao font
    if (notoSansLaoBase64) {
      doc.addFileToVFS("NotoSansLao-Regular.ttf", notoSansLaoBase64);
      doc.addFont("NotoSansLao-Regular.ttf", "NotoSansLao", "normal");
    }

    // ── Helper: detect Lao Unicode block (U+0E80–U+0EFF) ───────────────────
    const isLaoChar = (ch: string) => {
      const code = ch.charCodeAt(0);
      return code >= 0x0e80 && code <= 0x0eff;
    };

    // ── Helper: split text into [{text, isLao}] segments ───────────────────
    type Segment = { text: string; isLao: boolean };
    const splitSegments = (text: string): Segment[] => {
      if (!text) return [];
      const segs: Segment[] = [];
      let buf = text[0];
      let curLao = isLaoChar(text[0]);
      for (let i = 1; i < text.length; i++) {
        const lao = isLaoChar(text[i]);
        if (lao !== curLao) {
          segs.push({ text: buf, isLao: curLao });
          buf = text[i];
          curLao = lao;
        } else {
          buf += text[i];
        }
      }
      segs.push({ text: buf, isLao: curLao });
      return segs;
    };

    // ── Helper: measure text width respecting segment fonts ─────────────────
    const mixedTextWidth = (text: string, size: number): number => {
      let w = 0;
      for (const seg of splitSegments(text)) {
        doc.setFont(seg.isLao ? "NotoSansLao" : "helvetica", "normal");
        doc.setFontSize(size);
        w += doc.getTextWidth(seg.text);
      }
      return w;
    };

    // ── Helper: render mixed-script text at (x, y), return ending x ─────────
    const drawMixed = (
      text: string,
      x: number,
      y: number,
      size: number,
      align: "left" | "right" = "left"
    ): number => {
      const segs = splitSegments(text);
      // For right-align, compute total width first then shift x
      if (align === "right") {
        const totalW = mixedTextWidth(text, size);
        x = x - totalW;
      }
      let curX = x;
      for (const seg of segs) {
        doc.setFont(seg.isLao ? "NotoSansLao" : "helvetica", "normal");
        doc.setFontSize(size);
        doc.text(seg.text, curX, y);
        curX += doc.getTextWidth(seg.text);
      }
      return curX;
    };

    // Convenience wrappers
    const setLao = (size: number) => { doc.setFont("NotoSansLao", "normal"); doc.setFontSize(size); };
    const setLatin = (size: number) => { doc.setFont("helvetica", "normal"); doc.setFontSize(size); };

    // ── 4. Draw Header ───────────────────────────────────────────────────────
    // Top accent bar
    doc.setFillColor(37, 99, 235);
    doc.rect(marginL, 8, contentW, 1.2, "F");

    // Report title (all Lao)
    doc.setTextColor(15, 23, 42);
    setLao(15);
    doc.text("ລາຍງານແຈ້ງການມອດໄຟ", marginL, 20);

    // Right-side filter summary
    const filterProvince = effectiveProvinceId && effectiveProvinceId !== "all"
      ? (provinces.find((p) => String(p.id) === effectiveProvinceId)?.province_name ?? "ທຸກແຂວງ")
      : "ທຸກແຂວງ";
    const filterDistrict = effectiveDistrictId && effectiveDistrictId !== "all"
      ? (districts.find((d) => String(d.id) === effectiveDistrictId)?.district_name ?? "ທຸກເມືອງ")
      : "ທຸກເມືອງ";

    doc.setTextColor(100, 116, 139);
    drawMixed(
      `ຊ່ວງວັນທີ: ${moment(startDate).format("DD/MM/YYYY")} – ${moment(endDate).format("DD/MM/YYYY")}`,
      pageW - marginR, 20, 8, "right"
    );
    drawMixed(`ແຂວງ: ${filterProvince}   ເມືອງ: ${filterDistrict}`, pageW - marginR, 25, 8, "right");
    drawMixed(`ພິມວັນທີ: ${printedAt}`, pageW - marginR, 30, 8, "right");

    // Divider line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(marginL, 33, pageW - marginR, 33);

    // ── 5. Summary Stats Row ────────────────────────────────────────────────
    const statsY = 36;
    const cardW = contentW / 4;
    const statCards = [
      {
        label: "ເອກະສານທັງໝົດ",
        value: `${allData.length.toLocaleString()} ລາຍການ`,
        color: [37, 99, 235] as [number, number, number],
      },
      {
        label: "ເວລາທີ່ໃຊ້ລວມ",
        value: sumHours > 0 ? `${sumHours} ຊົ່ວໂມງ ${sumMins} ນາທີ (${sumMinutes.toLocaleString()} ນາທີ)` : `${sumMins} ນາທີ`,
        color: [217, 119, 6] as [number, number, number],
      },
      {
        label: "ບ້ານທີ່ຈະມອດໄຟທັງໝົດ",
        value: `${sumVillages.toLocaleString()} ບ້ານ`,
        color: [124, 58, 237] as [number, number, number],
      },
      {
        label: "ຜູ້ໃຊ້ໄຟທີ່ໄດ້ຮັບການແຈ້ງເຕືອນທັງໝົດ",
        value: `${sumUsers.toLocaleString()} ທ່ານ`,
        color: [5, 150, 105] as [number, number, number],
      },
    ];

    statCards.forEach((card, i) => {
      const x = marginL + i * cardW;
      // Card bg
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x + 1, statsY, cardW - 2, 18, 2, 2, "F");
      // Left accent
      doc.setFillColor(...card.color);
      doc.roundedRect(x + 1, statsY, 2.5, 18, 1, 1, "F");
      // Label — pure Lao text
      setLao(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(card.label, x + 6, statsY + 7);
      // Value — mixed (number + Lao unit) via drawMixed
      doc.setTextColor(...card.color);
      drawMixed(card.value, x + 6, statsY + 14, 9);
    });

    // ── 6. Build Table Data ─────────────────────────────────────────────────
    const tableColumn = [
      "ລຳດັບ",
      "ຫົວຂໍ້",
      "ລາຍລະອຽດ",
      "ວັນທີມອດໄຟ",       // merged: startDate – endDate
      "ເວລາ",
      "ເວລາໃຊ້",
      "ແຂວງ",
      "ເມືອງ",
      "ບ້ານທີ່ຈະມອດໄຟ",
      "ຜູ້ໃຊ້ໄຟທີ່ໄດ້ຮັບການແຈ້ງເຕືອນ",
    ];

    const tableRows = allData.map((d, index) => {
      const villagesWithUsers =
        d.turnoffAddresses
          ?.map(
            (a) =>
              `${a.village?.village_name || `Village #${a.villageId}`}${a.userCount ? ` (${a.userCount})` : ""}`
          )
          .join(", ") || "-";

      const rowUsers =
        d.turnoffAddresses?.reduce((acc, a) => acc + (Number(a.userCount) || 0), 0) || 0;

      // Merge start/end date: show range only when dates differ
      const fmtStart = d.startDate ? moment(d.startDate).format("DD/MM/YYYY") : "";
      const fmtEnd = d.endDate ? moment(d.endDate).format("DD/MM/YYYY") : "";
      const dateRange = fmtStart && fmtEnd && fmtStart !== fmtEnd
        ? `${fmtStart} – ${fmtEnd}`
        : fmtStart || fmtEnd || "-";

      return [
        String(index + 1),
        d.title || "",
        d.description || "",
        dateRange,                                                          // col 3: ວັນທີມອດໄຟ
        `${d.startTime || "--:--"} - ${d.endTime || "--:--"}`,            // col 4: ເວລາ
        d.useTime !== null && d.useTime !== undefined ? String(d.useTime) : "-", // col 5: ເວລາໃຊ້
        d.province?.province_name || "-",                                  // col 6: ແຂວງ
        d.district?.district_name || "-",                                  // col 7: ເມືອງ
        villagesWithUsers,                                                  // col 8: ບ້ານ
        rowUsers > 0 ? rowUsers.toLocaleString() : "-",                    // col 9: ຜູ້ໃຊ້ໄຟ
      ];
    });

    // ── 7. Render autoTable ─────────────────────────────────────────────────
    // Column widths are defined as proportional bases then scaled so their
    // total always equals contentW (= pageW - marginL - marginR) exactly.
    const _baseW = [10, 40, 36, 36, 24, 16, 24, 24, 52, 17]; // 10 cols, sum = 279
    const _baseSum = _baseW.reduce((a, b) => a + b, 0);
    // Scale each column; last column absorbs any rounding remainder.
    const _scaled = _baseW.map((w, i) =>
      i < _baseW.length - 1
        ? parseFloat((contentW * w / _baseSum).toFixed(2))
        : 0
    );
    _scaled[_scaled.length - 1] = parseFloat(
      (contentW - _scaled.slice(0, -1).reduce((a, b) => a + b, 0)).toFixed(2)
    );
    const cw = (col: number) => _scaled[col];

    autoTable(doc, {
      startY: statsY + 21,
      margin: { top: statsY + 21, left: marginL, right: marginR, bottom: 16 },
      head: [tableColumn],
      body: tableRows,
      styles: {
        font: "NotoSansLao",
        fontStyle: "normal",
        fontSize: 7,
        cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
        overflow: "linebreak",
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        textColor: [30, 41, 59],
      },
      headStyles: {
        font: "NotoSansLao",
        fontStyle: "normal",
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontSize: 7,
        halign: "center",
        valign: "middle",
        cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
        lineColor: [29, 78, 216],
        lineWidth: 0.3,
      },
      bodyStyles: {
        font: "NotoSansLao",
        fontStyle: "normal",
        valign: "top",
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
      columnStyles: {
        0: { cellWidth: cw(0), halign: "center", fontStyle: "bold" }, // ລຳດັບ
        1: { cellWidth: cw(1) },                                        // ຫົວຂໍ້
        2: { cellWidth: cw(2) },                                        // ລາຍລະອຽດ
        3: { cellWidth: cw(3), halign: "center" },                     // ວັນທີມອດໄຟ
        4: { cellWidth: cw(4), halign: "center" },                     // ເວລາ
        5: { cellWidth: cw(5), halign: "center" },                     // ເວລາໃຊ້
        6: { cellWidth: cw(6) },                                        // ແຂວງ
        7: { cellWidth: cw(7) },                                        // ເມືອງ
        8: { cellWidth: cw(8) },                                        // ບ້ານ
        9: { cellWidth: cw(9), halign: "center" },                     // ຜູ້ໃຊ້ໄຟ
      },

      // ── Smart multi-language rendering per cell via didDrawCell ─────────────
      // Covers both head and body: erases autoTable's own text and redraws using
      // the mixed-font helper so every character gets the correct font.
      didDrawCell: (data) => {
        // ── HEAD: blue background, white text ──────────────────────────────
        if (data.section === "head") {
          const cellText = Array.isArray(data.cell.text)
            ? data.cell.text.join("\n")
            : String(data.cell.text ?? "");

          if (!cellText) return;

          // Erase autotable's head text with the header fill colour
          doc.setFillColor(37, 99, 235);
          doc.rect(
            data.cell.x + 0.1,
            data.cell.y + 0.1,
            data.cell.width - 0.2,
            data.cell.height - 0.2,
            "F"
          );

          const headFontSize = 7;
          const pad = 2;
          const lines = cellText.split("\n");
          const totalH = lines.length * headFontSize * 0.352 * 2.2;
          // Vertically centre multi-line text in the cell
          let lineY =
            data.cell.y +
            (data.cell.height - totalH) / 2 +
            headFontSize * 0.352 +
            0.3;

          for (const line of lines) {
            const lineW = mixedTextWidth(line, headFontSize);
            // Headers are always centre-aligned
            const lineX = data.cell.x + (data.cell.width - lineW) / 2;
            doc.setTextColor(255, 255, 255);
            drawMixed(line, lineX, lineY, headFontSize);
            lineY += headFontSize * 0.352 * 2.2;
          }
          return;
        }

        // ── BODY: alternating background, dark text ─────────────────────────
        if (data.section !== "body") return;

        const cellText = Array.isArray(data.cell.text)
          ? data.cell.text.join("\n")
          : String(data.cell.text ?? "");

        if (!cellText || cellText === "-") return;

        // Erase autoTable's own text by painting the row fill colour on top
        const fillRgb = data.row.index % 2 === 0
          ? [255, 255, 255]   // white row
          : [241, 245, 249];  // alternate slate-100
        doc.setFillColor(fillRgb[0], fillRgb[1], fillRgb[2]);
        doc.rect(
          data.cell.x + 0.1,
          data.cell.y + 0.1,
          data.cell.width - 0.2,
          data.cell.height - 0.2,
          "F"
        );

        const fontSize = 7;
        const pad = 2;
        const colAlign = (data.cell.styles.halign as string) || "left";

        // Split multi-line text and draw each line with the mixed-font helper
        const lines = cellText.split("\n");
        let lineY = data.cell.y + data.cell.padding("top") + fontSize * 0.352 + 0.5;

        for (const line of lines) {
          const lineW = mixedTextWidth(line, fontSize);
          let lineX = data.cell.x + pad;

          if (colAlign === "center") {
            lineX = data.cell.x + (data.cell.width - lineW) / 2;
          } else if (colAlign === "right") {
            lineX = data.cell.x + data.cell.width - pad - lineW;
          }

          doc.setTextColor(30, 41, 59);
          drawMixed(line, lineX, lineY, fontSize);
          lineY += fontSize * 0.352 * 2.2; // line-height
        }
      },

      // ── Per-page footer ─────────────────────────────────────────────────────
      didDrawPage: (data) => {
        const totalPages = (doc.internal as any).getNumberOfPages();
        const currentPage = data.pageNumber;

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(marginL, pageH - 10, pageW - marginR, pageH - 10);

        // Left: Lao system name
        doc.setTextColor(148, 163, 184);
        drawMixed("ລາຍງານການແຈ້ງມອດໄຟ", marginL, pageH - 6, 6.5);

        // Right: page info (mixed date + numbers)
        drawMixed(`Page ${currentPage} / ${totalPages}   |   ${printedAt}`, pageW - marginR, pageH - 6, 6.5, "right");
      },
    });

    // ── 8. Save file ────────────────────────────────────────────────────────
    doc.save(`turnoff_report_${startDate}_to_${endDate}.pdf`);
    toast.success(`ສົ່ງອອກ PDF ສຳເລັດ — ${allData.length} ລາຍການ`);
  };

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    if (hasSearched) {
      fetchReportData(newPage, limit);
    }
  };

  // Handle Limit Change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    if (hasSearched) {
      fetchReportData(1, newLimit);
    }
  };

  // Calculate Summary Statistics
  const stats = useMemo(() => {
    let totalVillages = 0;
    let totalUsers = 0;
    let totalUseTimeMinutes = 0;

    reportData.forEach((doc) => {
      if (doc.useTime) {
        totalUseTimeMinutes += Number(doc.useTime);
      }
      if (doc.turnoffAddresses && Array.isArray(doc.turnoffAddresses)) {
        totalVillages += doc.turnoffAddresses.length;
        doc.turnoffAddresses.forEach((addr) => {
          totalUsers += addr.userCount || 0;
        });
      }
    });

    const hours = Math.floor(totalUseTimeMinutes / 60);
    const mins = totalUseTimeMinutes % 60;
    const formattedDuration =
      hours > 0 ? `${hours} ຊົ່ວໂມງ ${mins} ນາທີ` : `${mins} ນາທີ`;

    return {
      totalDocs: total,
      totalVillages,
      totalUsers,
      totalUseTimeMinutes,
      formattedDuration,
    };
  }, [reportData, total]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 font-sans text-slate-800 dark:text-slate-100 space-y-6 print:bg-white print:p-0">
        {/* Filter Card */}
        <div className="bg-white dark:bg-slate-900 p-5 md:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-5 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  ຕົວກອງຂໍ້ມູນລາຍງານແຈ້ງການມອດໄຟ
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ເພື່ອດຶງລາຍງານ
                </p>
              </div>
            </div>

            {/* Quick Date Shortcuts */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">ທາງລັດ:</span>
              <button
                type="button"
                onClick={() => handleQuickDate("today")}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
              >
                ມື້ນີ້
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate("7days")}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
              >
                7 ມື້ຜ່ານມາ
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate("30days")}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
              >
                30 ມື້ຜ່ານມາ
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate("month")}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
              >
                ເດືອນນີ້
              </button>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 ${currentUserRoleId === 6
              ? "sm:grid-cols-2"
              : currentUserRoleId === 5
                ? "sm:grid-cols-3"
                : "sm:grid-cols-2 lg:grid-cols-4"
              } gap-4`}
          >
            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
                <span>ວັນທີເລີ່ມຕົ້ນ</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 h-[42px] text-xs bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 font-semibold transition-all"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
                <span>ຫາວັນທີ</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 h-[42px] text-xs bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 font-semibold transition-all"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Province Select - Hidden for roleId 5 and 6 */}
            {currentUserRoleId !== 5 && currentUserRoleId !== 6 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
                  <span>ແຂວງ</span>
                </label>
                <div className="relative">
                  <select
                    value={provinceId}
                    onChange={(e) => setProvinceId(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <option value="all">-- ທຸກແຂວງ (All Provinces) --</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.province_name}
                      </option>
                    ))}
                  </select>
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            )}

            {/* District Select - Hidden for roleId 6 */}
            {currentUserRoleId !== 6 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
                  <span>ເມືອງ</span>
                </label>
                <div className="relative">
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    disabled={(!effectiveProvinceId || effectiveProvinceId === "all") || districts.length === 0}
                    className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="all">-- ທຸກເມືອງ (All Districts) --</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.district_name}
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ລ້າງຕົວກອງ</span>
            </button>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>ຄົ້ນຫາ / ດຶງລາຍງານ</span>
            </button>
          </div>
        </div>

        {/* Initial Empty State (Before Search) */}
        {!hasSearched && (
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 md:p-14 text-center select-none shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6 transition-all">
            {/* Ambient Decorative Shapes */}
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Icon Badge */}
            <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25 border border-white/20">
              <FileSpreadsheet className="w-12 h-12 text-white drop-shadow-md animate-pulse" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Text Description */}
            <div className="relative z-10 space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ກະລຸນາເລືອກຕົວກອງເພື່ອດຶງຂໍ້ມູນລາຍງານ
              </h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                ກະລຸນາເລືອກ <span className="font-bold text-blue-600 dark:text-blue-400">"ວັນທີເລີ່ມຕົ້ນ"</span> ແລະ <span className="font-bold text-blue-600 dark:text-blue-400">"ຫາວັນທີ"</span> ໃນຊ່ອງຕົວກອງດ້ານເທິງ ແລ້ວກົດປຸ່ມ <span className="font-bold text-indigo-600 dark:text-indigo-400">"ຄົ້ນຫາ / ດຶງລາຍງານ"</span> ເພື່ອສະແດງຂໍ້ມູນລາຍງານ
              </p>
            </div>

            {/* Step Guide Badges */}
            {/* <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>ເລືອກວັນທີ</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 hidden sm:block" />
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>ເລືອກແຂວງ/ເມືອງ (ຖ້າຕ້ອງການ)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 hidden sm:block" />
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>ກົດປຸ່ມຄົ້ນຫາ</span>
              </div>
            </div> */}
          </div>
        )}

        {/* Search Results Content */}
        {hasSearched && (
          <div className="space-y-6">
            {/* Summary Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
              {/* Card 1: Total Docs */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-blue-500/40 transition-all">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    ເອກະສານແຈ້ງມອດໄຟທັງໝົດ
                  </p>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                    {stats.totalDocs.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-slate-400">ລາຍການ</span>
                  </p>
                </div>
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <FileX className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Total Duration / useTime */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-amber-500/40 transition-all">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    ເວລາທີ່ໃຊ້ລວມ
                  </p>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400 tracking-tight">
                    {stats.formattedDuration}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    ({stats.totalUseTimeMinutes.toLocaleString()} ນາທີ)
                  </p>
                </div>
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <Timer className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Affected Villages */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-purple-500/40 transition-all">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    ບ້ານທີ່ຈະມອດໄຟທັງໝົດ
                  </p>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                    {stats.totalVillages.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-slate-400">ບ້ານ</span>
                  </p>
                </div>
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Affected Users */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-emerald-500/40 transition-all">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    ຜູ້ໃຊ້ໄຟທີ່ໄດ້ຮັບການແຈ້ງເຕືອນທັງໝົດ
                  </p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {stats.totalUsers.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-slate-400">ທ່ານ</span>
                  </p>
                </div>
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Data Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none overflow-hidden">
              {/* Table Title Bar & Export Action Buttons */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-6 bg-blue-600 rounded-full" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    ລາຍການແຈ້ງການມອດໄຟ
                  </h3>
                  <span className="text-xs px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full font-bold">
                    {total} ລາຍການ
                  </span>
                </div>

                {/* Save Excel & Save PDF Action Buttons */}
                {reportData.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 transition-all shadow-xs"
                      title="ສົ່ງອອກ Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span>ສົ່ງອອກ Excel (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-bold rounded-xl border border-red-200/80 dark:border-red-900/50 transition-all shadow-xs"
                      title="ສົ່ງອອກ PDF (.pdf)"
                    >
                      <FileType className="w-4 h-4 text-red-500" />
                      <span>ສົ່ງອອກ PDF (.pdf)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Table Element */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 select-none">
                      <th className="py-4 px-4 w-12 text-center">#</th>
                      <th className="py-4 px-4 min-w-[200px]">ຫົວຂໍ້</th>
                      <th className="py-4 px-4 min-w-[140px]">ວັນທີມອດໄຟ</th>
                      <th className="py-4 px-4 min-w-[120px]">ເວລາ</th>
                      <th className="py-4 px-4 min-w-[130px] bg-amber-50/30 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400">
                        ເວລາທີ່ໃຊ້ (ນາທີ)
                      </th>
                      <th className="py-4 px-4 min-w-[110px]">ແຂວງ</th>
                      <th className="py-4 px-4 min-w-[110px]">ເມືອງ</th>
                      <th className="py-4 px-4 min-w-[220px]">ບ້ານທີ່ຈະມອດໄຟ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-slate-400">
                          <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-blue-500" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            ກຳລັງໂຫຼດຂໍ້ມູນລາຍງານ...
                          </span>
                        </td>
                      </tr>
                    ) : reportData.length > 0 ? (
                      reportData.map((item, idx) => {
                        const rowNum = (page - 1) * limit + idx + 1;
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            {/* # */}
                            <td className="py-4 px-4 text-center font-bold text-slate-400 group-hover:text-blue-600">
                              {rowNum}
                            </td>

                            {/* Title */}
                            <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                              <p className="line-clamp-2 leading-relaxed">{item.title}</p>
                              {item.description && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span>
                                  {moment(item.startDate).format("DD/MM/YYYY")}
                                  {item.startDate !== item.endDate && (
                                    <> - {moment(item.endDate).format("DD/MM/YYYY")}</>
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* Time */}
                            <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>
                                  {item.startTime || "--:--"} - {item.endTime || "--:--"}
                                </span>
                              </div>
                            </td>

                            {/* useTime (นาที) */}
                            <td className="py-4 px-4 bg-amber-50/20 dark:bg-amber-950/5">
                              {item.useTime !== null && item.useTime !== undefined ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50 shadow-2xs">
                                  <Timer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span>{item.useTime} ນາທີ</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">-</span>
                              )}
                            </td>

                            {/* Province */}
                            <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                              {item.province?.province_name || "-"}
                            </td>

                            {/* District */}
                            <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                              {item.district?.district_name || "-"}
                            </td>

                            {/* Villages */}
                            <td className="py-4 px-4">
                              {item.turnoffAddresses && item.turnoffAddresses.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[280px]">
                                  {item.turnoffAddresses.slice(0, 3).map((addr) => (
                                    <span
                                      key={addr.id}
                                      className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-semibold"
                                    >
                                      {addr.village?.village_name || `Village #${addr.villageId}`}
                                      {addr.userCount ? ` (${addr.userCount} ທ່ານ)` : ""}
                                    </span>
                                  ))}
                                  {item.turnoffAddresses.length > 3 && (
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md font-bold">
                                      +{item.turnoffAddresses.length - 3} ບ້ານ
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 font-normal">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-slate-400">
                          <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            ບໍ່ພົບຂໍ້ມູນລາຍງານຕາມຕົວກອງນີ້
                          </p>
                          <p className="text-xs mt-1 text-slate-400">
                            ລອງປ່ຽນຊ່ວງວັນທີ ຫຼື ເລືອກແຂວງ/ເມືອງ ໃໝ່
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {reportData.length > 0 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
                    <span>ສະແດງ</span>
                    <select
                      value={limit}
                      onChange={(e) => handleLimitChange(Number(e.target.value))}
                      className="py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>ລາຍການຕໍ່ໜ້າ (ທັງໝົດ {total} ລາຍການ)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1 || loading}
                      className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-slate-700 dark:text-slate-200 px-3">
                      ໜ້າ {page} ຈາກ {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages || loading}
                      className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-bold"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
