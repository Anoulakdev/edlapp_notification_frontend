"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { axiosInstance } from "@/lib/axiosInstance";
import moment from "moment";
import { ButtonTooltip } from "@/lib/Tooltip";
import { Topic } from "@/schemas/topic";
import { Badge } from "@/components/ui/Badge";

// Modals
import { AddTopicModal } from "./AddTopicModal";
import { EditTopicModal } from "./EditTopicModal";
import { DeleteTopicModal } from "./DeleteTopicModal";

const ROWS_PER_PAGE = 10;

export function TopicManagement() {
  const [docs, setDocs] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [selectedDoc, setSelectedDoc] = useState<Topic | null>(null);

  // Fetch Topics from backend
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/topics");
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setDocs(data);
    } catch (err) {
      console.error("Failed to load topics:", err);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຫົວຂໍ້ໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Handlers
  const openAdd = () => setAddOpen(true);

  const openEdit = (doc: Topic) => {
    setSelectedDoc(doc);
    setEditOpen(true);
  };

  const openDelete = (doc: Topic) => {
    setSelectedDoc(doc);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      await axiosInstance.delete(`/topics/${selectedDoc.id}`);
      setDocs((prev) => prev.filter((d) => d.id !== selectedDoc.id));
      setDeleteOpen(false);
      toast.success("ລົບຂໍ້ມູນຫົວຂໍ້ສຳເລັດ");
    } catch (err) {
      console.error("Failed to delete topic:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນ");
    }
  };

  const toggleStatus = async (doc: Topic) => {
    const nextStatus = doc.actived ? "false" : "true";
    try {
      await axiosInstance.put(`/topics/updatestatus/${doc.id}?actived=${nextStatus}`);
      setDocs((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, actived: !doc.actived } : d))
      );
      toast.success("ປ່ຽນສະຖານະສຳເລັດ");
    } catch (err) {
      console.error("Failed to toggle status:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະ");
    }
  };

  // Columns definition
  const columns = useMemo<ColumnDef<Topic>[]>(
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
        header: "ຊື່ຫົວຂໍ້",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="py-1">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-250 break-all whitespace-normal">
                {doc.name}
              </div>
              {doc.description && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-all whitespace-normal line-clamp-2">
                  {doc.description}
                </div>
              )}
            </div>
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
            <span className="text-xs font-medium text-slate-600 dark:text-slate-350 flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {moment(doc.createdAt).format("DD/MM/YYYY HH:mm")}
            </span>
          );
        },
      },
      {
        accessorKey: "actived",
        header: "ສະຖານະ",
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <button
              onClick={() => toggleStatus(doc)}
              className="focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Badge color={doc.actived ? "success" : "danger"}>
                {doc.actived ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ"}
              </Badge>
            </button>
          );
        },
      },
      {
        id: "actions",
        header: "#",
        cell: ({ row }) => {
          const doc = row.original;
          const hasConversations = !!(doc.conversations && doc.conversations.length > 0);
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
              <ButtonTooltip text={hasConversations ? "ບໍ່ສາມາດລົບໄດ້" : "ລົບ"}>
                <button
                  onClick={() => openDelete(doc)}
                  disabled={hasConversations}
                  className={`p-2 rounded-xl transition-colors shrink-0 ${hasConversations
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

  // Client-side filtering
  const filteredDocs = useMemo(() => {
    if (!search.trim()) return docs;
    const s = search.toLowerCase().trim();
    return docs.filter((doc) => doc.name.toLowerCase().includes(s));
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

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            ຫົວຂໍ້ການສົນທະນາ
          </h1>
        </div>
        <div className="sm:ml-auto flex items-center">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:opacity-90 transition-opacity cursor-pointer"
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
                        <p className="text-sm font-semibold">ບໍ່ພົບຂໍ້ມູນຫົວຂໍ້</p>
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
      <AddTopicModal open={addOpen} onClose={() => setAddOpen(false)} onRefresh={fetchDocs} />

      <EditTopicModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        selectedDoc={selectedDoc}
        onRefresh={fetchDocs}
      />

      <DeleteTopicModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleDelete}
        selectedDoc={selectedDoc}
      />
    </div>
  );
}
