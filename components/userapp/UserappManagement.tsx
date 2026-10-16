"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Smartphone,
  Search,
  Plus,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  X,
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
import { UserApp } from "@/schemas/userapp";

// Modals
import { ResetPasswordModal } from "./ResetPasswordModal";
import { AddUserappModal } from "./AddUserappModal";

const ROWS_PER_PAGE = 10;

export function UserappManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<UserApp[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination State
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: ROWS_PER_PAGE,
  });

  // Modal States
  const [resetOpen, setResetOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserApp | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) =>
        prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
      );
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Check auth & role (Role 11 is permitted)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        const roleId = res.data?.roleId;
        if ([11].includes(roleId)) {
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

  // Fetch users with AbortController to prevent race conditions and redundant network calls
  useEffect(() => {
    if (!authorized) return;

    let isMounted = true;
    const controller = new AbortController();

    const loadUsers = async () => {
      try {
        setLoading(true);
        const params: Record<string, any> = {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
        };

        const trimmedQuery = debouncedSearch.trim();
        if (trimmedQuery) {
          params.search = trimmedQuery;
        }

        const res = await axiosInstance.get("/userapp", {
          params,
          signal: controller.signal,
        });

        if (isMounted) {
          if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
            setUsers(res.data.data || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.totalPages || 1);
          } else {
            const arr: UserApp[] = Array.isArray(res.data) ? res.data : [];
            setUsers(arr);
            setTotal(arr.length);
            setTotalPages(Math.ceil(arr.length / pagination.pageSize) || 1);
          }
        }
      } catch (err: any) {
        if (
          axios.isCancel(err) ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError"
        ) {
          return;
        }
        if (isMounted) {
          console.error("Failed to load userapp data:", err);
          toast.error(
            err.response?.data?.message || "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ແອັບໄດ້",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [
    authorized,
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
    refreshKey,
  ]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Action Handlers
  const handleResetPassword = useCallback((user: UserApp) => {
    setSelectedUser(user);
    setResetOpen(true);
  }, []);

  // TanStack columns
  const columns = useMemo<ColumnDef<UserApp>[]>(
    () => [
      {
        accessorKey: "user_id",
        header: "ລຳດັບ",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {user.user_id}
            </span>
          );
        },
      },
      {
        accessorKey: "username",
        header: "ຊື່ ແລະ ນາມສະກຸນ",
        cell: ({ row }) => {
          const user = row.original;
          const initial = user.username
            ? user.username.charAt(0).toUpperCase()
            : "U";
          return (
            <div className="flex items-center gap-2.5 py-1 min-w-[170px]">
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate"
                  title={user.username || "ບໍ່ມີຊື່ຜູ້ໃຊ້"}
                >
                  {user.username || (
                    <span className="text-slate-400 italic">ບໍ່ມີຊື່ຜູ້ໃຊ້</span>
                  )}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone_no",
        header: "ເບີໂທລະສັບ",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-1.5 min-w-[130px]">
              <Phone className="w-3.5 h-3.5 text-brand shrink-0" />
              <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                {user.phone_no || "-"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "ອີເມວ",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate block max-w-[160px]">
              {user.email || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "birthday",
        header: "ວັນເກີດ",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {user.birthday
                ? moment(user.birthday).format("DD/MM/YYYY")
                : "-"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "ຈັດການ",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <ButtonTooltip text="ຣີເຊັດລະຫັດຜ່ານ">
                <button
                  type="button"
                  onClick={() => handleResetPassword(user)}
                  className="p-1.5 rounded-lg text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer shrink-0"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
              </ButtonTooltip>
            </div>
          );
        },
      },
    ],
    [handleResetPassword],
  );

  const table = useReactTable({
    data: users,
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
        pages.push(
          0,
          "...",
          pageCount - 4,
          pageCount - 3,
          pageCount - 2,
          pageCount - 1,
        );
      } else {
        pages.push(
          0,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          pageCount - 1,
        );
      }
    }
    return pages;
  };

  if (authorized === null) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          ກຳລັງກວດສອບສິດການເຂົ້າເຖິງ...
        </span>
      </div>
    );
  }

  return (
    <div
      className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8 space-y-6"
      style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold flex items-center gap-2.5 text-theme-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <div className="p-2.5 rounded-2xl bg-brand/10 text-brand">
              <Smartphone className="w-7 h-7" />
            </div>
            <span>ຜູ້ໃຊ້ແອັບ</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:opacity-90 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>ເພີ່ມຜູ້ໃຊ້ແອັບ</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl overflow-hidden shadow-sm bg-theme-card border border-theme">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-theme">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຕາມຊື່, ເບີໂທລະສັບ ຫຼື ອີເມວ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm outline-none transition-all border border-theme bg-theme-bg text-theme-primary focus:border-brand"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="ລ້າງຄຳຄົ້ນຫາ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400 font-medium">
              ທັງໝົດ {total.toLocaleString()} ລາຍການ
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[880px] lg:min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-theme-bg border-b border-theme">
                  {headerGroup.headers.map((header) => {
                    const widthClass =
                      header.id === "user_id"
                        ? "w-[10%] min-w-[80px]"
                        : header.id === "username"
                          ? "w-[28%] min-w-[180px]"
                          : header.id === "phone_no"
                            ? "w-[20%] min-w-[140px]"
                            : header.id === "email"
                              ? "w-[20%] min-w-[140px]"
                              : header.id === "birthday"
                                ? "w-[12%] min-w-[110px]"
                                : header.id === "actions"
                                  ? "w-[10%] min-w-[90px]"
                                  : "";
                    return (
                      <th
                        key={header.id}
                        className={`text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 ${widthClass}`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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
                  <td colSpan={columns.length} className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand/30 border-t-brand" />
                    <span className="block text-xs text-slate-400 mt-2 font-medium">
                      ກຳລັງໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ແອັບ...
                    </span>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-16 text-sm text-slate-400 font-medium"
                  >
                    ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ແອັບ
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-theme transition-colors hover:bg-slate-500/5"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-theme text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              ສະແດງ{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {total > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0}
              </span>{" "}
              ຫາ{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)}
              </span>{" "}
              ຈາກທັງໝົດ{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {total.toLocaleString()}
              </span>{" "}
              ລາຍການ
            </div>

            <div className="flex items-center gap-2">
              <span>ຈຳນວນຕໍ່ໜ້າ:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setPagination({ pageIndex: 0, pageSize: newLimit });
                }}
                className="px-2.5 py-1 rounded-lg border border-theme bg-theme-bg text-theme-primary outline-none font-semibold cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: Math.max(0, prev.pageIndex - 1),
                }))
              }
              disabled={pagination.pageIndex === 0 || loading}
              className="p-1.5 rounded-lg border border-theme disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-500/10 transition-colors"
              title="ໜ້າກ່ອນໜ້າ"
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
                  type="button"
                  key={`page-${page}`}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: Number(page),
                    }))
                  }
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${pagination.pageIndex === page
                    ? "bg-brand text-white font-bold"
                    : "border border-theme hover:bg-slate-500/10 text-slate-600 dark:text-slate-350"
                    }`}
                >
                  {Number(page) + 1}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1),
                }))
              }
              disabled={pagination.pageIndex >= totalPages - 1 || loading}
              className="p-1.5 rounded-lg border border-theme disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-500/10 transition-colors"
              title="ໜ້າຖັດໄປ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ResetPasswordModal
        open={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleRefresh}
        user={selectedUser}
      />

      <AddUserappModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
