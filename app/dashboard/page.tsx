import { RevenueChart, OrdersChart, CustomerDistributionChart, TrafficSourceChart } from "@/components/Charts";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TopPages } from "@/components/dashboard/TopPages";

export default function DashboardPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Dashboard
        </h1>
        {/* <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          Welcome back, Admin. Here&apos;s what&apos;s happening today.
        </p> */}
      </div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Charts Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart title="Revenue Trend" subtitle="Last 7 days" />
          <OrdersChart title="Orders by Day" subtitle="Weekly overview" />
        </div>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CustomerDistributionChart title="Customer Distribution" subtitle="By subscription plan" />
          <TrafficSourceChart title="Traffic Sources" subtitle="Website visitors breakdown" />
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Feed */}
        <RecentActivity />

        {/* Top Pages */}
        <TopPages />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Dashboard",
};
