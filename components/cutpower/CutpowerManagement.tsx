"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  FileText,
  Calendar,
  User,
  MapPin,
  Eye,
} from "lucide-react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import { encryptId } from "@/lib/crypto";
import moment from "moment";
import { TableTooltip, ButtonTooltip } from "@/lib/Tooltip";
import { CutpowerDoc } from "@/schemas/cutpower";

// Modals
import { AddCutpowerModal } from "./AddCutpowerModal";
import { EditCutpowerModal } from "./EditCutpowerModal";
import { DeleteCutpowerModal } from "./DeleteCutpowerModal";
import { ViewCutpowerModal } from "./ViewCutpowerModal";

const ROWS_PER_PAGE = 10;

export function CutpowerManagement() {
  const router = useRouter();
  const [docs, setDocs] = useState<CutpowerDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cutpowerDate, setCutpowerDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination State
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: ROWS_PER_PAGE,
  });

  // Dropdown States for location filters
  const [provinces, setProvinces] = useState<{ id: number; province_name: string; province_code: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; district_name: string; district_code: string }[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [filterMyDocs, setFilterMyDocs] = useState(false);

  // User Role & Province States for role-based filters
  const [currentUserRoleId, setCurrentUserRoleId] = useState<number | null>(null);
  const [currentUserProvinceId, setCurrentUserProvinceId] = useState<number | null>(null);

  const effectiveProvinceId = useMemo(() => {
    if (currentUserRoleId === 4) {
      return currentUserProvinceId ? String(currentUserProvinceId) : "";
    }
    return selectedProvinceId;
  }, [currentUserRoleId, currentUserProvinceId, selectedProvinceId]);

  // Modals States
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CutpowerDoc | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Fetch Current Logged-in User Profile on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        setCurrentUserId(res.data?.id || null);
        setCurrentUserRoleId(res.data?.roleId || null);
        setCurrentUserProvinceId(res.data?.provinceId || null);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch Provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axiosInstance.get("/provinces/selectprovince");
        setProvinces(res.data || []);
      } catch (err) {
        console.error("Failed to load provinces:", err);
      }
    };
    fetchProvinces();
  }, []);

  // Load districts when effectiveProvinceId changes
  useEffect(() => {
    if (!effectiveProvinceId || provinces.length === 0) {
      setDistricts([]);
      setSelectedDistrictId("");
      return;
    }

    const fetchDistricts = async () => {
      try {
        const selectedProv = provinces.find((p) => p.id === Number(effectiveProvinceId));
        if (!selectedProv) return;

        const res = await axiosInstance.get(`/districts/selectdistrict?provinceCode=${selectedProv.province_code}`);
        setDistricts(res.data || []);
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    };
    fetchDistricts();
  }, [effectiveProvinceId, provinces]);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<CutpowerDoc | null>(null);

  const openViewFile = (doc: CutpowerDoc) => {
    setViewDoc(doc);
    setViewOpen(true);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Load outage documents from backend
  const fetchDocs = useCallback(async (searchVal = "", date = "", provId = "", distId = "", myDocsOnly = false) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/cutpowerdocs", {
        params: {
          search: searchVal.trim() || undefined,
          cutpowerDate: date || undefined,
          provinceId: provId || undefined,
          districtId: distId || undefined,
          filterMyDocs: myDocsOnly || undefined,
        },
      });
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setDocs(data);
    } catch (err) {
      console.error("Failed to load cutpower documents:", err);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນແຈ້ງການຕັດໄຟໄດ້");

    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch documents when filter state changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    fetchDocs(debouncedSearch, cutpowerDate, effectiveProvinceId, selectedDistrictId, filterMyDocs);
  }, [debouncedSearch, cutpowerDate, effectiveProvinceId, selectedDistrictId, filterMyDocs, fetchDocs]);

  // Keep track of latest filter values in a ref to avoid reconnecting SSE on every keystroke/filter change
  const filterRef = useRef({ debouncedSearch, cutpowerDate, effectiveProvinceId, selectedDistrictId, filterMyDocs });
  useEffect(() => {
    filterRef.current = { debouncedSearch, cutpowerDate, effectiveProvinceId, selectedDistrictId, filterMyDocs };
  }, [debouncedSearch, cutpowerDate, effectiveProvinceId, selectedDistrictId, filterMyDocs]);

  // Real-time SSE Connection
  useEffect(() => {
    const sseUrl = `/api/cutpowerdocs/sse`;
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource(sseUrl, {
        withCredentials: true,
      });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.action === "refresh") {
            const { debouncedSearch: s, cutpowerDate: cd, effectiveProvinceId: ep, selectedDistrictId: sdId, filterMyDocs: md } = filterRef.current;
            fetchDocs(s, cd, ep, sdId, md);
          }
        } catch (err) {
          console.error("Failed to parse SSE event data:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE connection error, attempting to reconnect in 5s...", err);
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          connectSSE();
        }, 5000);
      };
    };

    connectSSE();

    // Reconnect when browser/tab becomes active/visible again after sleep/inactive
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const isClosed = !eventSource || eventSource.readyState === EventSource.CLOSED;
        if (isClosed) {
          console.log("SSE connection lost or inactive, auto-reconnecting on visibility change...");
          connectSSE();
        }
      }
    };

    // Periodic check every 30 seconds to ensure connection is not closed
    const keepAliveInterval = setInterval(() => {
      const isClosed = !eventSource || eventSource.readyState === EventSource.CLOSED;
      if (isClosed && !reconnectTimeout) {
        console.log("SSE connection detected as closed in keep-alive check. Reconnecting...");
        connectSSE();
      }
    }, 30000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange); // Also check when window gets focus

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      clearInterval(keepAliveInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [fetchDocs]);

  // Reset Filters handler
  const handleClearFilters = () => {
    setSearch("");
    setCutpowerDate("");
    setSelectedProvinceId("");
    setSelectedDistrictId("");
    setFilterMyDocs(false);
  };

  // Handlers
  const openAdd = () => setAddOpen(true);

  const openEdit = (doc: CutpowerDoc) => {
    setSelectedDoc(doc);
    setEditOpen(true);
  };

  const openAssignVillages = (doc: CutpowerDoc) => {
    const encrypted = encryptId(doc.id);
    router.push(`/cutpowerassign?id=${encrypted}`);
  };

  const openDelete = (doc: CutpowerDoc) => {
    setSelectedDoc(doc);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      await axiosInstance.delete(`/cutpowerdocs/${selectedDoc.id}`);
      setDocs((prev) => prev.filter((d) => d.id !== selectedDoc.id));
      setDeleteOpen(false);
      toast.success("ລົບຂໍ້ມູນແຈ້ງການຕັດໄຟສຳເລັດ");

    } catch (err) {
      console.error("Failed to delete cutpower document:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນ");
    }
  };

  // Columns definition
  const columns = useMemo<ColumnDef<CutpowerDoc>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ເລກທີ",
        cell: ({ getValue }) => (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {getValue() as any}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "ຫົວຂໍ້",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="flex flex-col gap-1 min-w-[200px] w-auto py-1">
              <TableTooltip text={doc.title}>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-250 break-all whitespace-normal">
                  {doc.title}
                </div>
              </TableTooltip>
            </div>
          );
        },
      },
      {
        id: "cutpowerDate",
        header: "ວັນທີ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-350 flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              {moment(doc.cutpowerDate).format("DD/MM/YYYY")}
            </span>
          );
        },
      },
      {
        id: "province",
        header: "ແຂວງ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <span className="text-sm text-slate-600 dark:text-slate-350 whitespace-nowrap">
              {doc.province?.province_name || "-"}
            </span>
          );
        },
      },
      {
        id: "district",
        header: "ເມືອງ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <span className="text-sm text-slate-600 dark:text-slate-350 whitespace-nowrap">
              {doc.district?.district_name || "-"}
            </span>
          );
        },
      },
      {
        id: "creator",
        header: "ຜູ້ສ້າງ",
        cell: ({ row }) => {
          const doc = row.original;
          const firstName = doc.createdBy?.employee?.first_name || "";
          const lastName = doc.createdBy?.employee?.last_name || "";
          const name = `${firstName} ${lastName}`.trim() || doc.createdBy?.username || "-";
          return (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 whitespace-nowrap">
              <User className="w-3 h-3 text-slate-400 shrink-0" />
              {name}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "#",
        cell: ({ row }) => {
          const doc = row.original;
          const isCreator = currentUserId !== null && (Number(currentUserId) === Number(doc.createdById) || Number(currentUserId) === Number(doc.createdBy?.id));
          const isPast = doc.cutpowerDate ? moment().isAfter(moment(doc.cutpowerDate).endOf('day')) : false;
          const isDeleteDisabled = !isCreator || isPast;

          return (
            <div className="flex items-center gap-1.5 shrink-0">
              {doc.cutpowerFile && (
                <ButtonTooltip text="ເບິ່ງເອກະສານ">
                  <button
                    onClick={() => openViewFile(doc)}
                    className="p-2 rounded-xl text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-colors shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </ButtonTooltip>
              )}

              <ButtonTooltip text={!isCreator ? "ບໍ່ມີສິດກຳນົດບ້ານ" : isPast ? "ກາຍເວລາສິ້ນສຸດ" : "ກຳນົດບ້ານ"}>
                <button
                  onClick={() => openAssignVillages(doc)}
                  disabled={!isCreator || isPast}
                  className={`p-2 rounded-xl transition-colors shrink-0 ${(!isCreator || isPast)
                    ? "text-slate-400 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed opacity-50"
                    : doc.provinceId
                      ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                      : "text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20"
                    }`}
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </ButtonTooltip>
              <ButtonTooltip text={isCreator ? "ແກ້ໄຂ" : "ບໍ່ມີສິດແກ້ໄຂ"}>
                <button
                  onClick={() => openEdit(doc)}
                  disabled={!isCreator}
                  className={`p-2 rounded-xl transition-colors shrink-0 ${!isCreator
                    ? "text-slate-400 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed opacity-50"
                    : "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                    }`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </ButtonTooltip>
              <ButtonTooltip text={!isCreator ? "ບໍ່ມີສິດລົບ" : isPast ? "ກາຍເວລາສິ້ນສຸດ" : "ລົບ"}>
                <button
                  onClick={() => openDelete(doc)}
                  disabled={isDeleteDisabled}
                  className={`p-2 rounded-xl transition-colors shrink-0 ${isDeleteDisabled
                    ? "text-slate-400 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed opacity-50"
                    : "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                    }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </ButtonTooltip>
            </div>
          );
        },
      },
    ],
    [currentUserId]
  );

  const filteredDocs = useMemo(() => {
    return docs;
  }, [docs]);

  const table = useReactTable({
    data: filteredDocs,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  const generatePagination = () => {
    const currentPage = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    const pages = [];

    if (pageCount <= 5) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(0, 1, 2, 3, "...", pageCount - 1);
      } else if (currentPage >= pageCount - 3) {
        pages.push(0, "...", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1);
      } else {
        pages.push(0, "...", currentPage - 1, currentPage, currentPage + 1, "...", pageCount - 1);
      }
    }
    return pages;
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            ແຈ້ງການຕັດໄຟ

          </h1>
        </div>
        <div className="sm:ml-auto flex items-center">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            ເພີ່ມຂໍ້ມູນ
          </button>
        </div>
      </div>

      {/* Table Card Container */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
      >
        {/* Toolbar */}
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 border-b"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
              style={{
                fontFamily: "inherit",
                background: "rgb(var(--bg))",
                border: "1px solid rgb(var(--border))",
                color: "rgb(var(--text-primary))",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgb(var(--brand))")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgb(var(--border))")}
            />
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-xs text-slate-500">
              {table.getFilteredRowModel().rows.length} ລາຍການ
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                fontFamily: "inherit",
                background: showFilters ? "rgb(var(--brand))" : "rgb(var(--bg))",
                border: showFilters ? "1px solid rgb(var(--brand))" : "1px solid rgb(var(--border))",
                color: showFilters ? "white" : "rgb(var(--text-secondary))",
              }}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            className="flex flex-col sm:flex-row gap-4 px-4 sm:px-6 py-4 border-b text-sm items-end"
            style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--bg))" }}
          >
            <div className="w-full sm:w-48 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">ວັນທີ</label>
              <input
                type="date"
                value={cutpowerDate}
                onChange={(e) => setCutpowerDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-theme-bg border-theme outline-none text-xs"
                style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
              />
            </div>
            {currentUserRoleId !== 4 && currentUserRoleId !== 5 && (
              <div className="w-full sm:w-48 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">ແຂວງ</label>
                <div className="relative w-full">
                  <select
                    value={selectedProvinceId}
                    onChange={(e) => setSelectedProvinceId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border outline-none text-xs appearance-none cursor-pointer"
                    style={{ fontFamily: "'Noto Sans Lao', sans-serif", background: "rgb(var(--card))", color: "rgb(var(--text-primary))", borderColor: "rgb(var(--border))" }}
                  >
                    <option value="">ເລືອກແຂວງ</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>{p.province_name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}
            {currentUserRoleId !== 5 && (
              <div className="w-full sm:w-48 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">ເມືອງ</label>
                <div className="relative w-full">
                  <select
                    value={selectedDistrictId}
                    disabled={!effectiveProvinceId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border outline-none text-xs appearance-none cursor-pointer"
                    style={{ fontFamily: "'Noto Sans Lao', sans-serif", background: "rgb(var(--card))", color: "rgb(var(--text-primary))", borderColor: "rgb(var(--border))" }}
                  >
                    <option value="">ເລືອກເມືອງ</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.district_name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center pb-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterMyDocs}
                  onChange={(e) => setFilterMyDocs(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-350 dark:border-slate-700 bg-transparent focus:ring-brand cursor-pointer"
                  style={{ accentColor: "rgb(var(--brand))" }}
                />
                <span className="text-xs font-semibold text-slate-500 uppercase">ສະເພາະເອກະສານຂອງຂ້ອຍ</span>
              </label>
            </div>
            <div className="sm:ml-auto flex items-center pb-2.5">
              <button
                onClick={handleClearFilters}
                className="text-xs font-medium text-slate-500 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Table layout */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[800px] lg:min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} style={{ background: "rgb(var(--bg))" }}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-slate-500">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-slate-350" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">ບໍ່ພົບຂໍ້ມູນເອກະສານ</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                    style={{ borderColor: "rgb(var(--border))" }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination layout */}
        {table.getPageCount() > 1 && (
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 border-t"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <span className="text-xs text-slate-500">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="w-8 h-8 flex items-center justify-center rounded-lg border bg-theme-bg border-theme text-slate-500 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {generatePagination().map((page, idx) => {
                if (page === "...") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs font-semibold text-slate-400">
                      ...
                    </span>
                  );
                }
                const i = page as number;
                return (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: table.getState().pagination.pageIndex === i ? "rgb(var(--brand))" : "transparent",
                      border: "1px solid rgb(var(--border))",
                      color: table.getState().pagination.pageIndex === i ? "white" : "rgb(var(--text-secondary))",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="w-8 h-8 flex items-center justify-center rounded-lg border bg-theme-bg border-theme text-slate-500 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AddCutpowerModal open={addOpen} onClose={() => setAddOpen(false)} onRefresh={() => fetchDocs(search, cutpowerDate, effectiveProvinceId, selectedDistrictId, filterMyDocs)} />

      <EditCutpowerModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        selectedDoc={selectedDoc}
        onRefresh={() => fetchDocs(search, cutpowerDate, effectiveProvinceId, selectedDistrictId, filterMyDocs)}
      />

      <DeleteCutpowerModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleDelete}
        selectedDoc={selectedDoc}
      />

      <ViewCutpowerModal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewDoc(null); }}
        selectedDoc={viewDoc}
      />
    </div>
  );
}
