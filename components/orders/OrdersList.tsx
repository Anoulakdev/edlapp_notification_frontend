"use client";

import { useState } from "react";
import { ShoppingCart, Eye, Filter, TrendingUp, Download } from "lucide-react";
import { Select } from "@/components/ui/FormElements";

import { Order } from "@/schemas/order";

const ORDERS: Order[] = [
  { id: "ORD-001", customer: "Sarah Johnson", email: "sarah@example.com", amount: 2450, status: "Delivered", date: "Mar 15, 2025", items: 3 },
  { id: "ORD-002", customer: "Mark Torres", email: "mark@example.com", amount: 1890, status: "Shipped", date: "Mar 14, 2025", items: 2 },
  { id: "ORD-003", customer: "Priya Nair", email: "priya@example.com", amount: 3210, status: "Processing", date: "Mar 13, 2025", items: 5 },
  { id: "ORD-004", customer: "Daniel Kim", email: "daniel@example.com", amount: 1560, status: "Pending", date: "Mar 12, 2025", items: 1 },
  { id: "ORD-005", customer: "Lisa Chen", email: "lisa@example.com", amount: 4890, status: "Delivered", date: "Mar 11, 2025", items: 4 },
  { id: "ORD-006", customer: "James Wilson", email: "james@example.com", amount: 2100, status: "Cancelled", date: "Mar 10, 2025", items: 2 },
  { id: "ORD-007", customer: "Aisha Rahman", email: "aisha@example.com", amount: 3450, status: "Shipped", date: "Mar 9, 2025", items: 3 },
  { id: "ORD-008", customer: "Tom Bradley", email: "tom@example.com", amount: 1750, status: "Delivered", date: "Mar 8, 2025", items: 2 },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "rgb(59 130 246 / 0.1)", text: "rgb(59 130 246)" },
  Processing: { bg: "rgb(245 158 11 / 0.1)", text: "rgb(245 158 11)" },
  Shipped: { bg: "rgb(168 85 247 / 0.1)", text: "rgb(168 85 247)" },
  Delivered: { bg: "rgb(34 197 94 / 0.1)", text: "rgb(34 197 94)" },
  Cancelled: { bg: "rgb(239 68 68 / 0.1)", text: "rgb(239 68 68)" },
};

export function OrdersList() {
  const [orders] = useState<Order[]>(ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            Orders
          </h1>
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            Manage and track all customer orders.
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          <button
            onClick={() => alert("Export functionality is not implemented yet.")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "rgb(var(--card))",
              border: "1px solid rgb(var(--border))",
              color: "rgb(var(--text-secondary))",
            }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:block">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Total Orders */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                Total Orders
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                {orders.length}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgb(59 130 246 / 0.1)" }}
            >
              <ShoppingCart className="w-5 h-5" style={{ color: "rgb(59 130 246)" }} />
            </div>
          </div>
          <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
            <span style={{ color: "rgb(34 197 94)" }}>↑ 12.5%</span> from last month
          </p>
        </div>

        {/* Total Revenue */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                Total Revenue
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                ${(totalRevenue / 1000).toFixed(1)}k
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgb(34 197 94 / 0.1)" }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: "rgb(34 197 94)" }} />
            </div>
          </div>
          <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
            <span style={{ color: "rgb(34 197 94)" }}>↑ 8.2%</span> from last month
          </p>
        </div>

        {/* Avg Order Value */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                Avg Order Value
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                ${avgOrderValue}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgb(245 158 11 / 0.1)" }}
            >
              <ShoppingCart className="w-5 h-5" style={{ color: "rgb(245 158 11)" }} />
            </div>
          </div>
          <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
            <span style={{ color: "rgb(34 197 94)" }}>↑ 5.1%</span> from last month
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
      >
        {/* Toolbar */}
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 border-b"
          style={{ borderColor: "rgb(var(--border))" }}
        >
            <label htmlFor="orders-search" className="sr-only">Search orders</label>
            <div className="relative flex-1 max-w-xs">
            <input
              id="orders-search"
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        {/* Filter Panel */}
        {showFilters && (
          <div
            className="flex flex-col sm:flex-row gap-4 px-4 sm:px-6 py-4 border-b"
            style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--bg))" }}
          >
            <div className="w-full sm:w-48">
              <Select
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "All", label: "All Statuses" },
                  { value: "Pending", label: "Pending" },
                  { value: "Processing", label: "Processing" },
                  { value: "Shipped", label: "Shipped" },
                  { value: "Delivered", label: "Delivered" },
                  { value: "Cancelled", label: "Cancelled" },
                ]}
              />
            </div>
            <div className="sm:ml-auto flex items-end">
              <button
                onClick={() => setStatusFilter("All")}
                className="text-sm font-medium hover:underline mb-2"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgb(var(--bg))" }}>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  Order ID
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  Customer
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  Amount
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  Status
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  Date
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgb(var(--border))" }}>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-opacity-50 transition-all"
                  style={{ background: "transparent" }}
                >
                  <td
                    className="px-4 sm:px-6 py-4 text-sm font-semibold"
                    style={{ color: "rgb(var(--text-primary))" }}
                  >
                    {order.id}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "rgb(var(--text-primary))" }}
                      >
                        {order.customer}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgb(var(--text-secondary))" }}
                      >
                        {order.email}
                      </p>
                    </div>
                  </td>
                  <td
                    className="px-4 sm:px-6 py-4 text-sm font-semibold"
                    style={{ color: "rgb(var(--text-primary))" }}
                  >
                    ${order.amount}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: statusColors[order.status].bg,
                        color: statusColors[order.status].text,
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td
                    className="px-4 sm:px-6 py-4 text-sm"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    {order.date}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center">
                    <button
                      onClick={() => alert(`View details for order ${order.id}`)}
                      className="inline-flex items-center justify-center p-2 rounded-lg transition-all"
                      style={{
                        background: "rgb(var(--bg))",
                        color: "rgb(var(--text-secondary))",
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
