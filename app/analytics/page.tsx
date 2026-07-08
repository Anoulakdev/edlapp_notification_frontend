import { MetricsGrid } from "@/components/analytics/MetricsGrid";
import { PageViewsChart } from "@/components/analytics/PageViewsChart";
import { TrafficSources } from "@/components/analytics/TrafficSources";
import { TopPagesTable } from "@/components/analytics/TopPagesTable";

export default function AnalyticsPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Analytics
        </h1>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          Detailed reporting and insights about your business.
        </p>
      </div>

      <MetricsGrid />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PageViewsChart />
        <TrafficSources />
      </div>

      <TopPagesTable />
    </div>
  );
}

export const metadata = {
  title: "Analytics",
};
