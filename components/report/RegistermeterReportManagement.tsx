"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  FileText,
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Building2,
  Home,
  FileSpreadsheet,
  FileType,
  Sparkles,
  Layers,
  Component,
} from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { notoSansLaoBase64 } from "@/lib/notoSansLaoBase64";

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

interface Village {
  id: number;
  village_name: string;
}

interface MeterStatus {
  id: number;
  callcenter: string;
}

interface SourceType {
  id: number;
  name: string;
}

interface RegisterMeterReportItem {
  id: number;
  fullName: string;
  phone: string;
  accountNear: string;
  lat?: number | null;
  lng?: number | null;
  provinceId: number;
  province?: Province | null;
  districtId: number;
  district?: District | null;
  villageId: number;
  village?: Village | null;
  meterStatusId: number;
  meterStatus?: MeterStatus | null;
  sourcetypeId: number;
  sourcetype?: SourceType | null;
  createdAt: string;
  updatedAt: string;
}

export function RegistermeterReportManagement() {
  // Filter States
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [provinceId, setProvinceId] = useState<string>("all");
  const [districtId, setDistrictId] = useState<string>("all");
  const [villageId, setVillageId] = useState<string>("all");
  const [meterStatusId, setMeterStatusId] = useState<string>("all");
  const [sourcetypeId, setSourcetypeId] = useState<string>("all");

  // Dropdown Options States
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [meterStatuses, setMeterStatuses] = useState<MeterStatus[]>([]);
  const [sourceTypes, setSourceTypes] = useState<SourceType[]>([]);

  // Report Data States
  const [reportData, setReportData] = useState<RegisterMeterReportItem[]>([]);
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

  // 1. Fetch Provinces, MeterStatuses, SourceTypes on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [provRes, statusRes, sTypesRes] = await Promise.all([
          axiosInstance.get("/provinces/selectprovince"),
          axiosInstance.get("/meterstatues/selectstatus"),
          axiosInstance.get("/sourcetypes/selectsource"),
        ]);
        setProvinces(provRes.data || []);
        setMeterStatuses(statusRes.data || []);
        setSourceTypes(
          Array.isArray(sTypesRes.data)
            ? sTypesRes.data
            : sTypesRes.data?.data || []
        );
      } catch (err) {
        console.error("Failed to load initial dropdowns:", err);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Fetch Districts list when effectiveProvinceId changes
  useEffect(() => {
    if (!effectiveProvinceId || effectiveProvinceId === "all" || provinces.length === 0) {
      setDistricts([]);
      setDistrictId("all");
      setVillages([]);
      setVillageId("all");
      return;
    }
    const selectedProv = provinces.find((p) => String(p.id) === effectiveProvinceId);
    if (!selectedProv) {
      setDistricts([]);
      setDistrictId("all");
      setVillages([]);
      setVillageId("all");
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
      setVillages([]);
      setVillageId("all");
    };

    fetchDistricts();
  }, [effectiveProvinceId, provinces]);

  // 3. Fetch Villages list when effectiveDistrictId changes
  useEffect(() => {
    if (!effectiveDistrictId || effectiveDistrictId === "all" || districts.length === 0) {
      setVillages([]);
      setVillageId("all");
      return;
    }
    const selectedDist = districts.find((d) => String(d.id) === effectiveDistrictId);
    if (!selectedDist) {
      setVillages([]);
      setVillageId("all");
      return;
    }

    const fetchVillages = async () => {
      try {
        const res = await axiosInstance.get(
          `/villages/selectvillage?districtCode=${selectedDist.district_code}`
        );
        if (Array.isArray(res.data)) {
          setVillages(res.data);
        } else {
          setVillages([]);
        }
      } catch (err) {
        console.error("Failed to load villages:", err);
        setVillages([]);
      }
      setVillageId("all");
    };

    fetchVillages();
  }, [effectiveDistrictId, districts]);

  // 4. Fetch Register Meter Report Data
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
      if (villageId && villageId !== "all") {
        params.villageId = Number(villageId);
      }
      if (meterStatusId && meterStatusId !== "all") {
        params.meterStatusId = Number(meterStatusId);
      }
      if (sourcetypeId && sourcetypeId !== "all") {
        params.sourcetypeId = Number(sourcetypeId);
      }

      const res = await axiosInstance.get("/reports/registermeter", { params });

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
      console.error("Failed to fetch registermeter report:", err);
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
    setVillageId("all");
    setMeterStatusId("all");
    setSourcetypeId("all");
    setReportData([]);
    setTotal(0);
    setPage(1);
    setHasSearched(false);
  };

  // Export to Excel (.xlsx) using SheetJS 'xlsx' library
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      toast.warning("ບໍ່ມີຂໍ້ມູນລາຍງານເພື່ອສົ່ງອອກ");
      return;
    }

    const exportRows = reportData.map((d, index) => {
      return {
        "ລຳດັບ": index + 1,
        "ວັນທີແຈ້ງ": d.createdAt ? moment(d.createdAt).format("DD/MM/YYYY HH:mm") : "-",
        "ຊື່ ແລະ ນາມສະກຸນ": d.fullName || "",
        "ເບີໂທ": d.phone || "",
        "ບັນຊີໄກ້ກຽງ": d.accountNear || "",
        "ສະຖານະ": d.meterStatus?.callcenter || "-",
        "ຊ່ອງທາງ": d.sourcetype?.name || "-",
        "ແຂວງ": d.province?.province_name || "-",
        "ເມືອງ": d.district?.district_name || "-",
        "ບ້ານ": d.village?.village_name || "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Register Meter Report");

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

    XLSX.writeFile(workbook, `registermeter_report_${startDate}_to_${endDate}.xlsx`);
    toast.success("ສົ່ງອອກຂໍ້ມູນ Excel (.xlsx) ສຳເລັດແລ້ວ");
  };

  // Export to PDF (.pdf)
  const handleExportPDF = async () => {
    if (!startDate || !endDate) {
      toast.warning("ກະລຸນາເລືອກ ວັນທີເລີ່ມຕົ້ນ ແລະ ຫາວັນທີ ກ່ອນສົ່ງອອກ PDF");
      return;
    }

    let allData: RegisterMeterReportItem[] = [];
    try {
      const params: Record<string, any> = {
        page: 1,
        limit: 9999,
        startDate,
        endDate,
      };
      if (effectiveProvinceId && effectiveProvinceId !== "all") params.provinceId = Number(effectiveProvinceId);
      if (effectiveDistrictId && effectiveDistrictId !== "all") params.districtId = Number(effectiveDistrictId);
      if (villageId && villageId !== "all") params.villageId = Number(villageId);
      if (meterStatusId && meterStatusId !== "all") params.meterStatusId = Number(meterStatusId);
      if (sourcetypeId && sourcetypeId !== "all") params.sourcetypeId = Number(sourcetypeId);

      const res = await axiosInstance.get("/reports/registermeter", { params });
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

    // ── Compute summary stats ────────────────────────────────────────────
    const uniqueVillages = new Set(allData.map((d) => d.villageId)).size;

    // ── Initialise jsPDF (A4 Landscape) ──────────────────────────────────
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

    const isLaoChar = (ch: string) => {
      const code = ch.charCodeAt(0);
      return code >= 0x0e80 && code <= 0x0eff;
    };

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

    const mixedTextWidth = (text: string, size: number): number => {
      let w = 0;
      for (const seg of splitSegments(text)) {
        doc.setFont(seg.isLao ? "NotoSansLao" : "helvetica", "normal");
        doc.setFontSize(size);
        w += doc.getTextWidth(seg.text);
      }
      return w;
    };

    const drawMixed = (
      text: string,
      x: number,
      y: number,
      size: number,
      align: "left" | "right" = "left"
    ): number => {
      const segs = splitSegments(text);
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

    const setLao = (size: number) => { doc.setFont("NotoSansLao", "normal"); doc.setFontSize(size); };

    // ── Header ───────────────────────────────────────────────────────
    doc.setFillColor(37, 99, 235);
    doc.rect(marginL, 8, contentW, 1.2, "F");

    doc.setTextColor(15, 23, 42);
    setLao(15);
    doc.text("ລາຍງານການຂໍໝໍ້ນັບໄຟໃໝ່", marginL, 20);

    const filterProvince = effectiveProvinceId && effectiveProvinceId !== "all"
      ? (provinces.find((p) => String(p.id) === effectiveProvinceId)?.province_name ?? "ທຸກແຂວງ")
      : "ທຸກແຂວງ";
    const filterDistrict = effectiveDistrictId && effectiveDistrictId !== "all"
      ? (districts.find((d) => String(d.id) === effectiveDistrictId)?.district_name ?? "ທຸກເມືອງ")
      : "ທຸກເມືອງ";
    const filterVillage = villageId !== "all"
      ? (villages.find((v) => String(v.id) === villageId)?.village_name ?? "ທຸກບ້ານ")
      : "ທຸກບ້ານ";

    doc.setTextColor(100, 116, 139);
    drawMixed(
      `ຊ່ວງວັນທີ: ${moment(startDate).format("DD/MM/YYYY")} – ${moment(endDate).format("DD/MM/YYYY")}`,
      pageW - marginR, 20, 8, "right"
    );
    drawMixed(`ແຂວງ: ${filterProvince}   ເມືອງ: ${filterDistrict}   ບ້ານ: ${filterVillage}`, pageW - marginR, 25, 8, "right");
    drawMixed(`ພິມວັນທີ: ${printedAt}`, pageW - marginR, 30, 8, "right");

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(marginL, 33, pageW - marginR, 33);

    // ── Summary Stats Row ────────────────────────────────────────────────
    const statsY = 36;
    const cardW = contentW / 2;
    const statCards = [
      {
        label: "ເອກະສານຂໍໝໍ້ນັບໄຟທັງໝົດ",
        value: `${allData.length.toLocaleString()} ລາຍການ`,
        color: [37, 99, 235] as [number, number, number],
      },
      {
        label: "ບ້ານທີ່ມີການຂໍໝໍ້ນັບໄຟ",
        value: `${uniqueVillages.toLocaleString()} ບ້ານ`,
        color: [124, 58, 237] as [number, number, number],
      },
    ];

    statCards.forEach((card, i) => {
      const x = marginL + i * cardW;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x + 1, statsY, cardW - 2, 18, 2, 2, "F");
      doc.setFillColor(...card.color);
      doc.roundedRect(x + 1, statsY, 2.5, 18, 1, 1, "F");
      setLao(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(card.label, x + 6, statsY + 7);
      doc.setTextColor(...card.color);
      drawMixed(card.value, x + 6, statsY + 14, 9);
    });

    // ── Build Table Data ─────────────────────────────────────────────────
    const tableColumn = [
      "ລຳດັບ",
      "ວັນທີແຈ້ງ",
      "ຊື່ ແລະ ນາມສະກຸນ",
      "ເບີໂທ",
      "ບັນຊີໄກ້ກຽງ",
      "ສະຖານະ",
      "ຊ່ອງທາງ",
      "ແຂວງ",
      "ເມືອງ",
      "ບ້ານ",
    ];

    const tableRows = allData.map((d, index) => {
      return [
        String(index + 1),
        d.createdAt ? moment(d.createdAt).format("DD/MM/YYYY") : "-",
        d.fullName || "",
        d.phone || "",
        d.accountNear || "",
        d.meterStatus?.callcenter || "-",
        d.sourcetype?.name || "-",
        d.province?.province_name || "-",
        d.district?.district_name || "-",
        d.village?.village_name || "-",
      ];
    });

    // ── Render autoTable ─────────────────────────────────────────────────
    const _baseW = [10, 25, 45, 28, 30, 30, 25, 26, 26, 30]; // 10 cols, sum = 275
    const _baseSum = _baseW.reduce((a, b) => a + b, 0);
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
        0: { cellWidth: cw(0), halign: "center", fontStyle: "bold" },
        1: { cellWidth: cw(1), halign: "center" },
        2: { cellWidth: cw(2) },
        3: { cellWidth: cw(3), halign: "center" },
        4: { cellWidth: cw(4) },
        5: { cellWidth: cw(5) },
        6: { cellWidth: cw(6) },
        7: { cellWidth: cw(7) },
        8: { cellWidth: cw(8) },
        9: { cellWidth: cw(9) },
      },

      didDrawCell: (data) => {
        if (data.section === "head") {
          const cellText = Array.isArray(data.cell.text)
            ? data.cell.text.join("\n")
            : String(data.cell.text ?? "");

          if (!cellText) return;

          doc.setFillColor(37, 99, 235);
          doc.rect(
            data.cell.x + 0.1,
            data.cell.y + 0.1,
            data.cell.width - 0.2,
            data.cell.height - 0.2,
            "F"
          );

          const headFontSize = 7;
          const lines = cellText.split("\n");
          const totalH = lines.length * headFontSize * 0.352 * 2.2;
          let lineY =
            data.cell.y +
            (data.cell.height - totalH) / 2 +
            headFontSize * 0.352 +
            0.3;

          for (const line of lines) {
            const lineW = mixedTextWidth(line, headFontSize);
            const lineX = data.cell.x + (data.cell.width - lineW) / 2;
            doc.setTextColor(255, 255, 255);
            drawMixed(line, lineX, lineY, headFontSize);
            lineY += headFontSize * 0.352 * 2.2;
          }
          return;
        }

        if (data.section !== "body") return;

        const cellText = Array.isArray(data.cell.text)
          ? data.cell.text.join("\n")
          : String(data.cell.text ?? "");

        if (!cellText || cellText === "-") return;

        const fillRgb = data.row.index % 2 === 0
          ? [255, 255, 255]
          : [241, 245, 249];
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
          lineY += fontSize * 0.352 * 2.2;
        }
      },

      didDrawPage: (data) => {
        const totalPages = (doc.internal as any).getNumberOfPages();
        const currentPage = data.pageNumber;

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(marginL, pageH - 10, pageW - marginR, pageH - 10);

        doc.setTextColor(148, 163, 184);
        drawMixed("ລາຍງານການຂໍໝໍ້ນັບໄຟໃໝ່", marginL, pageH - 6, 6.5);

        drawMixed(`Page ${currentPage} / ${totalPages}   |   ${printedAt}`, pageW - marginR, pageH - 6, 6.5, "right");
      },
    });

    // ── Save file ────────────────────────────────────────────────────────
    doc.save(`registermeter_report_${startDate}_to_${endDate}.pdf`);
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
    const uniqueVillages = new Set(reportData.map((d) => d.villageId)).size;

    return {
      totalDocs: total,
      uniqueVillages,
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
                ຕົວກອງຂໍ້ມູນລາຍງານການຂໍໝໍ້ນັບໄຟໃໝ່
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

        {/* Filter Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Meter Status Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ສະຖານະ</span>
            </label>
            <div className="relative">
              <select
                value={meterStatusId}
                onChange={(e) => setMeterStatusId(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
              >
                <option value="all">-- ທຸກສະຖານະ (All Statuses) --</option>
                {meterStatuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.callcenter}
                  </option>
                ))}
              </select>
              <Component className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Source Type Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ຊ່ອງທາງ</span>
            </label>
            <div className="relative">
              <select
                value={sourcetypeId}
                onChange={(e) => setSourcetypeId(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
              >
                <option value="all">-- ທຸກຊ່ອງທາງ (All Channels) --</option>
                {sourceTypes
                  .filter((st) => st.id !== 3)
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
              </select>
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
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

          {/* Village Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between min-h-[18px]">
              <span>ບ້ານ</span>
            </label>
            <div className="relative">
              <select
                value={villageId}
                onChange={(e) => setVillageId(e.target.value)}
                disabled={(!effectiveDistrictId || effectiveDistrictId === "all") || villages.length === 0}
                className="w-full pl-9 pr-10 py-2.5 h-[42px] appearance-none bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">-- ທຸກບ້ານ (All Villages) --</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.village_name}
                  </option>
                ))}
              </select>
              <Home className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
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
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25 border border-white/20">
            <FileText className="w-12 h-12 text-white drop-shadow-md" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="relative z-10 space-y-2 max-w-lg mx-auto">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ກະລຸນາເລືອກຕົວກອງເພື່ອດຶງຂໍ້ມູນລາຍງານການຂໍໝໍ້ນັບໄຟໃໝ່
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              ກະລຸນາເລືອກ <span className="font-bold text-blue-600 dark:text-blue-400">"ວັນທີເລີ່ມຕົ້ນ"</span> ແລະ <span className="font-bold text-blue-600 dark:text-blue-400">"ຫາວັນທີ"</span> ໃນຊ່ອງຕົວກອງດ້ານເທິງ ແລ້ວກົດປຸ່ມ <span className="font-bold text-indigo-600 dark:text-indigo-400">"ຄົ້ນຫາ / ດຶງລາຍງານ"</span> ເພື່ອສະແດງຂໍ້ມູນລາຍງານ
            </p>
          </div>
        </div>
      )}

      {/* Search Results Content */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
            {/* Card 1: Total Docs */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-blue-500/40 transition-all">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ເອກະສານຂໍໝໍ້ນັບໄຟທັງໝົດ
                </p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                  {stats.totalDocs.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-400">ລາຍການ</span>
                </p>
              </div>
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Villages Count */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-purple-500/40 transition-all">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ບ້ານທີ່ມີການຂໍໝໍ້ນັບໄຟ
                </p>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  {stats.uniqueVillages.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-400">ບ້ານ</span>
                </p>
              </div>
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6" />
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
                  ລາຍການການຂໍໝໍ້ນັບໄຟໃໝ່
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
                    <th className="py-4 px-4 min-w-[120px]">ວັນທີແຈ້ງ</th>
                    <th className="py-4 px-4 min-w-[180px]">ຊື່ ແລະ ນາມສະກຸນ</th>
                    <th className="py-4 px-4 min-w-[110px]">ເບີໂທ</th>
                    <th className="py-4 px-4 min-w-[130px]">ບັນຊີໄກ້ກຽງ</th>
                    <th className="py-4 px-4 min-w-[130px]">ສະຖານະ</th>
                    <th className="py-4 px-4 min-w-[110px]">ຊ່ອງທາງ</th>
                    <th className="py-4 px-4 min-w-[110px]">ແຂວງ</th>
                    <th className="py-4 px-4 min-w-[110px]">ເມືອງ</th>
                    <th className="py-4 px-4 min-w-[120px]">ບ້ານ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-slate-400">
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

                          {/* Date */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>
                                {item.createdAt ? moment(item.createdAt).format("DD/MM/YYYY HH:mm") : "-"}
                              </span>
                            </div>
                          </td>

                          {/* Full Name */}
                          <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {item.fullName}
                          </td>

                          {/* Phone */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {item.phone || "-"}
                          </td>

                          {/* Account Near */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {item.accountNear || "-"}
                          </td>


                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {(() => {
                              let badgeClass = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
                              if (item.meterStatusId === 1) {
                                badgeClass = "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/50";
                              } else if (item.meterStatusId === 2) {
                                badgeClass = "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/50";
                              } else if (item.meterStatusId === 3) {
                                badgeClass = "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/50";
                              } else if (item.meterStatusId === 4) {
                                badgeClass = "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200/80 dark:border-red-900/50";
                              } else if (item.meterStatusId === 5) {
                                badgeClass = "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200/80 dark:border-purple-900/50";
                              }
                              return (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${badgeClass}`}>
                                  {item.meterStatus?.callcenter || "-"}
                                </span>
                              );
                            })()}
                          </td>

                          {/* SourceType */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {(() => {
                              let badgeClass = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
                              if (item.sourcetypeId === 1) {
                                badgeClass = "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/50";
                              } else if (item.sourcetypeId === 2) {
                                badgeClass = "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border border-sky-200/80 dark:border-sky-900/50";
                              } else if (item.sourcetypeId === 3) {
                                badgeClass = "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900/50";
                              } else if (item.sourcetypeId === 4) {
                                badgeClass = "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200/80 dark:border-teal-900/50";
                              }
                              return (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${badgeClass}`}>
                                  {item.sourcetype?.name || "-"}
                                </span>
                              );
                            })()}
                          </td>

                          {/* Province */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {item.province?.province_name || "-"}
                          </td>

                          {/* District */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {item.district?.district_name || "-"}
                          </td>

                          {/* Village */}
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {item.village?.village_name || "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-slate-400">
                        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                          ບໍ່ພົບຂໍ້ມູນລາຍງານຕາມຕົວກອງນີ້
                        </p>
                        <p className="text-xs mt-1 text-slate-400">
                          ລອງປ່ຽນຊ່ວງວັນທີ ຫຼື ເລືອກແຂວງ/ເມືອງ/ບ້ານ ໃໝ່
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
