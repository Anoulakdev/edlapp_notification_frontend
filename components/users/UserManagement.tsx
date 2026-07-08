"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { TableTooltip, ButtonTooltip } from "@/lib/Tooltip";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  KeyRound,
  Bell,
  UserCog,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Button, Badge } from "@/components/ui/FormElements";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  ColumnFiltersState,
} from "@tanstack/react-table";

import { AddUserModal } from "./AddUserModal";
import { EditUserModal } from "./EditUserModal";
import { DeleteUserModal } from "./DeleteUserModal";

import { User } from "@/schemas/user";
import { axiosInstance } from "@/lib/axiosInstance";
import { encryptId } from "@/lib/crypto";

export type { User };

const mapBackendUserToFrontend = (bUser: any): User => {
  const firstName = bUser.employee?.first_name || "";
  const lastName = bUser.employee?.last_name || "";
  const name = `${firstName} ${lastName}`.trim() || bUser.username || "Unknown User";

  const email = bUser.employee?.email || `${bUser.username}@edl.com.la`;

  let status: User["status"] = "Inactive";
  if (bUser.status === "A") status = "Active";
  else if (bUser.status === "C") status = "Inactive";

  const department = bUser.employee?.department?.department_name || "";
  const division = bUser.employee?.division?.division_name || "";
  const position = bUser.employee?.position?.pos_name || "";
  const empCode = bUser.employee?.emp_code || bUser.username || "";
  const tel = bUser.employee?.tel || "";

  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  const colors = [
    "61 109 255", "34 197 94", "245 158 11", "239 68 68",
    "168 85 247", "20 184 166", "251 146 60", "99 102 241"
  ];
  let sum = 0;
  const username = bUser.username || "";
  for (let i = 0; i < username.length; i++) {
    sum += username.charCodeAt(i);
  }
  const avatarColor = colors[sum % colors.length];

  const empimg = bUser.employee?.empimg || null;

  return {
    id: bUser.id,
    name,
    email,
    role: bUser.role?.name || "Viewer",
    status,
    department,
    division,
    position,
    empCode,
    tel,
    avatar: initials,
    avatarColor,
    empimg,
    raw: bUser,
  };
};

const roleColors: Record<string, "blue" | "green" | "red" | "yellow" | "purple" | "gray"> = {
  Admin: "blue",
  Manager: "green",
  Editor: "yellow",
  Viewer: "gray",
};

const statusColors: Record<string, "blue" | "green" | "red" | "yellow" | "purple" | "gray"> = {
  Active: "green",
  Inactive: "red",
  Pending: "yellow",
};

const avatarColors = [
  "61 109 255", "34 197 94", "245 158 11", "239 68 68",
  "168 85 247", "20 184 166", "251 146 60", "99 102 241",
];

export const emptyForm = {
  username: "",
  roleId: 0,
  provinceId: undefined as number | undefined,
  districtId: undefined as number | undefined,
};

const ROWS_PER_PAGE = 10;

export function UserManagement() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);


  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);


  // Reset password states
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [resetting, setResetting] = useState(false);

  const fetchUsers = useCallback(async (searchVal = "") => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/users", {
        params: {
          search: searchVal.trim() || undefined,
        }
      });
      const rawUsers = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setUsers(rawUsers.map(mapBackendUserToFrontend));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchMeAndMetadata = async () => {
      try {
        const [meRes, rolesRes] = await Promise.all([
          axiosInstance.get("/auth/me"),
          axiosInstance.get("/roles/selectrole"),
        ]);
        setCurrentUser(meRes.data || null);
        setRoles(rolesRes.data || []);
      } catch (err) {
        console.error("Failed to fetch metadata in UserManagement:", err);
      }
    };
    fetchMeAndMetadata();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(globalFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  useEffect(() => {
    fetchUsers(debouncedSearch);
  }, [debouncedSearch, fetchUsers]);

  // Handlers
  const openAdd = () => {
    setAddOpen(true);
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleAdd = async (newForm: typeof emptyForm) => {
    try {
      await axiosInstance.post("/users", {
        username: newForm.username,
        roleId: Number(newForm.roleId),
        provinceId: newForm.provinceId ? Number(newForm.provinceId) : null,
        districtId: newForm.districtId ? Number(newForm.districtId) : null,
      });
      setAddOpen(false);
      await fetchUsers(debouncedSearch);
      toast.success("ເພີ່ມຜູ້ໃຊ້ສຳເລັດ");
    } catch (err) {
      console.error("Failed to add user:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຜູ້ໃຊ້");
      throw err;
    }
  };

  const handleEdit = async (updatedForm: typeof emptyForm) => {
    if (!selectedUser) return;
    try {
      await axiosInstance.put(`/users/${selectedUser.id}`, {
        username: selectedUser.raw?.username,
        roleId: Number(updatedForm.roleId),
        provinceId: updatedForm.provinceId ? Number(updatedForm.provinceId) : null,
        districtId: updatedForm.districtId ? Number(updatedForm.districtId) : null,
      });
      setEditOpen(false);
      await fetchUsers(debouncedSearch);
      toast.success("ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ");
    } catch (err) {
      console.error("Failed to edit user:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້");
      throw err;
    }
  };

  const toggleStatus = async (user: User) => {
    const currentStatus = user.raw?.status; // 'A' or 'C'
    const nextStatus = currentStatus === "A" ? "C" : "A";
    try {
      await axiosInstance.put(`/users/updatestatus/${user.id}?actived=${nextStatus}`);
      await fetchUsers(debouncedSearch);
      toast.success("ປ່ຽນສະຖານະຜູ້ໃຊ້ສຳເລັດ");
    } catch (err) {
      console.error("Failed to toggle user status:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະຜູ້ໃຊ້");
    }
  };

  const handleResetPassword = async () => {
    if (!userToReset) return;
    setResetting(true);
    try {
      await axiosInstance.put(`/users/resetpassword/${userToReset.id}`);
      setResetModalOpen(false);
      setUserToReset(null);
      toast.success("ຣີເຊັດລະຫັດຜ່ານສຳເລັດ");
    } catch (err) {
      console.error("Failed to reset password:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການຣີເຊັດລະຫັດຜ່ານ");
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await axiosInstance.delete(`/users/${selectedUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setDeleteOpen(false);
      toast.success("ລົບຜູ້ໃຊ້ສຳເລັດ");
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການລົບຜູ້ໃຊ້");
    }
  };



  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "ຊື່ ແລະ ນາມສະກຸນ",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2 w-full min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
                style={{ background: user.empimg ? "transparent" : `rgb(${user.avatarColor})` }}
              >
                {user.empimg ? (
                  <img src={user.empimg} alt="profile" className="w-full h-full object-cover object-top" />
                ) : (
                  user.avatar
                )}
              </div>
              <div className="flex-1 min-w-0">
                <TableTooltip text={user.name}>
                  <div className="text-sm font-semibold whitespace-nowrap leading-snug" style={{ color: "rgb(var(--text-primary))" }}>
                    {user.name}
                  </div>
                </TableTooltip>
                <TableTooltip text={user.email}>
                  <div className="text-xs whitespace-nowrap" style={{ color: "rgb(var(--text-secondary))" }}>
                    {user.email}
                  </div>
                </TableTooltip>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "empCode",
        header: "ລະຫັດພະນັກງານ",
        cell: ({ getValue }) => (
          <TableTooltip text={(getValue() as string) || ""}>
            <span className="block text-sm whitespace-nowrap font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
              {(getValue() as string) || "-"}
            </span>
          </TableTooltip>
        ),
      },
      {
        accessorKey: "tel",
        header: "ເບີໂທ",
        cell: ({ getValue }) => (
          <TableTooltip text={(getValue() as string) || ""}>
            <span className="block text-xs whitespace-nowrap" style={{ color: "rgb(var(--text-secondary))" }}>
              {(getValue() as string) || "-"}
            </span>
          </TableTooltip>
        ),
      },
      {
        accessorKey: "position",
        header: "ຕຳແໜ່ງ",
        cell: ({ getValue }) => (
          <TableTooltip text={(getValue() as string) || ""}>
            <span className="block text-xs whitespace-nowrap font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
              {getValue() as string}
            </span>
          </TableTooltip>
        ),
      },
      {
        id: "dept_div",
        header: "ຝ່າຍ / ພະແນກ",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <TableTooltip text={user.department || ""}>
                <span className="block text-xs font-semibold whitespace-nowrap" style={{ color: "rgb(var(--text-primary))" }}>
                  {user.department || "-"}
                </span>
              </TableTooltip>
              {user.division && (
                <TableTooltip text={user.division || ""}>
                  <span className="block text-[11px] whitespace-nowrap" style={{ color: "rgb(var(--text-secondary))" }}>
                    {user.division}
                  </span>
                </TableTooltip>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "ສິດຜູ້ໃຊ້",
        cell: ({ getValue }) => {
          const role = getValue() as string;
          return <Badge color={roleColors[role] || "gray"}>{role}</Badge>;
        },
      },
      {
        accessorKey: "status",
        header: "ສະຖານະ",
        cell: ({ row, getValue }) => {
          const status = getValue() as string;
          const user = row.original;
          return (
            <div
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity p-1 -m-1 rounded-lg"
              onClick={() => toggleStatus(user)}
              title={user.raw.status === "A" ? "ຄລິກເພື່ອປິດການໃຊ້ງານ" : "ຄລິກເພື່ອເປີດການໃຊ້ງານ"}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    status === "Active"
                      ? "rgb(34 197 94)"
                      : "rgb(239 68 68)",
                }}
              />
              <Badge color={statusColors[status] || "gray"}>{status}</Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "#",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="relative flex items-center gap-1">
              <ButtonTooltip text="ແກ້ໄຂສິດ">
                <button
                  onClick={() => openEdit(user)}
                  className="p-1.5 rounded-md transition-all"
                  style={{ background: "rgba(245, 158, 11, 0.1)", color: "rgb(245, 158, 11)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245, 158, 11, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(245, 158, 11, 0.1)";
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </ButtonTooltip>

              {currentUser?.roleId === 1 && (
                <ButtonTooltip text="ລົບຜູ້ໃຊ້">
                  <button
                    onClick={() => openDelete(user)}
                    className="p-1.5 rounded-md transition-all"
                    style={{ background: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </ButtonTooltip>
              )}

              <ButtonTooltip text="ຣີເຊັດລະຫັດຜ່ານ">
                <button
                  onClick={() => {
                    setUserToReset(user);
                    setResetModalOpen(true);
                  }}
                  className="p-1.5 rounded-md transition-all"
                  style={{ background: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  }}
                >
                  <KeyRound className="w-4 h-4" />
                </button>
              </ButtonTooltip>

              {currentUser?.roleId === 1 && (
                <ButtonTooltip text="FCM Token">
                  <button
                    onClick={() => {
                      const encrypted = encryptId(user.id);
                      router.push(`/fcmtoken?id=${encrypted}`);
                    }}
                    className="p-1.5 rounded-md transition-all"
                    style={{ background: "rgba(14, 165, 233, 0.1)", color: "rgb(14, 165, 233)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(14, 165, 233, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(14, 165, 233, 0.1)";
                    }}
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                </ButtonTooltip>
              )}
            </div>
          );
        },
      },
    ],
    [currentUser]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: ROWS_PER_PAGE,
      },
    },
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
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            ຜູ້ໃຊ້ງານ
          </h1>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "rgb(var(--brand))" }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            ເພີ່ມຜູ້ໃຊ້ງານ
          </button>
        </div>
      </div>

      {/* Table Card */}
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
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "rgb(var(--text-secondary))" }}
            />
            <input
              type="text"
              placeholder="ຄົ້ນຫາ..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgb(var(--bg))",
                border: "1px solid rgb(var(--border))",
                color: "rgb(var(--text-primary))",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgb(var(--brand))")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgb(var(--border))")}
            />
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
              {table.getFilteredRowModel().rows.length} ລາຍການ
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
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
            className="flex flex-col sm:flex-row gap-4 px-4 sm:px-6 py-4 border-b"
            style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--bg))" }}
          >
            <div className="w-full sm:w-48">
              <Select
                label="ສິດຜູ້ໃຊ້"
                value={(table.getColumn("role")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("role")?.setFilterValue(e.target.value)}
                options={[
                  { value: "", label: "ສິດທັງໝົດ" },
                  ...roles.map((r) => ({ value: r.name, label: r.name })),
                ]}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="ສະຖານະ"
                value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("status")?.setFilterValue(e.target.value)}
                options={[
                  { value: "", label: "ທຸກສະຖານະ" },
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>
            <div className="sm:ml-auto flex items-end">
              <button
                onClick={() => setColumnFilters([])}
                className="text-sm font-medium hover:underline mb-2"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} style={{ background: "rgb(var(--bg))" }}>
                  {headerGroup.headers.map((header) => {
                    const widthClass =
                      header.id === "name" ? "w-[18%] min-w-[140px]" :
                        header.id === "empCode" ? "w-[7%] min-w-[70px]" :
                          header.id === "tel" ? "w-[8%] min-w-[80px]" :
                            header.id === "position" ? "w-[10%] min-w-[90px]" :
                              header.id === "dept_div" ? "w-[18%] min-w-[130px]" :
                                header.id === "role" ? "w-[10%] min-w-[70px]" :
                                  header.id === "status" ? "w-[8%] min-w-[70px]" :
                                    header.id === "actions" ? "w-[11%] min-w-[100px]" : "";
                    return (
                      <th
                        key={header.id}
                        className={`text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider ${widthClass}`}
                        style={{ color: "rgb(var(--text-secondary))" }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
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
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400" style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
                        ກຳລັງໂຫຼດຂໍ້ມູນຜູ້ໃຊ້...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgb(var(--bg))" }}
                      >
                        <Users className="w-7 h-7" style={{ color: "rgb(var(--text-secondary))" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                          ບໍ່ມີຂໍ້ມູນຜູ້ໃຊ້
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="table-row-hover border-t"
                    style={{ borderColor: "rgb(var(--border))" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(var(--bg))")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const widthClass =
                        cell.column.id === "name" ? "w-[18%] min-w-[140px]" :
                          cell.column.id === "empCode" ? "w-[7%] min-w-[70px]" :
                            cell.column.id === "tel" ? "w-[8%] min-w-[80px]" :
                              cell.column.id === "position" ? "w-[10%] min-w-[90px]" :
                                cell.column.id === "dept_div" ? "w-[18%] min-w-[130px]" :
                                  cell.column.id === "role" ? "w-[10%] min-w-[70px]" :
                                    cell.column.id === "status" ? "w-[8%] min-w-[70px]" :
                                      cell.column.id === "actions" ? "w-[11%] min-w-[100px]" : "";
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

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 border-t"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <span className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-40"
                style={{
                  background: "rgb(var(--bg))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--text-secondary))",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {generatePagination().map((page, idx) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-xs font-semibold"
                      style={{ color: "rgb(var(--text-secondary))" }}
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
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: table.getState().pagination.pageIndex === i ? "rgb(var(--brand))" : "rgb(var(--bg))",
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
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-40"
                style={{
                  background: "rgb(var(--bg))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--text-secondary))",
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}
      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />

      <EditUserModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onEdit={handleEdit}
        selectedUser={selectedUser}
      />

      <DeleteUserModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleDelete}
        selectedUser={selectedUser}
      />

      {/* ─── RESET PASSWORD CONFIRMATION MODAL ─── */}
      <Modal open={resetModalOpen} onClose={() => setResetModalOpen(false)} title="ຣີເຊັດລະຫັດຜ່ານ" size="sm">
        <div className="space-y-5">
          <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(239, 68, 68, 0.12)" }}
            >
              <KeyRound className="w-5 h-5 animate-pulse" style={{ color: "rgb(239, 68, 68)" }} />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                {userToReset?.name}
              </div>
              <div className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                {userToReset?.email}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setResetModalOpen(false)} className="flex-1">
              ຍົກເລີກ
            </Button>
            <Button variant="danger" onClick={handleResetPassword} loading={resetting} className="flex-1">
              ຣີເຊັດລະຫັດຜ່ານ
            </Button>
          </div>
        </div>
      </Modal>


    </div>
  );
}
