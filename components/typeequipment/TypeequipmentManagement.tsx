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
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import moment from "moment";
import { ButtonTooltip } from "@/lib/Tooltip";
import { TypeEquipment } from "@/schemas/typeequipment";

// Modals
import { AddTypeEquipmentModal } from "./AddTypeEquipmentModal";
import { EditTypeEquipmentModal } from "./EditTypeEquipmentModal";
import { DeleteTypeEquipmentModal } from "./DeleteTypeEquipmentModal";

const ROWS_PER_PAGE = 10;

export function TypeequipmentManagement() {
  const router = useRouter();
  const [docs, setDocs] = useState<TypeEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination State
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: ROWS_PER_PAGE,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals States
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<TypeEquipment | null>(null);

  // Authenticate user & role check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        if ([2, 3, 4].includes(res.data?.roleId)) {
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Type Equipments from backend
  const fetchDocs = useCallback(async (
    searchVal = "",
    page = 1,
    limit = ROWS_PER_PAGE
  ) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/typeequipments", {
        params: {
          search: searchVal.trim() || undefined,
          page,
          limit,
        },
      });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setDocs(res.data.data);
        setTotalCount(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      } else if (Array.isArray(res.data)) {
        setDocs(res.data);
        setTotalCount(res.data.length);
        setTotalPages(Math.ceil(res.data.length / limit) || 1);
      } else {
        setDocs([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load type equipments:", err);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໝວດໝູ່ອຸປະກອນໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  const prevFiltersRef = useRef({
    debouncedSearch,
  });

  // Fetch data when filters or pagination changes
  useEffect(() => {
    if (!authorized) return;

    const prev = prevFiltersRef.current;
    const filtersChanged = prev.debouncedSearch !== debouncedSearch;

    prevFiltersRef.current = {
      debouncedSearch,
    };

    if (filtersChanged && pagination.pageIndex !== 0) {
      setPagination((p) => ({ ...p, pageIndex: 0 }));
      return;
    }

    fetchDocs(
      debouncedSearch,
      pagination.pageIndex + 1,
      pagination.pageSize
    );
  }, [
    authorized,
    debouncedSearch,
    pagination.pageIndex,
    pagination.pageSize,
    fetchDocs,
  ]);

  // Stable refresh callback
  const handleRefresh = useCallback(() => {
    fetchDocs(
      debouncedSearch,
      pagination.pageIndex + 1,
      pagination.pageSize
    );
  }, [
    fetchDocs,
    debouncedSearch,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  // Handlers
  const openAdd = () => setAddOpen(true);

  const openEdit = (doc: TypeEquipment) => {
    setSelectedDoc(doc);
    setEditOpen(true);
  };

  const openDelete = (doc: TypeEquipment) => {
    setSelectedDoc(doc);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      await axiosInstance.delete(`/typeequipments/${selectedDoc.id}`);
      setDeleteOpen(false);
      toast.success("ລົບຂໍ້ມູນໝວດໝູ່ອຸປະກອນສຳເລັດ");
      handleRefresh();
    } catch (err) {
      console.error("Failed to delete type equipment:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນ");
    }
  };

  // Columns definition
  const columns = useMemo<ColumnDef<TypeEquipment>[]>(
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
        accessorKey: "name",
        header: "ຊື່ໝວດໝູ່ອຸປະກອນ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-all whitespace-normal py-1">
              {doc.name}
            </div>
          );
        },
      },
      {
        accessorKey: "code",
        header: "ລະຫັດ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {doc.code || "-"}
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
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
          const hasEquipments = !!(doc.equipments && doc.equipments.length > 0);
          return (
            <div className="flex items-center gap-1.5 shrink-0">
              <ButtonTooltip text="ແກ້ໄຂ">
                <button
                  onClick={() => openEdit(doc)}
                  className="p-2 rounded-xl text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 transition-colors shrink-0 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </ButtonTooltip>
              <ButtonTooltip text={hasEquipments ? "ບໍ່ສາມາດລົບໄດ້" : "ລົບ"}>
                <button
                  onClick={() => openDelete(doc)}
                  disabled={hasEquipments}
                  className={`p-2 rounded-xl transition-colors shrink-0 ${
                    hasEquipments
                      ? "text-slate-400 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed opacity-50"
                      : "text-red-500 bg-red-500/10 hover:bg-red-500/20 cursor-pointer"
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
    [pagination]
  );

  const table = useReactTable({
    data: docs,
    columns,
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  const generatePagination = () => {
    const currentPage = pagination.pageIndex;
    const pageCount = totalPages;
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
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm text-slate-500 font-medium">ກຳລັງກວດສອບສິດ...</span>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            ໝວດໝູ່ອຸປະກອນ
          </h1>
        </div>
        <div className="sm:ml-auto flex items-center">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
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
              {totalCount} ລາຍການ
            </span>
          </div>
        </div>

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
                        <p className="text-sm font-semibold">ບໍ່ພົບຂໍ້ມູນໝວດໝູ່ອຸປະກອນ</p>
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
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 border-t"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <span className="text-xs text-slate-500">
              Page {pagination.pageIndex + 1} of {totalPages} ({totalCount} ລາຍການ)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="w-8 h-8 flex items-center justify-center rounded-lg border bg-theme-bg border-theme text-slate-500 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
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
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    style={{
                      background: pagination.pageIndex === i ? "rgb(var(--brand))" : "transparent",
                      border: "1px solid rgb(var(--border))",
                      color: pagination.pageIndex === i ? "white" : "rgb(var(--text-secondary))",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="w-8 h-8 flex items-center justify-center rounded-lg border bg-theme-bg border-theme text-slate-500 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AddTypeEquipmentModal open={addOpen} onClose={() => setAddOpen(false)} onRefresh={handleRefresh} />

      <EditTypeEquipmentModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        selectedDoc={selectedDoc}
        onRefresh={handleRefresh}
      />

      <DeleteTypeEquipmentModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleDelete}
        selectedDoc={selectedDoc}
      />
    </div>
  );
}
