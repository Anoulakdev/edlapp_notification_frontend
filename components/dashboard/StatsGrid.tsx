import { Users, ShoppingCart, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

const stats = [
  {
    label: "Total Users",
    value: "24,521",
    change: "+12.5%",
    up: true,
    icon: Users,
    color: "61 109 255",
    bg: "61 109 255",
  },
  {
    label: "Total Orders",
    value: "8,430",
    change: "+8.2%",
    up: true,
    icon: ShoppingCart,
    color: "34 197 94",
    bg: "34 197 94",
  },
  {
    label: "Revenue",
    value: "$142,380",
    change: "+18.7%",
    up: true,
    icon: DollarSign,
    color: "245 158 11",
    bg: "245 158 11",
  },
  {
    label: "Bounce Rate",
    value: "23.6%",
    change: "-3.1%",
    up: false,
    icon: TrendingUp,
    color: "239 68 68",
    bg: "239 68 68",
  },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-2xl p-6 relative overflow-hidden group"
            style={{
              background: "rgb(var(--card))",
              border: "1px solid rgb(var(--border))",
            }}
          >
            {/* Glow BG */}
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-[0.06] group-hover:opacity-[0.1] transition-opacity"
              style={{ background: `rgb(${stat.bg})` }}
            />
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(${stat.bg}, 0.1)` }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: `rgb(${stat.color})` }}
                  strokeWidth={2}
                />
              </div>
              <span
                className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                style={{
                  background: stat.up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: stat.up ? "rgb(34 197 94)" : "rgb(239 68 68)",
                }}
              >
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div
              className="text-2xl font-bold mb-0.5"
              style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
            >
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
