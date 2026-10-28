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
  Box,
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
import { Equipment } from "@/schemas/equipment";
import { Badge } from "@/components/ui/Badge";

// Modals
import { AddEquipmentModal } from "./AddEquipmentModal";
import { EditEquipmentModal } from "./EditEquipmentModal";
import { DeleteEquipmentModal } from "./DeleteEquipmentModal";

const ROWS_PER_PAGE = 10;

export function EquipmentManagement() {
  const router = useRouter();
  const [docs, setDocs] = useState<Equipment[]>([]);
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
  const [selectedDoc, setSelectedDoc] = useState<Equipment | null>(null);

  // Authenticate user & role check (roles 5)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        if ([5].includes(res.data?.roleId)) {
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

  // Fetch Equipments from backend
  const fetchDocs = useCallback(async (
    searchVal = "",
    page = 1,
    limit = ROWS_PER_PAGE
  ) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/equipments", {
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
      console.error("Failed to load equipments:", err);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນອຸປະກອນໄດ້");
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

  const openEdit = (doc: Equipment) => {
    setSelectedDoc(doc);
    setEditOpen(true);
  };

  const openDelete = (doc: Equipment) => {
    setSelectedDoc(doc);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      await axiosInstance.delete(`/equipments/${selectedDoc.id}`);
      setDeleteOpen(false);
      toast.success("ລົບຂໍ້ມູນອຸປະກອນສຳເລັດ");
      handleRefresh();
    } catch (err: any) {
      console.error("Failed to delete equipment:", err);
      const errMsg = err?.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນ";
      toast.error(errMsg);
    }
  };

  const toggleStatus = async (doc: Equipment) => {
    const nextStatus = doc.actived ? "false" : "true";
    try {
      await axiosInstance.put(
        `/equipments/updatestatus/${doc.id}?actived=${nextStatus}`
      );
      setDocs((prev) =>
        prev.map((d) =>
          d.id === doc.id ? { ...d, actived: !doc.actived } : d
        )
      );
      toast.success("ປ່ຽນສະຖານະສຳເລັດ");
    } catch (err) {
      console.error("Failed to toggle equipment status:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະ");
    }
  };

  // Columns definition
  const columns = useMemo<ColumnDef<Equipment>[]>(
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
        header: "ຊື່ອຸປະກອນ",
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
        accessorKey: "unit",
        header: "ຫົວໜ່ວຍ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
              <Box className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {doc.unit || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "actived",
        header: "ສະຖານະ",
        cell: ({ row }) => {
          const doc = row.original;
          const isActive = !!doc.actived;
          return (
            <button
              onClick={() => toggleStatus(doc)}
              className="focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
              title={isActive ? "ຄລິກເພື່ອປິດການໃຊ້ງານ" : "ຄລິກເພື່ອເປີດການໃຊ້ງານ"}
            >
              <Badge color={isActive ? "success" : "danger"}>
                {isActive ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ"}
              </Badge>
            </button>
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
              <ButtonTooltip text="ລົບ">
                <button
                  onClick={() => openDelete(doc)}
                  className="p-2 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors shrink-0 cursor-pointer"
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{
              color: "rgb(var(--text-primary))",
              fontFamily: "var(--font-display)",
            }}
          >
            ອຸປະກອນ
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
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
        }}
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
              className="w-full pl-9 pr-4 py-2 h-[38px] rounded-xl text-sm outline-none transition-all"
              style={{
                fontFamily: "inherit",
                background: "rgb(var(--bg))",
                border: "1px solid rgb(var(--border))",
                color: "rgb(var(--text-primary))",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgb(var(--brand))")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgb(var(--border))")
              }
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
          <table className="w-full min-w-[700px] lg:min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  style={{ background: "rgb(var(--bg))" }}
                >
                  {headerGroup.headers.map((header) => {
                    const widthClass =
                      header.id === "index"
                        ? "w-[6%] min-w-[50px]"
                        : header.id === "name"
                          ? "w-[28%] min-w-[160px]"
                          : header.id === "unit"
                            ? "w-[16%] min-w-[100px]"
                            : header.id === "actived"
                              ? "w-[16%] min-w-[110px]"
                              : header.id === "creator"
                                ? "w-[18%] min-w-[120px]"
                                : header.id === "createdAt"
                                  ? "w-[10%] min-w-[100px]"
                                  : header.id === "actions"
                                    ? "w-[6%] min-w-[70px]"
                                    : "";
                    return (
                      <th
                        key={header.id}
                        className={`text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 ${widthClass}`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-20 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-slate-500">
                        ກຳລັງໂຫຼດຂໍ້ມູນ...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-slate-350" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          ບໍ່ພົບຂໍ້ມູນອຸປະກອນ
                        </p>
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-xs font-semibold text-slate-400"
                    >
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
                      background:
                        pagination.pageIndex === i
                          ? "rgb(var(--brand))"
                          : "transparent",
                      border: "1px solid rgb(var(--border))",
                      color:
                        pagination.pageIndex === i
                          ? "white"
                          : "rgb(var(--text-secondary))",
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
      <AddEquipmentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onRefresh={handleRefresh}
      />

      <EditEquipmentModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        doc={selectedDoc}
        onRefresh={handleRefresh}
      />

      <DeleteEquipmentModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleDelete}
        selectedDoc={selectedDoc}
      />
    </div>
  );
}
