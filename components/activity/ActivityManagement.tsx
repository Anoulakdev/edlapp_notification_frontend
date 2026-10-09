"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  MapPin,
  FileText,
  Image as ImageIcon,
  Newspaper,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import moment from "moment";
import { ButtonTooltip } from "@/lib/Tooltip";
import { Activity } from "@/schemas/activity";
import { ASSET_BASE_URL } from "@/lib/utils";

// Modals
import { AddActivityModal } from "./AddActivityModal";
import { EditActivityModal } from "./EditActivityModal";
import { ViewActivityModal } from "./ViewActivityModal";
import { DeleteActivityModal } from "./DeleteActivityModal";

const ROWS_PER_PAGE = 10;

export function ActivityManagement() {
  const router = useRouter();
  const [docs, setDocs] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: ROWS_PER_PAGE,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to first page when date filters change
  useEffect(() => {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [startDate, endDate]);

  // Modals States
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Activity | null>(null);

  // Authenticate user & role check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        const roleId = res.data?.roleId;
        setUserRole(roleId);
        if ([8].includes(roleId)) {
          setAuthorized(true);
        } else {
          router.replace("/unauthorized");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/signin");
      }
    };
    checkAuth();
  }, [router]);

  // Fetch Activities from backend API with server-side pagination
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axiosInstance.get("/activities", { params });
      if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
        setDocs(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        const arr = Array.isArray(res.data) ? res.data : [];
        setDocs(arr);
        setTotal(arr.length);
        setTotalPages(Math.ceil(arr.length / ROWS_PER_PAGE) || 1);
      }
    } catch (err) {
      console.error("Failed to load activities:", err);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນກິດຈະກຳໄດ້");
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, startDate, endDate]);

  useEffect(() => {
    if (authorized) {
      fetchDocs();
    }
  }, [authorized, fetchDocs]);

  // Handlers
  const openAdd = () => setAddOpen(true);

  const openView = (doc: Activity) => {
    setSelectedDoc(doc);
    setViewOpen(true);
  };

  const openEdit = (doc: Activity) => {
    setSelectedDoc(doc);
    setEditOpen(true);
  };

  const openDelete = (doc: Activity) => {
    setSelectedDoc(doc);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      await axiosInstance.delete(`/activities/${selectedDoc.id}`);
      setDeleteOpen(false);
      toast.success("ລົບຂໍ້ມູນກິດຈະກຳສຳເລັດ");
      fetchDocs();
    } catch (err) {
      console.error("Failed to delete activity:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນ");
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStartDate("");
    setEndDate("");
    setPagination({ pageIndex: 0, pageSize: ROWS_PER_PAGE });
  };

  const canManage = userRole ? [8].includes(userRole) : false;

  // Columns definition
  const columns = useMemo<ColumnDef<Activity>[]>(
    () => [
      {
        id: "index",
        header: "ລຳດັບ",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {pagination.pageIndex * pagination.pageSize + row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "ຫົວຂໍ້ກິດຈະກຳ",
        cell: ({ row }) => (
          <div className="py-1 min-w-[200px] max-w-[320px]">
            <span
              className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 block"
              title={row.original.title}
            >
              {row.original.title}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: "ສະຖານທີ່",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-350 min-w-[140px]">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate max-w-[180px]">{doc.location || "-"}</span>
            </div>
          );
        },
      },
      {
        id: "eventDate",
        header: "ວັນທີຈັດກິດຈະກຳ",
        cell: ({ row }) => {
          const doc = row.original;
          const s = doc.startDate ? moment(doc.startDate).format("DD/MM/YYYY") : "";
          const e = doc.endDate ? moment(doc.endDate).format("DD/MM/YYYY") : "";
          const isSame = s === e;
          return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-350 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{isSame ? s : `${s} - ${e}`}</span>
            </div>
          );
        },
      },
      {
        id: "attachment",
        header: "ໄຟລ໌ຄັດຕິດ",
        cell: ({ row }) => {
          const doc = row.original;
          if (!doc.actFile) {
            return <span className="text-xs text-slate-400 font-medium">-</span>;
          }
          const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.actFile);
          const fileUrl = `${ASSET_BASE_URL}/upload/activity/${doc.actFile}`;

          if (isImage) {
            return (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-12 h-12 rounded-xl overflow-hidden border border-theme bg-slate-100 dark:bg-slate-800 shrink-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                title="ຄລິກເພື່ອເບິ່ງຮູບພາບ"
              >
                <img
                  src={fileUrl}
                  alt={doc.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            );
          }

          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="ຄລິກເພື່ອເປີດໄຟລ໌"
            >
              <FileText className="w-4 h-4 shrink-0 text-red-500" />
              <span>ເປີດໄຟລ໌</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
            </a>
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
          const name = `${firstName} ${lastName}`.trim() || "-";
          return (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 whitespace-nowrap">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {name}
            </span>
          );
        },
      },
      {
        id: "createdAt",
        header: "ວັນທີສ້າງ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {moment(doc.createdAt).format("DD/MM/YYYY HH:mm")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "#",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="flex items-center gap-1.5 shrink-0">
              <ButtonTooltip text="ເບິ່ງລາຍລະອຽດ">
                <button
                  onClick={() => openView(doc)}
                  className="p-2 rounded-xl text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-colors shrink-0 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </ButtonTooltip>
              {canManage && (
                <>
                  <ButtonTooltip text="ແກ້ໄຂ">
                    <button
                      onClick={() => openEdit(doc)}
                      className="p-2 rounded-xl text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 transition-colors shrink-0 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </ButtonTooltip>
                  <ButtonTooltip text="ລົບ">
                    <button
                      onClick={() => openDelete(doc)}
                      className="p-2 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </ButtonTooltip>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [canManage, pagination.pageIndex, pagination.pageSize]
  );

  const table = useReactTable({
    data: docs,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  const generatePagination = () => {
    const currentPage = pagination.pageIndex;
    const pageCount = totalPages;
    const pages: (number | string)[] = [];

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

  if (authorized === null) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          ກຳລັງກວດສອບສິດການເຂົ້າເຖິງ...
        </span>
      </div>
    );
  }

  return (
    <div
      className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8"
      style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1 flex items-center gap-2.5"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            <Newspaper className="w-8 h-8 text-brand" />
            <span>ກິດຈະກຳ</span>
          </h1>
        </div>

        {canManage && (
          <div className="flex items-center">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:opacity-90 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>ເພີ່ມກິດຈະກຳ</span>
            </button>
          </div>
        )}
      </div>

      {/* Table Card Container */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
      >
        {/* Toolbar */}
        <div
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
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

          {/* Date Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>ວັນທີ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs outline-none border border-theme bg-theme-bg"
              />
              <span>ຫາ</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs outline-none border border-theme bg-theme-bg"
              />
            </div>

            {(startDate || endDate || search) && (
              <button
                onClick={handleResetFilters}
                className="p-1.5 rounded-lg border border-theme text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="ລ້າງຕົວກອງ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <span className="text-xs text-slate-500 ml-2 font-medium">
              {table.getFilteredRowModel().rows.length} ລາຍການ
            </span>
          </div>
        </div>

        {/* Table Layout */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[850px] lg:min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} style={{ background: "rgb(var(--bg))" }}>
                  {headerGroup.headers.map((header) => {
                    const widthClass =
                      header.id === "index"
                        ? "w-[6%] min-w-[60px]"
                        : header.id === "title"
                          ? "w-[26%] min-w-[200px]"
                          : header.id === "location"
                            ? "w-[16%] min-w-[140px]"
                            : header.id === "eventDate"
                              ? "w-[16%] min-w-[140px]"
                              : header.id === "attachment"
                                ? "w-[12%] min-w-[110px]"
                                : header.id === "creator"
                                  ? "w-[12%] min-w-[110px]"
                                  : header.id === "createdAt"
                                    ? "w-[10%] min-w-[110px]"
                                    : header.id === "actions"
                                      ? "w-[10%] min-w-[110px]"
                                      : "";
                    return (
                      <th
                        key={header.id}
                        className={`text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 ${widthClass}`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand/30 border-t-brand" />
                    <span className="block text-xs text-slate-400 mt-2 font-medium">
                      ກຳລັງໂຫຼດຂໍ້ມູນ...
                    </span>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-12 text-sm text-slate-400 font-medium"
                  >
                    ບໍ່ພົບຂໍ້ມູນກິດຈະກຳ
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-slate-500/5"
                    style={{ borderColor: "rgb(var(--border))" }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t text-xs text-slate-500"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <div>
            ສະແດງ {total > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0} ຫາ{" "}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              total
            )}{" "}
            ຈາກທັງໝົດ {total} ລາຍການ
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || loading}
              className="p-1.5 rounded-lg border border-theme disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-500/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {generatePagination().map((page, idx) =>
              page === "..." ? (
                <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => table.setPageIndex(Number(page))}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${pagination.pageIndex === page
                    ? "bg-brand text-white font-bold"
                    : "border border-theme hover:bg-slate-500/10 text-slate-600 dark:text-slate-350"
                    }`}
                >
                  {Number(page) + 1}
                </button>
              )
            )}

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || loading}
              className="p-1.5 rounded-lg border border-theme disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-500/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddActivityModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onRefresh={fetchDocs}
      />

      <EditActivityModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedDoc(null);
        }}
        onRefresh={fetchDocs}
        selectedDoc={selectedDoc}
      />

      <ViewActivityModal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelectedDoc(null);
        }}
        selectedDoc={selectedDoc}
      />

      <DeleteActivityModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedDoc(null);
        }}
        onDelete={handleDelete}
        selectedDoc={selectedDoc}
      />
    </div>
  );
}
