import { TrendingUp, BarChart3, Users, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function MetricsGrid() {
  const metrics = [
    { label: "Page Views", value: "124,856", change: "+12.5%", up: true, icon: Activity },
    { label: "Unique Visitors", value: "45,231", change: "+8.2%", up: true, icon: Users },
    { label: "Bounce Rate", value: "23.6%", change: "-3.1%", up: false, icon: TrendingUp },
    { label: "Avg. Session", value: "3m 42s", change: "+14.2%", up: true, icon: BarChart3 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.label}
            className="rounded-2xl p-6 border relative overflow-hidden group"
            style={{
              background: "rgb(var(--card))",
              borderColor: "rgb(var(--border))",
            }}
          >
            {/* Glow BG */}
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-[0.06] group-hover:opacity-[0.1] transition-opacity"
              style={{ background: "rgb(var(--brand))" }}
            />
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "rgb(var(--brand) / 0.1)" }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: "rgb(var(--brand))" }}
                  strokeWidth={2}
                />
              </div>
              <div className="flex items-center gap-0.5" style={{ color: metric.up ? "rgb(34 197 94)" : "rgb(239 68 68)" }}>
                {metric.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="text-xs font-semibold">{metric.change}</span>
              </div>
            </div>
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: "rgb(var(--text-secondary))" }}
            >
              {metric.label}
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              {metric.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
