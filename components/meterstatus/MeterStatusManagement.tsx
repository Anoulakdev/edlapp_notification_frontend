"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import { ButtonTooltip } from "@/lib/Tooltip";
import { MeterStatus } from "@/schemas/meterstatus";

// Modals
import { AddMeterStatusModal } from "./AddMeterStatusModal";
import { EditMeterStatusModal } from "./EditMeterStatusModal";
import { DeleteMeterStatusModal } from "./DeleteMeterStatusModal";

const ROWS_PER_PAGE = 10;

export function MeterStatusManagement() {
  const router = useRouter();
  const [docs, setDocs] = useState<MeterStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  // Pagination State
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: ROWS_PER_PAGE,
  });

  // Modals States
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<MeterStatus | null>(null);

  // Authenticate user & role check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        if (res.data?.roleId === 1) {
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

  // Fetch Meter Statuses from backend
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/meterstatues");
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setDocs(data);
    } catch (err) {
      console.error("Failed to load meter statuses:", err);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສະຖານະຂໍໝໍ້ນັບໄຟໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) {
      fetchDocs();
    }
  }, [authorized, fetchDocs]);

  // Handlers
  const openAdd = () => setAddOpen(true);

  const openEdit = (doc: MeterStatus) => {
    setSelectedDoc(doc);
    setEditOpen(true);
  };

  const openDelete = (doc: MeterStatus) => {
    setSelectedDoc(doc);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      await axiosInstance.delete(`/meterstatues/${selectedDoc.id}`);
      setDocs((prev) => prev.filter((d) => d.id !== selectedDoc.id));
      setDeleteOpen(false);
      toast.success("ລົບຂໍ້ມູນສະຖານະຂໍໝໍ້ນັບໄຟສຳເລັດ");
    } catch (err) {
      console.error("Failed to delete meter status:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນ");
    }
  };

  // Columns definition
  const columns = useMemo<ColumnDef<MeterStatus>[]>(
    () => [
      {
        id: "index",
        header: "ລຳດັບ",
        cell: ({ row }) => {
          return (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {row.index + 1 + pagination.pageIndex * pagination.pageSize}
            </span>
          );
        },
      },
      {
        accessorKey: "edlapp",
        header: "ສະຖານະ EDL App",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-all whitespace-normal py-1">
              {doc.edlapp || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "callcenter",
        header: "ສະຖານະ Call Center",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="text-sm text-slate-600 dark:text-slate-400 break-all whitespace-normal py-1">
              {doc.callcenter || "-"}
            </div>
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
              <ButtonTooltip text="ແກ້ໄຂ">
                <button
                  onClick={() => openEdit(doc)}
                  className="p-2 rounded-xl text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 transition-colors shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </ButtonTooltip>
              <ButtonTooltip text="ລົບ">
                <button
                  onClick={() => openDelete(doc)}
                  className="p-2 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </ButtonTooltip>
            </div>
          );
        },
      },
    ],
    [pagination]
  );

  // Client-side filtering
  const filteredDocs = useMemo(() => {
    if (!search.trim()) return docs;
    const s = search.toLowerCase().trim();
    return docs.filter(
      (doc) =>
        (doc.edlapp && doc.edlapp.toLowerCase().includes(s)) ||
        (doc.callcenter && doc.callcenter.toLowerCase().includes(s))
    );
  }, [docs, search]);

  const table = useReactTable({
    data: filteredDocs,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
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

  if (authorized === null) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">ກຳລັງກວດສອບສິດການເຂົ້າເຖິງ...</span>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
            >
              ສະຖານະຂໍໝໍ້ນັບໄຟ
            </h1>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            ເພີ່ມສະຖານະຂໍໝໍ້ນັບໄຟ
          </button>
        </div>
      </div>

      {/* Table Card Container */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
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
              placeholder="ຄົ້ນຫາສະຖານະຂໍໝໍ້ນັບໄຟ..."
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
          </div>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[600px] lg:min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} style={{ background: "rgb(var(--bg))" }}>
                  {headerGroup.headers.map((header) => {
                    const widthClass =
                      header.id === "index" ? "w-[10%] min-w-[70px]" :
                        header.id === "edlapp" ? "w-[37.5%] min-w-[180px]" :
                          header.id === "callcenter" ? "w-[37.5%] min-w-[180px]" :
                            header.id === "actions" ? "w-[15%] min-w-[100px]" : "";
                    return (
                      <th
                        key={header.id}
                        className={`text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 ${widthClass}`}
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
                        <p className="text-sm font-semibold">ບໍ່ພົບຂໍ້ມູນສະຖານະຂໍໝໍ້ນັບໄຟ</p>
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
                    {row.getVisibleCells().map((cell) => {
                      const widthClass =
                        cell.column.id === "index" ? "w-[10%] min-w-[70px]" :
                          cell.column.id === "edlapp" ? "w-[37.5%] min-w-[180px]" :
                            cell.column.id === "callcenter" ? "w-[37.5%] min-w-[180px]" :
                              cell.column.id === "actions" ? "w-[15%] min-w-[100px]" : "";
                      return (
                        <td key={cell.id} className={`px-6 py-4 ${widthClass}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
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
      <AddMeterStatusModal open={addOpen} onClose={() => setAddOpen(false)} onRefresh={fetchDocs} />

      <EditMeterStatusModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        selectedDoc={selectedDoc}
        onRefresh={fetchDocs}
      />

      <DeleteMeterStatusModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleDelete}
        selectedDoc={selectedDoc}
      />
    </div>
  );
}
